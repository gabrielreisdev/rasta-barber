<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 space-y-8">
    <!-- Header -->
    <div>
      <span class="text-xs font-black uppercase tracking-widest text-accent">Tempo real</span>
      <h1 class="text-3xl sm:text-4xl font-black text-surface-100 tracking-tight mt-1">Status do Rasta</h1>
      <p class="text-sm text-dark-300 mt-1">
        Veja se o barbeiro está na barbearia agora e quando será o próximo atendimento.
      </p>
    </div>

    <!-- Live Status Card -->
    <section
      id="status-live-card"
      :class="[
        'relative overflow-hidden rounded-3xl p-6 sm:p-8 border transition-all duration-500',
        state === 'online'
          ? 'bg-dark-900 border-accent-border shadow-glow-green'
          : state === 'scheduled'
            ? 'bg-dark-900 border-rasta-gold-border shadow-glow-gold'
            : 'bg-dark-900 border-white/[0.06] shadow-clean-md'
      ]"
    >
      <div
        :class="[
          'absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-60',
          state === 'online' ? 'bg-accent/20' : state === 'scheduled' ? 'bg-rasta-gold/15' : 'bg-rasta-red/10'
        ]"
      ></div>

      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
        <!-- Pulse indicator -->
        <div class="relative flex-shrink-0 w-20 h-20 flex items-center justify-center">
          <span
            v-if="state === 'online'"
            class="absolute inset-0 rounded-full bg-accent/30 animate-ping"
          ></span>
          <span
            :class="[
              'relative w-14 h-14 rounded-full flex items-center justify-center text-2xl border',
              state === 'online'
                ? 'bg-accent-soft border-accent-border'
                : state === 'scheduled'
                  ? 'bg-rasta-gold-soft border-rasta-gold-border'
                  : 'bg-rasta-red-soft border-rasta-red-border'
            ]"
          >
            {{ state === 'online' ? '💈' : state === 'scheduled' ? '⏰' : '🌙' }}
          </span>
        </div>

        <div class="flex-1 space-y-2">
          <span
            :class="[
              'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider border',
              state === 'online'
                ? 'bg-accent-soft text-accent border-accent-border'
                : state === 'scheduled'
                  ? 'bg-rasta-gold-soft text-rasta-gold border-rasta-gold-border'
                  : 'bg-rasta-red-soft text-rasta-red border-rasta-red-border'
            ]"
          >
            <span
              :class="[
                'w-1.5 h-1.5 rounded-full',
                state === 'online' ? 'bg-accent' : state === 'scheduled' ? 'bg-rasta-gold' : 'bg-rasta-red'
              ]"
            ></span>
            {{ state === 'online' ? 'Online agora' : state === 'scheduled' ? 'Presença programada' : 'Offline' }}
          </span>

          <h2 class="text-2xl sm:text-3xl font-black text-surface-100 tracking-tight">
            <template v-if="state === 'online'">O Rasta está na barbearia</template>
            <template v-else-if="state === 'scheduled'">Chega {{ barberStatusStore.formattedScheduleText.toLowerCase() }}</template>
            <template v-else>O Rasta não está na barbearia agora</template>
          </h2>

          <p v-if="barberStatusStore.customMessage" class="text-sm text-surface-200 italic">
            “{{ barberStatusStore.customMessage }}”
          </p>

          <p v-if="lastUpdatedLabel" class="text-xs text-dark-400">
            Atualizado {{ lastUpdatedLabel }}
          </p>
        </div>
      </div>
    </section>

    <!-- Info Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Next attendance -->
      <section id="status-next-attendance" class="rounded-3xl p-6 bg-dark-900 border border-white/[0.06] shadow-clean-md space-y-4">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 class="text-xs font-black uppercase tracking-widest text-dark-300">Próximo atendimento</h3>
        </div>

        <div v-if="nextAttendance">
          <p class="text-3xl font-black text-surface-100 tracking-tight">{{ nextAttendance.dayLabel }}</p>
          <p class="text-lg font-bold text-accent mt-1">{{ nextAttendance.timeLabel }}</p>
          <p class="text-xs text-dark-400 mt-3">{{ nextAttendance.note }}</p>
        </div>
        <p v-else-if="!slotCalculator.loading.value" class="text-sm text-dark-300">
          Nenhum dia de atendimento previsto nos próximos 30 dias.
        </p>
        <div v-else class="space-y-2">
          <div class="h-8 w-40 rounded-lg bg-dark-800 animate-pulse"></div>
          <div class="h-5 w-28 rounded-lg bg-dark-800 animate-pulse"></div>
        </div>

        <NuxtLink to="/agendar" class="inline-block pt-2">
          <BaseButton variant="primary" size="md">Agendar horário</BaseButton>
        </NuxtLink>
      </section>

      <!-- Next 7 days -->
      <section id="status-week-schedule" class="rounded-3xl p-6 bg-dark-900 border border-white/[0.06] shadow-clean-md space-y-4">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-xs font-black uppercase tracking-widest text-dark-300">Próximos 7 dias</h3>
        </div>

        <ul class="divide-y divide-white/[0.04]">
          <li
            v-for="day in weekDays"
            :key="day.dateStr"
            :class="[
              'flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl text-sm',
              day.isToday ? 'bg-accent-soft' : ''
            ]"
          >
            <div class="flex items-center gap-3">
              <span :class="['font-bold capitalize w-20', day.isToday ? 'text-accent' : 'text-surface-100']">
                {{ day.isToday ? 'Hoje' : day.weekday }}
              </span>
              <span class="text-xs text-dark-400">{{ day.shortDate }}</span>
            </div>
            <div class="text-right">
              <span v-if="day.closedReason" class="text-xs font-bold text-dark-400 uppercase tracking-wider">
                {{ day.closedReason }}
              </span>
              <template v-else>
                <span class="font-bold text-surface-100">{{ day.hours }}</span>
                <span v-if="day.lunch" class="block text-[11px] text-dark-400">Almoço {{ day.lunch }}</span>
              </template>
            </div>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import type { WorkingHours } from '~/types'

