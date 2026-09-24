<template>
  <header class="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-dark-950/80 backdrop-blur-2xl transition-all">
    <!-- Rasta ribbon — thin decorative line -->
    <div class="h-[2px] w-full rasta-ribbon opacity-80"></div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <!-- Logo & Brand -->
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <img
          src="/rastabarberlogo.png"
          alt="Rasta Barber"
          class="w-10 h-10 rounded-xl object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <div>
          <span class="font-extrabold text-lg tracking-tight text-surface-100 group-hover:text-accent transition-colors">
            RASTA <span class="text-accent">BARBER</span>
          </span>
        </div>
      </NuxtLink>

      <!-- Desktop Navigation -->
      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink
          to="/"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-dark-300 hover:text-surface-100 hover:bg-white/[0.04] transition-all"
          active-class="!text-accent bg-accent-soft"
        >
          Início
        </NuxtLink>

        <NuxtLink
          to="/agendar"
          class="px-4 py-2 rounded-lg text-sm font-semibold text-dark-300 hover:text-surface-100 hover:bg-white/[0.04] transition-all"
          active-class="!text-accent bg-accent-soft"
        >
          Agendar
        </NuxtLink>

      </nav>

      <!-- User Actions -->
      <div class="flex items-center gap-3">
        <ThemeSwitcher />

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
          class="md:hidden p-2 rounded-lg text-dark-300 hover:text-surface-100 hover:bg-white/[0.06] transition"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Drawer -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="mobileMenuOpen" class="md:hidden border-t border-white/[0.06] bg-dark-900/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-1">
        <div class="py-2 mb-2">
          <StatusBadge :is-online="barberStatusStore.isOnline" />
        </div>
        <NuxtLink
          to="/"
          class="block px-4 py-2.5 rounded-lg text-sm font-semibold text-dark-300 hover:bg-white/[0.04] hover:text-accent transition"
          @click="mobileMenuOpen = false"
        >
          Início
        </NuxtLink>
        <NuxtLink
          to="/agendar"
          class="block px-4 py-2.5 rounded-lg text-sm font-semibold text-dark-300 hover:bg-white/[0.04] hover:text-accent transition"
          @click="mobileMenuOpen = false"
        >
          Agendar Horário
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import StatusBadge from '~/components/ui/StatusBadge.vue'

const barberStatusStore = useBarberStatusStore()
const mobileMenuOpen = ref(false)
</script>
