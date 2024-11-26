<template>
  <div class="container mt-5">
    <h1 class="text-center">好友列表</h1>
    <div class="card">
      <div class="input-box">
        <input
          type="text"
          class="form-control"
          v-model="searchTerm"
          @input="filterFriends"
          placeholder="搜尋好友"
        />
        <font-awesome-icon
          :icon="['fas', 'magnifying-glass']"
          class="input-icon"
        />
      </div>

      <div v-if="loading" class="text-center my-3">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">加載中…</span>
        </div>
      </div>

      <template v-else-if="friends.length > 0">
        <div
          class="list border-bottom d-flex justify-content-between align-items-center"
          v-for="friend in filteredFriends"
          :key="friend.user2Id"
        >
          <div class="d-flex align-items-center">
            <div class="friend-photo mr-3 me-2 mx-2" @click="openModal(friend)">
              <img
                v-if="friend.photo"
                :src="friend.photo"
                :alt="friend.nickname || 'Friend'"
                style="cursor: pointer"
              />
              <div v-else class="default-avatar">
                {{ getDefaultAvatar(friend) }}
              </div>
            </div>
            <div class="d-flex flex-column">
              <span>{{ friend.nickname || "無" }}</span>
              <small>@{{ friend.accountNumber || "無" }}</small>
            </div>
          </div>
          <button
            class="btn btn-outline-danger btn-sm"
            @click="deleteFriend(friend.user2Id)"
          >
            刪除好友
          </button>
        </div>
      </template>

      <div v-else class="text-center my-3">朋友列表是空的。</div>
    </div>

    <AvatarModal
      v-if="selectedFriend"
      :friend="selectedFriend"
      @close="closeModal"
    />

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";
import AvatarModal from "@/components/user/AvatarModal.vue";
import { useMessage, useDialog } from 'naive-ui';

const userStore = useUserStore();
const userId = userStore.userId;

const message = useMessage();
const dialog = useDialog();

const friends = ref([]);
const loading = ref(true);
const searchTerm = ref("");

const selectedFriend = ref(null);

const filteredFriends = computed(() => {
  return friends.value.filter(
    (friend) =>
      (friend.accountNumber || "")
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase()) ||
      (friend.nickname || "")
        .toLowerCase()
        .includes(searchTerm.value.toLowerCase())
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
    const userRequests = friendsData.map((friend) =>
      axios.get(`/user/secure/${friend.user2Id}`)
    );
    const photoRequests = friendsData.map(
      (friend) =>
        axios
          .get(`/user/secure/profile-photo/${friend.user2Id}`)
          .catch(() => ({ data: null })) // 如果獲取頭像失敗，返回 null
    );
    
    const [userResponses, photoResponses] = await Promise.all([
      Promise.all(userRequests),
      Promise.all(photoRequests),
    ]);

    friends.value = friendsData.map((friend, index) => ({
      ...friend,
      id: userResponses[index].data.id,
      accountNumber: userResponses[index].data.accountNumber,
      nickname: userResponses[index].data.nickname,
      country: userResponses[index].data.country,
      city: userResponses[index].data.city,
      age: userResponses[index].data.age,
      gender: userResponses[index].data.gender,
      bio: userResponses[index].data.bio,
      photo: photoResponses[index].data,
    }));
  } catch (error) {
    console.error("Error fetching user details:", error);
    // 即使出錯，也設置 friends.value，以便顯示已獲取的資料
    friends.value = friendsData.map((friend) => ({
      ...friend,
      accountNumber: "無",
      nickname: "無",
      age: "",
      country: "",
      city: "",
      gender: "",
      bio: "",
      photo: null,
    }));
  }
}

async function deleteFriend(friendId) {
  dialog.warning({
    title: '刪除好友',
    content: '確定要刪除這個好友嗎？',
    positiveText: '確定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await axios.get(`/friend/switch-status/${userId}/${friendId}`);
        // 從列表中移除該好友
        friends.value = friends.value.filter(
          (friend) => friend.user2Id !== friendId
        );
        message.success('已成功刪除好友');
      } catch (error) {
        console.error(error);
        message.error('刪除好友失敗，請稍後再試');
      }
    }
  });
}

// Modal
function openModal(friend) {
  selectedFriend.value = friend;
}

function closeModal() {
  selectedFriend.value = null;
}

function getDefaultAvatar(friend) {
  return (friend.accountNumber || "無").charAt(0).toUpperCase();
}

</script>

<style scoped>
.container {
  margin-bottom: 60px;
  padding: 30px;
  /* background-color: var(--background-color); */
  background-color: var(--light-background);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(151, 113, 91, 0.08);
}

h1 {
  color: var(--accent-color);
  margin-bottom: 25px;
  font-weight: 700;
  font-size: 2.2rem;
  text-align: center;
}

.card {
  background-color: var(--light-background);
  border: none;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(228, 186, 182, 0.1);
}

.input-box {
  position: relative;
  margin: 20px auto 25px;
  max-width: 300px;

}

.form-control {
  height: 48px;
  background-color: var(--background-color);
  border: 2px solid var(--border-color);
  border-radius: 24px;
  color: var(--text-color);
  padding: 0 20px 0 50px;
  transition: all 0.3s ease;
  font-size: 1rem;
  width: 100%;
}

.form-control:focus {
  background-color: var(--light-background);
  box-shadow: 0 0 0 4px rgba(228, 186, 182, 0.15);
  border-color: var(--primary-color);
}

.input-icon {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--light-text-color);
  pointer-events: none;
  font-size: 1.2rem;
}

.list {
  padding: 15px 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.list:hover {
  background-color: rgba(243, 210, 168, 0.08);
  transform: translateX(5px);
}

.list:last-child {
  border-bottom: none;
}

.friend-photo {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  overflow: hidden;
  margin-right: 15px;
  transition: transform 0.3s ease;
}

.friend-photo:hover {
  transform: scale(1.1);
}

.friend-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  background-color: var(--secondary-color);
  color: var(--text-color);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5rem;
  font-weight: bold;
  width: 100%;
  height: 100%;
}

.friend-details {
  display: flex;
  flex-direction: column;
}

.friend-name {
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 2px;
}

.friend-account {
  font-size: 0.9rem;
  color: var(--light-text-color);
}

.btn-outline-danger {
  color: var(--danger-color);
  border: 2px solid var(--danger-color);
  background-color: transparent;
  border-radius: 20px;
  padding: 6px 15px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  font-weight: 600;
}

.btn-outline-danger:hover {
  color: var(--light-background);
  background-color: var(--danger-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(217, 83, 79, 0.2);
}

.spinner-border {
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .container {
    padding: 20px;
  }
  
  h1 {
    font-size: 1.8rem;
  }

  .input-box {
    max-width: 100%; /* 在小螢幕上全寬 */
  }
  
  .friend-photo {
    width: 40px;
    height: 40px;
  }
  
  .btn-outline-danger {
    padding: 5px 10px;
    font-size: 0.8rem;
  }
}
</style>