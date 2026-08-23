export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Se o usuário não está autenticado e nem em modo demo
  if (!authStore.isAuthenticated) {
    return navigateTo({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  }
})
