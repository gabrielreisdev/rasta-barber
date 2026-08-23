<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
      <div>
        <span class="text-xs font-black uppercase tracking-widest text-rasta-gold">Catálogo de Atendimentos</span>
        <h1 class="text-3xl font-black text-surface-900 mt-1">Gerenciamento de Serviços</h1>
        <p class="text-sm text-slate-700">Adicione novos serviços, edite preços, ajuste durações ou pause serviços temporariamente.</p>
      </div>

      <BaseButton variant="primary" size="md" @click="openCreateModal">
        + Adicionar Novo Serviço
      </BaseButton>
    </div>

    <!-- Services Table / Cards List -->
    <div class="space-y-3">
      <div
        v-for="service in servicesStore.services"
        :key="service.id"
        class="p-5 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <!-- Info -->
        <div class="space-y-1 max-w-xl">
          <div class="flex items-center gap-3">
            <h3 class="text-base font-extrabold text-surface-900">{{ service.name }}</h3>
            <span
              :class="[
                'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                service.is_active
                  ? 'bg-rasta-green-soft text-rasta-green border border-rasta-green-border'
                  : 'bg-slate-100 text-slate-700 border border-slate-200'
              ]"
            >
              {{ service.is_active ? 'Ativo no Site' : 'Pausado' }}
            </span>
          </div>

          <p class="text-xs text-slate-700 line-clamp-1">
            {{ service.description || 'Sem descrição cadastrada.' }}
          </p>
        </div>

        <!-- Metrics & Actions -->
        <div class="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
          <div class="text-right">
            <span class="text-xs text-slate-700 block font-semibold">{{ formatDuration(service.duration_minutes) }}</span>
            <span class="text-lg font-black text-rasta-green">{{ formatCurrency(service.price) }}</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              :class="[
                'p-2.5 rounded-xl text-xs font-bold border transition',
                service.is_active
                  ? 'bg-slate-100 text-slate-700 hover:text-rasta-gold border-slate-200'
                  : 'bg-rasta-green-soft text-rasta-green hover:bg-green-100 border-rasta-green-border'
              ]"
              :title="service.is_active ? 'Pausar Serviço' : 'Ativar Serviço'"
              @click="servicesStore.toggleActive(service.id)"
            >
              <svg v-if="service.is_active" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            <button
              type="button"
              class="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-surface-800 border border-slate-200 transition"
              title="Editar"
              @click="openEditModal(service)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            <button
              type="button"
              class="p-2.5 rounded-xl bg-rasta-red-soft hover:bg-red-100 text-rasta-red border border-rasta-red-border transition"
              title="Excluir"
              @click="handleDelete(service)"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <ServiceModal
      v-model="modalOpen"
      :service="selectedService"
      @saved="servicesStore.fetchServices"
    />
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import ServiceModal from '~/components/admin/ServiceModal.vue'
import type { Service } from '~/types'
import { formatCurrency, formatDuration } from '~/utils/formatters'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const servicesStore = useServicesStore()
const modalOpen = ref(false)
const selectedService = ref<Service | null>(null)

onMounted(async () => {
  await servicesStore.fetchServices()
})

const openCreateModal = () => {
  selectedService.value = null
  modalOpen.value = true
}

const openEditModal = (service: Service) => {
  selectedService.value = service
  modalOpen.value = true
}

const handleDelete = async (service: Service) => {
  if (confirm(`Tem certeza de que deseja excluir o serviço "${service.name}"?`)) {
    await servicesStore.deleteService(service.id)
  }
}
</script>
