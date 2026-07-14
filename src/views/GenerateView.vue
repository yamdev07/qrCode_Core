<script setup lang="ts">
import QrGeneratorForm from '@modules/generator/components/QrGeneratorForm.vue'
import QrCodeDisplay from '@modules/generator/components/QrCodeDisplay.vue'
import QrHistoryList from '@modules/generator/components/QrHistoryList.vue'
import { useQrGenerator } from '@modules/generator/composables/useQrGenerator'
import { ref } from 'vue'

const { formData } = useQrGenerator()
const currentQR = ref<string | null>(null)

function handleGenerated(qrData: string): void {
  currentQR.value = qrData
}

function handleHistorySelect(url: string): void {
  formData.url = url
}
</script>

<template>
  <div class="generate-view">
    <h2 class="view-title">
      ✨ Générer un QR code
    </h2>

    <QrGeneratorForm @generated="handleGenerated" />

    <QrCodeDisplay
      v-if="currentQR"
      :qr-data="currentQR"
      :format="formData.format"
      :size="formData.size"
    />

    <QrHistoryList @select="handleHistorySelect" />
  </div>
</template>

<style scoped>
.generate-view {
  max-width: 560px;
  margin: 0 auto;
}

.view-title {
  text-align: center;
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0 0 2rem;
}
</style>
