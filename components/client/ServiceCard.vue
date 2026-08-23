<template>
  <div
    :class="[
      'relative group p-5 rounded-2xl transition-all duration-200 border select-none cursor-pointer flex flex-col justify-between shadow-clean',
      isSelected
        ? 'bg-gradient-to-br from-green-50/60 via-white to-emerald-50/30 border-rasta-green shadow-clean-md ring-2 ring-rasta-green/30'
        : 'bg-white border-slate-200/90 hover:border-rasta-green/50 hover:shadow-clean-md hover:-translate-y-0.5'
    ]"
    @click="$emit('select', service)"
  >
    <!-- Selection Checkmark Badge -->
    <div
      :class="[
        'absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200',
        isSelected
          ? 'bg-rasta-green text-white scale-100 shadow-sm'
          : 'border-2 border-slate-300 group-hover:border-rasta-green/60 bg-white'
      ]"
    >
      <svg v-if="isSelected" class="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </div>

    <!-- Info Top -->
    <div class="pr-8 space-y-1.5">
      <h3 class="font-extrabold text-base text-surface-900 group-hover:text-rasta-green transition-colors">
        {{ service.name }}
      </h3>
      <p class="text-xs text-surface-700 leading-relaxed line-clamp-2">
        {{ service.description || 'Atendimento com produtos premium e técnica apurada.' }}
      </p>
    </div>

    <!-- Info Bottom (Price & Duration) -->
    <div class="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-xs text-surface-700 font-semibold">
        <svg class="w-4 h-4 text-rasta-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ formatDuration(service.duration_minutes) }}</span>
      </div>

      <div class="text-right">
        <span class="text-base font-black text-rasta-green font-sans">
          {{ formatCurrency(service.price) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Service } from '~/types'
import { formatCurrency, formatDuration } from '~/utils/formatters'

defineProps<{
  service: Service
  isSelected?: boolean
}>()

defineEmits<{
  (e: 'select', service: Service): void
}>()
</script>
