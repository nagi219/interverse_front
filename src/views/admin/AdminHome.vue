<template>
  <div class="container-fluid full-height" >
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800">
  <!-- Background -->
  <rect width="1200" height="800" fill="#DECEBF"/> <!-- Homepage background color -->

  <!-- Main content area -->
  <text x="280" y="50" font-family="Arial" font-size="24" font-weight="bold" fill="#68756D">歡迎回來，管理員</text>

  <!-- Dashboard cards -->
  <rect x="280" y="80" width="200" height="100" rx="10" fill="#FFFFFF"/>
  <text x="300" y="120" font-family="Arial" font-size="18" fill="#68756D">總訂單</text>
  <text x="300" y="150" font-family="Arial" font-size="24" font-weight="bold" fill="#68756D">8956</text>

  <rect x="500" y="80" width="200" height="100" rx="10" fill="#FFFFFF"/>
  <text x="520" y="120" font-family="Arial" font-size="18" fill="#68756D">新用戶</text>
  <text x="520" y="150" font-family="Arial" font-size="24" font-weight="bold" fill="#68756D">1268</text>

  <rect x="720" y="80" width="200" height="100" rx="10" fill="#FFFFFF"/>
  <text x="740" y="120" font-family="Arial" font-size="18" fill="#68756D">總收入</text>
  <text x="740" y="150" font-family="Arial" font-size="24" font-weight="bold" fill="#68756D">$145,320</text>

  <!-- Charts -->
  <rect x="280" y="200" width="640" height="250" rx="10" fill="#FFFFFF"/>
  <text x="300" y="230" font-family="Arial" font-size="18" font-weight="bold" fill="#68756D">銷售趨勢</text>
  <path d="M300 400 L400 350 L500 380 L600 320 L700 360 L800 300" fill="none" stroke="#B57B66" stroke-width="2"/>

  <rect x="280" y="470" width="310" height="250" rx="10" fill="#FFFFFF"/>
  <text x="300" y="500" font-family="Arial" font-size="18" font-weight="bold" fill="#68756D">商品類別分布</text>
  <circle cx="435" cy="595" r="80" fill="#A1A79E"/>
  <circle cx="435" cy="595" r="60" fill="#B57B66"/>
  <circle cx="435" cy="595" r="40" fill="#DECEBF"/> <!-- Homepage background color -->

  <rect x="610" y="470" width="310" height="250" rx="10" fill="#FFFFFF"/>
  <text x="630" y="500" font-family="Arial" font-size="18" font-weight="bold" fill="#68756D">最新訂單</text>
  <text x="630" y="540" font-family="Arial" font-size="14" fill="#68756D">訂單 #12345 - $120</text>
  <text x="630" y="570" font-family="Arial" font-size="14" fill="#68756D">訂單 #12346 - $85</text>
  <text x="630" y="600" font-family="Arial" font-size="14" fill="#68756D">訂單 #12347 - $200</text>
</svg>
</div>
</template>

<script setup>
import { onMounted } from "vue";
import axios from "@/plugins/axios";


//掛載時直接確認是否有權限參訪頁面
async function checkPermission() {
  try {
    const response = await axios.get('/admin/void')
    if (response.status === 200) {
      console.log('權限檢查:', response.data)
    }
  } catch (error) {
    console.error('權限檢查:', error)
  }
}

onMounted(() => {
  checkPermission()
})
</script>

<style scoped>
.full-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
