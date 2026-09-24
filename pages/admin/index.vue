<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-xs font-bold uppercase tracking-widest text-rasta-gold">Painel de Controle</span>
        <h1 class="text-3xl font-black text-surface-100 mt-1">Olá, Mestre Rasta 👋</h1>
        <p class="text-sm text-dark-300">Acompanhe seus atendimentos do dia e altere seu status em tempo real.</p>
      </div>

      <NuxtLink to="/admin/agendamentos">
        <BaseButton variant="secondary" size="md">
          Ver Agenda Completa
        </BaseButton>
      </NuxtLink>
    </div>

    <!-- Live Status Switch Component -->
    <StatusToggle />

    <!-- Metrics Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-2xl bg-dark-900 border border-white/[0.06] shadow-clean-md space-y-1">
        <span class="text-xs text-dark-400 font-extrabold uppercase tracking-wider">Agendamentos Hoje</span>
        <p class="text-3xl font-black text-surface-100">{{ todayAppointments.length }}</p>
        <p class="text-[11px] text-accent font-bold">{{ confirmedTodayCount }} confirmados para hoje</p>
      </div>

      <div class="p-5 rounded-2xl bg-dark-900 border border-white/[0.06] shadow-clean-md space-y-1">
        <span class="text-xs text-dark-400 font-extrabold uppercase tracking-wider">Previsão Faturamento Hoje</span>
        <p class="text-3xl font-black text-accent">{{ formatCurrency(todayEstimatedRevenue) }}</p>
        <p class="text-[11px] text-dark-400">Somatório dos agendamentos</p>
      </div>

      <div class="p-5 rounded-2xl bg-dark-900 border border-white/[0.06] shadow-clean-md space-y-1">
        <span class="text-xs text-dark-400 font-extrabold uppercase tracking-wider">Concluídos Hoje</span>
        <p class="text-3xl font-black text-blue-400">{{ completedTodayCount }}</p>
        <p class="text-[11px] text-dark-400">Clientes já atendidos</p>
      </div>
    </div>

    <!-- Today's Schedule -->
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-black text-surface-100 flex items-center gap-2">
          <span>Atendimentos de Hoje</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-dark-800 text-surface-200 border border-white/[0.06]">
            {{ todayFormatted }}
          </span>
        </h2>
      </div>

      <!-- Empty State -->
      <div
        v-if="todayAppointments.length === 0"
        class="p-8 rounded-2xl bg-dark-900 border border-white/[0.06] shadow-clean-md text-center space-y-2"
      >
        <p class="text-sm font-bold text-surface-200">Nenhum atendimento agendado para hoje</p>
        <p class="text-xs text-dark-400">Os agendamentos confirmados pelos clientes aparecerão aqui automaticamente.</p>
      </div>

      <!-- List of appointments for today -->
      <div v-else class="space-y-3">
        <div
          v-for="apt in todayAppointments"
          :key="apt.id"
          :class="[
            'p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-clean',
            apt.status === 'confirmed' ? 'bg-dark-900 border-white/[0.06]' :
            apt.status === 'completed' ? 'bg-dark-800 border-transparent opacity-75' :
            'bg-dark-800 border-transparent opacity-40 line-through'
          ]"
        >
          <!-- Client and Time -->
          <div class="flex items-center gap-4">
            <div class="p-3 rounded-xl bg-accent-soft text-accent font-bold text-center min-w-[70px]">
              <span class="text-lg font-black block">{{ apt.start_time }}</span>
              <span class="text-[10px] text-accent/70 uppercase font-semibold">até {{ apt.end_time }}</span>
            </div>

            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <p class="font-extrabold text-surface-100 text-base">{{ apt.client?.full_name || 'Cliente' }}</p>
                <span
                  :class="[
                    'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase',
                    apt.status === 'confirmed' ? 'bg-accent-soft text-accent border border-accent-border' :
                    apt.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-rasta-red-soft text-rasta-red border border-rasta-red-border'
                  ]"
                >
                  {{ apt.status === 'confirmed' ? 'Aguardando' : (apt.status === 'completed' ? 'Concluído' : 'Cancelado') }}
                </span>
              </div>
              <p class="text-xs text-dark-300 font-medium">
                WhatsApp: <a :href="'https://wa.me/55' + (apt.client?.phone || '').replace(/\D/g, '')" target="_blank" class="text-accent font-bold hover:underline">{{ formatPhone(apt.client?.phone) }}</a>
              </p>
              <div class="flex flex-wrap gap-1.5 pt-1">
                <span
                  v-for="(svc, idx) in apt.services"
                  :key="idx"
                  class="px-2.5 py-0.5 rounded-lg bg-dark-800 text-[11px] text-surface-200 font-semibold border border-white/[0.06]"
                >
                  {{ svc.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Price & Actions -->
          <div class="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.06]">
            <div class="text-right">
              <span class="text-xs text-dark-400 block font-bold">Total</span>
              <span class="text-lg font-black text-accent">{{ formatCurrency(apt.total_price) }}</span>
            </div>

            <div v-if="apt.status === 'confirmed'" class="flex items-center gap-2">
              <BaseButton
                size="sm"
                variant="primary"
                @click="bookingStore.completeAppointment(apt.id)"
              >
                Concluir
              </BaseButton>
              <BaseButton
                size="sm"
                variant="danger"
                @click="bookingStore.cancelAppointment(apt.id)"
              >
                Cancelar
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import StatusToggle from '~/components/admin/StatusToggle.vue'
import { formatCurrency, formatPhone } from '~/utils/formatters'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const bookingStore = useBookingStore()

onMounted(async () => {
  await bookingStore.fetchAppointments()
})

const todayDateStr = computed(() => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
})

const todayFormatted = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
})

const todayAppointments = computed(() => {
  return bookingStore.appointments.filter(a => a.appointment_date === todayDateStr.value)
})

const confirmedTodayCount = computed(() => {
  return todayAppointments.value.filter(a => a.status === 'confirmed').length
})

const completedTodayCount = computed(() => {
  return todayAppointments.value.filter(a => a.status === 'completed').length
})

const todayEstimatedRevenue = computed(() => {
  return todayAppointments.value
    .filter(a => a.status === 'confirmed' || a.status === 'completed')
    .reduce((acc, curr) => acc + Number(curr.total_price), 0)
})
</script>
