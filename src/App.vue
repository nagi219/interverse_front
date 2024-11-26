<template>
  <n-config-provider :theme-overrides="customTheme">
    <n-dialog-provider>
      <n-message-provider>
        <div class="container-fluid" v-if="isAdminAuthPage">
          <RouterView></RouterView>
        </div>
        <template v-else>
          <div class="app-container" v-if="isAdmin">
            <AdminSideBar></AdminSideBar>
            <main class="main-content">
              <RouterView></RouterView>
            </main>
          </div>
          <div class="container-fluid" v-else>
            <div>
              <UserNavbar></UserNavbar>
            </div>
            <div>
              <RouterView></RouterView>
            </div>
            <div>
              <Footer></Footer>
            </div>
          </div>
        </template>
      </n-message-provider>
    </n-dialog-provider>
  </n-config-provider>
</template>

<script setup>
import UserNavbar from "./views/UserNavbar.vue";
import AdminSideBar from "./views/AdminSideBar.vue";
import Footer from "./views/Footer.vue";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "tocas/dist/tocas.min.css";
import { NConfigProvider, NMessageProvider, NDialogProvider } from "naive-ui";
import { useCustomTheme } from '@/plugins/naiveui';


const { customTheme } = useCustomTheme(); 

import { computed } from "vue";
import { useRoute } from 'vue-router';
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";
import useAdminStore from "@/stores/adminStore";

const route = useRoute()
const isAdminAuthPage = computed(() => route.path === '/admin/auth')

// 初始化應用時設置 axios headers，這是用來在重新整理f5的時候，不會丟失token的方法
const adminStore = useAdminStore();

if (adminStore.token) {
  axios.defaults.headers.authorization = `Bearer ${adminStore.token}`;
}

if (adminStore.adminId) {
  axios.defaults.headers.common["X-User-ID"] = adminStore.adminId;
}

const isAdmin = computed(() => {
  return adminStore.adminId !== "";
});

// 初始化應用時設置 axios headers，這是用來在重新整理f5的時候，不會丟失token的方法
const userStore = useUserStore();

if (userStore.token) {
  axios.defaults.headers.authorization = `Bearer ${userStore.token}`;
}

if (userStore.userId) {
  axios.defaults.headers.common["X-User-ID"] = userStore.userId;
}
</script>

<style >
:root {
  /* 主要顏色 */
  --primary-color: #E4BAB6;
  --secondary-color: #F3D2A8;
  --accent-color: #97715B;
  --background-color: #FBE4E1;
  --text-color: #6B5147;
  --light-text-color: #97715B;
  --border-color: #E4BAB6;
  --light-background: #F5E6E3;

  /* 新增狀態顏色 */
  --success-color: #7FB069;
  --success-light: #D4EDDA;
  --warning-color: #FFB347;
  --warning-light: #FFF3CD;
  --danger-color: #D9534F;
  --danger-light: #F8D7DA;
  --info-color: #5BC0DE;
  --info-light: #D1ECF1;

  /* 額外的輔助顏色 */
  --muted-color: #B0A8A6;
  --highlight-color: #FFD700;

    /* 後台色系 */
    --admin-primary-color: #85614D;
  --admin-secondary-color: #DECEBF;
  --admin-background-color: #F5EFE7;
  --admin-text-color: #3A3042;
  --admin-border-color: #C8B6A6;
  --admin-body-color: #C8B6A6;
}

.admin-theme {
  --primary-color: var(--admin-primary-color);
  --secondary-color: var(--admin-secondary-color);
  --background-color: var(--admin-background-color);
  --text-color: var(--admin-text-color);
  --border-color: var(--admin-border-color);
}


body {
  color: var(--text-color);
  background-color: var(--background-color);
}

.ts-box, .modal-content {
  background-color: var(--light-background);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(228, 186, 182, 0.1);
}

.ts-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.ts-table th {
  background-color: var(--primary-color);
  color: var(--text-color);
  padding: 12px;
  font-weight: 600;
}

.ts-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border-color);
}

.ts-table tr:last-child td {
  border-bottom: none;
}

.btn, .ts-button {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
}

.btn-primary, .ts-button.is-primary {
  background-color: var(--primary-color);
  color: var(--text-color);
}

.btn-primary:hover, .ts-button.is-primary:hover {
  background-color: #D9A8A3;
}

.btn-secondary {
  background-color: var(--secondary-color);
  color: var(--text-color);
}

.btn-secondary:hover {
  background-color: #EEC48D;
}

.btn-danger, .btn-warning {
  background-color: var(--accent-color);
  color: var(--light-background);
}

.btn-danger:hover, .btn-warning:hover {
  background-color: #85614D;
}

.ts-breadcrumb {
  background-color: var(--background-color);
  padding: 10px;
  border-radius: 4px;
}

.ts-breadcrumb .item {
  color: var(--accent-color);
  font-weight: 600;
}

input[type="text"], input[type="number"], select {
  border: 1px solid var(--border-color);
  border-radius: 4px;
  padding: 8px;
  background-color: var(--light-background);
  color: var(--text-color);
}

input[type="text"]:focus, input[type="number"]:focus, select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(228, 186, 182, 0.2);
}

.modal-header {
  background-color: var(--primary-color);
  color: var(--text-color);
}

.modal-footer {
  background-color: var(--background-color);
}

/* 添加一些動畫效果 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .cart-container {
    flex-direction: column;
  }
  .checkout-summary {
    width: 100%;
  }
}

body {
  margin-top: 10px;
}
</style>

<style scoped>
.app-container {
  display: flex;
}

.main-content {
  flex-grow: 1;
  margin-left: 250px;
  background-color: #DECEBF;
  /* padding: 20px; */
}

@media (max-width: 768px) {
  .main-content {
    margin-left: 200px;
  }
}
</style>
