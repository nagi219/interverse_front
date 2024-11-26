<template>
  <div class="card">
    <div class="input-box">
      <input type="text" class="form-control" v-model="searchTerm" @input="filterFriends" placeholder="搜尋好友" />
      <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="input-icon" />
    </div>
    
    <div v-if="loading" class="text-center my-3">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">加載中…</span>
      </div>
    </div>

    <template v-else-if="friends.length > 0">
      <div class="list border-bottom d-flex justify-content-between align-items-center" v-for="friend in filteredFriends" :key="friend.user2Id">
        <div class="d-flex align-items-center">
          <div v-if="friend.photo" class="friend-photo mr-3 me-2 mx-2">
            <img :src="friend.photo" :alt="friend.nickname || 'Friend'"/>
          </div>
          <div v-else class="friend-photo mr-3 me-2 mx-2 default-avatar">
            {{ (friend.nickname || 'Unknown').charAt(0) }}
          </div>
          <div class="d-flex flex-column">
            <span>{{ friend.accountNumber || 'Unknown' }}</span>
            <small>{{ friend.nickname || 'Unknown' }}</small>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-sm" @click="deleteFriend(friend.user2Id)">刪除好友</button>
      </div>
    </template>

    <div v-else class="text-center my-3">
      朋友列表是空的。
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";

const userStore = useUserStore();
const userId = userStore.userId;

const friends = ref([]);
const loading = ref(true);
const searchTerm = ref('');

const filteredFriends = computed(() => {
  return friends.value.filter(friend => 
    (friend.accountNumber || '').toLowerCase().includes(searchTerm.value.toLowerCase()) ||
    (friend.nickname || '').includes(searchTerm.value)
  );
});

onMounted(async () => {
  await fetchFriends();
});

async function fetchFriends() {
  try {
    const response = await axios.get(`/friend/${userId}/list`);
    const friendsData = response.data;
    await fetchUserDetails(friendsData);
  } catch (error) {
    console.error("Error fetching friends:", error);
  } finally {
    loading.value = false;
  }
}

async function fetchUserDetails(friendsData) {
  try {
    const userRequests = friendsData.map(friend => axios.get(`/user/secure/${friend.user2Id}`));
    const photoRequests = friendsData.map(friend => 
      axios.get(`/user/secure/profile-photo/${friend.user2Id}`)
        .catch(() => ({ data: null })) // 如果獲取頭像失敗，返回 null
    );
    
    const [userResponses, photoResponses] = await Promise.all([
      Promise.all(userRequests),
      Promise.all(photoRequests)
    ]);
    
    friends.value = friendsData.map((friend, index) => ({
      ...friend,
      accountNumber: userResponses[index].data.accountNumber,
      nickname: userResponses[index].data.nickname,
      photo: photoResponses[index].data
    }));
  } catch (error) {
    console.error('Error fetching user details:', error);
    // 即使出錯，也設置 friends.value，以便顯示已獲取的資料
    friends.value = friendsData.map(friend => ({
      ...friend,
      accountNumber: 'Unknown',
      nickname: 'Unknown',
      photo: null
    }));
  }
}

function filterFriends() {
  // 這個函數可以留空，因為我們使用了計算屬性 filteredFriends
}

async function deleteFriend(friendId) {
  if (confirm('確定要刪除這個好友嗎？')) {
    try {
      await axios.get(`/friend/switch-status/${userId}/${friendId}`);
      // 從列表中移除該好友
      friends.value = friends.value.filter(friend => friend.user2Id !== friendId);
      alert('好友已成功刪除');
    } catch (error) {
      console.error('刪除好友時發生錯誤:', error);
      alert('刪除好友失敗，請稍後再試');
    }
  }
}
</script>

<style scoped>
.input-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
  pointer-events: none; /* 防止圖標阻礙用戶點擊輸入框 */
}

.card {
  background-color: #fff;
  padding: 15px;
  border: none;
}

.input-box {
  position: relative;
}

.input-box i {
  position: absolute;
  right: 13px;
  top: 15px;
  color: #ced4da;
}

.form-control {
  height: 50px;
  background-color: #eeeeee69;
}

.form-control:focus {
  background-color: #eeeeee69;
  box-shadow: none;
  border-color: #eee;
}

.list {
  padding-top: 20px;
  padding-bottom: 10px;
  display: flex;
  align-items: center;
}

.border-bottom {
  border-bottom: 2px solid #eee;
}

.list i {
  font-size: 19px;
  color: red;
}

.list small {
  color: #dedddd;
}

.friend-photo {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
}

.friend-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  background-color: #ccc;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
  font-weight: bold;
}
</style>
