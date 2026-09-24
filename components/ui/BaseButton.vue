<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-dark-900 active:scale-[0.97]',
      sizeClasses,
      variantClasses,
      (disabled || loading) ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
    ]"
    @click="$emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'danger' | 'ghost' | 'success'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    size: 'md',
    disabled: false,
    loading: false
  }
)

defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3.5 py-1.5 text-xs'
    case 'lg':
      return 'px-6 py-3 text-sm font-bold'
    case 'md':
    default:
      return 'px-4 py-2 text-sm'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-accent text-dark-950 hover:bg-accent-light focus:ring-accent/40 shadow-sm shadow-accent/20'
    case 'gold':
      return 'bg-rasta-gold text-dark-950 hover:bg-rasta-gold-light focus:ring-rasta-gold/40'
    case 'secondary':
      return 'bg-dark-700/60 hover:bg-dark-600/80 text-surface-200 border border-white/[0.08] focus:ring-dark-400/30'
    case 'outline':
      return 'bg-transparent border border-accent/40 text-accent hover:bg-accent-soft hover:border-accent/60 focus:ring-accent/30'
    case 'danger':
      return 'bg-rasta-red-soft hover:bg-rasta-red/20 text-rasta-red border border-rasta-red-border focus:ring-rasta-red/30'
    case 'success':
      return 'bg-accent-soft hover:bg-accent/20 text-accent border border-accent-border focus:ring-accent/30'
    case 'ghost':
      return 'bg-transparent hover:bg-white/[0.04] text-dark-300 hover:text-surface-100 focus:ring-white/10'
    default:
      return ''
  }
})
</script>
