<template>
  <div class="p-6 rounded-3xl bg-dark-900 border border-white/[0.06] shadow-clean-lg space-y-6">
    <!-- Header do Card -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs font-black uppercase tracking-wider text-dark-400">Controle de Presença</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-accent-soft text-accent border border-accent-border">
            Sincronização em Tempo Real
          </span>
        </div>
        <h3 class="text-xl font-black text-surface-100 flex items-center gap-2">
          <span>Status Atual para Clientes:</span>
        </h3>
      </div>

      <!-- Badge de Status Ativo -->
      <div
        :class="[
          'px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border flex items-center gap-2 shadow-sm transition-all',
          barberStatusStore.isCurrentlyOnline
            ? 'bg-accent-soft text-accent border-accent-border'
            : barberStatusStore.statusMode === 'scheduled'
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
              : 'bg-rasta-red-soft text-rasta-red border-rasta-red-border'
        ]"
      >
        <span class="relative flex h-2.5 w-2.5">
          <span
            v-if="barberStatusStore.isCurrentlyOnline"
            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"
          ></span>
          <span
            :class="[
              'relative inline-flex rounded-full h-2.5 w-2.5',
              barberStatusStore.isCurrentlyOnline
                ? 'bg-accent'
                : barberStatusStore.statusMode === 'scheduled'
                  ? 'bg-amber-500'
                  : 'bg-rasta-red'
            ]"
          ></span>
        </span>
        <span>{{ barberStatusStore.formattedScheduleText }}</span>
      </div>
    </div>

    <!-- Modos de Presença (Seletor) -->
    <div class="space-y-3">
      <label class="block text-xs font-black uppercase tracking-wider text-dark-400">
        Escolha como deseja configurar sua disponibilidade:
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <!-- Opção 1: Online Agora -->
        <button
          type="button"
          :class="[
            'p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-2',
            selectedMode === 'immediate'
              ? 'bg-accent-soft border-accent ring-2 ring-accent shadow-sm'
              : 'bg-dark-800 border-white/[0.06] hover:border-white/[0.1] hover:bg-dark-700'
          ]"
          @click="selectMode('immediate')"
        >
          <div class="flex items-center justify-between">
            <span class="text-xl">🟢</span>
            <span v-if="selectedMode === 'immediate'" class="w-2.5 h-2.5 rounded-full bg-accent"></span>
          </div>
          <div>
            <p class="font-extrabold text-sm text-surface-100">Online Agora</p>
            <p class="text-xs text-dark-400">Já estou na barbearia e atendendo clientes.</p>
          </div>
        </button>

        <!-- Opção 2: Programar Dia e Horário -->
        <button
          type="button"
          :class="[
            'p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-2',
            selectedMode === 'scheduled'
              ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500 shadow-sm'
              : 'bg-dark-800 border-white/[0.06] hover:border-white/[0.1] hover:bg-dark-700'
          ]"
          @click="selectMode('scheduled')"
        >
          <div class="flex items-center justify-between">
            <span class="text-xl">⏰</span>
            <span v-if="selectedMode === 'scheduled'" class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div>
            <p class="font-extrabold text-sm text-surface-100">Programar Horário</p>
            <p class="text-xs text-dark-400">Definir o dia e a partir de que hora estarei.</p>
          </div>
        </button>

        <!-- Opção 3: Offline / Fechado -->
        <button
          type="button"
          :class="[
            'p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between gap-2',
            selectedMode === 'offline'
              ? 'bg-rasta-red-soft border-rasta-red ring-2 ring-rasta-red shadow-sm'
              : 'bg-dark-800 border-white/[0.06] hover:border-white/[0.1] hover:bg-dark-700'
          ]"
          @click="selectMode('offline')"
        >
          <div class="flex items-center justify-between">
            <span class="text-xl">🔴</span>
            <span v-if="selectedMode === 'offline'" class="w-2.5 h-2.5 rounded-full bg-rasta-red"></span>
          </div>
          <div>
            <p class="font-extrabold text-sm text-surface-100">Offline / Fechado</p>
            <p class="text-xs text-dark-400">Ausente no momento ou folga hoje.</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Painel de Detalhes da Programação (Visível quando 'Programar Horário' está selecionado) -->
    <div
      v-if="selectedMode === 'scheduled'"
      class="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-4 animate-fade-in"
    >
      <div class="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wide">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Configurar data e horário de início
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Seleção de Data -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-dark-300">Qual dia você estará atendendo? *</label>
          
          <div class="flex gap-2 mb-2">
            <button
              type="button"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition border',
                targetDate === todayStr ? 'bg-amber-600 text-white border-amber-600' : 'bg-dark-800 text-surface-200 border-white/[0.06] hover:bg-dark-700'
              ]"
              @click="targetDate = todayStr"
            >
              Hoje
            </button>
            <button
              type="button"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition border',
                targetDate === tomorrowStr ? 'bg-amber-600 text-white border-amber-600' : 'bg-dark-800 text-surface-200 border-white/[0.06] hover:bg-dark-700'
              ]"
              @click="targetDate = tomorrowStr"
            >
              Amanhã
            </button>
          </div>

          <input
            v-model="targetDate"
            type="date"
            required
            class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-white/[0.06] text-surface-100 text-sm font-semibold focus:border-amber-500 focus:outline-none shadow-sm"
          />
        </div>

        <!-- Seleção de Horário de Início -->
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-dark-300">A partir de que horário? *</label>

          <!-- Atalhos rápidos de horário -->
          <div class="flex flex-wrap gap-1.5 mb-2">
            <button
              v-for="quickHour in ['09:00', '10:00', '13:00', '14:00', '15:00']"
              :key="quickHour"
              type="button"
              :class="[
                'px-2.5 py-1 rounded-lg text-xs font-bold transition border',
                targetTime === quickHour ? 'bg-amber-600 text-white border-amber-600' : 'bg-dark-800 text-surface-200 border-white/[0.06] hover:bg-dark-700'
              ]"
              @click="targetTime = quickHour"
            >
              {{ quickHour }}
            </button>
          </div>

          <input
            v-model="targetTime"
            type="time"
            required
            class="w-full px-3.5 py-2.5 rounded-xl bg-dark-800 border border-white/[0.06] text-surface-100 text-sm font-semibold focus:border-amber-500 focus:outline-none shadow-sm"
          />
        </div>
      </div>

      <!-- Preview do Aviso ao Cliente -->
      <div class="p-3 rounded-xl bg-dark-800 border border-amber-500/20 flex items-start gap-2.5 text-xs text-dark-300">
        <span class="text-base">📢</span>
        <div>
          <strong class="text-amber-500 font-bold block">Aviso que aparecerá aos clientes:</strong>
          <span>"Mestre Rasta estará atendendo <strong>{{ previewText }}</strong>."</span>
        </div>
      </div>
    </div>

    <!-- Botão de Ação para Salvar -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <p class="text-xs text-dark-400">
        Os clientes verão esta atualização <strong class="text-surface-100 font-bold">em tempo real</strong> sem recarregar a página.
      </p>

      <div class="flex items-center gap-2 w-full sm:w-auto">
        <div v-if="savedFeedback" class="text-xs text-accent font-bold flex items-center gap-1 animate-fade-in">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Salvo com sucesso!
        </div>

        <BaseButton
          variant="primary"
          size="md"
          class="w-full sm:w-auto min-w-[170px]"
          :loading="barberStatusStore.loading"
          @click="handleSavePresence"
        >
          Salvar Presença
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import type { PresenceMode } from '~/stores/barberStatus'

