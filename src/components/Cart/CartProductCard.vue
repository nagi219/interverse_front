<template>
    <div class="column">
      <div class="ts-box product-card" @click="navigateToProductDetails">
        <div class="ts-image image-container">
          <img :src="`${path}/products/${product.id}/latestphoto`" :alt="product.name">
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-price" style="color: #6B5147;">NT$ {{ formatPrice(product.price) }}</div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  const path = import.meta.env.VITE_API_URL;
  
  const props = defineProps(["product"]);
  const emits = defineEmits([""]);
  
  const formatPrice = (price) => {
    return price.toLocaleString('en-US');
  };

  const navigateToProductDetails = () => {
  router.push({
    name: 'product-cartDetail',
    params: { id: props.product.id },
  });
};
  </script>
  
  <style scoped>
  .product-card {
    overflow: hidden;
    transition: all 0.3s ease;
    height: 100%;
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  }
  
  .image-container {
    flex-grow: 1;
    overflow: hidden;
    position: relative;
    padding-top: 100%; /* 1:1 Aspect Ratio */
  }
  
  .ts-image img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .product-card:hover .ts-image img {
    transform: scale(1.05);
  }
  
  .product-info {
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f8f9fa;
    border-top: 1px solid #e9ecef;
  }
  
  .product-name {
    font-weight: bold;
    font-size: 1rem;
    color: #343a40;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .product-price {
    font-weight: bold;
    font-size: 1rem;
    color: var(--primary-color);
    margin-left: 1rem;
  }

  .price {
    color: var(--primary-color);
  }
  </style>