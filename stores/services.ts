import { defineStore } from 'pinia'
import type { Service } from '~/types'

const DEFAULT_SERVICES: Service[] = [
  {
    id: 's1-corte',
    name: 'Corte',
    description: 'Corte completo com tesoura e máquina, acabamento impecável e alinhamento preciso na navalha.',
    price: 18.00,
    duration_minutes: 30,
    is_active: true
  },
  {
    id: 's2-barba',
    name: 'Barba',
    description: 'Modelagem completa da barba, alinhamento das linhas e finalização com balm hidratante.',
    price: 15.00,
    duration_minutes: 30,
    is_active: true
  },
  {
    id: 's3-corte-barba',
    name: 'Corte e Barba',
    description: 'A combinação ideal: corte degradê de precisão + modelagem e alinhamento completo da barba.',
    price: 30.00,
    duration_minutes: 60,
    is_active: true
  }
]

const STORAGE_KEY = 'rasta_services_v3'

export const useServicesStore = defineStore('services', () => {
  const supabase = useSupabaseClient()
  // Inicializa SEMPRE com os serviços padrão — nunca fica vazio
  const services = ref<Service[]>([...DEFAULT_SERVICES])
  const loading = ref(false)

  const activeServices = computed(() => services.value.filter(s => s.is_active))

  // Função auxiliar para timeout de requisição (1.5s)
  const withTimeout = <T>(promise: Promise<T>, ms = 1500): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ])
  }

  const fetchServices = async () => {
    loading.value = true
    try {
      console.log('[servicesStore] fetchServices starting...')
      const query = supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true })

      console.log('[servicesStore] querying supabase...')
      const res = await withTimeout(query, 5000)
      console.log('[servicesStore] query result:', res)

      const { data, error } = res || {}
      if (error) {
        console.error('[servicesStore] Supabase error in fetchServices:', JSON.stringify(error), error?.message, error?.code, error?.details)
      }

      if (!error && data && data.length > 0) {
        console.log('[servicesStore] Loaded real services from Supabase:', data.length)
        services.value = data as Service[]
        persistLocal()
      } else if (import.meta.client) {
        console.log('[servicesStore] Supabase returned empty/error. Checking localStorage...')
        localStorage.removeItem('rasta_services')
        localStorage.removeItem('rasta_services_v2')

        const cached = localStorage.getItem(STORAGE_KEY)
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log('[servicesStore] Loaded services from localStorage:', parsed.length)
              services.value = parsed
            }
          } catch (e) {
            console.error('[servicesStore] Failed to parse localStorage cache', e)
          }
        }
        persistLocal()
      }
    } catch (err) {
      console.error('[servicesStore] Erro ao carregar serviços remotos (usando dados padrão):', err)
      if (import.meta.client) {
        const cached = localStorage.getItem(STORAGE_KEY)
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && parsed.length > 0) {
              services.value = parsed
            }
          } catch {}
        }
      }
    } finally {
      loading.value = false
    }
  }

  const persistLocal = () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services.value))
    }
  }

  // Criação de novo serviço (Admin)
  const createService = async (serviceData: Omit<Service, 'id' | 'created_at'>) => {
    loading.value = true
    try {
      const { data, error } = await withTimeout(
        supabase
          .from('services')
          .insert([serviceData])
          .select()
          .single(),
        5000
      )

      if (error) {
        console.error('Erro ao criar no Supabase:', error)
        throw error
      }

      if (data) {
        services.value.push(data as Service)
        persistLocal()
        return { success: true, data }
      }
    } catch (err: any) {
      console.warn('Falha ao salvar no banco, usando fallback local:', err)
      const newService: Service = {
        id: 'serv_' + Date.now(),
        ...serviceData
      }
      services.value.push(newService)
      persistLocal()
      return { success: true, data: newService }
    } finally {
      loading.value = false
    }
  }

  // Edição de serviço (Admin)
  const updateService = async (id: string, updates: Partial<Service>) => {
    loading.value = true
    try {
      console.log('[servicesStore] updateService starting for id:', id, 'updates:', updates)
      const res = await withTimeout(
        supabase
          .from('services')
          .update(updates)
          .eq('id', id)
          .select(),
        5000
      )
      console.log('[servicesStore] updateService supabase response:', res)
      
      const { data, error } = res || {}
      if (error) {
        console.error('[servicesStore] updateService supabase error:', error)
        throw error
      }

      const index = services.value.findIndex(s => s.id === id)
      if (index !== -1) {
        services.value[index] = { ...services.value[index], ...updates }
        persistLocal()
      }

      return { success: true, data }
    } catch (err: any) {
      console.error('[servicesStore] updateService catch block:', err)
      const index = services.value.findIndex(s => s.id === id)
      if (index !== -1) {
        services.value[index] = { ...services.value[index], ...updates }
        persistLocal()
      }
      return { success: true }
    } finally {
      loading.value = false
    }
  }

  // Alternar visibilidade/status ativo
  const toggleActive = async (id: string) => {
    const s = services.value.find(item => item.id === id)
    if (!s) return
    return updateService(id, { is_active: !s.is_active })
  }

  // Deletar serviço
  const deleteService = async (id: string) => {
    loading.value = true
    try {
      await supabase.from('services').delete().eq('id', id)
    } catch (err) {
      console.warn('Erro ao deletar remoto:', err)
    } finally {
      services.value = services.value.filter(s => s.id !== id)
      persistLocal()
      loading.value = false
    }
  }

  return {
    services,
    activeServices,
    loading,
    fetchServices,
    createService,
    updateService,
    toggleActive,
    deleteService
  }
})
