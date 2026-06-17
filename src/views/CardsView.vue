<script setup lang="ts">
import CardBatchForm from '@modules/generator/components/CardBatchForm.vue'
import GeneratedCardsList from '@modules/generator/components/GeneratedCardsList.vue'
</script>

<template>
  <div class="cards-view">
    <h2 class="view-title">🎴 Cartes QR (recto/verso + logo)</h2>
    <p class="view-subtitle">
      Saisissez vos personnes, ajoutez un logo par personne et générez tous les
      QR codes en une fois. Chaque carte a un QR recto et, si renseigné, un QR verso.
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
