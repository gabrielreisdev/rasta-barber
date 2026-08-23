<template>
  <div class="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-md w-full space-y-6">
      <!-- Header -->
      <div class="text-center space-y-2">
        <img
          src="/rastabarberlogo.png"
          alt="Rasta Barber"
          class="w-20 h-20 rounded-2xl object-contain mx-auto shadow-clean hover:scale-105 transition-transform"
        />
        <h1 class="text-2xl font-black text-surface-900">
          Acesso do Barbeiro
        </h1>
        <p class="text-xs text-slate-600">
          Informe seu usuário e senha de administrador para acessar seu painel de gestão.
        </p>
      </div>

      <!-- Admin Login Form Card -->
      <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-clean-lg space-y-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-1.5 rasta-ribbon"></div>

        <!-- Feedback Error -->
        <div v-if="errorMessage" class="p-3.5 rounded-xl bg-rasta-red-soft border border-rasta-red-border text-xs text-rasta-red font-bold">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4 pt-1">
          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Usuário de Administrador *
            </label>
            <input
              v-model="username"
              type="text"
              required
              autocomplete="username"
              placeholder="rastabarber123"
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 text-sm focus:border-rasta-green focus:bg-white focus:outline-none transition font-semibold"
            />
          </div>

          <div>
            <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Senha *
            </label>
            <input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 text-sm focus:border-rasta-green focus:bg-white focus:outline-none transition font-semibold"
            />
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            class="w-full mt-2"
            :loading="authStore.loading"
          >
            Entrar no Painel do Barbeiro
          </BaseButton>
        </form>

        <div class="pt-2 text-center border-t border-slate-100">
          <NuxtLink to="/" class="text-xs text-slate-500 hover:text-rasta-green font-bold transition">
            ← Voltar para a Página Inicial
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'

const authStore = useAuthStore()
const route = useRoute()

const username = ref('')
const password = ref('')
const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  const res = await authStore.login(username.value, password.value)
  if (res.success) {
    const target = (route.query.redirect as string) || '/admin'
    navigateTo(target)
  } else {
    errorMessage.value = res.error || 'Credenciais de administrador inválidas.'
  }
}
</script>