const barberStatusStore = useBarberStatusStore()

const selectedMode = ref<PresenceMode>(barberStatusStore.statusMode || (barberStatusStore.isOnline ? 'immediate' : 'offline'))
const targetDate = ref(barberStatusStore.scheduledDate || '')
const targetTime = ref(barberStatusStore.scheduledTime || '14:00')
const savedFeedback = ref(false)

const todayStr = computed(() => {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
})

const tomorrowStr = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
})

const selectMode = (mode: PresenceMode) => {
  selectedMode.value = mode
  if (mode === 'scheduled' && !targetDate.value) {
    targetDate.value = todayStr.value
  }
}

const previewText = computed(() => {
  if (!targetDate.value || !targetTime.value) return 'em breve'
  if (targetDate.value === todayStr.value) return `Hoje a partir das ${targetTime.value}`
  if (targetDate.value === tomorrowStr.value) return `Amanhã a partir das ${targetTime.value}`
  const [y, m, d] = targetDate.value.split('-')
  return `Dia ${d}/${m} a partir das ${targetTime.value}`
})

// Sincroniza campos quando o store carregar ou mudar externamente
watch(
  () => [barberStatusStore.statusMode, barberStatusStore.isOnline, barberStatusStore.scheduledDate, barberStatusStore.scheduledTime],
  () => {
    selectedMode.value = barberStatusStore.statusMode || (barberStatusStore.isOnline ? 'immediate' : 'offline')
    if (barberStatusStore.scheduledDate) targetDate.value = barberStatusStore.scheduledDate
    if (barberStatusStore.scheduledTime) targetTime.value = barberStatusStore.scheduledTime
  },
  { immediate: true }
)

const handleSavePresence = async () => {
  savedFeedback.value = false

  const isOnlineFlag = selectedMode.value === 'immediate'
  await barberStatusStore.setPresence({
    isOnline: isOnlineFlag,
    statusMode: selectedMode.value,
    scheduledDate: selectedMode.value === 'scheduled' ? targetDate.value : null,
    scheduledTime: selectedMode.value === 'scheduled' ? targetTime.value : null
  })

  savedFeedback.value = true
  setTimeout(() => {
    savedFeedback.value = false
  }, 3500)
}
</script>
