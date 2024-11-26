<template>
    <div class="cart-product-list">
      <h2 class="main-title">Interverse商品周邊</h2>
      <div class="product-grid">
        <div class="product-item" v-for="product in products" :key="product.id">
          <CartProductCard :product="product" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axiosapi from '@/plugins/axios';
  import CartProductCard from '@/components/Cart/CartProductCard.vue';
  
  const products = ref([]);
  const categories = ref([]);
  
  onMounted(function () {
      getAllProducts();
      getAllCategories();
  });
  
  function getAllProducts() {
      axiosapi.get(`/products`).then(function (response) {
          console.log("responseproducts", response);
          products.value = response.data;
      });
  }
  
  function getAllCategories() {
      axiosapi.get(`/categories`).then(function (response) {
          console.log("responsecategories", response);
          categories.value = response.data;
      });
  }

  
  </script>
  
  <style scoped>
  .cart-product-list {
    background-color: var(--background-color);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(177, 151, 252, 0.1);
  }
  
  .main-title {
    color: var(--text-color);
    text-align: center;
    margin-bottom: 50px;
    font-size: 1.8em;
    font-weight: bold;
  }
  
  .product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
  
  .product-item {
    background-color: white;
    border-radius: 8px;
    overflow: hidden;
    transition: box-shadow 0.3s ease, transform 0.3s ease;
  }
  
  .product-item:hover {
    box-shadow: 0 5px 15px rgba(177, 151, 252, 0.2);
    transform: translateY(-5px);
  }
  
  @media (max-width: 768px) {
    .product-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
  </style>