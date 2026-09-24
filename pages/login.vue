<template>
  <div class="min-h-[75vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
    <div class="max-w-md w-full space-y-6">
      <!-- Header -->
      <div class="text-center space-y-3">
        <img
          src="/rastabarberlogo.png"
          alt="Rasta Barber"
          class="w-16 h-16 rounded-2xl object-contain mx-auto hover:scale-105 transition-transform"
        />
        <h1 class="text-2xl font-bold text-surface-100">
          Acesso do Barbeiro
        </h1>
        <p class="text-xs text-dark-300">
          Informe suas credenciais para acessar o painel de gestão.
        </p>
      </div>

      <!-- Login Card -->
      <div class="p-6 sm:p-8 rounded-2xl bg-dark-800/80 border border-white/[0.08] shadow-clean-lg space-y-6 relative overflow-hidden">
        <div class="absolute top-0 left-0 right-0 h-[2px] rasta-ribbon opacity-60"></div>

        <!-- Error -->
        <div v-if="errorMessage" class="p-3 rounded-xl bg-rasta-red-soft border border-rasta-red-border text-xs text-rasta-red font-semibold">
          {{ errorMessage }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4 pt-1">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
              Usuário *
            </label>
            <input
              v-model="username"
              type="text"
              required
              autocomplete="username"
              placeholder="rastabarber123"
              class="glass-input"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-1.5">
              Senha *
            </label>
            <input
              v-model="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="glass-input"
            />
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            size="lg"
            class="w-full mt-2"
            :loading="authStore.loading"
          >
            Entrar no Painel
          </BaseButton>
        </form>

        <div class="pt-2 text-center border-t border-white/[0.06]">
          <NuxtLink to="/" class="text-xs text-dark-400 hover:text-accent font-medium transition">
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
