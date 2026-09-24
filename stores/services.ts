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
      const { data, error } = await withTimeout(
        supabase
          .from('services')
          .select('*')
          .order('price', { ascending: true })
      )

      if (!error && data && data.length > 0) {
        // Supabase retornou dados reais — usa eles
        services.value = data as Service[]
        persistLocal()
      } else if (import.meta.client) {
        // Supabase falhou/vazio — tenta cache local, senão mantém DEFAULT_SERVICES
        localStorage.removeItem('rasta_services')
        localStorage.removeItem('rasta_services_v2')

        const cached = localStorage.getItem(STORAGE_KEY)
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && parsed.length > 0) {
              services.value = parsed
            }
          } catch {}
        }
        // Se não tinha cache válido, services já tem DEFAULT_SERVICES
        persistLocal()
      }
      // No SSR sem dados do Supabase: services já tem DEFAULT_SERVICES, não mexe
    } catch (err) {
      console.warn('Erro ao carregar serviços remotos (usando dados padrão):', err)
      // services já tem DEFAULT_SERVICES, não precisa sobrescrever
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
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select()
        .single()

      if (!error && data) {
        services.value.push(data as Service)
        persistLocal()
        return { success: true, data }
      }
      
      const newService: Service = {
        id: 'serv_' + Date.now(),
        ...serviceData
      }
      services.value.push(newService)
      persistLocal()
      return { success: true, data: newService }
    } catch (err: any) {
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
      const { error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)

      const index = services.value.findIndex(s => s.id === id)
      if (index !== -1) {
        services.value[index] = { ...services.value[index], ...updates }
        persistLocal()
      }

      return { success: !error }
    } catch (err: any) {
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
