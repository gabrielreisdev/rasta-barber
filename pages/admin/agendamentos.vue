<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <span class="text-xs font-black uppercase tracking-widest text-rasta-gold">Histórico & Grade</span>
        <h1 class="text-3xl font-black text-surface-900 mt-1">Todos os Agendamentos</h1>
        <p class="text-sm text-slate-700">Consulte, filtre por data e gerencie o status de cada atendimento.</p>
      </div>

      <!-- Date Filter -->
      <div class="flex items-center gap-2">
        <label class="text-xs text-slate-700 font-extrabold uppercase">Filtrar Data:</label>
        <input
          v-model="filterDate"
          type="date"
          class="px-3 py-2 rounded-xl bg-white border border-slate-200 text-surface-900 text-xs focus:border-rasta-green focus:outline-none shadow-clean"
        />
        <button
          v-if="filterDate"
          type="button"
          class="text-xs text-rasta-green font-bold hover:underline"
          @click="filterDate = ''"
        >
          Limpar
        </button>
      </div>
    </div>

    <!-- Status Tabs Filter -->
    <div class="flex flex-wrap gap-2">
      <button
        type="button"
        :class="[
          'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-clean',
          filterStatus === 'all' ? 'bg-surface-900 text-white shadow-clean-md' : 'bg-white text-slate-700 hover:text-surface-900 border border-slate-200'
        ]"
        @click="filterStatus = 'all'"
      >
        Todos ({{ bookingStore.appointments.length }})
      </button>

      <button
        type="button"
        :class="[
          'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-clean',
          filterStatus === 'confirmed' ? 'bg-rasta-green text-white shadow-clean-md' : 'bg-white text-slate-700 hover:text-surface-900 border border-slate-200'
        ]"
        @click="filterStatus = 'confirmed'"
      >
        Confirmados ({{ countByStatus('confirmed') }})
      </button>

      <button
        type="button"
        :class="[
          'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-clean',
          filterStatus === 'completed' ? 'bg-blue-600 text-white shadow-clean-md' : 'bg-white text-slate-700 hover:text-surface-900 border border-slate-200'
        ]"
        @click="filterStatus = 'completed'"
      >
        Concluídos ({{ countByStatus('completed') }})
      </button>

      <button
        type="button"
        :class="[
          'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all shadow-clean',
          filterStatus === 'cancelled' ? 'bg-rasta-red text-white shadow-clean-md' : 'bg-white text-slate-700 hover:text-surface-900 border border-slate-200'
        ]"
        @click="filterStatus = 'cancelled'"
      >
        Cancelados ({{ countByStatus('cancelled') }})
      </button>
    </div>

    <!-- Empty State -->
    <div
      v-if="filteredAppointments.length === 0"
      class="p-12 rounded-3xl bg-white border border-slate-200 shadow-clean text-center space-y-2 max-w-md mx-auto"
    >
      <p class="text-base font-bold text-surface-900">Nenhum agendamento encontrado</p>
      <p class="text-xs text-slate-700">Não há reservas cadastradas para os filtros selecionados.</p>
    </div>

    <!-- Appointments Cards -->
    <div v-else class="space-y-3">
      <div
        v-for="apt in filteredAppointments"
        :key="apt.id"
        class="p-5 rounded-2xl bg-white border border-slate-200 shadow-clean flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div class="flex items-center gap-4">
          <div class="p-3 rounded-xl bg-rasta-green-soft text-rasta-green font-bold text-center min-w-[70px]">
            <span class="text-xs block text-slate-600 font-semibold">{{ formatFriendlyDate(apt.appointment_date) }}</span>
            <span class="text-base font-black text-surface-900">{{ apt.start_time }}</span>
            <span class="text-[10px] text-slate-600 block">às {{ apt.end_time }}</span>
          </div>

          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h3 class="font-extrabold text-surface-900 text-base">{{ apt.client?.full_name || 'Cliente' }}</h3>
              <span
                :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase',
                  apt.status === 'confirmed' ? 'bg-rasta-green-soft text-rasta-green border border-rasta-green-border' :
                  apt.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-rasta-red-soft text-rasta-red border border-rasta-red-border'
                ]"
              >
                {{ getStatusLabel(apt.status) }}
              </span>
            </div>

            <p class="text-xs text-slate-700 font-medium">
              Tel: {{ formatPhone(apt.client?.phone) }}
            </p>

            <div class="flex flex-wrap gap-1.5 pt-1">
              <span
                v-for="(svc, idx) in apt.services"
                :key="idx"
                class="px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] text-surface-800 font-semibold"
              >
                {{ svc.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div class="text-right">
            <span class="text-xs text-slate-700 block font-bold">Total</span>
            <span class="text-lg font-black text-rasta-green">{{ formatCurrency(apt.total_price) }}</span>
          </div>

          <div v-if="apt.status === 'confirmed'" class="flex items-center gap-2">
            <BaseButton size="sm" variant="success" @click="bookingStore.completeAppointment(apt.id)">
              Concluir
            </BaseButton>
            <BaseButton size="sm" variant="danger" @click="bookingStore.cancelAppointment(apt.id)">
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
import { formatCurrency, formatPhone } from '~/utils/formatters'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const bookingStore = useBookingStore()
const filterDate = ref('')
const filterStatus = ref<'all' | AppointmentStatus>('all')

onMounted(async () => {
  await bookingStore.fetchAppointments()
})

const countByStatus = (status: AppointmentStatus) => {
  return bookingStore.appointments.filter(a => a.status === status).length
}

const filteredAppointments = computed(() => {
  return bookingStore.appointments.filter(apt => {
    if (filterDate.value && apt.appointment_date !== filterDate.value) {
      return false
    }
    if (filterStatus.value !== 'all' && apt.status !== filterStatus.value) {
      return false
    }
    return true
  })
})

const getStatusLabel = (status: AppointmentStatus) => {
  switch (status) {
    case 'confirmed': return 'Confirmado'
    case 'completed': return 'Concluído'
    case 'cancelled': return 'Cancelado'
    default: return status
  }
}

const formatFriendlyDate = (dateStr: string) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}`
}
</script>
