<template>
  <div
    :class="[
      'relative overflow-hidden rounded-2xl p-6 sm:p-8 transition-all duration-300 border',
      barberStatusStore.isCurrentlyOnline
        ? 'bg-dark-800/80 border-accent/30 shadow-glow-green'
        : barberStatusStore.statusMode === 'scheduled'
          ? 'bg-dark-800/80 border-rasta-gold/20 shadow-glow-gold'
          : 'bg-dark-800/60 border-white/[0.06]'
    ]"
  >
    <!-- Decorative glow -->
    <div class="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-gradient-to-br from-accent/8 via-rasta-gold/5 to-transparent blur-3xl pointer-events-none"></div>

    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-3">
        <div class="flex items-center gap-2">
          <span class="relative flex h-3 w-3">
            <span
              v-if="barberStatusStore.isCurrentlyOnline"
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"
            ></span>
            <span
              :class="[
                'relative inline-flex rounded-full h-3 w-3',
                barberStatusStore.isCurrentlyOnline
                  ? 'bg-accent'
                  : barberStatusStore.statusMode === 'scheduled'
                    ? 'bg-rasta-gold'
                    : 'bg-rasta-red'
              ]"
            ></span>
          </span>
          <span class="text-xs font-semibold uppercase tracking-wider text-dark-300">
            {{ barberStatusStore.statusMode === 'scheduled' && !barberStatusStore.isCurrentlyOnline ? 'Programação de Atendimento' : 'Status em Tempo Real' }}
          </span>
        </div>

        <h2 class="text-xl sm:text-2xl font-bold text-surface-100 tracking-tight">
          <span v-if="barberStatusStore.isCurrentlyOnline" class="text-accent">
            Barbeiro na Barbearia 💈
          </span>
          <span v-else-if="barberStatusStore.statusMode === 'scheduled'" class="text-rasta-gold">
            Atendimento: {{ barberStatusStore.formattedScheduleText }}
          </span>
          <span v-else class="text-dark-300">
            Barbearia Fechada
          </span>
        </h2>

        <p class="text-sm text-dark-300 max-w-xl leading-relaxed">
          <span v-if="barberStatusStore.isCurrentlyOnline">
            O barbeiro está na ativa! Agende seu horário agora ou confira os horários livres.
          </span>
          <span v-else-if="barberStatusStore.statusMode === 'scheduled'">
            Presença confirmada para <strong class="text-surface-200">{{ barberStatusStore.formattedScheduleText }}</strong>. Reserve com antecedência.
          </span>
          <span v-else>
            Agende antecipadamente para os próximos dias e garanta seu horário.
          </span>
        </p>
      </div>

      <div class="flex-shrink-0">
        <NuxtLink to="/agendar">
          <BaseButton size="lg" variant="primary">
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
