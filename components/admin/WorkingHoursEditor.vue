<template>
  <div class="space-y-4">
    <div
      v-for="(item, index) in workingHours"
      :key="item.day_of_week"
      class="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean space-y-3"
    >
      <!-- Day Header & Working Toggle -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="w-8 h-8 rounded-lg bg-rasta-green-soft text-rasta-green flex items-center justify-center font-black text-sm">
            {{ item.day_of_week === 0 ? 'D' : (item.day_of_week === 6 ? 'S' : item.day_of_week) }}
          </span>
          <span class="font-bold text-surface-900 text-sm">
            {{ getDayOfWeekName(item.day_of_week) }}
          </span>
        </div>

        <label class="relative inline-flex items-center cursor-pointer">
          <input
            v-model="item.is_working"
            type="checkbox"
            class="sr-only peer"
          />
          <div class="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rasta-green"></div>
          <span class="ml-2 text-xs font-bold text-surface-700">
            {{ item.is_working ? 'Aberto' : 'Folga' }}
          </span>
        </label>
      </div>

      <!-- Configuração de Horários (se estiver aberto) -->
      <div v-if="item.is_working" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
        <div>
          <label class="block text-[11px] uppercase tracking-wider text-slate-700 font-extrabold mb-1">
            Início Expediente
          </label>
          <input
            v-model="item.start_time"
            type="time"
            class="w-full px-3 py-2 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 text-sm focus:border-rasta-green focus:bg-white focus:outline-none font-semibold"
          />
        </div>

        <div>
          <label class="block text-[11px] uppercase tracking-wider text-slate-700 font-extrabold mb-1">
            Fim Expediente
          </label>
          <input
            v-model="item.end_time"
            type="time"
            class="w-full px-3 py-2 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 text-sm focus:border-rasta-green focus:bg-white focus:outline-none font-semibold"
          />
        </div>

        <div>
          <label class="block text-[11px] uppercase tracking-wider text-slate-700 font-extrabold mb-1">
            Início Almoço / Pausa
          </label>
          <input
            v-model="item.lunch_start"
            type="time"
            class="w-full px-3 py-2 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 text-sm focus:border-rasta-green focus:bg-white focus:outline-none font-semibold"
          />
        </div>

        <div>
          <label class="block text-[11px] uppercase tracking-wider text-slate-700 font-extrabold mb-1">
            Fim Almoço / Pausa
          </label>
          <input
            v-model="item.lunch_end"
            type="time"
            class="w-full px-3 py-2 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 text-sm focus:border-rasta-green focus:bg-white focus:outline-none font-semibold"
          />
        </div>
      </div>
    </div>

    <!-- Botão de Salvar -->
    <div class="pt-4 flex justify-end">
      <BaseButton variant="primary" size="lg" :loading="saving" @click="save">
        Salvar Grade de Horários
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import type { WorkingHours } from '~/types'
import { getDayOfWeekName } from '~/utils/formatters'

const slotCalculator = useSlotCalculator()
const workingHours = ref<WorkingHours[]>([])
const saving = ref(false)

const emit = defineEmits<{
  (e: 'saved'): void
}>()

onMounted(async () => {
  await slotCalculator.fetchWorkingHours()
  const rawList = unref(slotCalculator.workingHoursList) || []
  workingHours.value = JSON.parse(JSON.stringify(rawList))
})

const save = async () => {
  saving.value = true
  try {
    await slotCalculator.saveWorkingHours(workingHours.value)
    emit('saved')
  } finally {
    saving.value = false
  }
}
</script>
