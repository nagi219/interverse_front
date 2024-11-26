<template>
  <div class="ts-container product-details" v-if="product">
    <div class="ts-grid">
      <div class="column is-7-wide">
        <div class="carousel-container">
          <transition name="fade" mode="out-in">
            <div class="ts-image main-image" :key="currentImageIndex">
              <img :src="currentImageUrl" :alt="product.name"/>
            </div>
          </transition>
          <button class="carousel-button prev" @click="prevImage">&lt;</button>
          <button class="carousel-button next" @click="nextImage">&gt;</button>
        </div>
        <div class="ts-grid thumbnail-grid">
          <div class="column" v-for="(photo, index) in productPhotos" :key="photo.id">
            <div class="ts-image thumbnail" @click="setCurrentImage(index)" :class="{ active: currentImageIndex === index }">
              <img :src="getPhotoUrl(photo.id)" :alt="product.name"/>
            </div>
          </div>
        </div>
      </div>
      <div class="column is-9-wide product-info">
        <h1 class="ts-header is-huge">{{ product.name }}</h1>
        <p class="ts-text is-large price">NT$ {{ product.price }}</p>
        <div class="ts-grid">
          <div class="column is-8-wide">
            <div class="ts-input is-fluid">
              <input type="number" v-model.number="vol" min="1" :max="100">
            </div>
          </div>
          <div class="column is-8-wide">
            <button class="ts-button is-fluid is-primary" @click="addToCart" :disabled="!isValidInput">
              加入購物車
            </button>
          </div>
        </div>
        <div class="ts-box is-segment has-top-spaced-large product-description">
          <div class="ts-content">
            <h3 class="ts-header">商品說明:</h3>
            <p class="ts-text">{{ product.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router';
import { ref, onMounted, computed } from 'vue'
import axiosapi from '@/plugins/axios';
import useUserStore from '@/stores/userstore';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cartStore';

const userStore = useUserStore();
const route = useRoute();
const product = ref(null);
const vol = ref(1);
const currentImageIndex = ref(0);
const productPhotos = ref([]);
const router = useRouter();
const products=ref([]);
const totalVolume =ref(0);
const cartStore = useCartStore();

const currentImageUrl = computed(() => {
  if (productPhotos.value.length > 0) {
    return getPhotoUrl(productPhotos.value[currentImageIndex.value].id);
  }
  return '';
});

const isValidInput = computed(() => {
  return product.value && vol.value > 0;
});

onMounted(() => {
  const productId = route.params.id;
  getProductById(productId);
  getProductPhotos(productId);
  //getUserCartCount(userStore.userId);
});




function getProductById(id) {
  axiosapi.get(`/products/${id}`).then(function (response) {
    product.value = response.data;
  }).catch(error => {
    console.error("Error fetching product:", error);
  });
}

function getProductPhotos(productId) {
  axiosapi.get(`/api/product-photos/product/${productId}`).then(function (response) {
    productPhotos.value = response.data;
  }).catch(error => {
    console.error("Error fetching product photos:", error);
  });
}

function getPhotoUrl(photoId) {
  return `http://localhost:8080/interverse/products/${product.value.id}/${photoId}`;
}

function addToCart() {
  if (!isValidInput.value) return;

// 檢查用戶是否登入
if (!userStore.isLoggedIn) {
  alert('請先登入才能加入購物車');
  router.push('/login'); // 假設登入頁面的路由是 '/login'
  return;



}

console.log(userStore.userId);
console.log(product.value.id);
console.log(vol.value);
let request = {
  "usersId": userStore.userId,
  "productsId": product.value.id,
  "vol": vol.value
};

  console.log(request);
  

  axiosapi.post("/cart/add", request).then(function (productResponse) {
    console.log("加入購物車成功", productResponse);
    alert('加入購物車成功！'); // 新增的成功提示
    router.push({
    name: 'product-cart',
    })
  }).catch(error => {
    console.error("加入購物車失敗", error);
    alert('加入購物車失敗，請稍後再試。'); // 新增的錯誤提示
  }).then(function(){
    getUserCartCount(userStore.userId);
  })
}

function prevImage() {
  currentImageIndex.value = (currentImageIndex.value - 1 + productPhotos.value.length) % productPhotos.value.length;
}

function nextImage() {
  currentImageIndex.value = (currentImageIndex.value + 1) % productPhotos.value.length;
}

function setCurrentImage(index) {
  currentImageIndex.value = index;
}

function getUserCartCount(userId) {
    axiosapi.get(`/cart/user/${userId}`).then(function (productResponse) {
        console.log("列出清單", productResponse);
        products.value = productResponse.data;
        totalVolume.value = products.value.reduce((sum, product) => sum + product.vol, 0);
        console.log("總數量",totalVolume._rawValue);

        cartStore.updateCartCount(totalVolume._rawValue);
    });
}


  




</script>

<style scoped>
.product-details {
  padding: 20px;
  background-color: var(--background-color);
}

.carousel-container {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(177, 151, 252, 0.2);
}

.main-image {
  width: 100%;
  height: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: white;
}

.main-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.carousel-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 15px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s;
  opacity: 0.7;
}

.carousel-button:hover {
  opacity: 1;
}

.carousel-button.prev {
  left: 10px;
}

.carousel-button.next {
  right: 10px;
}

.thumbnail-grid {
  margin-top: 10px;
}

.thumbnail {
  width: 60px;
  height: 60px;
  cursor: pointer;
  border: 2px solid transparent;
  border-radius: 4px;
  overflow: hidden;
  transition: border-color 0.3s;
}

.thumbnail.active {
  border-color: var(--primary-color);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding-left: 20px;
}

.price {
  color: var(--primary-color);
  font-weight: bold;
}

.ts-input input {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px;
  width: 100%;
}

.ts-button.is-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition: background-color 0.3s, transform 0.1s;
  cursor: pointer;
  padding-top: 6px;
}

.ts-button.is-primary:hover {
  background-color:  var( --background-color);
  transform: translateY(-2px);
}

.ts-button.is-primary:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
  transform: none;
}

.product-description {
  background-color: white;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.product-description .ts-header {
  color: var(--primary-color);
  margin-bottom: 10px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .ts-grid {
    flex-direction: column;
  }

  .column.is-7-wide,
  .column.is-9-wide {
    width: 100%;
  }

  .product-info {
    padding-left: 0;
    margin-top: 20px;
  }
}
</style>