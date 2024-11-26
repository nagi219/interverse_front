<template>
  <div class="container mt-4">

    <div v-if="isLoading" class="loading-indicator">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">加載中…</span>
      </div>
    </div>

    <div v-else class="main-content">
      <div class="row gutters">
        <div class="col-xl-3 col-lg-3 col-md-12 col-sm-12 col-12">
          <div class="profile-section">
            
            <div class="user-avatar">
              <div v-if="photo">
                <img :src="`${photo}`" :alt="userData.nickname || 'User Photo'"/>
              </div>
              <div v-else class="default-avatar">
                {{ (userData.accountNumber || "無").charAt(0).toUpperCase() }}
              </div>
              <n-upload ref="upload" :default-upload="false" :on-change="handleChange">
                <n-button>修改大頭照</n-button>
              </n-upload>
            </div>

            <hr />
            <h5>{{ userData.nickname }}</h5>
            <table class="profile-info">
              <tr>
                <td><font-awesome-icon :icon="['fas', 'envelope']" /></td>
                <td>{{ userData.email }}</td>
              </tr>
              <tr>
                <td><font-awesome-icon :icon="['fas', 'phone']" /></td>
                <td>{{ userData.phoneNumber }}</td>
              </tr>
              <tr>
                <td><font-awesome-icon :icon="['fas', 'location-dot']" /></td>
                <td>{{ userData.country }} , {{ userData.city }}</td>
              </tr>
              <tr>
                <td><font-awesome-icon :icon="['fas', 'cake-candles']" /></td>
                <td>{{ userData.age }} 歲</td>
              </tr>
              <tr>
                <td><font-awesome-icon :icon="['fas', 'venus-mars']" /></td>
                <td>{{ userData.gender }}</td>
              </tr>
            </table>
          </div>

          <div class="about-section">
            <h5>關於我</h5>
            <p>{{ userData.bio }}</p>
          </div>

        </div>

        <div class="col-xl-9 col-lg-9 col-md-12 col-sm-12 col-12">
          <div class="details-section">
            <div class="container mt-4">
              <!-- Tabs Navigation -->
              <ul class="nav nav-tabs" id="myTab" role="tablist">
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link"
                    :class="{ active: activeTab === 'wallet' }"
                    @click="activeTab = 'wallet'"
                  >
                    錢包
                  </button>
                </li>
                <li class="nav-item" role="presentation">
                  <button
                    class="nav-link"
                    :class="{ active: activeTab === 'profile' }"
                    @click="activeTab = 'profile'"
                  >
                    個人資料
                  </button>
                </li>
              </ul>

              <!-- Tabs Content -->
              <div class="tab-content mt-3">
                <div v-if="activeTab === 'wallet'" class="tab-pane active">
                  <h3>我的錢包</h3>
                  <!-- Wallet Section -->
                  <Wallet></Wallet>
                </div>
                <div v-if="activeTab === 'profile'" class="tab-pane active">
                  <h3>個人資料</h3>
                  <!-- Profile Section -->
                  <ProfileForm
                  v-bind="userData"
                  @update-success="callFind"
                  ></ProfileForm>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ProfileForm from "@/components/user/ProfileForm.vue";
import Wallet from "@/components/user/Wallet.vue";

import { ref, onMounted } from "vue";
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";

const activeTab = ref("wallet");

const userStore = useUserStore();
const userId = userStore.userId;

const userData = ref({});
const photo = ref('');

const isLoading = ref(true);
const upload = ref(null);


onMounted(function () {
  callFind();
});

function callFind() {
  isLoading.value = true;
  Promise.all([
    axios.get(`/user/secure/${userId}`),
    axios.get(`/user/secure/profile-photo/${userId}`)
  ]).then(([userResponse, photoResponse]) => {

    console.log("response", userResponse);
    // 處理用戶數據
    userData.value = userResponse.data;

    // 處理照片數據
    photo.value = photoResponse.data;
  }).catch((error) => {
    console.log("error", error);
  }).finally(() => {
    isLoading.value = false;
  });
}

const selectedFile = ref(null);
function handleChange({ file }) {
  // 選擇照片時觸發改變事件
  selectedFile.value = file;
  // 呼叫上傳的方法，會員選擇完成並點擊'確定'後立即上傳
  uploadPhoto();
}

async function uploadPhoto() {
  const formData = new FormData();
  formData.append("file", selectedFile.value.file); // `file` 屬性包含實際文件

  try {
    const response = await axios.post(
      `/user/secure/profile-photo/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    photo.value = response.data;

    // 清除上傳組件的文件列表
    if (upload.value) {
      upload.value.clear();
    }

  } catch (error) {
    console.error("更新失敗", error);
  }
}

</script>

<style scoped>
.main-content {
  margin-top: 20px;
}

.about-section,
.profile-section,
.details-section {
  padding: 15px;
  background-color: var(--background-color);
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(228, 186, 182, 0.1);
  white-space: pre-wrap;

}

.profile-info {
  width: 80%;
  margin: 0 auto;
  border-collapse: collapse;
  font-size: 0.9rem;
  text-align: left;
  color: var(--text-color);
}

.profile-info td {
  padding: 5px 10px;
  vertical-align: middle;
}

.profile-info td:first-child {
  width: 30px;
  text-align: center;
  color: var(--accent-color);
}

.about-section {
  text-align: center;
  margin-top: 20px;
}

.section-title {
  font-weight: bold;
  color: var(--accent-color);
}

.form-control {
  margin-bottom: 15px;
  border-color: var(--border-color);
}

.actions .btn {
  margin-left: 10px;
  background-color: var(--secondary-color);
  color: var(--text-color);
  border: none;
}

.actions .btn:hover {
  background-color: var(--primary-color);
}

.gutters {
  margin-left: -15px;
  margin-right: -15px;
}

.gutters > .col-md-6 {
  padding-left: 15px;
  padding-right: 15px;
}

.user-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.user-avatar img,
.default-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  margin-bottom: 15px;
  border: 3px solid var(--primary-color);
}

.default-avatar {
  background-color: var(--secondary-color);
  color: var(--text-color);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 35px;
  font-weight: bold;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  color: var(--accent-color);
}

/* 新增樣式 */
.nav-tabs .nav-link {
  color: var(--text-color);
}

.nav-tabs .nav-link.active {
  color: var(--accent-color);
  border-color: var(--accent-color);
}

h3, h5 {
  color: var(--accent-color);
}

.btn {
  background-color: var(--secondary-color);
  color: var(--text-color);
  border: none;
}

.btn:hover {
  background-color: var(--primary-color);
}

/* 添加過渡效果 */
.btn, .nav-link, .form-control {
  transition: all 0.3s ease;
}
</style>
