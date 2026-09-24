<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-6">
      <div>
        <span class="text-xs font-semibold uppercase tracking-widest text-rasta-gold">Consultar Reservas</span>
        <h1 class="text-2xl font-bold text-surface-100 mt-1">Meus Agendamentos</h1>
        <p class="text-sm text-dark-300">Consulte seus horários marcados ou busque pelo seu WhatsApp.</p>
      </div>

      <NuxtLink to="/agendar">
        <BaseButton variant="primary" size="md">
          + Novo Agendamento
        </BaseButton>
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="p-4 rounded-xl bg-dark-800/60 border border-white/[0.06] flex flex-col sm:flex-row items-center gap-3">
      <div class="flex-1 w-full">
        <label class="block text-[11px] font-semibold uppercase text-dark-300 mb-1">
          Buscar por Telefone / WhatsApp:
        </label>
        <input
          v-model="searchPhone"
          type="tel"
          placeholder="Ex: (11) 98765-4321 ou apenas números"
          class="glass-input"
        />
      </div>
      <div class="w-full sm:w-auto self-end">
        <BaseButton variant="secondary" size="md" class="w-full sm:w-auto" @click="clearSearch">
          Mostrar Recentes
        </BaseButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="bookingStore.loading" class="py-16 text-center text-dark-300">
      <div class="inline-block animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full mb-2"></div>
      <p class="text-sm font-medium">Carregando agendamentos...</p>
    </div>

    <!-- Empty -->
    <div
      v-else-if="filteredAppointments.length === 0"
      class="py-16 px-4 rounded-2xl bg-dark-800/40 border border-white/[0.06] text-center space-y-4 max-w-md mx-auto"
    >
      <div class="w-12 h-12 rounded-xl bg-accent-soft flex items-center justify-center mx-auto text-accent">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-surface-100">Nenhum agendamento encontrado</h3>
      <p class="text-xs text-dark-300">
        Não localizamos reservas para este número. Agende online.
      </p>
      <NuxtLink to="/agendar">
        <BaseButton variant="primary" size="md">Agendar Agora</BaseButton>
      </NuxtLink>
    </div>

    <!-- Appointments List -->
    <div v-else class="space-y-3">
      <div
        v-for="apt in filteredAppointments"
        :key="apt.id"
        class="p-5 rounded-xl bg-dark-800/60 border border-white/[0.06] hover:border-white/[0.1] transition-all space-y-4"
      >
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-accent-soft text-accent font-bold text-center min-w-[50px]">
              <span class="text-[10px] block leading-none font-semibold">{{ getFormattedMonth(apt.appointment_date) }}</span>
              <span class="text-lg leading-tight font-bold">{{ getFormattedDay(apt.appointment_date) }}</span>
            </div>
            <div>
              <p class="text-sm font-bold text-surface-100">
                {{ apt.start_time }} às {{ apt.end_time }}
              </p>
              <p class="text-xs text-dark-300">
                <strong class="text-surface-200">{{ apt.client_name }}</strong> • {{ formatFriendlyDate(apt.appointment_date) }}
              </p>
            </div>
          </div>

          <!-- Status -->
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider',
              apt.status === 'confirmed' ? 'bg-accent-soft text-accent border border-accent-border' :
              apt.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
              apt.status === 'cancelled' ? 'bg-rasta-red-soft text-rasta-red border border-rasta-red-border' :
              'bg-rasta-gold-soft text-rasta-gold border border-rasta-gold-border'
            ]"
          >
            {{ getStatusLabel(apt.status) }}
          </span>
        </div>

        <!-- Services -->
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="(svc, idx) in apt.services"
            :key="idx"
            class="px-3 py-1 rounded-lg bg-dark-700/50 border border-white/[0.06] text-xs text-surface-200 font-medium"
          >
            {{ svc.name }}
          </span>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between pt-2">
          <div>
            <span class="text-[11px] text-dark-400 block uppercase font-semibold">Valor Total</span>
            <span class="text-lg font-bold text-accent">{{ formatCurrency(apt.total_price) }}</span>
          </div>

          <div v-if="apt.status === 'confirmed'">
            <BaseButton
              size="sm"
              variant="danger"
              @click="handleCancel(apt.id)"
            >
              Cancelar
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import type { AppointmentStatus } from '~/types'
import { formatCurrency } from '~/utils/formatters'

const bookingStore = useBookingStore()
const searchPhone = ref('')

onMounted(async () => {
  await bookingStore.fetchAppointments()
  if (bookingStore.clientPhone) {
    searchPhone.value = bookingStore.clientPhone
  }
})

const clearSearch = () => {
  searchPhone.value = ''
}

const filteredAppointments = computed(() => {
  const all = bookingStore.appointments
  if (!searchPhone.value || !searchPhone.value.trim()) {
    return all.slice(0, 10)
  }
  const cleanSearch = searchPhone.value.replace(/\D/g, '')
  return all.filter(a => {
    const cleanPhone = (a.client_phone || '').replace(/\D/g, '')
    return cleanPhone.includes(cleanSearch) || (a.client_name || '').toLowerCase().includes(searchPhone.value.toLowerCase())
  })
})

const getStatusLabel = (status: AppointmentStatus) => {
  switch (status) {
    case 'confirmed': return 'Confirmado'
    case 'completed': return 'Concluído'
    case 'cancelled': return 'Cancelado'
    case 'pending': return 'Pendente'
    default: return status
  }
}

const getFormattedDay = (dateStr: string) => {
  if (!dateStr) return ''
  return dateStr.split('-')[2]
}

const getFormattedMonth = (dateStr: string) => {
  if (!dateStr) return ''
  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
  const mIndex = parseInt(dateStr.split('-')[1], 10) - 1
  return months[mIndex] || ''
}

const formatFriendlyDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}/${y}`
}

const handleCancel = async (id: string) => {
  if (confirm('Tem certeza de que deseja cancelar este agendamento?')) {
    await bookingStore.cancelAppointment(id)
  }
}
</script>
