<template>
  <div class="p-6 rounded-2xl bg-dark-900 border border-white/[0.06] shadow-clean-md space-y-6">
    <!-- Header do Calendário de Folgas -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
      <div class="space-y-1">
        <h3 class="text-lg font-black text-surface-100 flex items-center gap-2">
          <span>Calendário de Folgas & Bloqueios</span>
          <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rasta-red-soft text-rasta-red border border-rasta-red-border">
            1 Clique para Bloquear
          </span>
        </h3>
        <p class="text-xs text-dark-300">
          Clique em qualquer dia para alternar entre <strong>Dia de Atendimento (Verde)</strong> e <strong>Folga / Offline (Vermelho)</strong>.
        </p>
      </div>

      <!-- Navegação de Mês -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="p-2 rounded-xl border border-white/[0.06] bg-dark-800 hover:bg-dark-700 text-surface-200 transition"
          @click="prevMonth"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <span class="text-sm font-black text-surface-100 min-w-[140px] text-center capitalize">
          {{ currentMonthLabel }}
        </span>

        <button
          type="button"
          class="p-2 rounded-xl border border-white/[0.06] bg-dark-800 hover:bg-dark-700 text-surface-200 transition"
          @click="nextMonth"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Legenda explicativa -->
    <div class="flex flex-wrap items-center gap-4 text-xs font-semibold text-dark-300">
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-md bg-accent"></span>
        <span>Dia Aberto para Clientes</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-md bg-rasta-red"></span>
        <span>Folga / Fechado (Bloqueado)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-md bg-dark-700"></span>
        <span>Folga Padrão Semanal</span>
      </div>
    </div>

    <!-- Grid de Dias do Mês -->
    <div>
      <!-- Dias da Semana Header -->
      <div class="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-black uppercase text-dark-400">
        <span>Dom</span>
        <span>Seg</span>
        <span>Ter</span>
        <span>Qua</span>
        <span>Qui</span>
        <span>Sex</span>
        <span>Sáb</span>
      </div>

      <!-- Grid Cells -->
      <div class="grid grid-cols-7 gap-2">
        <!-- Espaços vazios para o início do mês -->
        <div
          v-for="empty in startDayOfWeek"
          :key="'empty-' + empty"
          class="h-16 rounded-xl bg-dark-800/30 border border-transparent pointer-events-none"
        ></div>

        <!-- Dias do Mês -->
        <button
          v-for="day in daysInCurrentMonth"
          :key="day.dateStr"
          type="button"
          :disabled="day.isPast"
          :class="[
            'h-16 p-2 rounded-xl border transition-all duration-200 flex flex-col justify-between text-left select-none relative group',
            day.isPast ? 'opacity-30 bg-dark-800 border-white/[0.06] cursor-not-allowed text-dark-400' :
            day.isBlocked ? 'bg-rasta-red-soft border-rasta-red-border text-rasta-red shadow-sm hover:scale-[1.02]' :
            day.isWeeklyOff ? 'bg-dark-800 border-white/[0.06] text-dark-400 hover:border-dark-700' :
            'bg-accent-soft border-accent-border text-accent hover:border-accent shadow-sm hover:scale-[1.02]'
          ]"
          @click="toggleDay(day.dateStr)"
        >
          <!-- Top Row: Número do dia e badge -->
          <div class="flex items-center justify-between w-full">
            <span
              :class="[
                'text-sm font-black',
                day.isToday ? 'underline decoration-2 underline-offset-2' : ''
              ]"
            >
              {{ day.dayNumber }}
            </span>
            <span v-if="day.isToday" class="text-[9px] font-extrabold uppercase bg-surface-100 text-dark-950 px-1.5 py-0.5 rounded shadow-sm">
              Hoje
            </span>
          </div>

          <!-- Bottom Row: Status Text -->
          <div class="text-[10px] font-extrabold uppercase tracking-tight">
            <span v-if="day.isPast">Passou</span>
            <span v-else-if="day.isBlocked">⛔ Folga</span>
            <span v-else-if="day.isWeeklyOff">Folga Semanal</span>
            <span v-else>✓ Aberto</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const slotCalculator = useSlotCalculator()

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

    // Verifica se é folga semanal
    const weeklyConfig = hoursList.find(w => w.day_of_week === dayOfWeek)
    const isWeeklyOff = weeklyConfig ? !weeklyConfig.is_working : false

    // Verifica se está especificamente bloqueado pelo barbeiro
    const isBlocked = blockedList.includes(dateStr)

    list.push({
      dayNumber: d,
      dateStr,
      isPast,
      isToday,
      isWeeklyOff,
      isBlocked
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

const toggleDay = async (dateStr: string) => {
  await slotCalculator.toggleDateBlocked(dateStr)
}
</script>
