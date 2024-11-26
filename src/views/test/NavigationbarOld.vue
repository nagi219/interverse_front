<template>

  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" :to="{ name: 'home-link' }">InterVerse</RouterLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item">
            <RouterLink class="nav-link active" aria-current="page" :to="{ name: 'home-link' }">首頁</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'login-link' }" v-show="!userStore.isLoggedIn">登入</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'register-link' }">註冊</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'club-all-link' }">俱樂部</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'club-approve-link' }">俱樂部審核</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'club-my-link' }">我的俱樂部</RouterLink>
          </li>
          <li class="nav-item">
          <RouterLink class="nav-link" :to="{ name: 'event-all-link' }">工作坊</RouterLink>
        </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'product-category' }">類別頁面</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'product-product' }">產品頁面</RouterLink>
            <RouterLink class="nav-link" :to="{ name: 'post-create-link' }">新增動態</RouterLink>
          </li>          
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'user-post-link' }" >動態牆</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'product-cart' }">加入購物車頁面</RouterLink>
          </li>
          <li class="nav-item" v-if="userStore.isLoggedIn">
            <RouterLink class="nav-link" :to="{ name: 'cart-user' }">購物車頁面</RouterLink>
          </li>
          <li class="nav-item" v-if="userStore.isLoggedIn">
            <RouterLink class="nav-link" :to="{ name: 'user-orders' }">使用者的訂單</RouterLink>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              <!-- v-show="userStore.isLoggedIn" -->
              Dropdown link
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'profile-link' }">編輯個人資料</RouterLink>
              </li>
              <li><RouterLink class="dropdown-item" :to="{ name: 'profile-link' }">###</RouterLink></li>
              <li><a class="dropdown-item" @click="logout">登出</a></li>
            </ul>
          </li>
        </ul>
        <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'login-link' }" v-show="!userStore.isLoggedIn"><font-awesome-icon :icon="['fas', 'sign-in-alt']" /> 登入</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" :to="{ name: 'register-link' }"><font-awesome-icon :icon="['fas', 'user-plus']" /> 註冊</RouterLink>
            </li>
          </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import useUserStore from '@/stores/userstore';
import axios from '@/plugins/axios';

const userStore = useUserStore();
function logout() {
  userStore.resetStore();
  axios.defaults.headers.authorization ='';
}



</script>

<style></style>