<template>
  <div
    :class="[
      'relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300 border shadow-clean-md',
      barberStatusStore.isCurrentlyOnline
        ? 'bg-gradient-to-br from-emerald-50 via-white to-green-50/50 border-rasta-green-border shadow-rasta-glow'
        : barberStatusStore.statusMode === 'scheduled'
          ? 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40 border-amber-200 shadow-clean-lg'
          : 'bg-white border-slate-200'
    ]"
  >
    <!-- Detalhe decorativo com as cores Rasta -->
    <div class="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-rasta-green/10 via-rasta-gold/10 to-rasta-red/10 blur-2xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="relative flex h-3.5 w-3.5">
            <span
              v-if="barberStatusStore.isCurrentlyOnline"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
            ></span>
            <span
              :class="[
                'relative inline-flex rounded-full h-3.5 w-3.5',
                barberStatusStore.isCurrentlyOnline
                  ? 'bg-rasta-green'
                  : barberStatusStore.statusMode === 'scheduled'
                    ? 'bg-amber-500'
                    : 'bg-rasta-red'
              ]"
            ></span>
          </span>
          <span class="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            {{ barberStatusStore.statusMode === 'scheduled' && !barberStatusStore.isCurrentlyOnline ? 'Programação de Atendimento' : 'Presença do Barbeiro em Tempo Real' }}
          </span>
        </div>

        <h2 class="text-2xl sm:text-3xl font-black text-surface-900 tracking-tight">
          <span v-if="barberStatusStore.isCurrentlyOnline" class="text-rasta-green flex items-center gap-2">
            Mestre Rasta está na Barbearia! 💈
          </span>
          <span v-else-if="barberStatusStore.statusMode === 'scheduled'" class="text-amber-800 flex items-center gap-2">
            Atendimento: {{ barberStatusStore.formattedScheduleText }}! ⏰
          </span>
          <span v-else class="text-surface-700">
            Barbearia Fechada / Barbeiro Ausente
          </span>
        </h2>

        <p class="text-sm text-surface-700 max-w-xl leading-relaxed">
          <span v-if="barberStatusStore.isCurrentlyOnline">
            O barbeiro está na ativa! Agende seu horário agora mesmo ou confira os horários livres na agenda.
          </span>
          <span v-else-if="barberStatusStore.statusMode === 'scheduled'">
            O barbeiro programou sua presença para <strong>{{ barberStatusStore.formattedScheduleText }}</strong>. Você já pode reservar seu corte com antecedência e garantir sua vaga.
          </span>
          <span v-else>
            Você pode agendar antecipadamente para os próximos dias e garantir seu corte com o Rasta sem filas.
          </span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <NuxtLink to="/agendar">
          <BaseButton size="lg" variant="primary" class="w-full sm:w-auto">
            <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Agendar Horário
          </BaseButton>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'

const barberStatusStore = useBarberStatusStore()
</script>
