<template>
  <div class="club-members-list bg-white shadow-md rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold text-gray-800">俱樂部成員</h2>
      <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700 focus:outline-none">
        <span class="sr-only">關閉</span>
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div v-if="loading" class="text-center py-4">
      <p class="text-xl text-gray-500">加載中...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      role="alert">
      <strong class="font-bold">錯誤：</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else-if="members.length === 0" class="text-center py-4">
      <p class="text-xl text-gray-500">該俱樂部目前沒有成員。</p>
    </div>

    <div v-else>
      <ul class="member-list">
        <li v-for="member in members" :key="member.userId" class="member-item" @click="goToUserPost(member.userId)">
          <div class="avatar-container">
            <img v-if="member.photoUrl" :src="member.photoUrl" :alt="member.userName" class="avatar-image">
            <div v-else class="avatar-default">
              <span>{{ member.userName.charAt(0).toUpperCase() }}</span>
            </div>
          </div>
          <div class="member-details">
            <p class="text-lg font-medium text-gray-900">{{ member.userName }}</p>
            <p class="text-sm text-gray-500">加入時間: {{ formatDate(member.added) }}</p>
          </div>
          <button v-if="isCreator" @click.stop="confirmRemoveMember(member.userId)" class="delete-button">
            踢除
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from "@/plugins/axios";
import useUserStore from '@/stores/userstore';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';

const router = useRouter();
const message = useMessage();

const props = defineProps({
  clubId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['close']);

const members = ref([]);
const loading = ref(true);
const error = ref(null);
const isCreator = ref(false);
const userStore = useUserStore();

const goToUserPost = (userId) => {
  router.push({ name: 'user-post-link', params: { id: userId } });
};

const fetchMembers = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get(`/clubMember/club/${props.clubId}/approved-members`);
    const membersData = response.data;

    const membersWithPhotos = await Promise.all(membersData.map(async (member) => {
      try {
        const photoResponse = await axios.get(`/user/secure/profile-photo/${member.userId}`);
        return {
          ...member,
          photoUrl: photoResponse.data || null
        };
      } catch (err) {
        console.error(`Error fetching photo for user ${member.userId}:`, err);
        return member;
      }
    }));

    members.value = membersWithPhotos;

    const clubResponse = await axios.get(`/clubs/${props.clubId}`);
    isCreator.value = clubResponse.data.clubCreator === userStore.userId;

  } catch (err) {
    console.error('Error fetching club members or club info:', err);
    if (err.response && err.response.status === 404) {
      members.value = [];
    } else {
      error.value = err.response?.data || '獲取俱樂部成員出錯';
    }
  } finally {
    loading.value = false;
  }
};

const handleRemoveMember = async (userId) => {
  try {
    const response = await axios.delete(`/clubMember/club/${props.clubId}/user/${userId}`);
    message.success(response.data);
    await fetchMembers();
  } catch (err) {
    console.error('Error removing member:', err);
    message.error(err.response.data);
  }
};

const confirmRemoveMember = async (userId) => {
  const confirmed = confirm("確定要刪除此成員嗎？");
  if (confirmed) {
    await handleRemoveMember(userId);
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString();
};

const refreshMembers = async () => {
  await fetchMembers();
};

onMounted(fetchMembers);

defineExpose({ refreshMembers });
</script>

<style scoped>
.club-members-list {
  width: 100%;
  margin: 25px auto;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

h2 {
  color: #111827;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

.member-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: left;
}

.member-item {
  width: 200px;
  text-align: center;
  padding: 10px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 10px;
  transition: transform 0.3s ease;
}

.member-item:hover {
  transform: translateY(-5px);
}

.avatar-container {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #d1d5db;
  margin: 0 auto;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-default {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  font-weight: bold;
  color: #374151;
}

.delete-button {
  background-color: #ff4d4f;
  color: white;
  font-weight: bold;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
}

.delete-button:hover {
  background-color: #ff7875;
  transform: translateY(-2px);
}

.delete-button:active {
  background-color: #d9363e;
  transform: translateY(0);
}

.member-details {
  margin-top: 10px;
}

.member-item {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.member-item:hover {
  transform: translateY(-5px);
}

.text-gray-900 {
  color: #111827;
}

.text-gray-500 {
  color: #6b7280;
}

button {
  transition: background-color 0.3s ease;
}

button:hover {
  transform: translateY(-2px);
}

button:focus {
  outline: none;
}

.shadow-lg {
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
}

.bg-gray-100 {
  background-color: #f3f4f6;
}
</style>