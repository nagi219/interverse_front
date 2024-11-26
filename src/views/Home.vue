<template>
  <div class="home-page">

    <div class="mosaic-grid">
      <div v-for="num in 18" :key="num" :class="['mosaic-item', `item-${(num - 1) % 5 + 1}`]">
        <img :src="`http://localhost:8080/interverse/products/1/${21 - num}`" :alt="`Image ${18 - num}`" />
        <div class="mosaic-caption">
        </div>
      </div>
    </div>

    <div class="hero-section">
      <h1>發現您的理想社群</h1>
      <p>InterVerse 是一個讓您可以建立和加入俱樂部、參與活動，並與志同道合的人聯繫的平台。</p>
      <div class="features">
        <div class="feature">
          <font-awesome-icon :icon="['fas', 'dollar-sign']" class="feature-icon" />
          <h3>付費活動</h3>
          <p>在此平台輕鬆管理和收費付費活動。</p>
        </div>
        <div class="feature">
          <font-awesome-icon :icon="['fas', 'globe']" class="feature-icon" />
          <h3>專屬空間</h3>
          <p>為您的俱樂部提供私密的專屬空間，統一管理您的社群。</p>
        </div>
        <div class="feature">
          <font-awesome-icon :icon="['fas', 'comments']" class="feature-icon" />
          <h3>主題論壇</h3>
          <p>為每個俱樂部提供專屬討論空間，促進成員交流、分享想法和深入探討共同興趣。</p>
        </div>
      </div>
      <button @click="exploreClubs">探索俱樂部</button>
    </div>


    <div class="featured-products-wrapper">
      <div class="featured-products">
        <div class="featured-product" v-for="(product, index) in products" :key="index"
          @click="navigateToProductDetails(product.id)">
          <div class="product-image-container" style="height: 300px; width: 300px;">
            <img :src="product.image" :alt="product.name" />
          </div>
          <div class="product-name">{{ product.name }}</div>
        </div>
      </div>
      <div class="shop-now-section" @click="navigateToShop" style="width: 200px;">
        <span style="font-size: 70px;">立即購物</span>
      </div>
    </div>


    <div class="separator"></div>

    <div class="workshop-article">
      <div class="article-image">
        <div class="cookie-border">
          <div class="workshop-image"></div>
        </div>
      </div>
      <div class="article-content">
        <h1>創建您的工作坊</h1>
        <h5>在 InterVerse，您可以輕鬆創建和主持自己的工作坊，並從中獲得收入。無論您是專業人士、創意工作者還是熱愛分享的愛好者，都能在這裡找到屬於自己的舞台。</h5>
        <h5>設置靈活的定價模式，接受一次性付費或訂閱制。我們提供簡單的工具來管理您的工作坊，讓您專注於創造精彩內容。</h5>
        <div class="benefits-list">
          <div class="benefit-item">
            <font-awesome-icon :icon="['fas', 'check-circle']" />
            <span>輕鬆設置付費工作坊</span>
          </div>
          <div class="benefit-item">
            <font-awesome-icon :icon="['fas', 'check-circle']" />
            <span>靈活的定價選項</span>
          </div>
          <div class="benefit-item">
            <font-awesome-icon :icon="['fas', 'check-circle']" />
            <span>直接從您的專業知識中獲利</span>
          </div>
          <div class="benefit-item">
            <font-awesome-icon :icon="['fas', 'check-circle']" />
            <span>建立您的專業品牌</span>
          </div>
        </div>
      </div>
      <button @click="createWorkshop" class="create-button">開始創建工作坊</button>
    </div>


    <div class="cta-section">
      <h2>輕鬆交友，展現真我</h2>
      <h3>個人主頁動態牆</h3>
        <p>分享您的日常生活、想法和創意。與朋友互動，獲得靈感，擴展您的社交圈。</p>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';

const products = ref([
  { id: 'product1', name: '馬克杯', image: '/馬克杯2.png' },
  { id: 'product2', name: '手機殼', image: '/手機殼3.jpg' },
  { id: 'product3', name: '飲料杯袋', image: '/袋子2.png' }
]);

function navigateToProductDetails(productId) {
  console.log(`Navigating to product: ${productId}`);
}

function navigateToShop() {
  console.log('Navigating to shop');
}

</script>

<style scoped>
.item-1 {
  grid-column: span 1;
  grid-row: span 1;
}

.item-2 {
  grid-column: span 1;
  grid-row: span 1;
}

.item-3 {
  grid-column: span 1;
  grid-row: span 1;
}

.item-4 {
  grid-column: span 1;
  grid-row: span 2;
}

.item-5 {
  grid-column: span 2;
  grid-row: span 2;
}


.mosaic-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 150px;
  gap: 10px;
  padding: 20px;
}

.mosaic-item {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.mosaic-item:hover {
  transform: scale(1.05);
}

.mosaic-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(232, 204, 204, 0.7);
  /* 粉藕色半透明背景 */
  color: #4a3636;
  /* 深棕色文字 */
  padding: 10px;
}

.mosaic-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}



