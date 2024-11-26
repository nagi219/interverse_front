<template>
  <li v-if="isLoggedIn" class="nav-item dropdown">
    <n-badge :value="displayCount" :max="15">
      <a
        class="nav-link dropdown-toggle"
        href="#"
        id="notificationDropdown"
        role="button"
        @mouseenter="openDropdown"
        @mouseleave="closeDropdown"
        aria-expanded="dropdownVisible"
      >
        <font-awesome-icon :icon="['far', 'bell']" />
      </a>
    </n-badge>
    <ul
      class="dropdown-menu"
      :class="{ show: dropdownVisible }"
      aria-labelledby="notificationDropdown"
      @mouseenter="openDropdown"
      @mouseleave="closeDropdown"
    >
      <li v-if="isLoading" class="dropdown-item text-muted">加載中...</li>
      <li v-else-if="error" class="dropdown-item text-danger">{{ error }}</li>
      <li
        v-else-if="notifications.length === 0"
        class="dropdown-item text-muted"
      >
        沒有新通知
      </li>
      <li v-else class="dropdown-item">
        <button @click="markAllAsRead" class="btn btn-sm btn-outline-secondary">
          標示全部為已讀
        </button>
      </li>
      <li
        v-for="notification in notifications"
        :key="notification.id"
        class="dropdown-item"
        :class="{ 'font-weight-bold': !notification.status }"
      >
        <span @click="markAsRead(notification.id)">
          {{ notification.content }}
          <span class="time-ago" :title="formatFullDate(notification.added)">
            {{ getTimeAgo(notification.added) }}
          </span>
        </span>
      </li>
    </ul>
  </li>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";

const userStore = useUserStore();
const isLoggedIn = computed(() => userStore.isLoggedIn);
const userId = computed(() => userStore.userId);

const notifications = ref([]);
const unreadCount = ref(0);
const dropdownVisible = ref(false);
const pollingInterval = ref(null);
const isPolling = ref(false);
const isLoading = ref(false);
const error = ref(null);

const displayCount = computed(() => unreadCount.value);

async function fetchNotifications() {
  if (!isPolling.value || !isLoggedIn.value) return;
  isLoading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`/notification/${userId.value}`);
    notifications.value = response.data;
    updateUnreadCount();
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
    if (err.response && err.response.status === 404) {
      error.value = "無法獲取通知，請稍後再試";
    } else {
      error.value = "發生錯誤，請稍後再試";
    }
  } finally {
    isLoading.value = false;
  }
}

function updateUnreadCount() {
  unreadCount.value = notifications.value.filter((n) => !n.status).length;
  localStorage.setItem("notificationCount", unreadCount.value.toString());
}

async function fetchNotificationCount() {
  if (!isLoggedIn.value) return;
  try {
    const response = await axios.get(`/notification/count/${userId.value}`);
    unreadCount.value = response.data;
    localStorage.setItem("notificationCount", unreadCount.value.toString());
  } catch (err) {
    console.error("Failed to fetch notification count:", err);
  }
}

async function markAsRead(notificationId) {
  try {
    const response = await axios.put(`/notification/update-status/${notificationId}`);
    const updatedNotification = response.data;
    const index = notifications.value.findIndex(n => n.id === updatedNotification.id);
    if (index !== -1) {
      notifications.value[index] = updatedNotification;
    }
    updateUnreadCount();
  } catch (err) {
    console.error('Failed to mark notification as read:', err);
  }
}

async function markAllAsRead() {
  try {
    const response = await axios.put(`/notification/update/${userId.value}/all`);
    notifications.value = response.data;
    updateUnreadCount();
  } catch (err) {
    console.error('Failed to mark all notifications as read:', err);
  }
}

// 開始轉換通知時間
function getTimeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const diffMs = now - past;
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSecs < 60) return `${diffSecs} 秒前`;
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  if (diffHours < 24) return `${diffHours} 小時前`;
  if (diffDays < 30) return `${diffDays} 天前`;
  return formatFullDate(dateString);
}

