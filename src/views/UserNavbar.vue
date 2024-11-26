<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light mt-4">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" :to="{ name: 'home-link' }"><img src="/interverse navlogo.png" width="100px"></RouterLink>
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
            <RouterLink class="nav-link" :to="{ name: 'club-all-link' }">俱樂部</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'event-all-link' }">工作坊</RouterLink>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button"
            @mouseenter="openDropdown('club')" @mouseleave="closeDropdown('club')" aria-expanded="dropdownStates.club" v-show="userStore.isLoggedIn">
              主辦頁面 <font-awesome-icon :icon="['fas', 'caret-down']" :class="{ 'rotate': dropdownStates.club }" />
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink" :class="{ 'show': dropdownStates.club }" @mouseenter="openDropdown('club')" @mouseleave="closeDropdown('club')">
              <li><RouterLink class="dropdown-item" :to="{ name: 'club-approve-link' }" @click="closeDropdown('club')">俱樂部管理
              </RouterLink></li>
              <li><RouterLink class="dropdown-item" :to="{ name: 'event-approve-link' }" @click="closeDropdown('club')">工作坊/活動管理
              </RouterLink></li>
            </ul>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'user-post-link' }">我的動態牆</RouterLink>
          </li>
          <!-- Other items -->
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'product-cart' }">購物商城</RouterLink>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto">
          <li class="nav-item dropdown me-2">
            <a class="nav-link dropdown-toggle" href="#" id="anotherDropdownMenuLink" role="button"
            @mouseenter="openDropdown('person')" @mouseleave="closeDropdown('person')" 
            aria-expanded="dropdownStates.person" v-show="userStore.isLoggedIn"> 歡迎回來, {{ userStore.nickname }}
              <font-awesome-icon :icon="['fas', 'user']" /> <font-awesome-icon :icon="['fas', 'caret-down']" :class="{ 'rotate': dropdownStates.person }" />
            </a>
            <ul class="dropdown-menu" aria-labelledby="anotherDropdownMenuLink"
              :class="{ 'show': dropdownStates.person }" @mouseenter="openDropdown('person')" @mouseleave="closeDropdown('person')">
              <RouterLink class="dropdown-item" :to="{ name: 'profile-link' }" @click="closeDropdown('person')">會員詳細資料
              </RouterLink>
              <RouterLink class="dropdown-item" :to="{ name: 'friend-link' }" @click="closeDropdown('person')">我的好友列表
              </RouterLink>
              <RouterLink class="dropdown-item" :to="{ name: 'friend-request-link' }" @click="closeDropdown('person')">我的好友邀請列表
              </RouterLink>
              <RouterLink class="dropdown-item" :to="{ name: 'user-orders' }" @click="closeDropdown('person')">我的訂單紀錄
              </RouterLink>
              <RouterLink class="dropdown-item" :to="{ name: 'club-my-link' }" @click="closeDropdown('club')">我的俱樂部
              </RouterLink>
              <RouterLink class="dropdown-item" :to="{ name: 'event-my-link' }" @click="closeDropdown('club')">我參加的活動/工作坊
              </RouterLink>
              <li><a class="dropdown-item" @click="logout(); closeDropdown('person')">登出</a></li>
            </ul>
          </li>
          <li class="nav-item me-2" >
            <!-- <n-badge :value="notiValue" :max="15" v-show="userStore.isLoggedIn">
              <RouterLink class="nav-link" :to="{ name: 'notification-link' }" v-show="userStore.isLoggedIn">
                <font-awesome-icon :icon="['far', 'bell']" />
              </RouterLink>
            </n-badge> -->
            <div v-show="userStore.isLoggedIn">
              <NotificationDropdown></NotificationDropdown>
            </div>
          </li>
          <li class="nav-item me-2">
            <n-badge :value="cartValue" :max="15" v-show="userStore.isLoggedIn">
              <RouterLink class="nav-link" :to="{ name: 'cart-user' }" v-show="userStore.isLoggedIn">
                <font-awesome-icon :icon="['fas', 'cart-shopping']"  />
              </RouterLink>
            </n-badge>
          </li>


          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'login-link' }" v-show="!userStore.isLoggedIn">
              <font-awesome-icon :icon="['fas', 'sign-in-alt']" /> 登入
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'register-link' }" v-show="!userStore.isLoggedIn">
              <font-awesome-icon :icon="['fas', 'user-plus']" /> 註冊
            </RouterLink>
          </li>


        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { onMounted, ref,computed } from 'vue';
import useUserStore from '@/stores/userstore';
import axios from '@/plugins/axios';
import { useCartStore } from '@/stores/cartStore';

import NotificationDropdown from '@/components/user/NotificationDropdown.vue';

const cartStore = useCartStore();

const cartValue = computed(() => cartStore.cartItemCount);

onMounted(() => {
  cartStore.initializeCartCount();
});






const dropdownStates = ref({
  club: false,
  settings: false,
  person: false
});

function openDropdown(menu) {
  dropdownStates.value[menu] = true;
}

function closeDropdown(menu) {
  dropdownStates.value[menu] = false;
}

const userStore = useUserStore();
const currentUserId = computed(() => userStore.userId);
function logout() {
  userStore.resetStore();
  axios.defaults.headers.authorization = '';
  axios.defaults.headers.common['X-User-ID'] = '';
}

</script>


<style scoped>
.navbar {
  background-color: var(--background-color) !important;
  padding: 1rem 2rem; /* 增加導航欄的內邊距 */
}

.nav-link {
  color: var(--text-color) !important;
  font-size: 1.2rem; /* 增加字體大小 */
  margin: 0 0.8rem; /* 增加導航項之間的間距 */
  padding: 0.5rem 1rem; /* 增加導航項的內邊距 */
  font-weight: bold;
}

.nav-link:hover {
  color: var(--accent-color) !important;
}

.dropdown-menu {
  background-color: #fafafa;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 6px rgba(151, 113, 91, 0.1);
}

.dropdown-item {
  color: var(--text-color);
  font-size: 1.1rem; /* 增加下拉菜單項的字體大小 */
  padding: 0.7rem 1.5rem; /* 增加下拉菜單項的內邊距 */
}

.dropdown-item:hover {
  background-color: var(--primary-color);
  color: var(--background-color);
}

.arrow {
  font-size: 0.75em;
}

.rotate {
  transform: rotate(180deg);
  transition: transform 0.5s ease;
}

.dropdown-toggle::after {
  display: none;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
}

.dropdown-menu {
  display: block;
  border: none;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease-out, opacity 0.3s ease-out, visibility 0s 0.5s;
  opacity: 0;
  visibility: hidden;
}

.dropdown-menu.show {
  max-height: 500px; /* 增加最大高度以適應更大的字體 */
  opacity: 1;
  transition: max-height 0.5s ease-in, opacity 0.3s ease-in, visibility 0s;
  visibility: visible;
}

.dropdown-toggle .fa-caret-down {
  transition: transform 0.5s ease;
}

.navbar-nav .dropdown-menu {
  right: 0;
  left: auto;
  max-width: 250px; /* 增加最大寬度以適應更大的字體 */
  width: max-content;
}

.navbar-nav .dropdown-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 991.98px) {
  .navbar-nav .dropdown-menu {
    position: static;
    float: none;
    width: auto;
    margin-top: 0;
    background-color: transparent;
    border: 0;
    box-shadow: none;
  }
  
  .nav-link {
    margin: 0.5rem 0; /* 在小屏幕上調整間距 */
  }
}

/* 添加一個過渡效果使變化更平滑 */
.navbar, .nav-link, .dropdown-item {
  transition: all 0.3s ease;
}
</style>