useHead({
  title: 'Status do Rasta | Rasta Barber',
  meta: [
    { name: 'description', content: 'Veja em tempo real se o barbeiro está na Rasta Barber e quando será o próximo atendimento.' }
  ]
})

const barberStatusStore = useBarberStatusStore()
const slotCalculator = useSlotCalculator()

// Relógio local para manter os textos relativos atualizados
const now = ref(new Date())
let timer: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  timer = setInterval(() => { now.value = new Date() }, 30_000)
  await slotCalculator.fetchWorkingHours()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// ---------- Helpers ----------
const toDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hhmm = (t?: string | null) => (t ? t.slice(0, 5) : '')
const toMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const addDays = (base: Date, n: number) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + n)
const configFor = (d: Date): WorkingHours | undefined =>
  slotCalculator.workingHoursList.value.find(w => w.day_of_week === d.getDay())
const isBlocked = (d: Date) => slotCalculator.blockedDates.value.includes(toDateStr(d))

const weekdayFmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
const shortDateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' })

const dayLabelFor = (d: Date) => {
  const today = toDateStr(now.value)
  const tomorrow = toDateStr(addDays(now.value, 1))
  const ds = toDateStr(d)
  if (ds === today) return 'Hoje'
  if (ds === tomorrow) return 'Amanhã'
  const wd = weekdayFmt.format(d)
  return `${wd.charAt(0).toUpperCase()}${wd.slice(1)}, ${shortDateFmt.format(d)}`
}

