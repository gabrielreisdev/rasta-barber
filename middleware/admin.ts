export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }

  // Apenas role 'barber' pode acessar rotas administrativas
  if (!authStore.isBarber) {
    return navigateTo('/')
  }
})
