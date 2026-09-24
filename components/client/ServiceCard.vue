<template>
  <div
    :class="[
      'group relative flex flex-col justify-between p-8 rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer',
      'min-h-[280px]',
      isSelected
        ? 'bg-dark-800 shadow-[0_0_0_2px_rgba(52,211,153,1)] scale-[0.98]'
        : 'bg-dark-900 border border-white/[0.04] hover:bg-dark-850 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50'
    ]"
    @click="$emit('select', service)"
  >
    <!-- Background Gradient Effect -->
    <div
      class="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
    ></div>

    <!-- Top Section: Checkmark & Icon -->
    <div class="relative z-10 flex items-start justify-between">
      <div
        :class="[
          'w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300',
          isSelected
            ? 'bg-accent text-dark-950 shadow-glow-green'
            : 'bg-dark-800 text-dark-400 group-hover:bg-dark-700 group-hover:text-surface-100'
        ]"
      >
        <svg v-if="isSelected" class="w-5 h-5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </div>

      <!-- Duration Tag -->
      <div class="px-3 py-1.5 rounded-full bg-dark-950/50 border border-white/[0.05] flex items-center gap-1.5 backdrop-blur-md">
        <svg class="w-3.5 h-3.5 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs font-bold tracking-wider text-surface-200">
          {{ formatDuration(service.duration_minutes) }}
        </span>
      </div>
    </div>

    <!-- Bottom Section: Info & Price -->
    <div class="relative z-10 mt-auto pt-8">
      <h3 class="text-2xl font-black text-white tracking-tight leading-none mb-3 group-hover:text-accent transition-colors">
        {{ service.name }}
      </h3>
      
      <p class="text-sm text-dark-400 font-medium leading-relaxed line-clamp-2 mb-6">
        {{ service.description || 'Acabamento premium para o seu estilo.' }}
      </p>

      <div class="flex items-end justify-between border-t border-white/[0.06] pt-5">
        <span class="text-[10px] font-bold uppercase tracking-[0.2em] text-dark-500">Valor</span>
        <span class="text-3xl font-black text-white tracking-tighter">
          {{ formatCurrency(service.price).replace('R$', '') }}<span class="text-sm text-dark-400 ml-1 font-bold">BRL</span>
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
  index?: number
}>()

defineEmits<{
  (e: 'select', service: Service): void
}>()
</script>
