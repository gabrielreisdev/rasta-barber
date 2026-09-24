<template>
  <button
    type="button"
    class="p-2 rounded-xl border border-white/[0.06] bg-dark-800 text-surface-200 hover:text-accent hover:border-accent/50 transition-all flex items-center justify-center"
    title="Alternar Tema"
    @click="toggleTheme"
  >
    <!-- Ícone Lua (Escuro) -->
    <svg v-if="!isLight" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
    <!-- Ícone Sol (Claro) -->
    <svg v-else class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  </button>
</template>

<script setup lang="ts">
const isLight = ref(false)

onMounted(() => {
  if (import.meta.client) {
    const theme = localStorage.getItem('rasta_theme') || 'dark'
    isLight.value = theme === 'light'
    applyTheme()
  }
})

const applyTheme = () => {
  if (import.meta.client) {
    if (isLight.value) {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
      localStorage.setItem('rasta_theme', 'light')
    } else {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
      localStorage.setItem('rasta_theme', 'dark')
    }
  }
}

const toggleTheme = () => {
  isLight.value = !isLight.value
  applyTheme()
}
</script>
