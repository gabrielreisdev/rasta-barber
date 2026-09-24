<template>
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <span class="text-xs font-semibold uppercase tracking-widest text-rasta-gold">Agendamento Online</span>
      <h1 class="text-3xl sm:text-4xl font-bold text-surface-100">Reserve Seu Horário</h1>
      <p class="text-sm text-dark-300">Selecione o serviço, a data e o melhor horário para você.</p>
    </div>

    <!-- Stepper -->
    <div v-if="!bookingSuccess" class="grid grid-cols-2 gap-3 max-w-sm mx-auto">
      <div
        :class="[
          'p-3 rounded-xl border text-center transition-all',
          currentStep === 1
            ? 'bg-accent text-dark-950 border-accent font-bold'
            : 'bg-dark-800/60 border-white/[0.06] text-dark-300'
        ]"
      >
        <span class="text-xs block uppercase tracking-wider">Passo 1</span>
        <span class="text-sm font-semibold">Serviço</span>
      </div>

      <div
        :class="[
          'p-3 rounded-xl border text-center transition-all',
          currentStep === 2
            ? 'bg-accent text-dark-950 border-accent font-bold'
            : 'bg-dark-800/60 border-white/[0.06] text-dark-300'
        ]"
      >
        <span class="text-xs block uppercase tracking-wider">Passo 2</span>
        <span class="text-sm font-semibold">Data & Horário</span>
      </div>
    </div>

    <!-- Success State -->
    <div
      v-if="bookingSuccess"
      class="p-8 rounded-2xl bg-dark-800/80 border border-accent/30 shadow-glow-green text-center space-y-6 max-w-lg mx-auto"
    >
      <div class="w-14 h-14 rounded-full bg-accent-soft text-accent flex items-center justify-center mx-auto">
        <svg class="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-surface-100">Agendamento Realizado!</h2>
        <p class="text-sm text-dark-300">
          Enviamos a mensagem de confirmação para o WhatsApp do Barbeiro.
        </p>
      </div>

      <!-- Booking Summary -->
      <div v-if="lastBooking" class="p-4 rounded-xl bg-dark-700/40 border border-white/[0.06] text-left text-xs space-y-2">
        <div class="flex justify-between">
          <span class="text-dark-400 font-semibold uppercase">Cliente:</span>
          <span class="font-bold text-surface-100">{{ lastBooking.name }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-dark-400 font-semibold uppercase">Data & Hora:</span>
          <span class="font-bold text-accent">{{ formattedLastDate }} às {{ lastBooking.time }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-dark-400 font-semibold uppercase">Valor:</span>
          <span class="font-bold text-surface-100">{{ formatCurrency(lastBooking.totalPrice) }}</span>
        </div>
      </div>

      <div class="space-y-3 pt-2">
        <a
          v-if="whatsappUrl"
          :href="whatsappUrl"
          target="_blank"
          class="w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
        >
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          Abrir WhatsApp do Barbeiro (71 99375-8072)
        </a>

        <BaseButton variant="secondary" size="md" class="w-full" @click="startNewBooking">
          Fazer Outro Agendamento
        </BaseButton>
      </div>
    </div>

    <!-- Step 1: Service Selection -->
    <div v-else-if="currentStep === 1" class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-surface-100">Selecione o serviço:</h2>
        <span class="text-xs font-medium text-accent" v-if="bookingStore.selectedServices.length > 0">1 selecionado</span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ServiceCard
          v-for="service in servicesStore.activeServices"
          :key="service.id"
          :service="service"
          :is-selected="bookingStore.isServiceSelected(service.id)"
          @select="bookingStore.toggleService(service)"
        />
      </div>

      <!-- Footer -->
      <div class="p-4 rounded-xl bg-dark-800/60 border border-white/[0.06] flex items-center justify-between gap-4">
        <div>
          <span class="text-xs text-dark-300 block font-medium">Valor do serviço:</span>
          <span class="text-xl font-bold text-accent">{{ formatCurrency(bookingStore.totalPrice) }}</span>
          <span class="text-xs text-dark-300 ml-2">({{ formatDuration(bookingStore.totalDurationMinutes) }})</span>
        </div>

        <BaseButton
          variant="primary"
          size="lg"
          :disabled="bookingStore.selectedServices.length === 0"
          @click="currentStep = 2"
        >
          Avançar →
        </BaseButton>
      </div>
    </div>

    <!-- Step 2: Date & Time -->
    <div v-else-if="currentStep === 2" class="space-y-8">
      <div class="flex items-center justify-between">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 text-xs font-medium text-dark-300 hover:text-accent transition"
          @click="currentStep = 1"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar
        </button>

        <div class="text-right">
          <span class="text-xs text-dark-300 font-medium">1 serviço</span>
          <span class="text-sm font-bold text-accent ml-2">{{ formatCurrency(bookingStore.totalPrice) }}</span>
        </div>
      </div>

      <TimeSlotPicker
        :selected-date="bookingStore.selectedDate"
        :selected-time="bookingStore.selectedTime"
        :total-duration="bookingStore.totalDurationMinutes"
        :appointments="bookingStore.appointments"
        @select-date="bookingStore.selectedDate = $event"
        @select-time="bookingStore.selectedTime = $event"
      />

      <!-- Footer -->
      <div class="p-4 rounded-xl bg-dark-800/60 border border-white/[0.06] flex items-center justify-between gap-4">
        <div>
          <span class="text-xs text-dark-300 block font-medium">Horário escolhido:</span>
          <span v-if="bookingStore.selectedTime" class="text-base font-bold text-accent">
            {{ formattedDate }} às {{ bookingStore.selectedTime }}
          </span>
          <span v-else class="text-xs text-dark-400 italic">Nenhum horário selecionado</span>
        </div>

        <BaseButton
          variant="primary"
          size="lg"
          :disabled="!bookingStore.selectedDate || !bookingStore.selectedTime"
          @click="reviewModalOpen = true"
        >
          Finalizar
        </BaseButton>
      </div>
    </div>

    <!-- Booking Summary Modal -->
    <BookingSummaryModal
      v-model="reviewModalOpen"
      :services="bookingStore.selectedServices"
      :selected-date="bookingStore.selectedDate"
      :selected-time="bookingStore.selectedTime"
      :total-price="bookingStore.totalPrice"
      :total-duration="bookingStore.totalDurationMinutes"
      :loading="bookingStore.loading"
      @confirm="handleConfirmBooking"
    />
  </div>
</template>

<script setup lang="ts">
import BaseButton from '~/components/ui/BaseButton.vue'
import ServiceCard from '~/components/client/ServiceCard.vue'
import TimeSlotPicker from '~/components/client/TimeSlotPicker.vue'
import BookingSummaryModal from '~/components/client/BookingSummaryModal.vue'
import type { Service } from '~/types'
import { formatCurrency, formatDuration } from '~/utils/formatters'

const BARBER_WHATSAPP = '5571993758072'

const servicesStore = useServicesStore()
const bookingStore = useBookingStore()

const currentStep = ref(1)
const reviewModalOpen = ref(false)
const bookingSuccess = ref(false)
const whatsappUrl = ref('')
const lastBooking = ref<{
  name: string
  phone: string
  services: Service[]
  date: string
  time: string
  totalPrice: number
} | null>(null)

onMounted(async () => {
  await servicesStore.fetchServices()
  await bookingStore.fetchAppointments()

  if (bookingStore.selectedServices.length > 0 && !bookingStore.selectedDate) {
    currentStep.value = 2
  }
})

const formattedDate = computed(() => {
  if (!bookingStore.selectedDate) return ''
  const [y, m, d] = bookingStore.selectedDate.split('-')
  return `${d}/${m}/${y}`
})

const formattedLastDate = computed(() => {
  if (!lastBooking.value?.date) return ''
  const [y, m, d] = lastBooking.value.date.split('-')
  return `${d}/${m}/${y}`
})

const generateWhatsAppMessage = (data: {
  name: string
  phone: string
  services: Service[]
  date: string
  time: string
  totalPrice: number
}) => {
  const [y, m, d] = data.date.split('-')
  const dateFormatted = `${d}/${m}/${y}`
  const servicesList = data.services.map(s => `• ${s.name}`).join('\n')

  const text =
    `💈 *NOVO AGENDAMENTO - RASTA BARBER* 💈\n\n` +
    `👤 *Cliente:* ${data.name}\n` +
    `📱 *WhatsApp:* ${data.phone}\n` +
    `📅 *Data:* ${dateFormatted}\n` +
    `⏰ *Horário:* ${data.time}\n\n` +
    `✂️ *Serviço:*\n${servicesList}\n\n` +
    `💰 *Valor Total:* ${formatCurrency(data.totalPrice)}\n\n` +
    `_Agendamento realizado pelo site oficial!_`

  return `https://wa.me/${BARBER_WHATSAPP}?text=${encodeURIComponent(text)}`
}

const handleConfirmBooking = async (clientData: { name: string; phone: string }) => {
  const bookingSnapshot = {
    name: clientData.name,
    phone: clientData.phone,
    services: [...bookingStore.selectedServices],
    date: bookingStore.selectedDate,
    time: bookingStore.selectedTime,
    totalPrice: bookingStore.totalPrice
  }

  const result = await bookingStore.confirmBooking(clientData.name, clientData.phone)
  if (result.success) {
    lastBooking.value = bookingSnapshot
    whatsappUrl.value = generateWhatsAppMessage(bookingSnapshot)

    reviewModalOpen.value = false
    bookingSuccess.value = true

    if (import.meta.client) {
      window.open(whatsappUrl.value, '_blank')
    }
  } else {
    alert(result.error || 'Erro ao realizar agendamento.')
  }
}

const startNewBooking = () => {
  bookingSuccess.value = false
  currentStep.value = 1
  lastBooking.value = null
  whatsappUrl.value = ''
  bookingStore.clearSelection()
}
</script>
