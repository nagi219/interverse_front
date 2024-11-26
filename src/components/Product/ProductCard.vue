<template>
  <div class="product-card admin-theme ">
    <img class="product-image" :src="`${path}/products/${product.id}/latestphoto?timestamp=${Date.now()}`" :alt="product.name">
    <div class="product-details">
      <h5 class="product-title">{{ product.name }}</h5>
      <div class="product-price">NT$ {{ product.price }}</div>
      <div class="product-actions">
        <button type="button" class="ts-button is-secondary" @click="emits('openUpdate','update',product.id)">修改</button>
        <button type="button" class="ts-button is-danger" @click="emits('delete',product.id)">刪除</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const path = import.meta.env.VITE_API_URL;
const props = defineProps(["product"]);
const emits = defineEmits(["openUpdate","delete"]);
</script>

<style scoped>
.product-card {
  background-color: var(--background-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(133, 97, 77, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(133, 97, 77, 0.2);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-details {
  padding: 15px;
}

.product-title {
  color: var(--text-color);
  margin-bottom: 10px;
  font-weight: 600;
}

.product-price {
  color: var(--primary-color);
  font-weight: 700;
  font-size: 1.1em;
  margin-bottom: 15px;
}

.product-actions {
  display: flex;
  justify-content: space-between;
}

.ts-button {
  flex: 1;
  margin: 0 5px;
}

.ts-button.is-secondary {
  background-color: var( --primary-color);
  color: white;
}

.ts-button.is-secondary:hover {
  background-color: var( --border-color);
  color: white;
}

.ts-button.is-danger {
  background-color: white;
  color: var( --primary-color);
  border-color:var( --border-color);

  /* background-color: rgb(245, 153, 153);
  color: white; */
}

.ts-button.is-danger:hover {
    background-color: var( --border-color);
    color: white;
}
</style>