<template>
  <div
    :class="[
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-300',
      barberStatusStore.isCurrentlyOnline
        ? 'bg-accent-soft border border-accent-border text-accent'
        : barberStatusStore.statusMode === 'scheduled'
          ? 'bg-rasta-gold-soft border border-rasta-gold-border text-rasta-gold'
          : 'bg-rasta-red-soft border border-rasta-red-border text-rasta-red'
    ]"
  >
    <span class="relative flex h-2 w-2">
      <span
        v-if="barberStatusStore.isCurrentlyOnline"
        class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"
      ></span>
      <span
        :class="[
          'relative inline-flex rounded-full h-2 w-2',
          barberStatusStore.isCurrentlyOnline
            ? 'bg-accent'
            : barberStatusStore.statusMode === 'scheduled'
              ? 'bg-rasta-gold'
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
    return 'Online'
  }
  if (barberStatusStore.statusMode === 'scheduled') {
    return `${barberStatusStore.formattedScheduleText}`
  }
  return 'Offline'
})
</script>
