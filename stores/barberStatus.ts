import { defineStore } from 'pinia'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { BarberStatus } from '~/types'

export type PresenceMode = 'immediate' | 'scheduled' | 'offline'

export const useBarberStatusStore = defineStore('barberStatus', () => {
  const supabase = useSupabaseClient()
  const isOnline = ref(false)
  const statusMode = ref<PresenceMode>('offline')
  const scheduledDate = ref<string | null>(null)
  const scheduledTime = ref<string | null>(null)
  const customMessage = ref<string | null>(null)
  const lastUpdated = ref<string | null>(null)
  const loading = ref(false)
  let channel: RealtimeChannel | null = null

  // Verifica se o barbeiro está efetivamente online no momento
  const isCurrentlyOnline = computed(() => {
    if (statusMode.value === 'offline') return false
    if (statusMode.value === 'immediate') return isOnline.value

    if (statusMode.value === 'scheduled') {
      if (!scheduledDate.value || !scheduledTime.value) return isOnline.value
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const todayStr = `${yyyy}-${mm}-${dd}`

      const currentMinutes = now.getHours() * 60 + now.getMinutes()
      const [h, m] = scheduledTime.value.split(':').map(Number)
      const scheduledMinutes = h * 60 + m

      // Se a data já passou ou se é hoje e o horário já passou
      if (scheduledDate.value < todayStr) return true
      if (scheduledDate.value === todayStr && currentMinutes >= scheduledMinutes) return true

      return false
    }

    return isOnline.value
  })

  // Texto formatado amigável da programação de presença
  const formattedScheduleText = computed(() => {
    if (statusMode.value === 'immediate' || (isOnline.value && statusMode.value !== 'scheduled')) {
      return 'Online na Barbearia'
    }

    if (statusMode.value === 'scheduled' && scheduledDate.value && scheduledTime.value) {
      const now = new Date()
      const yyyy = now.getFullYear()
      const mm = String(now.getMonth() + 1).padStart(2, '0')
      const dd = String(now.getDate()).padStart(2, '0')
      const todayStr = `${yyyy}-${mm}-${dd}`

      const tomorrow = new Date()
      tomorrow.setDate(now.getDate() + 1)
      const tomY = tomorrow.getFullYear()
      const tomM = String(tomorrow.getMonth() + 1).padStart(2, '0')
      const tomD = String(tomorrow.getDate()).padStart(2, '0')
      const tomorrowStr = `${tomY}-${tomM}-${tomD}`

      let dayLabel = ''
      if (scheduledDate.value === todayStr) {
        dayLabel = 'Hoje'
      } else if (scheduledDate.value === tomorrowStr) {
        dayLabel = 'Amanhã'
      } else {
        const [y, m, d] = scheduledDate.value.split('-')
        dayLabel = `Dia ${d}/${m}`
      }

      return `${dayLabel} a partir das ${scheduledTime.value}`
    }

    return 'Barbeiro Ausente / Offline'
  })

  const scheduleShortSummary = computed(() => {
    if (isCurrentlyOnline.value) return 'Rasta Online na Barbearia'
    if (statusMode.value === 'scheduled' && scheduledDate.value && scheduledTime.value) {
      return `Atende ${formattedScheduleText.value}`
    }
    return 'Barbeiro Offline'
  })

  // Sincroniza estado com cache local
  const syncFromCache = () => {
    if (!import.meta.client) return
    const cached = localStorage.getItem('rasta_barber_status_full')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        isOnline.value = parsed.is_online ?? false
        statusMode.value = parsed.status_mode ?? (parsed.is_online ? 'immediate' : 'offline')
        scheduledDate.value = parsed.scheduled_date ?? null
        scheduledTime.value = parsed.scheduled_time ?? null
        customMessage.value = parsed.custom_message ?? null
        lastUpdated.value = parsed.last_updated ?? null
        return
      } catch {}
    }

    const legacyOnline = localStorage.getItem('rasta_barber_online')
    if (legacyOnline !== null) {
      isOnline.value = legacyOnline === 'true'
      statusMode.value = isOnline.value ? 'immediate' : 'offline'
    }
  }

  const saveToCache = () => {
    if (!import.meta.client) return
    const data = {
      is_online: isOnline.value,
      status_mode: statusMode.value,
      scheduled_date: scheduledDate.value,
      scheduled_time: scheduledTime.value,
      custom_message: customMessage.value,
      last_updated: lastUpdated.value
    }
    localStorage.setItem('rasta_barber_status_full', JSON.stringify(data))
    localStorage.setItem('rasta_barber_online', String(isOnline.value))
  }

  // Busca o status inicial
  const fetchStatus = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('barber_status')
        .select('*')
        .eq('id', 1)
        .single()

      if (!error && data) {
        isOnline.value = data.is_online ?? false
        statusMode.value = (data.status_mode as PresenceMode) || (data.is_online ? 'immediate' : 'offline')
        scheduledDate.value = data.scheduled_date ?? null
        scheduledTime.value = data.scheduled_time ?? null
        customMessage.value = data.custom_message ?? null
        lastUpdated.value = data.last_updated ?? null
        saveToCache()
      } else {
        syncFromCache()
      }
    } catch (err) {
      syncFromCache()
    } finally {
      loading.value = false
    }
  }

  // Inscreve no Supabase Realtime para receber updates instantâneos
  const subscribeToRealtime = () => {
    if (channel) return

    try {
      channel = supabase
        .channel('barber_status_realtime')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'barber_status', filter: 'id=eq.1' },
          (payload: any) => {
            if (payload.new) {
              isOnline.value = payload.new.is_online ?? false
              statusMode.value = (payload.new.status_mode as PresenceMode) || (payload.new.is_online ? 'immediate' : 'offline')
              scheduledDate.value = payload.new.scheduled_date ?? null
              scheduledTime.value = payload.new.scheduled_time ?? null
              customMessage.value = payload.new.custom_message ?? null
              lastUpdated.value = payload.new.last_updated ?? null
              saveToCache()
            }
          }
        )
        .subscribe()
    } catch (err) {
      console.warn('Realtime channel falhou (modo offline/demo):', err)
    }
  }

  const unsubscribe = () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }

  // Atualiza a presença (Imediato, Programado ou Offline)
  const setPresence = async (options: {
    isOnline: boolean
    statusMode: PresenceMode
    scheduledDate?: string | null
    scheduledTime?: string | null
    customMessage?: string | null
  }) => {
    loading.value = true
    isOnline.value = options.isOnline
    statusMode.value = options.statusMode
    scheduledDate.value = options.scheduledDate || null
    scheduledTime.value = options.scheduledTime || null
    customMessage.value = options.customMessage || null
    lastUpdated.value = new Date().toISOString()

    saveToCache()

    try {
      const updatePayload: any = {
        is_online: options.isOnline,
        status_mode: options.statusMode,
        scheduled_date: options.scheduledDate || null,
        scheduled_time: options.scheduledTime || null,
        custom_message: options.customMessage || null,
        last_updated: new Date().toISOString()
      }

      const { error } = await supabase
        .from('barber_status')
        .update(updatePayload)
        .eq('id', 1)

      if (error) {
        // Se der erro por colunas não criadas no supabase remoto, tenta update apenas com is_online
        await supabase
          .from('barber_status')
          .update({
            is_online: options.isOnline,
            last_updated: new Date().toISOString()
          })
          .eq('id', 1)
      }
      return { success: true }
    } catch (err: any) {
      console.warn('Erro ao atualizar status remoto (mantendo local):', err)
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  // Alterna o status (legado / atalho rápido)
  const toggleStatus = async (newStatus: boolean) => {
    return await setPresence({
      isOnline: newStatus,
      statusMode: newStatus ? 'immediate' : 'offline',
      scheduledDate: null,
      scheduledTime: null
    })
  }

  return {
    isOnline,
    statusMode,
    scheduledDate,
    scheduledTime,
    customMessage,
    lastUpdated,
    loading,
    isCurrentlyOnline,
    formattedScheduleText,
    scheduleShortSummary,
    fetchStatus,
    subscribeToRealtime,
    unsubscribe,
    setPresence,
    toggleStatus
  }
})
