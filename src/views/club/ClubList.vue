<template>
  <div class="container mx-auto p-4">
    <h1 class="text-4xl font-bold text-center text-pink-400 mb-8">所有俱樂部</h1>
    <div class="button-container">
      <router-link :to="{ name: 'club-form-link' }" class="new-club-button">新增俱樂部</router-link>
      <router-link :to="{ name: 'club-favorite-link' }" class="new-club-button">我的收藏</router-link>
    </div>
    <!-- 搜索和排序 -->
    <div class="search-sort-container">
      <div class="ts-input is-end-icon custom-input search-input">
        <input v-model="searchQuery" type="text" placeholder="搜索俱樂部" @input="filterClubs">
        <i class="search icon"></i>
      </div>
      <div class="ts-select custom-select sort-select">
        <select v-model="sortOption" @change="sortClubs">
          <option value="nameAsc">名稱 (A-Z)</option>
          <option value="nameDesc">名稱 (Z-A)</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="ts-loading is-center"></div>
    <div v-else-if="error" class="ts-box is-negative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      <div class="ts-content">
        <strong>錯誤：</strong>{{ error }}
      </div>
    </div>
    <div v-else class="club-grid">
      <div v-for="club in filteredClubs" :key="club.id" class="club-card">
        <div class="club-image">
          <router-link :to="{ name: 'club-detail-link', params: { id: club.id } }">
            <img v-if="club.photo" :src="getPhotoUrl(club.photo)" :alt="club.clubName">
            <div v-else class="no-photo">
              無照片
            </div>
          </router-link>
          <button @click.stop="toggleFavorite(club)" class="favorite-button" :class="{ 'is-favorite': club.isFavorite }">
            {{ club.isFavorite ? '❤' : '♡' }}
          </button>
        </div>
        <div class="club-content">
          <h2 class="club-name">
            <router-link :to="{ name: 'club-detail-link', params: { id: club.id } }">
              {{ club.clubName }}
            </router-link>
          </h2>
          <div v-if="!club.isPublic" class="review-status">
            須審核
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";
import { useMessage } from 'naive-ui';

const clubs = ref([]);
const filteredClubs = ref([]);
const searchQuery = ref('');
const sortOption = ref('nameAsc');
const loading = ref(true);
const error = ref(null);
const userStore = useUserStore();
const message = useMessage();

const isLoggedIn = computed(() => !!userStore.userId);

const fetchClubs = async () => {
  try {
    const response = await axios.get('/clubs/all');
    clubs.value = response.data.map(club => ({
      ...club,
      isFavorite: false // 初始化收藏的狀態
    }));
    if (isLoggedIn.value) {
      await fetchFavorites();
    }
    filterClubs();
    loading.value = false;
  } catch (err) {
    console.error('Error fetching clubs:', err);
    error.value = err.message;
    loading.value = false;
  }
};

const fetchFavorites = async () => {
  if (!isLoggedIn.value) return;
  
  try {
    const response = await axios.get(`/clubFavorite/user/${userStore.userId}`);
    const favorites = new Set(response.data.map(fav => fav.clubId));
    clubs.value.forEach(club => {
      club.isFavorite = favorites.has(club.id);
    });
  } catch (err) {
    console.error('Error fetching favorites:', err);
    // 不顯示錯誤，只是記錄它
  }
};

const filterClubs = () => {
  filteredClubs.value = clubs.value.filter(club =>
    club.clubName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  sortClubs();
};

const sortClubs = () => {
  filteredClubs.value.sort((a, b) => {
    switch (sortOption.value) {
      case 'nameAsc':
        return a.clubName.localeCompare(b.clubName);
      case 'nameDesc':
        return b.clubName.localeCompare(a.clubName);
      default:
        return 0;
    }
  });
};

const getPhotoUrl = (photoId) => {
  if (!photoId) return null;
  return `${import.meta.env.VITE_API_URL}/clubs/photo/${photoId}`;
};

const joinClub = async (club) => {
  if (!isLoggedIn.value) {
    message.warning('請先登入以加入俱樂部');
    return;
  }

  const clubMemberDTO = {
    clubId: club.id,
    userId: userStore.userId,
    status: club.isPublic === 1 ? 1 : 0
  };
  try {
    await axios.post('/clubMember', clubMemberDTO);
    if (club.isPublic === 1) {
      message.success('已成功加入俱樂部！');
    } else {
      message.success('已成功提交申請！等待審核中。');
    }
  } catch (error) {
    console.error('Error joining club:', error);
    message.error('無法加入俱樂部，請稍後再試。');
  }
};

const toggleFavorite = async (club) => {
  if (!isLoggedIn.value) {
    message.warning('請先登入以收藏俱樂部');
    return;
  }

  try {
    if (club.isFavorite) {
      await axios.delete(`/clubFavorite/user/${userStore.userId}/club/${club.id}`);
    } else {
      await axios.post('/clubFavorite/add', {
        userId: userStore.userId,
        clubId: club.id
      });
    }
    club.isFavorite = !club.isFavorite;
    message.success(club.isFavorite ? '已加入收藏' : '已取消收藏');
  } catch (error) {
    console.error('Error toggling favorite:', error);
    message.error('操作失敗，請稍後再試。');
  }
};

onMounted(fetchClubs);
</script>

<style scoped>
.club-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.club-card {
  display: flex;
  flex-direction: column;
  height: 350px;
  border: 1px solid var(--border-color);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  background-color: var(--light-background);
  position: relative;
}

.club-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 6px rgba(252, 217, 230, 0.5);
}

.club-image {
  position: relative;
  height: 350px;
  overflow: hidden;
}

.club-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-photo {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--light-background);
  color: var(--muted-color);
  font-size: 1.2rem;
}

.club-content {
  flex-grow: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100px; /* 固定高度 */
}

.club-name {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.club-name a {
  color: var(--text-color);
  text-decoration: none;
  transition: color 0.3s ease;
}

.club-name a:hover {
  color: var(--accent-color);
}

.review-status {
  color: white;
  background-color: var(--accent-color);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  font-weight: bold;
  display: inline-block;
  align-self: flex-start; /* 標籤靠左對齊 */
  margin-top: auto; /* 將標籤推到底部 */
  width: auto; 
  min-width: 70px; 
  text-align: center; 
}

.favorite-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(228, 186, 182, 0.8);
  color: var(--accent-color);
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.favorite-button:hover {
  background-color: rgba(243, 210, 168, 0.9);
}

.favorite-button.is-favorite {
  background-color: var(--accent-color);
  color: white;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.new-club-button {
  padding: 0.75rem 1.5rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: bold;
  text-decoration: none;
  display: inline-block;
  box-shadow: 0 4px 6px rgba(151, 113, 91, 0.4);
  margin: 0 0.5rem;
}

.new-club-button:hover {
  background-color: var(--secondary-color);
  color: var(--text-color);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(151, 113, 91, 0.6);
}

.search-sort-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.custom-input {
  width: 50%;
  margin-right: 1rem;
}

.sort-select {
  width: 20%;
}

.sort-select select {
  background-color: var(--light-background);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 0.25rem;
  padding: 0.5rem;
}

.sort-select select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(151, 113, 91, 0.2);
}

h1 {
  color: var(--accent-color);
  margin-bottom: 25px;
  font-weight: 700;
  font-size: 2.2rem;
  text-align: center;
}
</style>