.home-page {
  width: 100%;
  background-color: #FBE4E1;
}

.featured-products-wrapper {
  display: flex;
  background-color: #FBE4E1;
  min-height: 350px;
}

.featured-products {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  align-items: center;
  padding: 40px 20px;
}

.featured-product {
  width: 30%;
  cursor: pointer;
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.featured-product:hover {
  transform: scale(1.05);
}

.product-image-container {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  border: 5px solid #E4BAB6;
}

.product-image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-name {
  text-align: center;
  font-weight: bold;
  color: #97715B;
  font-size: 1.2em;
}

.shop-now-section {
  width: 120px;
  background-color: #F3D2A8;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.shop-now-section:hover {
  background-color: #EEC48D;
}

.shop-now-section span {
  font-size: 2em;
  font-weight: bold;
  color: #97715B;
  text-transform: uppercase;
}

.separator {
  height: 40px;
  background-color: #E4BAB6;
}

.workshop-article {
  display: flex;
  flex-wrap: wrap;
  background-color: var(--light-background);
  padding: 50px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
}

.article-image {
  flex: 0 0 30%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.cookie-border {
  width: 250px;
  height: 250px;
  border: 12px solid var(--primary-color);
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.workshop-image {
  width: 220px;
  height: 220px;
  background-image: url('/Capybaras.gif');
  background-size: cover;
  background-position: center;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
}

.article-content {
  flex: 0 0 70%;
  padding-left: 30px;
}

.article-content h1 {
  font-size: 2.5em;
  color: var(--accent-color);
  margin-bottom: 20px;
}

.article-content h5 {
  font-size: 1.1em;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 15px;
  font-weight: normal;
}

.benefits-list {
  display: flex;
  flex-wrap: wrap;
  margin: 20px 0;
}

.benefit-item {
  flex: 0 0 50%;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.benefit-item svg {
  color: var(--accent-color);
  margin-right: 10px;
}

.benefit-item span {
  font-weight: bold;
  color: var(--text-color);
}

.create-button {
  position: absolute;
  bottom: 30px;
  right: 50px;
  background-color: var(--accent-color);
  color: var(--light-background);
  border: none;
  padding: 12px 24px;
  font-size: 1.1em;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 5px;
}

.create-button:hover {
  background-color: var(--secondary-color);
}


.hero-section {
  background-color: var(--primary-color);
  color: var(--text-color);
  text-align: center;
  padding: 60px 20px;
}

.hero-section h1 {
  font-size: 3em;
  margin-bottom: 20px;
}

.hero-section>p {
  font-size: 1.2em;
  margin-bottom: 30px;
}

.features {
  display: flex;
  justify-content: space-around;
  margin-bottom: 40px;
}

.feature {
  flex: 1;
  margin: 0 15px;
  max-width: 300px;
}

.feature-icon {
  font-size: 2.5em;
  color: var(--accent-color);
  margin-bottom: 15px;
}

.feature h3 {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.feature p {
  font-size: 1em;
  line-height: 1.4;
}

.hero-section button {
  font-size: 1.1em;
  padding: 12px 24px;
  background-color: var(--accent-color);
  color: var(--light-background);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.hero-section button:hover {
  background-color: var(--secondary-color);
}

.cta-section {
  background-color: var(--secondary-color);
  text-align: center;
  padding: 60px 20px;
  color: var(--text-color);
}

.cta-section h2 {
  font-size: 2.5em;
  margin-bottom: 20px;
}

.cta-section p {
  font-size: 1.2em;
  margin-bottom: 30px;
}

.cta-section button {
  font-size: 1.1em;
  padding: 10px 20px;
  background-color: var(--accent-color);
  color: var(--light-background);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 2.5em;
  }

  .features {
    flex-direction: column;
    align-items: center;
  }

  .feature {
    margin-bottom: 30px;
  }

  .cta-section h2 {
    font-size: 2em;
  }
}

@media (max-width: 1024px) {
  .featured-products-wrapper {
    flex-direction: column;
  }

  .featured-products {
    width: 100%;
  }

  .shop-now-section {
    width: 100%;
    height: 80px;
    writing-mode: horizontal-tb;
  }

  .shop-now-section span {
    writing-mode: horizontal-tb;
  }

  .workshop-article {
    flex-direction: column;
  }

  .article-image,
  .article-content {
    width: 100%;
  }

  .article-content {
    padding-left: 0;
    padding-top: 30px;
  }

  .create-button {
    position: static;
    margin-top: 20px;
    align-self: flex-end;
  }
}

@media (max-width: 768px) {
  .featured-product {
    width: 45%;
  }

  .product-image-container {
    width: 150px;
    height: 150px;
  }

  .cookie-border {
    width: 250px;
    height: 250px;
  }

  .workshop-article {
    padding: 30px;
  }

  .article-content h1 {
    font-size: 2em;
  }

  .benefit-item {
    flex: 0 0 100%;
  }
}

@media (max-width: 480px) {
  .featured-product {
    width: 100%;
  }

  .product-image-container {
    width: 120px;
    height: 120px;
  }
}
</style>