<template>
  <div class="min-h-screen flex flex-col md:flex-row bg-surface-50 text-surface-900 selection:bg-rasta-green-soft selection:text-rasta-green">
    <!-- Sidebar Desktop do Barbeiro -->
    <aside class="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white p-6 justify-between flex-shrink-0 shadow-clean">
      <div class="space-y-8">
        <!-- Logo & Admin badge -->
        <NuxtLink to="/admin" class="flex items-center gap-3">
          <img
            src="/rastabarberlogo.png"
            alt="Rasta Barber"
            class="w-10 h-10 rounded-xl object-contain shadow-clean"
          />
          <div>
            <h1 class="font-extrabold text-base text-surface-900">RASTA BARBER</h1>
            <span class="text-[10px] font-black uppercase tracking-wider text-rasta-gold">Painel do Barbeiro</span>
          </div>
        </NuxtLink>

        <!-- Navigation Links -->
        <nav class="space-y-1.5">
          <NuxtLink
            to="/admin"
            exact-active-class="bg-rasta-green text-white font-bold shadow-clean"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-surface-700 hover:bg-slate-100 hover:text-surface-900 transition-all"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Visão Geral / Hoje
          </NuxtLink>

          <NuxtLink
            to="/admin/agendamentos"
            active-class="bg-rasta-green text-white font-bold shadow-clean"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-surface-700 hover:bg-slate-100 hover:text-surface-900 transition-all"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Agenda & Reservas
          </NuxtLink>

          <NuxtLink
            to="/admin/servicos"
            active-class="bg-rasta-green text-white font-bold shadow-clean"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-surface-700 hover:bg-slate-100 hover:text-surface-900 transition-all"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879a3 3 0 11-4.242-4.242L10.5 5.5" />
            </svg>
            Catálogo de Serviços
          </NuxtLink>

          <NuxtLink
            to="/admin/agenda"
            active-class="bg-rasta-green text-white font-bold shadow-clean"
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-surface-700 hover:bg-slate-100 hover:text-surface-900 transition-all"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Horários & Expediente
          </NuxtLink>
        </nav>
      </div>

      <!-- Rodapé da Sidebar: Usuário e Sair -->
      <div class="pt-6 border-t border-slate-200 space-y-3">
        <NuxtLink
          to="/"
          class="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-rasta-green transition"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Ver Site Público
        </NuxtLink>

        <div class="flex items-center justify-between pt-2">
          <div>
            <p class="text-xs font-bold text-surface-900">{{ authStore.profile?.full_name || 'Mestre Rasta' }}</p>
            <p class="text-[10px] text-rasta-green uppercase font-bold">Barbeiro / Admin</p>
          </div>
          <button
            type="button"
            class="p-2 rounded-lg text-slate-400 hover:text-rasta-red hover:bg-red-50 transition"
            title="Encerrar Sessão"
            @click="handleLogout"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Mobile Topbar for Admin -->
    <header class="md:hidden flex items-center justify-between p-4 border-b border-slate-200 bg-white">
      <NuxtLink to="/admin" class="flex items-center gap-2">
        <img
          src="/rastabarberlogo.png"
          alt="Rasta Barber"
          class="w-8 h-8 rounded-lg object-contain"
        />
        <span class="font-bold text-sm text-surface-900">Painel do Barbeiro</span>
      </NuxtLink>

      <div class="flex items-center gap-2">
        <NuxtLink to="/" class="text-xs text-slate-700 font-bold px-2.5 py-1 rounded bg-slate-100">
          Ver Site
        </NuxtLink>
        <button
          type="button"
          class="p-1 text-slate-500 hover:text-rasta-red"
          title="Sair"
          @click="handleLogout"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Mobile Admin Nav Bar -->
    <nav class="md:hidden flex overflow-x-auto border-b border-slate-200 bg-white p-2 gap-1 scrollbar-thin shadow-sm">
      <NuxtLink
        to="/admin"
        exact-active-class="bg-rasta-green text-white font-bold"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-surface-700"
      >
        Hoje
      </NuxtLink>
      <NuxtLink
        to="/admin/agendamentos"
        active-class="bg-rasta-green text-white font-bold"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-surface-700"
      >
        Agenda
      </NuxtLink>
      <NuxtLink
        to="/admin/servicos"
        active-class="bg-rasta-green text-white font-bold"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-surface-700"
      >
        Serviços
      </NuxtLink>
      <NuxtLink
        to="/admin/agenda"
        active-class="bg-rasta-green text-white font-bold"
        class="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap text-surface-700"
      >
        Expediente
      </NuxtLink>
    </nav>

    <!-- Main Admin Dashboard Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <main class="p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const barberStatusStore = useBarberStatusStore()

onMounted(async () => {
  await barberStatusStore.fetchStatus()
  barberStatusStore.subscribeToRealtime()
})

const handleLogout = async () => {
  await authStore.logout()
  navigateTo('/login')
}
</script>
