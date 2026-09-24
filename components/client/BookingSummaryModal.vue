<template>
  <BaseModal
    :model-value="modelValue"
    max-width="lg"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #title>
      <div class="flex items-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full bg-accent"></span>
        <span class="text-surface-100">Finalizar Agendamento</span>
      </div>
    </template>

    <form @submit.prevent="handleConfirm" class="space-y-5">
      <!-- 1. Client Info -->
      <div class="p-4 rounded-xl bg-dark-700/40 border border-white/[0.06] space-y-3">
        <span class="text-xs font-semibold uppercase tracking-wider text-dark-300 block">
          Seus Dados
        </span>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-[11px] font-semibold uppercase text-dark-300 mb-1">
              Seu Nome *
            </label>
            <input
              v-model="name"
              type="text"
              required
              placeholder="Ex: Carlos Silva"
              class="glass-input"
            />
          </div>

          <div>
            <label class="block text-[11px] font-semibold uppercase text-dark-300 mb-1">
              WhatsApp / Celular *
            </label>
            <input
              v-model="phone"
              type="tel"
              required
              placeholder="Ex: (11) 98765-4321"
              class="glass-input"
            />
          </div>
        </div>
      </div>

      <!-- 2. Date & Time -->
      <div class="grid grid-cols-2 gap-3">
        <div class="p-3.5 rounded-xl bg-dark-700/40 border border-white/[0.06]">
          <span class="text-[10px] uppercase tracking-wider text-dark-300 font-semibold block mb-1">Data</span>
          <span class="text-sm font-bold text-surface-100">{{ formattedDate }}</span>
        </div>
        <div class="p-3.5 rounded-xl bg-dark-700/40 border border-white/[0.06]">
          <span class="text-[10px] uppercase tracking-wider text-dark-300 font-semibold block mb-1">Horário</span>
          <span class="text-sm font-bold text-accent">{{ selectedTime }}</span>
        </div>
      </div>

      <!-- 3. Selected Services -->
      <div>
        <span class="text-xs uppercase tracking-wider text-dark-300 font-semibold block mb-2">Serviço Selecionado</span>
        <div class="divide-y divide-white/[0.04] rounded-xl bg-dark-700/40 border border-white/[0.06] overflow-hidden">
          <div
            v-for="service in services"
            :key="service.id"
            class="p-3.5 flex items-center justify-between"
          >
            <div>
              <p class="text-sm font-semibold text-surface-100">{{ service.name }}</p>
              <p class="text-xs text-dark-300">{{ formatDuration(service.duration_minutes) }}</p>
            </div>
            <span class="text-sm font-bold text-surface-100">{{ formatCurrency(service.price) }}</span>
          </div>
        </div>
      </div>

      <!-- 4. Total -->
      <div class="p-4 rounded-xl bg-accent-soft border border-accent-border flex items-center justify-between">
        <div>
          <span class="text-xs text-dark-300 block font-medium">Tempo Estimado</span>
          <span class="text-sm font-semibold text-surface-100">{{ formatDuration(totalDuration) }}</span>
        </div>
        <div class="text-right">
          <span class="text-xs text-accent uppercase tracking-wider block font-semibold">Valor Total</span>
          <span class="text-2xl font-bold text-accent">{{ formatCurrency(totalPrice) }}</span>
        </div>
      </div>

      <p class="text-[11px] text-dark-400 text-center">
        O pagamento é efetuado diretamente na barbearia após o corte.
      </p>

      <div class="pt-4 mt-6 border-t border-white/[0.06] flex justify-end gap-3">
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
