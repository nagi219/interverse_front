<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light mt-4">
    <div class="container-fluid">
      <RouterLink class="navbar-brand" :to="{ name: 'admin-home-link' }">InterVerse Admin</RouterLink>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavDropdown"
        aria-controls="navbarNavDropdown" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNavDropdown">
        <ul class="navbar-nav">
          <li class="nav-item">
            <RouterLink class="nav-link active" aria-current="page" :to="{ name: 'admin-home-link' }">後台首頁</RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink class="nav-link" :to="{ name: 'product-cart' }">商城</RouterLink>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button"
              @click="toggleDropdown('humanresources')" aria-expanded="dropdownStates.humanresources">
              人資管理
              <font-awesome-icon :icon="['fas', 'caret-down']" :class="{ rotate: dropdownStates.humanresources }" />
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink" :class="{ show: dropdownStates.humanresources }">
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'admin-register-link' }" @click="closeDropdown('humanresources')">新增員工
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'product-category' }" @click="closeDropdown('humanresources')">
                  類別
                </RouterLink>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button"
              @click="toggleDropdown('product')" aria-expanded="dropdownStates.product">
              產品管理
              <font-awesome-icon :icon="['fas', 'caret-down']" :class="{ rotate: dropdownStates.product }" />
            </a>
            <ul class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink" :class="{ show: dropdownStates.product }">
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'product-product' }" @click="closeDropdown('product')">產品
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'product-category' }" @click="closeDropdown('product')">
                  類別
                </RouterLink>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" id="anotherDropdownMenuLink" role="button"
              @click="toggleDropdown('settings')" aria-expanded="dropdownStates.settings">
              勁甫(暫放)
              <font-awesome-icon :icon="['fas', 'caret-down']" :class="{ rotate: dropdownStates.settings }" />
            </a>
            <ul class="dropdown-menu" aria-labelledby="anotherDropdownMenuLink"
              :class="{ show: dropdownStates.settings }">
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'post-create-link' }" @click="closeDropdown('settings')">
                  新增動態
                </RouterLink>
              </li>
              <li>
                <RouterLink class="dropdown-item" :to="{ name: 'user-post-link' }" @click="closeDropdown('settings')">
                  動態牆
                </RouterLink>
              </li>
            </ul>
          </li>
          <!-- Other items -->
        </ul>
        
        <ul class="navbar-nav ms-auto">
          <li class="nav-item dropdown me-2">
            <a class="nav-link dropdown-toggle" href="#" id="anotherDropdownMenuLink" role="button"
              @click="toggleDropdown('person')" aria-expanded="dropdownStates.person" v-show="adminStore.isLoggedIn">
              <font-awesome-icon :icon="['fas', 'user']" /> <font-awesome-icon :icon="['fas', 'caret-down']" :class="{ 'rotate': dropdownStates.person }" />
            </a>
            <ul class="dropdown-menu" aria-labelledby="anotherDropdownMenuLink"
              :class="{ 'show': dropdownStates.person }">
              <RouterLink class="dropdown-item" :to="{ name: 'profile-link' }" @click="closeDropdown('person')">會員詳細
              </RouterLink>
              <RouterLink class="dropdown-item" :to="{ name: 'friend-link' }" @click="closeDropdown('person')">我的好友列表
              </RouterLink>
              <RouterLink class="dropdown-item" :to="{ name: 'user-orders' }" @click="closeDropdown('person')">我的訂單紀錄
              </RouterLink>
              <li><a class="dropdown-item" @click="logoutAdmin(); closeDropdown('person')">登出</a></li>
            </ul>
          </li>
        </ul>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import useAdminStore from "@/stores/adminStore";
import axios from "@/plugins/axios";

const adminStore = useAdminStore();

//掛載時直接確認是否有權限參訪此navbar
async function checkPermission() {
  try {
    const response = await axios.get('/admin/void')
    if (response.status === 200) {
      console.log('權限檢查:', response.data)
    }
  } catch (error) {
    adminStore.setAdminId("");
    console.error('權限檢查:', error)
  }
}

onMounted(() => {
  checkPermission()
})

function logoutAdmin() {
  adminStore.resetStore();
  axios.defaults.headers.authorization = "";
  axios.defaults.headers.common["X-User-ID"] = "";
}

const dropdownStates = ref({
  humanresources: false,
  product: false,
  settings: false,
  person: false,
});

function initializeDropdownState(menu) {
  if (!(menu in dropdownStates.value)) {
    dropdownStates.value[menu] = false;
  }
}

function toggleDropdown(menu) {
  initializeDropdownState(menu);
  Object.keys(dropdownStates.value).forEach((key) => {
    dropdownStates.value[key] =
      key === menu ? !dropdownStates.value[key] : false;
  });
}

function closeDropdown(menu) {
  dropdownStates.value[menu] = false;
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
