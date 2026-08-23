<template>
  <div class="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-clean space-y-6">
    <!-- Header do Calendário do Cliente -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
      <div>
        <span class="text-xs font-black uppercase tracking-wider text-rasta-gold">Disponibilidade Mensal</span>
        <h3 class="text-xl sm:text-2xl font-black text-surface-900 mt-0.5 flex items-center gap-2">
          <span>Dias de Atendimento do Rasta</span>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rasta-green-soft text-rasta-green border border-rasta-green-border">
            Atualizado em Tempo Real
          </span>
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 mt-1">
          Confira abaixo os dias em que o barbeiro estará presente. Clique em um dia disponível para agendar seu horário.
        </p>
      </div>

      <!-- Navegação de Mês -->
      <div class="flex items-center gap-2 self-start sm:self-auto bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          class="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-surface-800 transition shadow-xs"
          @click="prevMonth"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span class="text-xs sm:text-sm font-black text-surface-900 min-w-[130px] text-center capitalize px-2">
          {{ currentMonthLabel }}
        </span>

        <button
          type="button"
          class="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-surface-800 transition shadow-xs"
          @click="nextMonth"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Legenda de Cores -->
    <div class="flex flex-wrap items-center gap-4 sm:gap-6 text-xs font-bold text-slate-700 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
      <div class="flex items-center gap-2">
        <span class="w-3.5 h-3.5 rounded-md bg-rasta-green border border-green-600"></span>
        <span>Dia com Atendimento (Disponível)</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3.5 h-3.5 rounded-md bg-slate-200 border border-slate-300"></span>
        <span>Folga / Indisponível</span>
      </div>
    </div>

    <!-- Grid do Calendário -->
    <div>
      <!-- Dias da Semana Header -->
      <div class="grid grid-cols-7 gap-1.5 sm:gap-2 mb-2 text-center text-[11px] sm:text-xs font-black uppercase text-slate-500">
        <span>Dom</span>
        <span>Seg</span>
        <span>Ter</span>
        <span>Qua</span>
        <span>Qui</span>
        <span>Sex</span>
        <span>Sáb</span>
      </div>

      <!-- Células do Calendário -->
      <div class="grid grid-cols-7 gap-1.5 sm:gap-2">
        <!-- Espaços vazios do início do mês -->
        <div
          v-for="empty in startDayOfWeek"
          :key="'empty-' + empty"
          class="h-16 sm:h-20 rounded-2xl bg-slate-50/30 border border-transparent opacity-20 pointer-events-none"
        ></div>

        <!-- Dias do Mês -->
        <button
          v-for="day in daysInCurrentMonth"
          :key="day.dateStr"
          type="button"
          :disabled="day.isPast || !day.isOpen"
          :class="[
            'h-16 sm:h-20 p-2 sm:p-2.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between text-left select-none relative group',
            day.isPast ? 'opacity-30 bg-slate-100 border-slate-200 cursor-not-allowed' :
            !day.isOpen ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' :
            'bg-gradient-to-b from-white to-emerald-50/60 border-rasta-green-border hover:border-rasta-green text-surface-900 shadow-sm hover:shadow-clean-md hover:scale-[1.03] cursor-pointer'
          ]"
          @click="selectDayToBook(day.dateStr)"
        >
          <!-- Topo do Dia: Número e Badge -->
          <div class="flex items-center justify-between w-full">
            <span
              :class="[
                'text-sm sm:text-base font-black',
                day.isOpen && !day.isPast ? 'text-surface-900 group-hover:text-rasta-green' : 'text-slate-400',
                day.isToday ? 'underline decoration-2 decoration-rasta-gold underline-offset-2' : ''
              ]"
            >
              {{ day.dayNumber }}
            </span>

            <span
              v-if="day.isToday"
              class="text-[8px] sm:text-[9px] font-black uppercase bg-rasta-gold text-white px-1.5 py-0.5 rounded shadow-xs"
            >
              Hoje
            </span>
          </div>

          <!-- Rodapé do Dia: Status e Horário -->
          <div class="text-[9px] sm:text-[10px] font-black uppercase tracking-tight">
            <span v-if="day.isPast" class="text-slate-400 font-medium">Passou</span>
            <span v-else-if="!day.isOpen" class="text-slate-500 font-bold">Folga</span>
            <div v-else class="flex flex-col">
              <span class="text-rasta-green flex items-center gap-1 font-black">
                <span class="w-1.5 h-1.5 rounded-full bg-rasta-green animate-pulse"></span>
                Atendendo
              </span>
              <span class="text-[9px] text-slate-500 font-semibold lowercase hidden sm:inline">
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

    // Configuração semanal do dia
    const weeklyConfig = hoursList.find(w => w.day_of_week === dayOfWeek)
    const isWeeklyOff = weeklyConfig ? !weeklyConfig.is_working : false

    // Folga específica cadastrada pelo barbeiro
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
