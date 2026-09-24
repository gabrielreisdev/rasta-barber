import type { WorkingHours, TimeSlot, Appointment, BlockedDate } from '~/types'

const DEFAULT_WORKING_HOURS: WorkingHours[] = [
  { id: 'wh-0', day_of_week: 0, is_working: false, start_time: '09:00', end_time: '14:00', lunch_start: null, lunch_end: null },
  { id: 'wh-1', day_of_week: 1, is_working: true, start_time: '09:00', end_time: '19:00', lunch_start: '12:00', lunch_end: '13:00' },
  { id: 'wh-2', day_of_week: 2, is_working: true, start_time: '09:00', end_time: '19:00', lunch_start: '12:00', lunch_end: '13:00' },
  { id: 'wh-3', day_of_week: 3, is_working: true, start_time: '09:00', end_time: '19:00', lunch_start: '12:00', lunch_end: '13:00' },
  { id: 'wh-4', day_of_week: 4, is_working: true, start_time: '09:00', end_time: '19:00', lunch_start: '12:00', lunch_end: '13:00' },
  { id: 'wh-5', day_of_week: 5, is_working: true, start_time: '09:00', end_time: '20:00', lunch_start: '12:00', lunch_end: '13:00' },
  { id: 'wh-6', day_of_week: 6, is_working: true, start_time: '08:30', end_time: '18:00', lunch_start: '12:30', lunch_end: '13:30' }
]

