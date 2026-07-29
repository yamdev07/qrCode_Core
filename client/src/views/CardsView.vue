<script setup lang="ts">
import { onMounted } from 'vue'
import CardBatchForm from '@modules/generator/components/CardBatchForm.vue'
import GeneratedCardsList from '@modules/generator/components/GeneratedCardsList.vue'
import { useQrCards } from '@modules/generator/composables/useQrCards'

const { restoreGeneratedCards } = useQrCards()

onMounted(() => {
  restoreGeneratedCards()
})
</script>

<template>
  <div class="cards-view">
    <h2 class="view-title">🎴 Cartes professionnelles (QR + images)</h2>
    <p class="view-subtitle">
      Saisissez Nom, Prénoms et Poste, ajoutez les images à afficher et un logo
      par personne. À la validation, les images sont hébergées et chaque QR
      pointe vers <code>/carte/nom-prenoms</code>.
    </p>

    <CardBatchForm />
    <GeneratedCardsList />
  </div>
</template>

<style scoped>
.cards-view {
  max-width: 860px;
  margin: 0 auto;
}

.view-title {
  text-align: center;
  font-size: 1.5rem;
  color: #1e293b;
  margin: 0 0 0.5rem;
}

.view-subtitle {
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  margin: 0 auto 2rem;
  max-width: 540px;
}
</style>
