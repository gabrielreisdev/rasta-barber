<template>
  <div class="min-h-screen bg-dark-950">
    <!-- Cinematic Hero Section -->
    <section class="relative h-[85vh] sm:h-[90vh] flex items-center justify-center overflow-hidden">
      <!-- Background Image with Overlay -->
      <div class="absolute inset-0 z-0">
        <img
          src="/hero-bg.jpg"
          alt="Barbershop Interior"
          class="w-full h-full object-cover opacity-40 scale-105 transform animate-slow-pan"
        />
        <div class="absolute inset-0 bg-gradient-to-b from-dark-950/20 via-dark-950/60 to-dark-950"></div>
        <div class="absolute inset-0 bg-gradient-to-r from-dark-950/80 via-transparent to-dark-950/80"></div>
      </div>

      <!-- Hero Content -->
      <div class="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-8 mt-12">
        <!-- <div class="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-dark-900/60 backdrop-blur-md border border-white/10 shadow-clean">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
          </span>
          <span class="text-xs font-bold uppercase tracking-[0.2em] text-surface-200">A Nova Geração da Barbearia</span>
        </div> -->

        <h1 class="text-6xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9]">
          CORTE <br class="sm:hidden" />
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-white via-surface-200 to-dark-400">PRECISO.</span><br />
          <span class="text-accent italic font-serif">VIBE ÚNICA.</span>
        </h1>

        <p class="text-lg sm:text-xl text-dark-300 max-w-2xl mx-auto font-medium leading-relaxed">
          Onde a técnica apurada encontra o estilo moderno. Agende seu horário e experimente o padrão Rasta Barber.
        </p>

        <div class="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink to="/agendar" class="w-full sm:w-auto">
            <button class="w-full sm:w-auto px-10 py-4 rounded-full bg-accent hover:bg-emerald-400 text-dark-950 font-bold text-sm tracking-widest uppercase transition-all duration-300 shadow-[0_0_40px_-10px_rgba(52,211,153,0.5)] hover:shadow-[0_0_60px_-10px_rgba(52,211,153,0.7)] hover:-translate-y-1">
              Agendar Agora
            </button>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Bento Grid Services Section -->
    <section class="relative z-20 -mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
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

<style scoped>
@keyframes slow-pan {
  0% {
    transform: scale(1.05) translate(0, 0);
  }
  50% {
    transform: scale(1.1) translate(-1%, -1%);
  }
  100% {
    transform: scale(1.05) translate(0, 0);
  }
}
.animate-slow-pan {
  animation: slow-pan 30s ease-in-out infinite;
}
</style>
