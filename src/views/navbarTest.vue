<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" :to="{ name: 'home-link' }"><img src="../../public/IMG_7258.jpg" width="80px"></RouterLink>
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
            <RouterLink class="nav-link" :to="{ name: 'login-link' }">登入</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'personal-link' }">註冊</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'club-all-link' }">俱樂部</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'event-cluball-link' }">社團活動</RouterLink>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button"
              @click="toggleDropdown('club')" aria-expanded="dropdownStates.club">
              dropdown <font-awesome-icon :icon="['fas', 'caret-down']" :class="{ 'rotate': dropdownStates.club }" />
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink" :class="{ 'show': dropdownStates.club }">
              <li><a class="dropdown-item" href="#" @click="closeDropdown('club')">Option 1</a></li>
              <li><a class="dropdown-item" href="#" @click="closeDropdown('club')">Option 2</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="anotherDropdownMenuLink" role="button"
              @click="toggleDropdown('settings')" aria-expanded="dropdownStates.settings">
              設置 <font-awesome-icon :icon="['fas', 'caret-down']" :class="{ 'rotate': dropdownStates.settings }" />
            </a>
            <ul class="dropdown-menu" aria-labelledby="anotherDropdownMenuLink"
              :class="{ 'show': dropdownStates.settings }">
              <li><a class="dropdown-item" href="#" @click="closeDropdown('settings')">Option 1</a></li>
              <li><a class="dropdown-item" href="#" @click="closeDropdown('settings')">Option 2</a></li>
            </ul>
          </li>
          <!-- Other items -->
        </ul>

        <ul class="navbar-nav ms-auto">
          <li class="nav-item dropdown me-2">
            <a class="nav-link dropdown-toggle" href="#" id="anotherDropdownMenuLink" role="button"
              @click="toggleDropdown('person')" aria-expanded="dropdownStates.person" v-show="userStore.isLoggedIn">
              <font-awesome-icon :icon="['fas', 'user']" /> <font-awesome-icon :icon="['fas', 'caret-down']" :class="{ 'rotate': dropdownStates.person }" />
            </a>
            <ul class="dropdown-menu" aria-labelledby="anotherDropdownMenuLink"
              :class="{ 'show': dropdownStates.person }">
              <RouterLink class="dropdown-item" :to="{ name: 'profile-link' }" @click="closeDropdown('person')">編輯個人資料
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
              <RouterLink class="nav-link" :to="{ name: 'profiletest-link' }" v-show="userStore.isLoggedIn">
                <font-awesome-icon :icon="['fas', 'cart-shopping']" />
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
import { ref } from 'vue';
import useUserStore from '@/stores/userstore';
import axios from '@/plugins/axios';

import NotificationDropdown from '@/components/user/NotificationDropdown.vue';

const notiValue = ref(5);
const cartValue = ref(2);

const dropdownStates = ref({
  club: false,
  settings: false,
  person: false
});

function initializeDropdownState(menu) {
  if (!(menu in dropdownStates.value)) {
    dropdownStates.value[menu] = false;
  }
}

function toggleDropdown(menu) {
  initializeDropdownState(menu);
  Object.keys(dropdownStates.value).forEach(key => {
    dropdownStates.value[key] = key === menu ? !dropdownStates.value[key] : false;
  });

}

function closeDropdown(menu) {
  dropdownStates.value[menu] = false;
}

const userStore = useUserStore();

function logout() {
  userStore.resetStore();
  axios.defaults.headers.authorization = '';
}

</script>


<style scoped>
.arrow {
  font-size: 0.75em;
  /* Adjust the size of the arrow */
  transition: transform 0.5s ease;
  /* Smooth transition for rotation */
}

.rotate {
  transform: rotate(180deg);
  /* Rotate the arrow when the dropdown is open */
}

.dropdown-menu {
  display: none;
  /* Hide dropdown menu by default */
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-menu.show {
  display: block;
  /* Show dropdown menu when it has 'show' class */
}

.dropdown-item {
  padding: 10px 20px;
  color: #000;
}

.dropdown-item:hover {
  background-color: #f1f1f1;
}

.dropdown-toggle::after {
  display: none;
  /* Hide default Bootstrap dropdown arrow */
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  /* Adjust the gap between the text and the icon */
}
</style>