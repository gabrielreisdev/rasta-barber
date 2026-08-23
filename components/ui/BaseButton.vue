<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98]',
      sizeClasses,
      variantClasses,
      (disabled || loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
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
      return 'px-6 py-3.5 text-base font-bold shadow-clean-md'
    case 'md':
    default:
      return 'px-4 py-2.5 text-sm shadow-clean'
  }
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      // Rasta Green Principal
      return 'bg-rasta-green text-white hover:bg-emerald-700 focus:ring-rasta-green focus:ring-offset-white'
    case 'gold':
      // Rasta Gold/Amarelo
      return 'bg-rasta-gold text-white hover:bg-amber-700 focus:ring-rasta-gold focus:ring-offset-white'
    case 'secondary':
      return 'bg-surface-100 hover:bg-surface-200 text-surface-800 border border-slate-200 focus:ring-slate-300'
    case 'outline':
      return 'bg-white border border-rasta-green/60 text-rasta-green hover:bg-rasta-green-soft hover:border-rasta-green focus:ring-rasta-green'
    case 'danger':
      return 'bg-rasta-red-soft hover:bg-red-100 text-rasta-red border border-rasta-red-border focus:ring-rasta-red'
    case 'success':
      return 'bg-rasta-green-soft hover:bg-green-100 text-rasta-green border border-rasta-green-border focus:ring-rasta-green'
    case 'ghost':
      return 'bg-transparent hover:bg-surface-100 text-surface-700 hover:text-surface-900 focus:ring-slate-200'
    default:
      return ''
  }
})
</script>
