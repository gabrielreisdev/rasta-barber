<template>
  <BaseModal
    :model-value="modelValue"
    :title="service ? 'Editar Serviço' : 'Novo Serviço'"
    max-width="md"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
          Nome do Serviço *
        </label>
        <input
          v-model="form.name"
          type="text"
          required
          placeholder="Ex: Corte Degradê Navalhado"
          class="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 placeholder-slate-400 focus:outline-none focus:border-rasta-green focus:bg-white text-sm"
        />
      </div>

      <div>
        <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
          Descrição (Opcional)
        </label>
        <textarea
          v-model="form.description"
          rows="2"
          placeholder="Detalhes dos produtos e técnicas..."
          class="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 placeholder-slate-400 focus:outline-none focus:border-rasta-green focus:bg-white text-sm resize-none"
        ></textarea>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Preço (R$) *
          </label>
          <input
            v-model.number="form.price"
            type="number"
            step="0.50"
            min="0"
            required
            placeholder="35.00"
            class="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 placeholder-slate-400 focus:outline-none focus:border-rasta-green focus:bg-white text-sm font-bold"
          />
        </div>

        <div>
          <label class="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
            Duração (Minutos) *
          </label>
          <input
            v-model.number="form.duration_minutes"
            type="number"
            step="5"
            min="5"
            required
            placeholder="30"
            class="w-full px-3.5 py-2.5 rounded-xl bg-surface-50 border border-slate-200 text-surface-900 placeholder-slate-400 focus:outline-none focus:border-rasta-green focus:bg-white text-sm font-bold"
          />
        </div>
      </div>

      <div class="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <span class="text-xs font-bold text-surface-900 block">Serviço Ativo no Catálogo</span>
          <span class="text-[11px] text-slate-700">Permitir que clientes vejam e agendem este serviço</span>
        </div>
        <input
          v-model="form.is_active"
          type="checkbox"
          class="w-5 h-5 rounded text-rasta-green bg-white border-slate-300 focus:ring-rasta-green"
        />
      </div>

      <div class="pt-4 flex justify-end gap-3 border-t border-slate-100">
        <BaseButton variant="ghost" type="button" @click="$emit('update:modelValue', false)">
          Cancelar
        </BaseButton>
        <BaseButton variant="primary" type="submit" :loading="loading">
          {{ service ? 'Salvar Alterações' : 'Criar Serviço' }}
        </BaseButton>
      </div>
    </form>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '~/components/ui/BaseModal.vue'
import BaseButton from '~/components/ui/BaseButton.vue'
import type { Service } from '~/types'

const props = defineProps<{
  modelValue: boolean
  service: Service | null
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: boolean): void
  (e: 'saved'): void
}>()

const servicesStore = useServicesStore()
const loading = ref(false)

const form = reactive({
  name: '',
  description: '',
  price: 35,
  duration_minutes: 30,
  is_active: true
})

watch(() => props.service, (val) => {
  if (val) {
    form.name = val.name
    form.description = val.description || ''
    form.price = Number(val.price)
    form.duration_minutes = val.duration_minutes
    form.is_active = val.is_active
  } else {
    form.name = ''
    form.description = ''
    form.price = 40
    form.duration_minutes = 35
    form.is_active = true
  }
}, { immediate: true })

const handleSubmit = async () => {
  loading.value = true
  try {
    if (props.service) {
      await servicesStore.updateService(props.service.id, { ...form })
    } else {
      await servicesStore.createService({ ...form })
    }
    emit('saved')
    emit('update:modelValue', false)
  } finally {
    loading.value = false
  }
}
</script>
