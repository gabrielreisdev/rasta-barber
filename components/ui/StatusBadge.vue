<template>
  <div
    :class="[
      'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-sm',
      barberStatusStore.isCurrentlyOnline
        ? 'bg-rasta-green-soft border border-rasta-green-border text-rasta-green'
        : barberStatusStore.statusMode === 'scheduled'
          ? 'bg-amber-50 border border-amber-200 text-amber-700'
          : 'bg-rasta-red-soft border border-rasta-red-border text-rasta-red'
    ]"
  >
    <span class="relative flex h-2 w-2">
      <span
        v-if="barberStatusStore.isCurrentlyOnline"
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
      ></span>
      <span
        :class="[
          'relative inline-flex rounded-full h-2 w-2',
          barberStatusStore.isCurrentlyOnline
            ? 'bg-rasta-green'
            : barberStatusStore.statusMode === 'scheduled'
              ? 'bg-amber-500'
              : 'bg-rasta-red'
        ]"
      ></span>
    </span>
    <span>{{ badgeText }}</span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOnline?: boolean
}>()

const barberStatusStore = useBarberStatusStore()

const badgeText = computed(() => {
  if (barberStatusStore.isCurrentlyOnline) {
    return 'Rasta Online na Barbearia'
  }
  if (barberStatusStore.statusMode === 'scheduled') {
    return `Atende ${barberStatusStore.formattedScheduleText}`
  }
  return 'Barbeiro Offline'
})
</script>