function formatFullDate(dateString) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString("zh-TW", options);
}
// 結束轉換通知時間

// 開始輪詢
function startPolling() {
  if (isPolling.value || !isLoggedIn.value) return;
  isPolling.value = true;
  pollingInterval.value = setInterval(fetchNotifications, 30000); // 每30秒輪詢一次
}

function stopPolling() {
  isPolling.value = false;
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value);
  }
}

let userActivityTimeout;
function resetUserActivityTimer() {
  clearTimeout(userActivityTimeout);
  userActivityTimeout = setTimeout(() => {
    stopPolling();
  }, 300000); // 5分鐘無活動後停止輪詢
}

function handleUserActivity() {
  resetUserActivityTimer();
  if (!isPolling.value && isLoggedIn.value) {
    startPolling();
  }
}

function handleVisibilityChange() {
  if (document.hidden) {
    stopPolling();
  } else if (isLoggedIn.value) {
    startPolling();
  }
}

function handleOnline() {
  if (isLoggedIn.value) {
    startPolling();
  }
}

function handleOffline() {
  stopPolling();
}
// 結束輪詢

// 開始樣式
function openDropdown() {
  dropdownVisible.value = true;
  if (isLoggedIn.value) {
    fetchNotifications();
  }
}

function closeDropdown() {
  dropdownVisible.value = false;
}
// 結束樣式

onMounted(async () => {
  if (isLoggedIn.value) {
    await fetchNotificationCount(); // 初始只獲取數量
    startPolling(); // 開始輪詢完整通知
  }

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  ["mousemove", "keypress", "scroll", "click"].forEach((event) => {
    document.addEventListener(event, handleUserActivity);
  });

  resetUserActivityTimer();
});

onUnmounted(() => {
  stopPolling();

  document.removeEventListener("visibilitychange", handleVisibilityChange);
  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);

  ["mousemove", "keypress", "scroll", "click"].forEach((event) => {
    document.removeEventListener(event, handleUserActivity);
  });

  clearTimeout(userActivityTimeout);
});

watch(isLoggedIn, async (newValue) => {
  if (newValue) {
    await fetchNotificationCount();
    startPolling();
  } else {
    stopPolling();
    notifications.value = [];
    unreadCount.value = 0;
    error.value = null;
    localStorage.removeItem("notificationCount");
  }
});

watch(
  () => userStore.route,
  (newRoute) => {
    if (isLoggedIn.value) {
      stopPolling();
      startPolling();
    }
  }
);
</script>

<style scoped>
.dropdown-menu {
  display: block;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.5s ease-out, opacity 0.3s ease-out,
    visibility 0s 0.5s;
  visibility: hidden;
  right: 0;
  left: auto;
  width: 300px;  /* 設定一個固定寬度 */
  max-width: 90vw;  /* 確保在小屏幕上不會太寬 */
}

.dropdown-menu.show {
  max-height: 400px;  /* 稍微增加最大高度 */
  opacity: 1;
  overflow-y: auto;
  transition: max-height 0.5s ease-in, opacity 0.3s ease-in, visibility 0s;
  visibility: visible;
}

.nav-link {
  color: var(--text-color) !important;
  font-size: 1.2rem;
  margin: 0 0.8rem;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
}

.navbar .dropdown-toggle::after {
  display: none; /* 隱藏 Bootstrap 生成的下拉箭頭 */
}

.time-ago {
  font-size: 0.8em;
  color: #6c757d;
  margin-left: 5px;
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 15px;
  white-space: normal;  /* 允許文本換行 */
  word-break: break-word;  /* 確保長單詞也能換行 */
}

.font-weight-bold {
  font-weight: bold;
}

.dropdown-item span {
  cursor: pointer;
}

/* 為小屏幕設備調整樣式 */
@media (max-width: 768px) {
  .dropdown-menu {
    position: fixed;
    top: 60px;  /* 調整這個值以匹配您的導航欄高度 */
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }
}
</style>