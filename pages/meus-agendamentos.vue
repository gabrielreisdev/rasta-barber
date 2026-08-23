<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <span class="text-xs font-black uppercase tracking-widest text-rasta-gold">Consultar Reservas</span>
        <h1 class="text-3xl font-black text-surface-900 mt-1">Meus Agendamentos</h1>
        <p class="text-sm text-slate-700">Consulte seus horários marcados ou busque pelo seu WhatsApp.</p>
      </div>

      <NuxtLink to="/agendar">
        <BaseButton variant="primary" size="md">
          + Novo Agendamento
        </BaseButton>
      </NuxtLink>
    </div>

    <!-- Search by Phone input -->
    <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean flex flex-col sm:flex-row items-center gap-3">
      <div class="flex-1 w-full">
        <label class="block text-[11px] font-black uppercase text-slate-600 mb-1">
          Buscar por Telefone / WhatsApp:
        </label>
        <input
          v-model="searchPhone"
          type="tel"
          placeholder="Ex: (11) 98765-4321 ou apenas números"
          class="w-full px-3.5 py-2 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 text-sm font-semibold focus:border-rasta-green focus:bg-white focus:outline-none"
        />
      </div>
      <div class="w-full sm:w-auto self-end">
        <BaseButton variant="secondary" size="md" class="w-full sm:w-auto" @click="clearSearch">
          Mostrar Recentes
        </BaseButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="bookingStore.loading" class="py-16 text-center text-slate-700">
      <div class="inline-block animate-spin w-8 h-8 border-4 border-rasta-green border-t-transparent rounded-full mb-2"></div>
      <p class="text-sm font-semibold">Carregando agendamentos...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredAppointments.length === 0"
      class="py-16 px-4 rounded-3xl bg-white border border-slate-200 shadow-clean text-center space-y-4 max-w-md mx-auto"
    >
      <div class="w-12 h-12 rounded-2xl bg-rasta-green-soft flex items-center justify-center mx-auto text-rasta-green">
        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-lg font-bold text-surface-900">Nenhum agendamento encontrado</h3>
      <p class="text-xs text-slate-700">
        Não localizamos reservas para este número. Escolha seu corte e agende online.
      </p>
      <NuxtLink to="/agendar">
        <BaseButton variant="primary" size="md">Agendar Agora</BaseButton>
      </NuxtLink>
    </div>

    <!-- Lista de Agendamentos -->
    <div v-else class="space-y-4">
      <div
        v-for="apt in filteredAppointments"
        :key="apt.id"
        class="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md transition-all space-y-4"
      >
        <!-- Header Card: Data, Hora e Status -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div class="flex items-center gap-3">
            <div class="p-3 rounded-xl bg-rasta-green-soft text-rasta-green font-bold text-center min-w-[54px] shadow-sm">
              <span class="text-xs block leading-none font-bold">{{ getFormattedMonth(apt.appointment_date) }}</span>
              <span class="text-xl leading-tight font-black">{{ getFormattedDay(apt.appointment_date) }}</span>
            </div>
            <div>
              <p class="text-base font-black text-surface-900">
                {{ apt.start_time }} às {{ apt.end_time }}
              </p>
              <p class="text-xs text-slate-700 font-medium">
                Cliente: <strong class="text-surface-900">{{ apt.client_name }}</strong> • {{ formatFriendlyDate(apt.appointment_date) }}
              </p>
            </div>
          </div>

          <!-- Status Badge -->
          <div>
            <span
              :class="[
                'px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-sm',
                apt.status === 'confirmed' ? 'bg-rasta-green-soft text-rasta-green border border-rasta-green-border' :
                apt.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                apt.status === 'cancelled' ? 'bg-rasta-red-soft text-rasta-red border border-rasta-red-border' :
                'bg-amber-50 text-amber-700 border border-amber-200'
              ]"
            >
              {{ getStatusLabel(apt.status) }}
            </span>
          </div>
        </div>

        <!-- Lista de Serviços -->
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="(svc, idx) in apt.services"
            :key="idx"
            class="px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-surface-800 font-bold"
          >
            {{ svc.name }}
          </span>
        </div>

        <!-- Rodapé do Card: Preço e Ações -->
        <div class="flex items-center justify-between pt-2">
          <div>
            <span class="text-[11px] text-slate-600 block uppercase font-extrabold">Valor Total</span>
            <span class="text-lg font-black text-rasta-green">{{ formatCurrency(apt.total_price) }}</span>
          </div>

          <div v-if="apt.status === 'confirmed'">
            <BaseButton
              size="sm"
              variant="danger"
              @click="handleCancel(apt.id)"
            >
              Cancelar Horário
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
    // Mostra os agendamentos recentes salvos localmente ou os últimos cadastrados
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
