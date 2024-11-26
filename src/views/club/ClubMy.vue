<template>
  <n-space vertical size="large">
    <n-layout>
      <n-layout-content class="content-container">
        <n-h1 style="text-align: center; color: #e3bdbd;">我加入的俱樂部</n-h1>
        <n-space vertical>
          <n-spin :show="loading">
            <n-result
              v-if="error"
              status="error"
              :title="error"
              :description="'獲取俱樂部列表時出錯'"
            />
            <n-empty v-else-if="clubs.length === 0" description="您還沒有加入任何俱樂部" />
            <n-grid v-else x-gap="12" y-gap="12" cols="1 s:2 m:3 l:4 xl:4" responsive="screen">
              <n-gi v-for="club in clubs" :key="club.id">
                <n-card class="club-card" hoverable>
                  <template #cover>
                    <div class="club-image">
                      <n-image
                        v-if="club.photo"
                        :src="getPhotoUrl(club.photo)"
                        :alt="club.clubName"
                        object-fit="cover"
                        preview-disabled
                        class="club-photo"
                      />
                      <div v-else class="no-photo">無照片</div>
                    </div>
                  </template>
                  <n-space vertical @click="goToClubDetail(club.id)">
                    <n-text class="club-name">{{ club.clubName }}</n-text>
                    <n-tag :bordered="false" class="public-tag">
                      公開: {{ club.isPublic === 1 ? '是' : '否' }}
                    </n-tag>
                  </n-space>
                  <template #footer>
                    <n-button class="quit-button" block quaternary @click="confirmQuit(club.id)">
                      退出社團
                    </n-button>
                  </template>
                </n-card>
              </n-gi>
            </n-grid>
          </n-spin>
        </n-space>
      </n-layout-content>
    </n-layout>
  </n-space>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";
import {
  NSpace, NLayout, NLayoutContent, NH1, NButton, NSpin, NResult,
  NEmpty, NGrid, NGi, NCard, NImage, NText, NTag
} from 'naive-ui';

const router = useRouter();
const message = useMessage();
const userStore = useUserStore();

const clubs = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchMyClubs = async () => {
  try {
    const response = await axios.get(`/clubMember/user/${userStore.userId}/clubs`);
    clubs.value = response.data;
    loading.value = false;
  } catch (err) {
    console.error('Error fetching my clubs:', err);
    error.value = err.response?.data?.message || '獲取俱樂部列表時出錯';
    loading.value = false;
  }
};

const getPhotoUrl = (photoName) => {
  if (!photoName) return null;
  return `${import.meta.env.VITE_API_URL}/clubs/photo/${photoName}`;
};

const confirmQuit = (clubId) => {
  if (window.confirm('確定要退出這個社團嗎？')) {
    quitClub(clubId);
  }
};

const quitClub = async (clubId) => {
  try {
    await axios.delete(`/clubMember/user/${userStore.userId}/delete/${clubId}`);
    message.success('您已成功退出社團');
    clubs.value = clubs.value.filter(club => club.id !== clubId);
  } catch (err) {
    console.error('Error quitting club:', err);
    message.error(err.response?.data?.message || '退出社團時出錯，請稍後再試');
  }
};

const goToClubDetail = async (clubId) => {
  try {
    const response = await axios.get(`/clubs/${clubId}/check-edit-permission`);
    if (response.data.canEdit) {
      router.push({ name: 'club-edit-link', params: { id: clubId } });
    } else {
      router.push({ name: 'club-detail-link', params: { id: clubId } });
    }
  } catch (err) {
    console.error('Error checking edit permission:', err);
    router.push({ name: 'club-detail-link', params: { id: clubId } });
  }
};

onMounted(fetchMyClubs);
</script>

<style scoped>
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.club-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff0f5;
  transition: all 0.3s ease;
  border: none;
}

.club-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(227, 189, 189, 0.2);
}

.club-image {
  height: 300px;
  overflow: hidden;
}

.club-photo {
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

.club-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: rgb(218, 112, 112);
}

.public-tag {
  background-color: rgba(243, 153, 153, 0.2);
  border: 1px solid rgb(243, 153, 153);
  color: rgb(243, 153, 153);
  padding: 2px 8px;
  border-radius: 4px;
}

:deep(.n-card) {
  background-color: #fff0f5;
  border: none;
}

:deep(.n-card-header) {
  border-bottom: none;
}

:deep(.n-card-footer) {
  border-top: none;
  padding: 0;
}

:deep(.n-card-content) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

:deep(.n-card__footer) {
  margin-top: auto;
}

.quit-button {
  background-color: rgba(177, 151, 252, 0.2);
  border: none;
  color: rgb(177, 151, 252);
  font-size: 1rem;
  height: 40px;
  transition: all 0.3s ease;
}

.quit-button:hover {
  background-color: rgba(177, 151, 252, 0.3);
}

:deep(.n-tag) {
  padding: 0 8px;
}

:deep(.n-tag:not(.n-tag--bordered) .n-tag__border) {
  display: none;
}
</style>