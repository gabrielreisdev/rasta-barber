<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/70 backdrop-blur-md overflow-y-auto"
        @click.self="closeOnBackdrop && $emit('update:modelValue', false)"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-4"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-4"
        >
          <div
            v-if="modelValue"
            :class="[
              'w-full rounded-2xl bg-dark-800 border border-white/[0.08] shadow-clean-lg p-6 relative overflow-hidden',
              maxWidthClass
            ]"
          >
            <!-- Rasta ribbon top accent -->
            <div class="absolute top-0 left-0 right-0 h-[2px] rasta-ribbon opacity-60"></div>

            <!-- Header -->
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-white/[0.06] pt-2">
              <h3 class="text-lg font-bold text-surface-100">
                <slot name="title">{{ title }}</slot>
              </h3>
              <button
                type="button"
                class="p-1.5 rounded-lg text-dark-300 hover:text-surface-100 hover:bg-white/[0.06] transition"
                @click="$emit('update:modelValue', false)"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Body -->
            <div class="text-surface-200">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="pt-4 mt-6 border-t border-white/[0.06] flex justify-end gap-3">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    closeOnBackdrop?: boolean
  }>(),
  {
    title: '',
    maxWidth: 'md',
    closeOnBackdrop: true
  }
)

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm': return 'max-w-sm'
    case 'lg': return 'max-w-lg'
    case 'xl': return 'max-w-xl'
    case '2xl': return 'max-w-2xl'
    case 'md':
    default: return 'max-w-md'
  }
})
</script>
