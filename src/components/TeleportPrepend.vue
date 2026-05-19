<!-- components/TeleportPrepend.vue -->
<template>
  <Teleport v-if="containerSelector" :to="containerSelector" :disabled="disabled">
    <slot />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  to: string
  disabled?: boolean
}>()

const containerSelector = ref<string | null>(null)
let prependContainer: HTMLElement | null = null

onMounted(() => {
  const target = document.querySelector(props.to)
  if (!target) {
    return
  }

  prependContainer = document.createElement('div')
  target.prepend(prependContainer)

  const uid = `teleport-prepend-${Math.random().toString(36).slice(2)}`
  prependContainer.id = uid
  containerSelector.value = `#${uid}`
})

onUnmounted(() => {
  prependContainer?.remove()
})
</script>
