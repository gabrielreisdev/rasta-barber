import { defineStore } from 'pinia'
import type { Service } from '~/types'

const DEFAULT_SERVICES: Service[] = [
  {
    id: '2e6303b0-1306-434c-b8cf-899cf5d0b153',
    name: 'Corte Clássico / Degradê',
    description: 'Corte com tesoura e máquina, acabamento impecável na navalha com toalha refrescante.',
    price: 40.00,
    duration_minutes: 35,
    is_active: true
  },
  {
    id: '02278c57-ff70-448e-9420-df44001890d8',
    name: 'Barba Terapia com Toalha Quente',
    description: 'Modelagem completa da barba, esfoliação facial, hidratação e toalha quente aromática.',
    price: 35.00,
    duration_minutes: 30,
    is_active: true
  },
  {
    id: 'f0b9ec5c-ff1e-4f95-92a7-54bf07f147cc',
    name: 'Combo Rasta Master (Corte + Barba)',
    description: 'A experiência completa: corte degradê de precisão + barba terapia completa.',
    price: 70.00,
    duration_minutes: 60,
    is_active: true
  }
]

const STORAGE_KEY = 'rasta_services_v4'

export const useServicesStore = defineStore('services', () => {
  // Inicializa com os serviços padrão para renderização imediata
  const services = ref<Service[]>([...DEFAULT_SERVICES])
  const loading = ref(false)

  const activeServices = computed(() => services.value.filter(s => s.is_active))

  const persistLocal = () => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services.value))
    }
  }

  const loadFromCache = () => {
    if (!import.meta.client) return false
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          services.value = parsed
          return true
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar serviços do cache local:', e)
    }
    return false
  }

  // Busca serviços via API segura do servidor
  const fetchServices = async () => {
    loading.value = true
    try {
      // Limpa chaves legadas com IDs mockados antigos
      if (import.meta.client) {
        localStorage.removeItem('rasta_services')
        localStorage.removeItem('rasta_services_v2')
        localStorage.removeItem('rasta_services_v3')
      }

      const data = await $fetch<Service[]>('/api/services')
      if (data && Array.isArray(data) && data.length > 0) {
        services.value = data
        persistLocal()
      } else {
        loadFromCache()
      }
    } catch (err) {
      console.warn('Não foi possível carregar serviços da API remota, usando cache/padrão:', err)
      loadFromCache()
    } finally {
      loading.value = false
    }
  }

  // Criação de novo serviço (Admin)
  const createService = async (serviceData: Omit<Service, 'id' | 'created_at'>) => {
    loading.value = true
    try {
      const created = await $fetch<Service>('/api/services', {
        method: 'POST',
        body: serviceData
      })

      if (created) {
        services.value.push(created)
        persistLocal()
        return { success: true, data: created }
      }
      throw new Error('Falha ao criar serviço na API')
    } catch (err: any) {
      console.error('Erro ao criar serviço:', err)
      // Fallback offline com UUID real
      const fallbackId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'serv_' + Date.now()
      const newService: Service = {
        id: fallbackId,
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
      const updated = await $fetch<Service>(`/api/services/${id}`, {
        method: 'PUT',
        body: updates
      })

      const index = services.value.findIndex(s => s.id === id)
      if (index !== -1) {
        services.value[index] = { ...services.value[index], ...(updated || updates) }
        persistLocal()
      }

      return { success: true, data: updated }
    } catch (err: any) {
      console.error('Erro ao atualizar serviço remotamente:', err)
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
      await $fetch(`/api/services/${id}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('Erro ao deletar remotamente na API:', err)
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
