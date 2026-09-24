import { defineStore } from 'pinia'
import type { Profile, UserRole } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  
  const profile = ref<Profile | null>(null)
  const loading = ref(false)
  const isDemoMode = ref(false)

  const isAuthenticated = computed(() => !!user.value || !!profile.value)
  const isBarber = computed(() => profile.value?.role === 'barber')

  // Carrega ou sincroniza o perfil do usuário
  const fetchProfile = async () => {
    if (!user.value) {
      // Verifica se há perfil demo persistido via cookie (para funcionar no SSR)
      const demoCookie = useCookie<Profile | null>('rasta_demo_profile')
      if (demoCookie.value) {
        profile.value = demoCookie.value
        isDemoMode.value = true
        return
      }
      profile.value = null
      return
    }

    loading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.value.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar perfil:', error)
      }

      if (data) {
        profile.value = data as Profile
      } else {
        // Fallback de perfil inicial
        profile.value = {
          id: user.value.id,
          role: (user.value.user_metadata?.role as UserRole) || 'client',
          full_name: user.value.user_metadata?.full_name || 'Cliente',
          phone: user.value.user_metadata?.phone || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      }
    } catch (err) {
      console.error('Erro inesperado em fetchProfile:', err)
    } finally {
      loading.value = false
    }
  }

  // Login com Usuário ou Email e Senha
  const login = async (identifier: string, password: string) => {
    loading.value = true
    try {
      const cleanIdentifier = identifier ? identifier.trim() : ''

      // Validação de credenciais de Administrador
      if (cleanIdentifier.toLowerCase() === 'rastabarber123' && password === 'admin123') {
        const adminProfile: Profile = {
          id: '00000000-0000-0000-0000-000000000001',
          role: 'barber',
          full_name: 'Mestre Rasta (Admin)',
          phone: '(11) 98765-4321',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        profile.value = adminProfile
        isDemoMode.value = true
        const demoCookie = useCookie<Profile | null>('rasta_demo_profile')
        demoCookie.value = adminProfile
        return { success: true, data: { user: { id: adminProfile.id, email: 'rastabarber123@admin.local' } } }
      }

      // Se for formato de e-mail e não for o usuário direto, tenta via Supabase
      if (cleanIdentifier.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanIdentifier,
          password
        })
        if (error) throw error
        await fetchProfile()
        return { success: true, data }
      }

      return { success: false, error: 'Usuário ou senha de administrador inválidos.' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Falha ao autenticar' }
    } finally {
      loading.value = false
    }
  }

  // Cadastro de novo cliente no Supabase
  const register = async (email: string, password: string, fullName: string, phone: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            role: 'client'
          }
        }
      })
      if (error) throw error
      await fetchProfile()
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message || 'Falha ao cadastrar' }
    } finally {
      loading.value = false
    }
  }

  // Logout
  const logout = async () => {
    loading.value = true
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error(err)
    } finally {
      const demoCookie = useCookie<Profile | null>('rasta_demo_profile')
      demoCookie.value = null
      profile.value = null
      isDemoMode.value = false
      loading.value = false
    }
  }

  // Alternador de modo Demo (Permite testar como Barbeiro ou Cliente sem chaves do Supabase)
  const setDemoUser = (role: UserRole, name?: string) => {
    const demoProfile: Profile = {
      id: role === 'barber' ? '00000000-0000-0000-0000-000000000001' : '00000000-0000-0000-0000-000000000002',
      role,
      full_name: name || (role === 'barber' ? 'Mestre Rasta (Barbeiro)' : 'Carlos Cliente'),
      phone: '(11) 98765-4321',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    profile.value = demoProfile
    isDemoMode.value = true
    const demoCookie = useCookie<Profile | null>('rasta_demo_profile')
    demoCookie.value = demoProfile
  }

  // Observa mudanças de estado do usuário
  watch(user, () => {
    fetchProfile()
  }, { immediate: true })

  return {
    profile,
    loading,
    isDemoMode,
    isAuthenticated,
    isBarber,
    fetchProfile,
    login,
    register,
    logout,
    setDemoUser
  }
})
