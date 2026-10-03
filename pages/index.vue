<template>
  <div class="min-h-screen bg-dark-950">
    <!-- Compact Hero Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">
      <div class="relative h-[340px] sm:h-[400px] rounded-3xl overflow-hidden border border-white/[0.06] shadow-clean-md">
        <!-- Background Image with Overlay -->
        <img
          src="/hero-bg.jpg"
          alt="Ferramentas de barbeiro da Rasta Barber"
          class="absolute inset-0 w-full h-full object-cover object-right"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-dark-950/90 via-dark-950/50 to-transparent"></div>

      <!-- Hero Content -->
      <div class="relative z-10 h-full flex flex-col justify-center px-6 sm:px-12 max-w-xl space-y-5">
        <!-- <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-dark-900/60 backdrop-blur-md border border-white/10 shadow-clean">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
          </span>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-surface-200">A Nova Geração da Barbearia</span>
        </div> -->

        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05]">
          Corte preciso.<br />
          <span class="text-accent italic font-serif">Vibe única.</span>
        </h1>

        <p class="text-sm sm:text-base text-dark-300 font-medium leading-relaxed">
          Técnica apurada e estilo moderno. Agende seu horário em poucos cliques.
        </p>

        <div class="pt-2">
          <NuxtLink to="/agendar" class="inline-block">
            <button class="px-8 py-3 rounded-full bg-accent hover:bg-emerald-400 text-dark-950 font-bold text-xs tracking-widest uppercase transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_30px_-10px_rgba(52,211,153,0.5)]">
              Agendar Agora
            </button>
          </NuxtLink>
        </div>
      </div>
      </div>
    </section>

    <!-- Bento Grid Services Section -->
    <section class="relative z-20 pt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
      <!-- Section Header -->
      <div class="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <span class="text-sm font-bold uppercase tracking-widest text-accent mb-2 block">Menu</span>
          <h2 class="text-4xl sm:text-5xl font-black text-white tracking-tight">Serviços Premium</h2>
        </div>
        <p class="text-dark-300 text-sm max-w-xs sm:text-right">
          Selecione o serviço desejado abaixo para iniciar o agendamento expresso.
        </p>
      </div>

      <!-- Services Grid (Bento Box style) -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServiceCard
          v-for="(service, index) in servicesStore.activeServices"
          :key="service.id"
          :service="service"
          :index="index"
          :is-selected="bookingStore.isServiceSelected(service.id)"
          @select="handleServiceClick"
        />
      </div>

      <!-- Floating Checkout Action -->
      <Transition
        enter-active-class="transition duration-500 ease-out"
        enter-from-class="opacity-0 translate-y-12 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition duration-300 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-12 scale-95"
      >
        <div
          v-if="bookingStore.selectedServices.length > 0"
          class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md p-4 rounded-3xl bg-dark-900/90 backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] flex items-center justify-between"
        >
          <div class="pl-3">
            <p class="text-[10px] font-bold uppercase tracking-widest text-dark-400">Total Selecionado</p>
            <p class="text-xl font-black text-white">
              {{ formatCurrency(bookingStore.totalPrice) }}
            </p>
          </div>
          <NuxtLink to="/agendar">
            <button class="px-8 py-3.5 rounded-2xl bg-accent text-dark-950 font-bold text-sm hover:bg-emerald-400 transition-colors shadow-glow-green">
              Continuar
            </button>
          </NuxtLink>
        </div>
      </Transition>
    </section>
  </div>
</template>

<script setup lang="ts">
import ServiceCard from '~/components/client/ServiceCard.vue'
import type { Service } from '~/types'
import { formatCurrency } from '~/utils/formatters'

const servicesStore = useServicesStore()
const bookingStore = useBookingStore()

onMounted(async () => {
  await servicesStore.fetchServices()
})

const handleServiceClick = (service: Service) => {
  bookingStore.toggleService(service)
}
</script>