// ---------- Estado atual ----------
const state = computed<'online' | 'scheduled' | 'offline'>(() => {
  const { statusMode, scheduledDate, scheduledTime, isOnline } = barberStatusStore
  if (statusMode === 'offline') return 'offline'
  if (statusMode === 'scheduled' && scheduledDate && scheduledTime) {
    // Compara com o relógio local para virar "online" sozinho quando chegar a hora
    const n = now.value
    const todayStr = toDateStr(n)
    const nowMin = n.getHours() * 60 + n.getMinutes()
    if (scheduledDate < todayStr || (scheduledDate === todayStr && nowMin >= toMinutes(scheduledTime))) {
      return 'online'
    }
    return 'scheduled'
  }
  return isOnline ? 'online' : 'offline'
})

const lastUpdatedLabel = computed(() => {
  if (!barberStatusStore.lastUpdated) return ''
  const diffMin = Math.floor((now.value.getTime() - new Date(barberStatusStore.lastUpdated).getTime()) / 60000)
  if (diffMin < 1) return 'agora mesmo'
  if (diffMin < 60) return `há ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `há ${diffH} h`
  const diffD = Math.floor(diffH / 24)
  return `há ${diffD} dia${diffD > 1 ? 's' : ''}`
})

// ---------- Próximo atendimento ----------
const nextAttendance = computed(() => {
  const n = now.value

  if (state.value === 'online') {
    const cfg = configFor(n)
    const worksToday = cfg?.is_working && !isBlocked(n)
    return {
      dayLabel: 'Agora',
      timeLabel: worksToday ? `Atendendo até ${hhmm(cfg!.end_time)}` : 'Atendendo neste momento',
      note: 'O barbeiro marcou presença na barbearia.'
    }
  }

  if (state.value === 'scheduled') {
    const [y, m, d] = barberStatusStore.scheduledDate!.split('-').map(Number)
    return {
      dayLabel: dayLabelFor(new Date(y, m - 1, d)),
      timeLabel: `A partir das ${hhmm(barberStatusStore.scheduledTime)}`,
      note: 'Horário confirmado pelo próprio barbeiro.'
    }
  }

  // Offline: estima pela agenda semanal + folgas marcadas no calendário
  if (!slotCalculator.workingHoursList.value.length) return null
  const nowMin = n.getHours() * 60 + n.getMinutes()
  for (let i = 0; i < 30; i++) {
    const day = addDays(n, i)
    const cfg = configFor(day)
    if (!cfg?.is_working || isBlocked(day)) continue
    // Hoje só conta se o expediente ainda não começou (o barbeiro está offline)
    if (i === 0 && nowMin >= toMinutes(cfg.start_time)) continue
    return {
      dayLabel: dayLabelFor(day),
      timeLabel: `A partir das ${hhmm(cfg.start_time)}`,
      note: 'Previsão baseada no horário de funcionamento. Sujeito a alteração.'
    }
  }
  return null
})

// ---------- Próximos 7 dias ----------
const weekDays = computed(() => {
  const todayStr = toDateStr(now.value)
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(now.value, i)
    const ds = toDateStr(d)
    const cfg = configFor(d)

    let closedReason = ''
    if (isBlocked(d)) closedReason = 'Folga'
    else if (!cfg || !cfg.is_working) closedReason = 'Fechado'

    // Se o barbeiro programou chegada mais tarde neste dia, mostra o horário ajustado
    let start = cfg ? hhmm(cfg.start_time) : ''
    if (
      cfg &&
      barberStatusStore.statusMode === 'scheduled' &&
      barberStatusStore.scheduledDate === ds &&
      barberStatusStore.scheduledTime &&
      toMinutes(barberStatusStore.scheduledTime) > toMinutes(cfg.start_time)
    ) {
      start = hhmm(barberStatusStore.scheduledTime)
    }

    return {
      dateStr: ds,
      isToday: ds === todayStr,
      weekday: weekdayFmt.format(d).replace('-feira', ''),
      shortDate: shortDateFmt.format(d),
      closedReason,
      hours: cfg ? `${start} – ${hhmm(cfg.end_time)}` : '',
      lunch: cfg?.lunch_start && cfg?.lunch_end ? `${hhmm(cfg.lunch_start)}–${hhmm(cfg.lunch_end)}` : ''
    }
  })
})
</script>
