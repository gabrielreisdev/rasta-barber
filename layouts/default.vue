<template>
  <div class="min-h-screen flex flex-col bg-dark-950 text-surface-100">
    <!-- App Header / Navbar Pública -->
    <AppNavbar />

    <!-- Main Content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="mt-20 border-t border-white/[0.06] bg-dark-900/50 py-12 text-dark-300 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <img
            src="/rastabarberlogo.png"
            alt="Rasta Barber"
            class="w-9 h-9 rounded-xl object-contain opacity-80"
          />
          <div>
            <p class="font-extrabold text-sm text-surface-100">RASTA BARBER</p>
            <p class="text-[11px] text-dark-300">Estilo roots, precisão nos cortes e atendimento de primeira.</p>
          </div>
        </div>

        <div class="flex items-center gap-6 font-semibold">
          <NuxtLink to="/" class="text-dark-300 hover:text-accent transition">Início</NuxtLink>
          <NuxtLink to="/agendar" class="text-dark-300 hover:text-accent transition">Agendar Horário</NuxtLink>
          <NuxtLink to="/login" class="text-dark-400 hover:text-accent transition">Área do Barbeiro</NuxtLink>
        </div>

        <p class="text-[11px] text-dark-400">
          © {{ new Date().getFullYear() }} Rasta Barber. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import AppNavbar from '~/components/ui/AppNavbar.vue'

const barberStatusStore = useBarberStatusStore()

onMounted(async () => {
  await barberStatusStore.fetchStatus()
  barberStatusStore.subscribeToRealtime()
})

onUnmounted(() => {
  barberStatusStore.unsubscribe()
})
</script>
