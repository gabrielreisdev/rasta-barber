<template>
  <div
    :class="[
      'clean-card transition-all duration-200',
      hoverable ? 'clean-card-hover cursor-pointer' : '',
      accent ? 'border-l-4 border-l-rasta-green' : '',
      paddingClasses
    ]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    accent?: boolean
    hoverable?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
  }>(),
  {
    accent: false,
    hoverable: false,
    padding: 'md'
  }
)

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0'
    case 'sm':
      return 'p-3.5 sm:p-4'
    case 'lg':
      return 'p-6 sm:p-8'
    case 'md':
    default:
      return 'p-5 sm:p-6'
  }
})
</script>
