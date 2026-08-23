<template>
  <div class="space-y-16 pb-16">
    <!-- Hero Section -->
    <section class="relative pt-12 sm:pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div class="text-center space-y-6 max-w-3xl mx-auto">
        <!-- Badge Rasta -->
        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rasta-green-soft border border-rasta-green-border text-rasta-green text-xs font-black uppercase tracking-widest shadow-sm">
          <span>Barbearia & Cortes Roots</span>
        </div>

        <h1 class="text-4xl sm:text-6xl font-black tracking-tight text-surface-900 leading-tight">
          Cortes de Precisão & <br />
          <span class="text-rasta-green">Vibe Única no Rasta</span>
        </h1>

        <p class="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto font-medium">
          Cortes degradê impecáveis, alinhamento de barba e acabamento preciso na navalha. Acompanhe a presença do barbeiro em tempo real e reserve seu horário online sem filas.
        </p>

        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <NuxtLink to="/agendar" class="w-full sm:w-auto">
            <BaseButton size="lg" variant="primary" class="w-full sm:w-auto px-8">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Agendar Meu Horário
            </BaseButton>
          </NuxtLink>

          <a href="#catalogo" class="w-full sm:w-auto">
            <BaseButton size="lg" variant="secondary" class="w-full sm:w-auto">
              Ver Serviços e Preços
            </BaseButton>
          </a>
        </div>
      </div>
    </section>

    <!-- Real-time Barber Live Status Banner -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <BarberLiveBanner />
    </section>

    <!-- Calendário Mensal de Presença do Barbeiro -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ClientMonthCalendar />
    </section>

    <!-- Services Catalog Section -->
    <section id="catalogo" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span class="text-xs font-black uppercase tracking-wider text-rasta-gold">Cardápio de Serviços</span>
          <h2 class="text-3xl font-black text-surface-900 mt-1">Cortes & Barba</h2>
        </div>
        <p class="text-sm text-slate-700 max-w-md">
          Clique no serviço desejado para adicioná-lo ao agendamento direto.
        </p>
      </div>

      <!-- Services Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <ServiceCard
          v-for="service in servicesStore.activeServices"
          :key="service.id"
          :service="service"
          :is-selected="bookingStore.isServiceSelected(service.id)"
          @select="handleServiceClick"
        />
      </div>

      <!-- Quick Action Floating Bar if services selected -->
      <div
        v-if="bookingStore.selectedServices.length > 0"
        class="sticky bottom-6 z-30 p-4 rounded-2xl bg-white border-2 border-rasta-green shadow-clean-lg flex items-center justify-between gap-4 max-w-2xl mx-auto transition-all"
      >
        <div>
          <p class="text-xs text-slate-600 font-semibold">
            <span class="font-bold text-surface-900">{{ bookingStore.selectedServices.length }}</span> serviço(s) selecionado(s)
          </p>
          <p class="text-lg font-black text-rasta-green">
            {{ formatCurrency(bookingStore.totalPrice) }}
            <span class="text-xs text-slate-600 font-normal">({{ formatDuration(bookingStore.totalDurationMinutes) }})</span>
          </p>
        </div>

        <NuxtLink to="/agendar">
          <BaseButton variant="primary" size="md">
            Prosseguir para Data/Hora →
          </BaseButton>
        </NuxtLink>
      </div>
    </section>

    <!-- Experience / Brand Highlights -->
    <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean flex items-start gap-4">
          <div class="p-3 rounded-xl bg-rasta-green-soft text-rasta-green font-bold">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-surface-900 text-sm">Navalhado & Acabamento Preciso</h3>
            <p class="text-xs text-slate-700 mt-1">Linhas nítidas, precisão nas tesouras e alinhamento milimétrico.</p>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean flex items-start gap-4">
          <div class="p-3 rounded-xl bg-rasta-gold-soft text-rasta-gold font-bold">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-surface-900 text-sm">Sem Filas de Espera</h3>
            <p class="text-xs text-slate-700 mt-1">Agende seu horário online com precisão e seja atendido na hora marcada.</p>
          </div>
        </div>

        <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean flex items-start gap-4">
          <div class="p-3 rounded-xl bg-rasta-red-soft text-rasta-red font-bold">
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 class="font-bold text-surface-900 text-sm">Status em Tempo Real</h3>
            <p class="text-xs text-slate-700 mt-1">Saiba instantaneamente se o barbeiro está presente e disponível.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import BarberLiveBanner from '~/components/client/BarberLiveBanner.vue'
import ClientMonthCalendar from '~/components/client/ClientMonthCalendar.vue'
import ServiceCard from '~/components/client/ServiceCard.vue'
import type { Service } from '~/types'
import { formatCurrency, formatDuration } from '~/utils/formatters'

const servicesStore = useServicesStore()
const bookingStore = useBookingStore()

onMounted(async () => {
  await servicesStore.fetchServices()
})

const handleServiceClick = (service: Service) => {
  bookingStore.toggleService(service)
}
</script>
