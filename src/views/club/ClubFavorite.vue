<template>
    <div class="container mx-auto p-4">
      <h1 class="text-4xl font-bold text-center text-pink-400 mb-8">收藏的俱樂部</h1>
      
      <div v-if="loading" class="ts-loading is-center"></div>
      <div v-else-if="error" class="ts-box is-negative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <div class="ts-content">
          <strong>錯誤：</strong>{{ error }}
        </div>
      </div>
      <div v-else-if="favoriteClubs.length === 0" class="text-center text-gray-500">
        您還沒有收藏任何俱樂部
      </div>
      <div v-else class="club-grid">
        <div v-for="club in favoriteClubs" :key="club.id" class="club-card">
          <router-link :to="{ name: 'club-detail-link', params: { id: club.id } }">
            <div class="club-image">
              <img 
                v-if="club.photo" 
                :src="getPhotoUrl(club.photo)" 
                :alt="club.clubName"
              >
              <div v-else class="no-photo">
                無照片
              </div>
            </div>
          </router-link>
          <div class="club-content">
            <h2 class="club-name">
              <router-link 
                :to="{ name: 'club-detail-link', params: { id: club.id } }"
              >
                {{ club.clubName }}
              </router-link>
            </h2>
            <div v-if="!club.isPublic" class="review-status">
              須審核
            </div>
          </div>
          <div class="club-footer">
            <button @click="removeFavorite(club)" class="favorite-button is-favorite">
              ❤ 取消收藏
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from "@/plugins/axios";
  import useUserStore from "@/stores/userstore";
  
  const favoriteClubs = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const userStore = useUserStore();
  
  const fetchFavoriteClubs = async () => {
    try {
      loading.value = true;
      const response = await axios.get(`/clubFavorite/user/${userStore.userId}`);
      const clubPromises = response.data.map(async (favorite) => {
        const clubResponse = await axios.get(`/clubs/${favorite.clubId}`);
        return { ...clubResponse.data, isFavorite: true };
      });
      favoriteClubs.value = await Promise.all(clubPromises);
    } catch (err) {
      console.error('Error fetching favorite clubs:', err);
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };
  
  const getPhotoUrl = (photoId) => {
    if (!photoId) return null;
    return `${import.meta.env.VITE_API_URL}/clubs/photo/${photoId}`;
  };
  
  const removeFavorite = async (club) => {
    try {
      await axios.delete(`/clubFavorite/user/${userStore.userId}/club/${club.id}`);
      favoriteClubs.value = favoriteClubs.value.filter(c => c.id !== club.id);
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('操作失敗，請稍後再試。');
    }
  };
  
  onMounted(fetchFavoriteClubs);
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
    height: 500px;
    border: 1px solid #fcd9e6;
    border-radius: 0.5rem;
    overflow: hidden;
    transition: all 0.3s ease;
    background-color: #fff0f5;
  }
  
  .club-image {
    height: 300px;
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
    background-color: #fde8ef;
    color: #f8a5c2;
    font-size: 1.2rem;
  }
  
  .club-content {
    flex-grow: 1;
    padding: 1rem;
  }
  
  .club-name {
    font-size: 1.25rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    color: #e3bdbd;
  }
  
  .club-name a {
    color: #e3bdbd;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .club-name a:hover {
    color: #d3a9a9;
  }
  
  .review-status {
    color: white;
    background-color: rgba(248, 165, 194, 0.7);
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: bold;
    display: inline-block;
    margin-top: 0.5rem;
  }
  
  .club-footer {
    padding: 1rem;
  }
  
  .favorite-button {
    width: 100%;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: #ff69b4;
    color: white;
    font-size: 1rem;
    font-weight: bold;
  }
  
  .favorite-button:hover {
    background-color: #ff1493;
  }
  </style>