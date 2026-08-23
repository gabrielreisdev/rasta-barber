<template>
  <BaseModal
    :model-value="modelValue"
    max-width="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #title>
      <div class="flex items-center gap-2">
        <span class="w-3 h-3 rounded-full bg-rasta-green"></span>
        <span class="text-surface-900">Finalizar Agendamento</span>
      </div>
    </template>

    <form @submit.prevent="handleConfirm" class="space-y-5">
      <!-- 1. Identificação Rápida do Cliente (SEM CADASTRO) -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <span class="text-xs font-black uppercase tracking-wider text-slate-700 block">
          Seus Dados para o Atendimento
        </span>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
              Seu Nome *
            </label>
            <input
              v-model="name"
              type="text"
              required
              placeholder="Ex: Carlos Silva"
              class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-surface-900 text-sm font-semibold focus:border-rasta-green focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-[11px] font-extrabold uppercase text-slate-600 mb-1">
              WhatsApp / Celular *
            </label>
            <input
              v-model="phone"
              type="tel"
              required
              placeholder="Ex: (11) 98765-4321"
              class="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-surface-900 text-sm font-semibold focus:border-rasta-green focus:outline-none"
            />
          </div>
        </div>
      </div>

      <!-- 2. Data e Horário -->
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-clean">
          <span class="text-[10px] uppercase tracking-wider text-slate-600 font-extrabold block mb-1">Data</span>
          <span class="text-sm font-black text-surface-900">{{ formattedDate }}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-white border border-slate-200 shadow-clean">
          <span class="text-[10px] uppercase tracking-wider text-slate-600 font-extrabold block mb-1">Horário de Início</span>
          <span class="text-sm font-black text-rasta-green">{{ selectedTime }}</span>
        </div>
      </div>

      <!-- 3. Lista de Serviços Selecionados -->
      <div>
        <span class="text-xs uppercase tracking-wider text-slate-600 font-extrabold block mb-2">Serviços Selecionados</span>
        <div class="divide-y divide-slate-100 rounded-xl bg-white border border-slate-200 shadow-clean overflow-hidden">
          <div
            v-for="service in services"
            :key="service.id"
            class="p-3.5 flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-bold text-surface-900">{{ service.name }}</p>
              <p class="text-xs text-slate-600 font-medium">{{ formatDuration(service.duration_minutes) }}</p>
            </div>
            <span class="text-sm font-black text-surface-900">{{ formatCurrency(service.price) }}</span>
          </div>
        </div>
      </div>

      <!-- 4. Totalizadores -->
      <div class="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-green-50 to-amber-50 border border-rasta-green-border flex items-center justify-between">
        <div>
          <span class="text-xs text-slate-700 block font-semibold">Tempo Total Estimado</span>
          <span class="text-sm font-extrabold text-surface-800">{{ formatDuration(totalDuration) }}</span>
        </div>
        <div class="text-right">
          <span class="text-xs text-rasta-green uppercase tracking-wider block font-black">Valor Total</span>
          <span class="text-2xl font-black text-rasta-green">{{ formatCurrency(totalPrice) }}</span>
        </div>
      </div>

      <p class="text-[11px] text-slate-600 text-center">
        O pagamento é efetuado diretamente na barbearia após o corte.
      </p>

      <div class="pt-4 mt-6 border-t border-slate-100 flex justify-end gap-3">
        <BaseButton variant="ghost" type="button" @click="$emit('update:modelValue', false)">
          Voltar
        </BaseButton>
        <BaseButton variant="primary" type="submit" :loading="loading">
          Confirmar Agendamento
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import type { Service } from '~/types'
import { formatCurrency, formatDuration } from '~/utils/formatters'

const props = defineProps<{
  modelValue: boolean
  services: Service[]
  selectedDate: string
  selectedTime: string
  totalPrice: number
  totalDuration: number
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'confirm', data: { name: string; phone: string }): void
}>()

const bookingStore = useBookingStore()
const name = ref('')
const phone = ref('')

watch(() => props.modelValue, (val) => {
  if (val) {
    name.value = bookingStore.clientName || ''
    phone.value = bookingStore.clientPhone || ''
  }
})

const formattedDate = computed(() => {
  if (!props.selectedDate) return ''
  const [y, m, d] = props.selectedDate.split('-')
  return `${d}/${m}/${y}`
})

const handleConfirm = () => {
  emit('confirm', { name: name.value, phone: phone.value })
}
</script>
