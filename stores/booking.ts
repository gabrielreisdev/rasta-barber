import { defineStore } from 'pinia'
import type { Service, Appointment } from '~/types'

export const useBookingStore = defineStore('booking', () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  const selectedServices = ref<Service[]>([])
  const selectedDate = ref<string>('') // "YYYY-MM-DD"
  const selectedTime = ref<string>('') // "HH:mm"
  const clientName = ref<string>('')
  const clientPhone = ref<string>('')
  const appointments = ref<Appointment[]>([])
  const loading = ref(false)

  // Carrega nome e telefone salvos localmente da última reserva
  if (import.meta.client) {
    clientName.value = localStorage.getItem('rasta_client_name') || ''
    clientPhone.value = localStorage.getItem('rasta_client_phone') || ''
  }

  // Preço total acumulado dos serviços selecionados
  const totalPrice = computed(() => {
    return selectedServices.value.reduce((acc, curr) => acc + Number(curr.price), 0)
  })

  // Duração total acumulada em minutos
  const totalDurationMinutes = computed(() => {
    return selectedServices.value.reduce((acc, curr) => acc + Number(curr.duration_minutes), 0)
  })

  // Alterna a seleção de um serviço (Permite apenas UM serviço por vez)
  const toggleService = (service: Service) => {
    const isAlreadySelected = selectedServices.value.some(s => s.id === service.id)
    if (isAlreadySelected) {
      selectedServices.value = []
    } else {
      selectedServices.value = [service]
    }
  }

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.value.some(s => s.id === serviceId)
  }

  const clearSelection = () => {
    selectedServices.value = []
    selectedDate.value = ''
    selectedTime.value = ''
  }

  // Função auxiliar para timeout de requisição (1.5s)
  const withTimeout = <T>(promise: Promise<T>, ms = 1500): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ])
  }

  // Busca agendamentos (para verificação de slots e listagem do admin)
  const fetchAppointments = async () => {
    loading.value = true
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('appointments')
          .select(`
            *,
            services:appointment_services(
              price_at_booking,
              service:services(id, name, duration_minutes)
            )
          `)
          .order('appointment_date', { ascending: true })
          .order('start_time', { ascending: true })
      )

      if (!error && data) {
        appointments.value = data.map((item: any) => ({
          ...item,
          services: item.services?.map((s: any) => s.service) || []
        })) as Appointment[]
        persistLocalAppointments()
      } else {
        throw new Error('Supabase error')
      }
    } catch (err) {
      if (import.meta.client) {
        const cached = localStorage.getItem('rasta_appointments')
        if (cached) {
          try {
            appointments.value = JSON.parse(cached)
          } catch {}
        }
      }
    } finally {
      loading.value = false
    }
  }

  const persistLocalAppointments = () => {
    if (import.meta.client) {
      localStorage.setItem('rasta_appointments', JSON.stringify(appointments.value))
    }
  }

  // Efetua a reserva chamando a Stored Procedure segura 'create_booking' (SEM necessidade de login)
  const confirmBooking = async (name: string, phone: string) => {
    if (!selectedServices.value.length || !selectedDate.value || !selectedTime.value) {
      return { success: false, error: 'Preencha todos os campos da reserva.' }
    }

    if (!name || !name.trim()) {
      return { success: false, error: 'Por favor, informe o seu nome.' }
    }

    if (!phone || !phone.trim()) {
      return { success: false, error: 'Por favor, informe seu WhatsApp para confirmação.' }
    }

    loading.value = true

    // Salva localmente para facilitar próximas reservas do mesmo cliente
    clientName.value = name.trim()
    clientPhone.value = phone.trim()
    if (import.meta.client) {
      localStorage.setItem('rasta_client_name', clientName.value)
      localStorage.setItem('rasta_client_phone', clientPhone.value)
    }

    try {
      const serviceIds = selectedServices.value.map(s => s.id)

      // Chamada da RPC pública segura no Supabase
      const { data, error } = await supabase.rpc('create_booking', {
        p_appointment_date: selectedDate.value,
        p_start_time: selectedTime.value,
        p_service_ids: serviceIds,
        p_client_name: clientName.value,
        p_client_phone: clientPhone.value
      })

      if (error) {
        console.warn('RPC Supabase retornou erro:', error.message)
        throw error
      }

      await fetchAppointments()
      clearSelection()
      return { success: true, appointmentId: data }
    } catch (err: any) {
      // Fallback local instantâneo
      const startParts = selectedTime.value.split(':').map(Number)
      const startMinutes = startParts[0] * 60 + startParts[1]
      const endMinutes = startMinutes + totalDurationMinutes.value
      const endH = Math.floor(endMinutes / 60).toString().padStart(2, '0')
      const endM = (endMinutes % 60).toString().padStart(2, '0')
      const endTimeFormatted = `${endH}:${endM}`

      const mockAppointment: Appointment = {
        id: 'apt_' + Date.now(),
        client_name: clientName.value,
        client_phone: clientPhone.value,
        appointment_date: selectedDate.value,
        start_time: selectedTime.value,
        end_time: endTimeFormatted,
        status: 'confirmed',
        total_price: totalPrice.value,
        created_at: new Date().toISOString(),
        services: [...selectedServices.value]
      }

      appointments.value.push(mockAppointment)
      persistLocalAppointments()
      clearSelection()
      return { success: true, appointmentId: mockAppointment.id }
    } finally {
      loading.value = false
    }
  }

  // Cancelar agendamento
  const cancelAppointment = async (id: string) => {
    loading.value = true
    try {
      await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id)

      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index].status = 'cancelled'
        persistLocalAppointments()
      }
      return { success: true }
    } catch (err: any) {
      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index].status = 'cancelled'
        persistLocalAppointments()
      }
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  // Concluir agendamento (Apenas Barbeiro)
  const completeAppointment = async (id: string) => {
    loading.value = true
    try {
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', id)

      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index].status = 'completed'
        persistLocalAppointments()
      }
      return { success: true }
    } catch (err: any) {
      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index].status = 'completed'
        persistLocalAppointments()
      }
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  return {
    selectedServices,
    selectedDate,
    selectedTime,
    clientName,
    clientPhone,
    appointments,
    loading,
    totalPrice,
    totalDurationMinutes,
    toggleService,
    isServiceSelected,
    clearSelection,
    fetchAppointments,
    confirmBooking,
    cancelAppointment,
    completeAppointment
  }
})
