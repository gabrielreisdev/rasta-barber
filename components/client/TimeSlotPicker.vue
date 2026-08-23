<template>
  <div class="space-y-6">
    <!-- 1. Seletor de Datas (Próximos 14 dias) -->
    <div>
      <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-3">
        1. Selecione o Dia
      </label>
      <div class="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
        <button
          v-for="day in nextDays"
          :key="day.dateStr"
          type="button"
          :class="[
            'flex-shrink-0 flex flex-col items-center justify-center w-20 py-3 px-2 rounded-2xl border transition-all duration-200 shadow-clean',
            selectedDate === day.dateStr
              ? 'bg-rasta-green text-white border-rasta-green shadow-clean-md scale-[1.02]'
              : 'bg-white border-slate-200 text-surface-700 hover:border-rasta-green/50 hover:bg-slate-50'
          ]"
          @click="selectDate(day.dateStr)"
        >
          <span class="text-[11px] font-bold uppercase tracking-wider">{{ day.weekDayName }}</span>
          <span class="text-xl font-black my-0.5" :class="selectedDate === day.dateStr ? 'text-white' : 'text-surface-900'">
            {{ day.dayNumber }}
          </span>
          <span class="text-[10px]" :class="selectedDate === day.dateStr ? 'text-green-100' : 'text-slate-600'">
            {{ day.monthName }}
          </span>
        </button>
      </div>
    </div>

    <!-- 2. Grid de Horários Disponíveis -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600">
          2. Selecione o Horário de Início
        </label>
        <span v-if="selectedDate" class="text-xs text-rasta-gold font-bold">
          Duração estimada: {{ formatDuration(totalDuration) }}
        </span>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="py-12 flex flex-col items-center justify-center text-slate-600 gap-2">
        <svg class="w-6 h-6 animate-spin text-rasta-green" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xs font-medium">Verificando horários livres na agenda...</p>
      </div>

      <!-- Empty / Closed State -->
      <div
        v-else-if="!slots || slots.length === 0"
        class="p-6 rounded-2xl bg-white border border-slate-200 text-center space-y-2 shadow-clean"
      >
        <svg class="w-8 h-8 mx-auto text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-bold text-surface-800">Barbearia fechada ou sem horários livres neste dia</p>
        <p class="text-xs text-slate-600">O barbeiro não atende nesta data ou os horários já foram preenchidos. Escolha outro dia acima.</p>
      </div>

      <!-- Slots Grid -->
      <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        <button
          v-for="slot in slots"
          :key="slot.time"
          type="button"
          :disabled="!slot.available"
          :class="[
            'py-2.5 px-3 rounded-xl text-sm font-bold border transition-all duration-200 flex flex-col items-center justify-center gap-0.5 shadow-clean',
            slot.available && selectedTime === slot.time
              ? 'bg-rasta-green text-white border-rasta-green shadow-clean-md scale-[1.02]'
              : slot.available
                ? 'bg-white border-slate-200 text-surface-800 hover:border-rasta-green/60 hover:text-rasta-green hover:bg-emerald-50/40'
                : 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed opacity-50'
          ]"
          @click="slot.available && $emit('selectTime', slot.time)"
        >
          <span>{{ slot.time }}</span>
          <span v-if="!slot.available" class="text-[9px] uppercase tracking-wider font-semibold text-slate-600">
            {{ getSlotReasonLabel(slot.reason) }}
          </span>
          <span v-else-if="selectedTime === slot.time" class="text-[9px] uppercase tracking-wider text-green-100 font-extrabold">
            Escolhido
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TimeSlot, Appointment } from '~/types'
import { formatDuration } from '~/utils/formatters'

const props = defineProps<{
  selectedDate: string
  selectedTime: string
  totalDuration: number
  appointments: Appointment[]
}>()

const emit = defineEmits<{
  (e: 'selectDate', date: string): void
  (e: 'selectTime', time: string): void
}>()

const slotCalculator = useSlotCalculator()
const slots = ref<TimeSlot[]>([])
const loading = ref(false)

const nextDays = computed(() => {
  const days = []
  const today = new Date()
  const weekShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const monthShort = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  for (let i = 0; i < 14; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)

    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    days.push({
      dateStr,
      dayNumber: dd,
      weekDayName: i === 0 ? 'Hoje' : (i === 1 ? 'Amanhã' : weekShort[d.getDay()]),
      monthName: monthShort[d.getMonth()]
    })
  }
  return days
})

const updateSlots = () => {
  if (!props.selectedDate) {
    slots.value = []
    return
  }
  slots.value = slotCalculator.calculateAvailableSlots(
    props.selectedDate,
    props.totalDuration || 30,
    props.appointments
  )
}

const selectDate = (dateStr: string) => {
  emit('selectDate', dateStr)
}

const getSlotReasonLabel = (reason?: string) => {
  switch (reason) {
    case 'booked': return 'Ocupado'
    case 'lunch': return 'Almoço'
    case 'past': return 'Passou'
    case 'exceeds_closing': return 'Sem tempo'
    default: return 'Indisp.'
  }
}

onMounted(async () => {
  loading.value = true
  await slotCalculator.fetchWorkingHours()
  loading.value = false
  if (props.selectedDate) {
    updateSlots()
  } else if (nextDays.value.length > 0) {
    emit('selectDate', nextDays.value[0].dateStr)
  }
})

watch(() => [props.selectedDate, props.totalDuration, props.appointments], () => {
  updateSlots()
}, { deep: true })
</script>
