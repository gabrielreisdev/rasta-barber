<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="border-b border-slate-200 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <span class="text-xs font-black uppercase tracking-widest text-rasta-gold">Gestão de Agenda & Folgas</span>
        <h1 class="text-3xl font-black text-surface-900 mt-1">Horários & Expediente</h1>
        <p class="text-sm text-slate-700">
          Bloqueie dias específicos no calendário e configure o horário de funcionamento semanal da barbearia.
        </p>
      </div>

      <!-- Tabs Switcher -->
      <div class="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold shadow-clean">
        <button
          type="button"
          :class="[
            'px-4 py-2 rounded-lg transition-all',
            activeTab === 'calendar' ? 'bg-white text-rasta-green shadow-sm font-black' : 'text-slate-600 hover:text-surface-900'
          ]"
          @click="activeTab = 'calendar'"
        >
          📅 Calendário de Folgas
        </button>
        <button
          type="button"
          :class="[
            'px-4 py-2 rounded-lg transition-all',
            activeTab === 'hours' ? 'bg-white text-rasta-green shadow-sm font-black' : 'text-slate-600 hover:text-surface-900'
          ]"
          @click="activeTab = 'hours'"
        >
          ⏰ Horários Semanais
        </button>
      </div>
    </div>

    <!-- Tab 1: Calendário Visual de Folgas -->
    <div v-if="activeTab === 'calendar'" class="space-y-4">
      <CalendarDayOffManager />
    </div>

    <!-- Tab 2: Horários Semanais e Almoço -->
    <div v-else-if="activeTab === 'hours'" class="space-y-4">
      <div v-if="savedSuccess" class="p-4 rounded-xl bg-rasta-green-soft border border-rasta-green-border text-xs text-rasta-green font-bold flex items-center justify-between shadow-sm">
        <span>Horários semanais atualizados com sucesso!</span>
        <button @click="savedSuccess = false" class="text-slate-600 hover:text-surface-900">&times;</button>
      </div>

      <WorkingHoursEditor @saved="handleSaved" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CalendarDayOffManager from '~/components/admin/CalendarDayOffManager.vue'
import WorkingHoursEditor from '~/components/admin/WorkingHoursEditor.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const activeTab = ref<'calendar' | 'hours'>('calendar')
const savedSuccess = ref(false)

const handleSaved = () => {
  savedSuccess.value = true
  setTimeout(() => {
    savedSuccess.value = false
  }, 4000)
}
</script>
