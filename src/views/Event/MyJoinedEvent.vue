<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-card class="my-joined-events-container">
      <n-h1 class="page-title"style="color: #e3bdbd">我參加的活動/工作坊</n-h1>
      <n-spin :show="loading">
        <n-result v-if="error" status="error" :title="error" />
        <div v-else>
          <n-empty v-if="events.length === 0" description="您還沒有參加任何活動" />
          <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:3 l:4" responsive="screen" v-else>
            <n-grid-item v-for="event in events" :key="event.id">
              <n-card hoverable class="event-card"@click="viewEventDetails(event.id)">
                <template #cover>
                  <img :src="event.coverPhotoUrl || 'default-image.jpg'" alt="活動封面" class="event-cover">
                </template>
                <n-space vertical>
                  <n-h3 @click="viewEventDetails(event.id)" class="event-name">{{ event.eventName }}</n-h3>
                  <n-space>
                    <n-tag size="small" :style="event.clubName ? {
                      backgroundColor: '#FFF0F5', 
                      color: '#FF1493',
                      borderColor: '#FF69B4'
                    } : {
                      backgroundColor: '#F0E6FF',
                      color: '#4B0082', 
                      borderColor: '#8A2BE2' 
                    }">
                      {{ event.clubName || '工作坊' }}
                    </n-tag>
                  </n-space>
                  <span class="event-creator">創建者：{{ event.creatorName }}</span>
                </n-space>
                <template #footer>
                  <n-space justify="end">
                    <n-button size="small" @click="viewEventDetails(event.id)">查看詳情</n-button>
                  </n-space>
                </template>
              </n-card>
            </n-grid-item>
          </n-grid>
        </div>
      </n-spin>
    </n-card>
  </n-config-provider>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/plugins/axios';
import useUserStore from "@/stores/userstore";
import {
  NConfigProvider, NCard, NSpin, NResult, NH1, NH3, NEmpty, NGrid, NGridItem,
  NButton, NSpace, NTag, useMessage
} from 'naive-ui';

const router = useRouter();
const userStore = useUserStore();
const message = useMessage();

const events = ref([]);
const loading = ref(true);
const error = ref(null);

const themeOverrides = {
  common: {
    primaryColor: '#8E44AD',
    primaryColorHover: '#9B59B6',
    primaryColorPressed: '#7D3C98',
  },
  Tag: {
    infoColor: '#E6E6FA', // 淡紫色
    infoTextColor: '#8E44AD', // 深紫色文字
  }
};


const fetchJoinedEvents = async () => {
  try {
    const response = await axios.get(`/eventParticipant/user/${userStore.userId}/events`);
    events.value = await Promise.all((response.data || []).map(async event => {
      const [eventDetail, eventPhotos] = await Promise.all([
        axios.get(`/eventDetail/${event.id}/show`),
        axios.get(`/eventPhoto/event/${event.id}`)
      ]);

      let coverPhotoUrl = null;
      if (eventPhotos.data && eventPhotos.data.length > 0) {
        const coverPhoto = eventPhotos.data.find(photo => photo.isCover) || eventPhotos.data[0];
        coverPhotoUrl = `${import.meta.env.VITE_API_URL}/eventPhoto/${event.id}/${coverPhoto.id}`;
      }

      return {
        ...event,
        ...eventDetail.data,
        coverPhotoUrl: coverPhotoUrl
      };
    }));
    loading.value = false;
  } catch (err) {
    console.error('Error fetching joined events:', err);
    error.value = '獲取已參加活動列表時出錯';
    loading.value = false;
    message.error('獲取已參加活動列表失敗');
  }
};

const viewEventDetails = (eventId) => {
  router.push({ name: 'event-detail-link', params: { id: eventId } });
};

onMounted(() => {
  fetchJoinedEvents();
});
</script>

<style scoped>
.my-joined-events-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  text-align: center;
  margin-bottom: 20px;
}

.event-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-cover {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.event-name {
  cursor: pointer;
}

.event-name:hover {
  color: #8E44AD;
}

.event-creator {
  font-size: 14px;
  color: #666;
}
</style>