export const useSlotCalculator = () => {
  const supabase = useSupabaseClient()
  const workingHoursList = ref<WorkingHours[]>([])
  const blockedDates = ref<string[]>([]) // Array de datas "YYYY-MM-DD" bloqueadas/folgas
  const loading = ref(false)

  // Função auxiliar para timeout de requisição (1.5s)
  const withTimeout = <T>(promise: Promise<T>, ms = 1500): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ])
  }

  // Carrega horários de trabalho e dias bloqueados
  const fetchWorkingHours = async () => {
    loading.value = true
    try {
      // 1. Busca working_hours com timeout rápido
      const { data, error } = await withTimeout(
        supabase.from('working_hours').select('*').order('day_of_week', { ascending: true })
      )

      if (!error && data && data.length > 0) {
        workingHoursList.value = data as WorkingHours[]
      } else {
        throw new Error('Supabase error or empty')
      }
    } catch (err) {
      if (import.meta.client) {
        const cached = localStorage.getItem('rasta_working_hours')
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && parsed.length > 0) {
              workingHoursList.value = parsed
            } else {
              workingHoursList.value = [...DEFAULT_WORKING_HOURS]
            }
          } catch {
            workingHoursList.value = [...DEFAULT_WORKING_HOURS]
          }
        } else {
          workingHoursList.value = [...DEFAULT_WORKING_HOURS]
        }
      } else {
        workingHoursList.value = [...DEFAULT_WORKING_HOURS]
      }
    }

    try {
      // 2. Busca blocked_dates com timeout rápido
      const { data, error } = await withTimeout(
        supabase.from('blocked_dates').select('date')
      )

      if (!error && data) {
        blockedDates.value = data.map(d => d.date)
      } else {
        throw new Error('Supabase error')
      }
    } catch (err) {
      if (import.meta.client) {
        const cached = localStorage.getItem('rasta_blocked_dates')
        if (cached) {
          try {
            blockedDates.value = JSON.parse(cached)
          } catch {}
        }
      }
    }
    
    loading.value = false
  }

  // Compatibilidade caso chamem isolado
  const fetchBlockedDates = async () => {
    // Agora o fetchWorkingHours já faz tudo e trata cache corretamente.
    // Deixo vazio ou posso chamar de novo (mas não é necessário).
  }

  // Alterna o status de um dia específico no calendário (Bloqueado/Folga ou Aberto)
  const toggleDateBlocked = async (dateStr: string) => {
    const isBlocked = blockedDates.value.includes(dateStr)
    if (isBlocked) {
      // Desbloqueia (Abre o dia)
      blockedDates.value = blockedDates.value.filter(d => d !== dateStr)
      try {
        await supabase.from('blocked_dates').delete().eq('date', dateStr)
      } catch (err) {
        console.warn('Erro ao deletar folga no Supabase:', err)
      }
    } else {
      // Bloqueia (Marca folga)
      blockedDates.value.push(dateStr)
      try {
        await supabase.from('blocked_dates').insert([{ date: dateStr, reason: 'Folga do Barbeiro' }])
      } catch (err) {
        console.warn('Erro ao inserir folga no Supabase:', err)
      }
    }

    if (import.meta.client) {
      localStorage.setItem('rasta_blocked_dates', JSON.stringify(blockedDates.value))
    }
  }

  // Atualiza horários de funcionamento padrão
  const saveWorkingHours = async (hours: WorkingHours[]) => {
    loading.value = true
    try {
      for (const h of hours) {
        await supabase
          .from('working_hours')
          .upsert({
            day_of_week: h.day_of_week,
            is_working: h.is_working,
            start_time: h.start_time,
            end_time: h.end_time,
            lunch_start: h.lunch_start,
            lunch_end: h.lunch_end
          }, { onConflict: 'day_of_week' })
      }
    } catch (err) {
      console.warn('Salvando working_hours localmente:', err)
    } finally {
      workingHoursList.value = [...hours]
      if (import.meta.client) {
        localStorage.setItem('rasta_working_hours', JSON.stringify(hours))
      }
      loading.value = false
    }
  }

  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0
    const [h, m] = timeStr.split(':').map(Number)
    return h * 60 + m
  }

  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0')
    const m = (minutes % 60).toString().padStart(2, '0')
    return `${h}:${m}`
  }

  /**
   * Calcula todos os slots disponíveis considerando Folgas no Calendário, Expediente Semanal e Almoço
   */
  const calculateAvailableSlots = (
    dateStr: string,
    durationMinutes: number,
    existingAppointments: Appointment[]
  ): TimeSlot[] => {
    if (!dateStr || durationMinutes <= 0) return []

    // 1. Verifica se a data foi especificamente bloqueada no calendário pelo barbeiro (Folga)
    if (blockedDates.value.includes(dateStr)) {
      return [] // Dia de folga total
    }

    const [year, month, day] = dateStr.split('-').map(Number)
    const targetDate = new Date(year, month - 1, day)
    const dayOfWeek = targetDate.getDay()

    // 2. Verifica a rotina semanal padrão
    const config = workingHoursList.value.find(w => w.day_of_week === dayOfWeek)
    if (!config || !config.is_working) {
      return [] // Fechado por padrão no dia da semana
    }

    const barberStatusStore = useBarberStatusStore()

    // Se o barbeiro definiu que nesta data específica começará a partir de um horário específico:
    let effectiveOpenTime = config.start_time
    if (
      barberStatusStore.statusMode === 'scheduled' &&
      barberStatusStore.scheduledDate === dateStr &&
      barberStatusStore.scheduledTime
    ) {
      if (timeToMinutes(barberStatusStore.scheduledTime) > timeToMinutes(effectiveOpenTime)) {
        effectiveOpenTime = barberStatusStore.scheduledTime
      }
    }

    const openMin = timeToMinutes(effectiveOpenTime)
    const closeMin = timeToMinutes(config.end_time)
    const lunchStartMin = config.lunch_start ? timeToMinutes(config.lunch_start) : null
    const lunchEndMin = config.lunch_end ? timeToMinutes(config.lunch_end) : null

    // Agendamentos ativos do dia
    const dayAppointments = existingAppointments.filter(
      a => a.appointment_date === dateStr && a.status !== 'cancelled'
    )

    const now = new Date()
    const isToday =
      targetDate.getFullYear() === now.getFullYear() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getDate() === now.getDate()
    const currentMinutesNow = now.getHours() * 60 + now.getMinutes()

    const slots: TimeSlot[] = []
    const step = 30 // Intervalos de 30 minutos

    for (let slotStart = openMin; slotStart < closeMin; slotStart += step) {
      const slotEnd = slotStart + durationMinutes
      const timeLabel = minutesToTime(slotStart)

      // Passou do horário de fechamento
      if (slotEnd > closeMin) {
        slots.push({ time: timeLabel, available: false, reason: 'exceeds_closing' })
        continue
      }

      // Horário já passou hoje
      if (isToday && slotStart <= currentMinutesNow + 15) {
        slots.push({ time: timeLabel, available: false, reason: 'past' })
        continue
      }

      // Conflito com almoço
      if (lunchStartMin !== null && lunchEndMin !== null) {
        const overlapsLunch = !(slotEnd <= lunchStartMin || slotStart >= lunchEndMin)
        if (overlapsLunch) {
          slots.push({ time: timeLabel, available: false, reason: 'lunch' })
          continue
        }
      }

      // Conflito com outros agendamentos existentes
      const hasConflict = dayAppointments.some(apt => {
        const aptStart = timeToMinutes(apt.start_time)
        const aptEnd = timeToMinutes(apt.end_time)
        return !(slotEnd <= aptStart || slotStart >= aptEnd)
      })

      if (hasConflict) {
        slots.push({ time: timeLabel, available: false, reason: 'booked' })
        continue
      }

      // Disponível
      slots.push({ time: timeLabel, available: true })
    }

    return slots
  }

  return {
    workingHoursList,
    blockedDates,
    loading,
    fetchWorkingHours,
    fetchBlockedDates,
    toggleDateBlocked,
    saveWorkingHours,
    calculateAvailableSlots
  }
}
