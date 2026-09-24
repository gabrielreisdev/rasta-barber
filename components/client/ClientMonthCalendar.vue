<template>
  <div class="p-6 sm:p-8 rounded-2xl bg-dark-800/60 border border-white/[0.06] space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
      <div>
        <span class="text-xs font-semibold uppercase tracking-wider text-rasta-gold">Disponibilidade</span>
        <h3 class="text-lg sm:text-xl font-bold text-surface-100 mt-0.5">
          Dias de Atendimento
        </h3>
        <p class="text-xs text-dark-300 mt-1">
          Clique em um dia disponível para agendar.
        </p>
      </div>

      <!-- Month Navigation -->
      <div class="flex items-center gap-2 self-start sm:self-auto bg-dark-700/50 p-1 rounded-xl border border-white/[0.06]">
        <button
          type="button"
          class="p-2 rounded-lg hover:bg-white/[0.06] text-dark-300 hover:text-surface-100 transition"
          @click="prevMonth"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span class="text-sm font-semibold text-surface-100 min-w-[130px] text-center capitalize px-2">
          {{ currentMonthLabel }}
        </span>

        <button
          type="button"
          class="p-2 rounded-lg hover:bg-white/[0.06] text-dark-300 hover:text-surface-100 transition"
          @click="nextMonth"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-dark-300 bg-dark-700/30 p-3 rounded-xl border border-white/[0.04]">
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-md bg-accent/80"></span>
        <span>Disponível</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-md bg-dark-600"></span>
        <span>Folga / Indisponível</span>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div>
      <!-- Week Days Header -->
      <div class="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-[11px] sm:text-xs font-semibold uppercase text-dark-400">
        <span>Dom</span>
        <span>Seg</span>
        <span>Ter</span>
        <span>Qua</span>
        <span>Qui</span>
        <span>Sex</span>
        <span>Sáb</span>
      </div>

      <!-- Calendar Cells -->
      <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
        <!-- Empty slots -->
        <div
          v-for="empty in startDayOfWeek"
          :key="'empty-' + empty"
          class="h-14 sm:h-18 rounded-xl bg-dark-850/30 border border-transparent opacity-20 pointer-events-none"
        ></div>

        <!-- Day cells -->
        <button
          v-for="day in daysInCurrentMonth"
          :key="day.dateStr"
          type="button"
          :disabled="day.isPast || !day.isOpen"
          :class="[
            'h-14 sm:h-18 p-2 rounded-xl border transition-all duration-200 flex flex-col justify-between text-left select-none relative group',
            day.isPast ? 'opacity-20 bg-dark-800/30 border-transparent cursor-not-allowed' :
            !day.isOpen ? 'bg-dark-800/30 border-white/[0.04] text-dark-400 cursor-not-allowed' :
            'bg-dark-700/40 border-white/[0.06] hover:border-accent/40 text-surface-100 hover:bg-dark-700/60 hover:shadow-sm cursor-pointer'
          ]"
          @click="selectDayToBook(day.dateStr)"
        >
          <!-- Day Number -->
          <div class="flex items-center justify-between w-full">
            <span
              :class="[
                'text-sm font-semibold',
                day.isOpen && !day.isPast ? 'text-surface-100 group-hover:text-accent' : 'text-dark-400',
                day.isToday ? 'text-accent' : ''
              ]"
            >
              {{ day.dayNumber }}
            </span>

            <span
              v-if="day.isToday"
              class="text-[7px] sm:text-[8px] font-bold uppercase bg-accent text-dark-950 px-1.5 py-0.5 rounded"
            >
              Hoje
            </span>
          </div>

          <!-- Day Status Footer -->
          <div class="text-[9px] sm:text-[10px] font-medium">
            <span v-if="day.isPast" class="text-dark-500">—</span>
            <span v-else-if="!day.isOpen" class="text-dark-400">Folga</span>
            <div v-else class="flex flex-col">
              <span class="text-accent flex items-center gap-1">
                <span class="w-1 h-1 rounded-full bg-accent"></span>
                Aberto
              </span>
              <span class="text-[8px] text-dark-400 hidden sm:inline">
                {{ day.hoursText }}
              </span>
            </div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const slotCalculator = useSlotCalculator()
const bookingStore = useBookingStore()

const currentDate = ref(new Date())

onMounted(async () => {
  await slotCalculator.fetchWorkingHours()
})

const currentYear = computed(() => currentDate.value.getFullYear())
const currentMonth = computed(() => currentDate.value.getMonth())

const currentMonthLabel = computed(() => {
  return currentDate.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

const startDayOfWeek = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  return firstDay.getDay()
})

const daysInCurrentMonth = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const totalDays = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const hoursList = unref(slotCalculator.workingHoursList) || []
  const blockedList = unref(slotCalculator.blockedDates) || []

  const list = []
  for (let d = 1; d <= totalDays; d++) {
    const dObj = new Date(year, month, d)
    dObj.setHours(0, 0, 0, 0)

    const yyyy = dObj.getFullYear()
    const mm = String(dObj.getMonth() + 1).padStart(2, '0')
    const dd = String(dObj.getDate()).padStart(2, '0')
    const dateStr = `${yyyy}-${mm}-${dd}`

    const isPast = dObj.getTime() < today.getTime()
    const isToday = dObj.getTime() === today.getTime()
    const dayOfWeek = dObj.getDay()

    const weeklyConfig = hoursList.find(w => w.day_of_week === dayOfWeek)
    const isWeeklyOff = weeklyConfig ? !weeklyConfig.is_working : false
    const isBlocked = blockedList.includes(dateStr)
    const isOpen = !isWeeklyOff && !isBlocked

    const hoursText = weeklyConfig && weeklyConfig.is_working
      ? `${weeklyConfig.start_time.slice(0, 5)} às ${weeklyConfig.end_time.slice(0, 5)}`
      : ''

    list.push({
      dayNumber: d,
      dateStr,
      isPast,
      isToday,
      isOpen,
      hoursText
    })
  }

  return list
})

const prevMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
}

const selectDayToBook = (dateStr: string) => {
  bookingStore.selectedDate = dateStr
  navigateTo('/agendar')
}
</script>
