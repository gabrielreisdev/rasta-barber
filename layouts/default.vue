<template>
  <div class="min-h-screen flex flex-col bg-surface-50 text-surface-900 selection:bg-rasta-green-soft selection:text-rasta-green">
    <!-- App Header / Navbar Pública -->
    <AppNavbar />

    <!-- Main Content -->
    <main class="flex-grow">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="mt-20 border-t border-slate-200 bg-white py-12 text-slate-600 text-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-3">
          <img
            src="/rastabarberlogo.png"
            alt="Rasta Barber"
            class="w-9 h-9 rounded-xl object-contain shadow-sm"
          />
          <div>
            <p class="font-extrabold text-sm text-surface-900">RASTA BARBER</p>
            <p class="text-[11px] text-slate-600">Estilo roots, precisão nos cortes e atendimento de primeira.</p>
          </div>
        </div>

        <div class="flex items-center gap-6 font-semibold">
          <NuxtLink to="/" class="hover:text-rasta-green transition">Início</NuxtLink>
          <NuxtLink to="/agendar" class="hover:text-rasta-green transition">Agendar Horário</NuxtLink>
          <NuxtLink to="/login" class="text-slate-400 hover:text-rasta-green transition">Área do Barbeiro</NuxtLink>
        </div>

        <p class="text-[11px] text-slate-600">
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
