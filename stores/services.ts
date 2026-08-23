import { defineStore } from 'pinia'
import type { Service } from '~/types'

const DEFAULT_SERVICES: Service[] = [
  {
    id: 's1-corte-classico',
    name: 'Corte Clássico / Degradê',
    description: 'Corte com tesoura e máquina, acabamento impecável e alinhamento preciso na navalha.',
    price: 40.00,
    duration_minutes: 35,
    is_active: true
  },
  {
    id: 's2-barba-completa',
    name: 'Barba Completa / Modelagem',
    description: 'Modelagem completa da barba, alinhamento das linhas e finalização com balm hidratante.',
    price: 35.00,
    duration_minutes: 30,
    is_active: true
  },
  {
    id: 's3-combo-master',
    name: 'Combo Rasta Master (Corte + Barba)',
    description: 'A combinação ideal: corte degradê de precisão + modelagem e alinhamento completo da barba.',
    price: 70.00,
    duration_minutes: 60,
    is_active: true
  },
  {
    id: 's4-sobrancelha',
    name: 'Design de Sobrancelha',
    description: 'Alinhamento e limpeza precisa com navalhete.',
    price: 15.00,
    duration_minutes: 15,
    is_active: true
  }
]

export const useServicesStore = defineStore('services', () => {
  const supabase = useSupabaseClient()
  const services = ref<Service[]>([])
  const loading = ref(false)

  const activeServices = computed(() => services.value.filter(s => s.is_active))

  const fetchServices = async () => {
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('price', { ascending: true })

      if (!error && data && data.length > 0) {
        services.value = data as Service[]
      } else {
        if (import.meta.client) {
          const cached = localStorage.getItem('rasta_services')
          if (cached) {
            try {
              const parsed = JSON.parse(cached)
              // Filtra serviços removidos caso estejam em cache antigo
              const filtered = parsed.filter((s: Service) =>
                !s.name.toLowerCase().includes('platinado') &&
                !s.name.toLowerCase().includes('nevou') &&
                !s.name.toLowerCase().includes('pigmenta')
              )
              services.value = filtered.length > 0 ? filtered : [...DEFAULT_SERVICES]
              return
            } catch {}
          }
        }
        services.value = [...DEFAULT_SERVICES]
      }
    } catch (err) {
      console.warn('Erro ao carregar serviços remotos (usando dados padrão):', err)
      services.value = [...DEFAULT_SERVICES]
    } finally {
      loading.value = false
    }
  }

  const persistLocal = () => {
    if (import.meta.client) {
      localStorage.setItem('rasta_services', JSON.stringify(services.value))
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
