<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md transition-all shadow-clean">
    <!-- Faixa Rasta Tricolor (Verde, Ouro, Vermelho) -->
    <div class="h-1.5 w-full rasta-ribbon"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <!-- Logo & Brand -->
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <img
          src="/rastabarberlogo.png"
          alt="Rasta Barber"
          class="w-12 h-12 rounded-xl object-contain shadow-clean group-hover:scale-105 transition-transform duration-200"
        />
        <div>
          <span class="font-extrabold text-xl tracking-tight text-surface-900 group-hover:text-rasta-green transition-colors">
            RASTA <span class="text-rasta-green">BARBER</span>
          </span>
          <div class="flex items-center gap-1.5 text-[10px] tracking-wider uppercase font-bold text-slate-600">
            <span class="text-rasta-green">Roots</span>
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-rasta-gold"></span>
            <span class="text-rasta-gold">Style</span>
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-rasta-red"></span>
            <span class="text-rasta-red">Precision</span>
          </div>
        </div>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-6 text-sm font-semibold">
        <NuxtLink
          to="/"
          class="text-surface-700 hover:text-rasta-green transition-colors"
          active-class="text-rasta-green font-bold"
        >
          Início
        </NuxtLink>

        <NuxtLink
          to="/agendar"
          class="text-surface-700 hover:text-rasta-green transition-colors"
          active-class="text-rasta-green font-bold"
        >
          Agendar
        </NuxtLink>
      </nav>

      <!-- User Actions & Quick Switcher -->
      <div class="flex items-center gap-3">
        <!-- Live Status Badge -->
        <NuxtLink to="/agendar" class="hidden sm:block">
          <StatusBadge :is-online="barberStatusStore.isOnline" />
        </NuxtLink>

        <NuxtLink to="/agendar">
          <BaseButton size="sm" variant="primary">
            Agendar Horário
          </BaseButton>
        </NuxtLink>

        <!-- Mobile Menu Button -->
        <button
          type="button"
          class="md:hidden p-2 rounded-xl text-surface-700 hover:bg-slate-100"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <div v-if="mobileMenuOpen" class="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
      <div class="py-2">
        <StatusBadge :is-online="barberStatusStore.isOnline" />
      </div>
      <NuxtLink
        to="/"
        class="block px-3 py-2 rounded-xl text-base font-semibold text-surface-800 hover:bg-slate-50 hover:text-rasta-green"
        @click="mobileMenuOpen = false"
      >
        Início
      </NuxtLink>
      <NuxtLink
        to="/agendar"
        class="block px-3 py-2 rounded-xl text-base font-semibold text-surface-800 hover:bg-slate-50 hover:text-rasta-green"
        @click="mobileMenuOpen = false"
      >
        Agendar Horário
      </NuxtLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import StatusBadge from '~/components/ui/StatusBadge.vue'

const barberStatusStore = useBarberStatusStore()
const mobileMenuOpen = ref(false)
</script>
