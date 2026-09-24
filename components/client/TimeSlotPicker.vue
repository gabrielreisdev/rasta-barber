<template>
  <div class="space-y-6">
    <!-- 1. Date Selector -->
    <div>
      <label class="block text-xs font-semibold uppercase tracking-wider text-dark-300 mb-3">
        1. Selecione o Dia
      </label>
      <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
        <button
          v-for="day in nextDays"
          :key="day.dateStr"
          type="button"
          :class="[
            'flex-shrink-0 flex flex-col items-center justify-center w-[72px] py-3 px-2 rounded-xl border transition-all duration-200',
            selectedDate === day.dateStr
              ? 'bg-accent text-dark-950 border-accent shadow-sm shadow-accent/20'
              : 'bg-dark-800/60 border-white/[0.06] text-dark-300 hover:border-accent/30 hover:text-surface-100'
          ]"
          @click="selectDate(day.dateStr)"
        >
          <span class="text-[10px] font-semibold uppercase tracking-wider">{{ day.weekDayName }}</span>
          <span class="text-lg font-bold my-0.5" :class="selectedDate === day.dateStr ? 'text-dark-950' : 'text-surface-100'">
            {{ day.dayNumber }}
          </span>
          <span class="text-[10px]" :class="selectedDate === day.dateStr ? 'text-dark-950/60' : 'text-dark-400'">
            {{ day.monthName }}
          </span>
        </button>
      </div>
    </div>

    <!-- 2. Time Slots Grid -->
    <div>
      <div class="flex items-center justify-between mb-3">
        <label class="block text-xs font-semibold uppercase tracking-wider text-dark-300">
          2. Selecione o Horário
        </label>
        <span v-if="selectedDate" class="text-xs text-rasta-gold font-medium">
          Duração: {{ formatDuration(totalDuration) }}
        </span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="py-12 flex flex-col items-center justify-center text-dark-300 gap-2">
        <svg class="w-6 h-6 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xs">Verificando horários...</p>
      </div>

      <!-- Empty -->
      <div
        v-else-if="!slots || slots.length === 0"
        class="p-6 rounded-xl bg-dark-800/40 border border-white/[0.06] text-center space-y-2"
      >
        <svg class="w-7 h-7 mx-auto text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium text-surface-200">Sem horários livres neste dia</p>
        <p class="text-xs text-dark-300">Escolha outro dia acima.</p>
      </div>

      <!-- Slots Grid -->
      <div v-else class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        <button
          v-for="slot in slots"
          :key="slot.time"
          type="button"
          :disabled="!slot.available"
          :class="[
            'py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all duration-200 flex flex-col items-center justify-center gap-0.5',
            slot.available && selectedTime === slot.time
              ? 'bg-accent text-dark-950 border-accent shadow-sm shadow-accent/20'
              : slot.available
                ? 'bg-dark-800/60 border-white/[0.06] text-surface-200 hover:border-accent/30 hover:text-accent'
                : 'bg-dark-850/40 border-transparent text-dark-500 cursor-not-allowed opacity-40'
          ]"
          @click="slot.available && $emit('selectTime', slot.time)"
        >
          <span>{{ slot.time }}</span>
          <span v-if="!slot.available" class="text-[9px] uppercase tracking-wider text-dark-500">
            {{ getSlotReasonLabel(slot.reason) }}
          </span>
          <span v-else-if="selectedTime === slot.time" class="text-[9px] uppercase tracking-wider text-dark-950/60 font-bold">
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
