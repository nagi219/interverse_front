<template>
  <div class="event-detail-container">
    <n-card :bordered="false" class="main-card">
      <n-space vertical size="large">
        <n-page-header @back="back" class="custom-page-header">
          <template #title>
            <n-text :style="{ color: '#FFC0CB', fontSize: '32px', fontWeight: 'bold' }">
              {{ event.eventName }}
            </n-text>
          </template>
        </n-page-header>

        <n-spin :show="loading">
          <n-space v-if="eventDetail && event" vertical size="large">
            <n-grid :cols="24" :x-gap="12">
              <n-gi :span="8">
                <n-card class="event-photo-card" :bordered="false">
                  <n-image :src="coverPhotoUrl" :preview-disabled="true" object-fit="cover" width="300" height="300"
                    class="square-photo" />
                </n-card>
              </n-gi>
              <n-gi :span="16">
                <n-card title="活動詳情" class="detail-card">
                  <div class="custom-details">
                    <div class="detail-item">
                      <div class="detail-label">地點</div>
                      <div class="detail-content">{{ eventDetail.location }}</div>
                    </div>
                    <div class="detail-item creator-item" @click="goToUserPost(event.eventCreatorId)">
                      <div class="detail-label">主辦者</div>
                      <div class="detail-content creator-content">
                        <n-avatar :src="creatorPhotoUrl" :fallback-src="defaultAvatarUrl" :size="40" round />
                        <span>{{ event.creatorName }}</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">開始時間</div>
                      <div class="detail-content">{{ formatDateTime(eventDetail.startTime) }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">結束時間</div>
                      <div class="detail-content">{{ formatDateTime(eventDetail.endTime) }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">費用</div>
                      <div class="detail-content">${{ eventDetail.fee }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">人數</div>
                      <div class="detail-content">{{ approvedParticipants.length }} / {{ eventDetail.participantMax }}
                      </div>
                    </div>
                  </div>
                  <n-space justify="end" style="margin-top: 16px;">
                    <n-button @click="handleParticipation" :disabled="!canParticipate" :loading="loading"
                      class="participation-button">
                      {{ participationButtonText }}
                    </n-button>
                  </n-space>
                </n-card>
              </n-gi>
            </n-grid>

            <n-card title="活動描述" class="description-card">
              <n-text>{{ eventDetail.description }}</n-text>
            </n-card>

            <n-card title="活動統計" class="stats-card">
              <n-grid :cols="3" :x-gap="12">
                <n-gi>
                  <n-statistic label="已報名">
                    {{ approvedParticipants.length }}
                  </n-statistic>
                </n-gi>
                <n-gi>
                  <n-statistic label="人數上限">
                    {{ eventDetail.participantMax }}
                  </n-statistic>
                </n-gi>
                <n-gi>
                  <n-statistic label="成團人數">
                    {{ eventDetail.participantMin }}
                  </n-statistic>
                </n-gi>
              </n-grid>
            </n-card>

            <n-card title="活動相簿" class="photo-card">
              <EventPhoto :workshopId="route.params.id" :eventCreatorId="event.eventCreatorId" />
            </n-card>

            <n-card title="參加者" class="participants-card">
              <n-scrollbar style="max-height: 300px">
                <n-space v-if="approvedParticipants.length > 0" justify="start" align="center" :wrap="true">
                  <div v-for="participant in approvedParticipants" :key="participant.userId" class="participant-item"
    @click="goToUserPost(participant.userId)">
    <n-avatar :src="participant.photoUrl || defaultAvatarUrl"
      :fallback-src="defaultAvatarUrl" :size="50" round />
    <span class="participant-name">{{ participant.userName }}</span>
  </div>
                </n-space>
                <n-empty v-else description="暫無參加者" />
              </n-scrollbar>
            </n-card>
          </n-space>
          <n-result v-else-if="error" status="error" :title="error" />
        </n-spin>
      </n-space>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '@/plugins/axios';
import useUserStore from "@/stores/userstore";
import EventPhoto from './EventPhoto.vue';
import {
  NCard, NSpin, NSpace, NButton, NResult, useMessage,
  NEmpty, NPageHeader, NGrid, NGi, NTag, NStatistic, NScrollbar,
  NImage, NEllipsis, NText, NDescriptions, NDescriptionsItem, NAvatar
} from 'naive-ui';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const goToUserPost = (userId) => {
  router.push({ name: 'user-post-link', params: { id: userId } });
};
const event = ref({});
const eventDetail = ref(null);
const loading = ref(true);
const error = ref(null);
const participationStatus = ref(null);
const approvedParticipants = ref([]);
const message = useMessage();
const coverPhotoUrl = ref('https://via.placeholder.com/300');
const defaultAvatarUrl = 'https://via.placeholder.com/50';
const creatorPhotoUrl = ref(defaultAvatarUrl);

const fetchCreatorPhoto = async () => {
  try {
    if (event.value && event.value.eventCreatorId) {
      const photoResponse = await axios.get(`/user/secure/profile-photo/${event.value.eventCreatorId}`);
      creatorPhotoUrl.value = photoResponse.data || defaultAvatarUrl;
    }
  } catch (error) {
    console.error('獲取主辦者頭像失敗:', error);
    creatorPhotoUrl.value = defaultAvatarUrl;
  }
};

const fetchEventDetail = async () => {
  try {
    const response = await axios.get(`/eventDetail/${route.params.id}/show`);
    eventDetail.value = response.data;
    loading.value = false;
  } catch (error) {
    console.error('獲取活動詳情失敗:', error);
    error.value = '獲取活動詳情失敗';
    loading.value = false;
  }
};

const fetchApprovedParticipants = async () => {
  try {
    const response = await axios.get(`/eventParticipant/event/${route.params.id}/approved-participants`);
    const participantsData = response.data;
    if (participantsData.map != null) {
      approvedParticipants.value = await Promise.all(participantsData.map(async (participant) => {
        try {
          const photoResponse = await axios.get(`/user/secure/profile-photo/${participant.userId}`);
          return {
            ...participant,
            photoUrl: photoResponse.data || null
          };
        } catch (err) {
          console.error(`Error fetching photo for user ${participant.userId}:`, err);
          return participant;
        }
      }));
    }
  } catch (error) {
    console.error('讀取參加者失敗:', error);
    // message.error('讀取參加者失敗');
  }
};

const fetchEvent = async () => {
  try {
    const response = await axios.get(`/events/${route.params.id}`);
    event.value = response.data;
    console.log("Event data:", event.value);
    await fetchCreatorPhoto();
  } catch (error) {
    console.error('獲取活動名稱失敗:', error);
    error.value = '獲取活動名稱失敗';
  }
};

const checkParticipationStatus = async () => {
  try {
    const response = await axios.get(`/eventParticipant/event/${route.params.id}/user/${userStore.userId}/status`);
    participationStatus.value = response.data;
  } catch (error) {
    console.error('檢查參與狀態失敗:', error);
    message.error('檢查參與狀態失敗');
    participationStatus.value = { status: -1 };
  }
};

const fetchCoverPhoto = async () => {
  try {
    const photosResponse = await axios.get(`/eventPhoto/event/${route.params.id}`);
    if (photosResponse.data && photosResponse.data.length > 0) {
      const coverPhoto = photosResponse.data.find(photo => photo.isCover) || photosResponse.data[0];
      coverPhotoUrl.value = `${import.meta.env.VITE_API_URL}/eventPhoto/${route.params.id}/${coverPhoto.id}`;
    }
  } catch (error) {
    console.error('獲取封面照片失敗:', error);
  }
};

const participationButtonText = computed(() => {
  if (!participationStatus.value || participationStatus.value.status === -1) return '加入活動';
  if (participationStatus.value.status === 0) return '待審核';
  if (participationStatus.value.status === 1) return '已加入';
  return '加入活動';
});

const canParticipate = computed(() => {
  return !participationStatus.value || participationStatus.value.status === -1;
});

const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '未設置';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateTimeString).toLocaleString('zh-TW', options);
};

const handleParticipation = async () => {
  if (!canParticipate.value) return;
  loading.value = true;
  let participantResponse = null;
  let transactionResponse = null;

  try {
    // 首先嘗試加入活動
    participantResponse = await axios.post('/eventParticipant', {
      eventId: route.params.id,
      userId: userStore.userId
    });

    // 如果加入活動成功
    if (participantResponse.status === 201) {
      if (eventDetail.value.fee === 0) {
        // 如果是免費活動
        message.success('成功提交參加請求', {
          closable: true,
          duration: 5000
        });
      } else {
        // 如果是付費活動
        const formattedEventId = String(event.value.id).padStart(5, '0');
        const formattedUserId = String(userStore.userId).padStart(5, '0');
        transactionResponse = await axios.post('/transaction/add', {
          transactionNo: `E${formattedEventId}${event.value.eventName}U${formattedUserId}R`, //R=request
          amount: -eventDetail.value.fee,
          paymentMethod: '錢包支付',
          status: 2,
          user: {
            id: userStore.userId
          }
        });

        if (transactionResponse.status === 201) {
          message.success(`成功提交參加請求並將從錢包支付${eventDetail.value.fee}元活動款項`, {
            closable: true,
            duration: 5000
          });
        }
      }

      // 更新本地狀態
      participationStatus.value = {
        eventId: route.params.id,
        userId: userStore.userId,
        status: 0 // 0 表示待審核狀態
      };
    }
  } catch (error) {
    console.error('處理參與請求時發生錯誤:', error);

    // 錯誤處理和回滾邏輯
    if (participantResponse && participantResponse.status === 201 && eventDetail.value.fee !== 0) {
      // 如果加入活動成功但支付失敗（僅針對付費活動），需要取消加入活動
      try {
        await axios.delete(`/eventParticipant/${route.params.id}/${userStore.userId}`);
        console.log('成功回滾活動參與');
      } catch (rollbackError) {
        console.error('回滾活動參與失敗:', rollbackError);
        message.error('操作失敗，且無法完全回滾。請聯繫客服。', {
          closable: true,
          duration: 5000
        });
        return;
      }
    }

    // 根據錯誤類型顯示不同的錯誤消息
    if (error.response) {
      if (error.response.status === 400 && eventDetail.value.fee !== 0) {
        message.error('餘額不足，請先儲值', {
          closable: true,
          duration: 5000
        });
      } else {
        message.error('處理參與請求時發生錯誤', {
          closable: true,
          duration: 5000
        });
      }
    } else {
      message.error('網絡錯誤，請稍後再試', {
        closable: true,
        duration: 5000
      });
    }
  } finally {
    loading.value = false;
  }
};

const back = () => {
  router.go(-1);
};

onMounted(() => {
  fetchEventDetail();
  fetchEvent();
  checkParticipationStatus();
  fetchApprovedParticipants();
  fetchCoverPhoto();
});
</script>

<style scoped>
.event-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.main-card {
  background-color: #f8f9fa;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.custom-page-header {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.event-photo-card {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.square-photo {
  border-radius: 8px;
  overflow: hidden;
}

.detail-card,
.stats-card,
.description-card,
.photo-card,
.participants-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.custom-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #b396b4;
  border-radius: 8px;
  transition: all 0.3s ease;
  background-color: rgb(235, 221, 233);
}

.detail-item:hover {
  background-color: #e6d9ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.detail-label {
  flex: 1;
  font-weight: bold;
  color: #6a0dad;
}

.detail-content {
  flex: 2;
  color: #4a0080;
}

.participant-item {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
}

.participant-item:hover {
  transform: translateY(-5px);
}

.participation-button {
  background-color: #9370DB;
  color: white;
  font-weight: bold;
  padding: 10px 20px;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.participation-button:hover {
  background-color: #8A2BE2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.participation-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.participant-item {
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px;
}

.participant-item:hover {
  transform: translateY(-5px);
}

.participant-item .n-avatar {
  transition: all 0.3s ease;
}

.participant-item:hover .n-avatar {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(147, 112, 219, 0.5);
}

.participant-name {
  margin-top: 4px;
  font-size: 12px;
  text-align: center;
}

.participant-name {
  margin-top: 4px;
  font-size: 12px;
  text-align: center;
}

.photo-card {
  padding: 20px;
}

.creator-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.creator-item:hover {
  background-color: #f0e6ff;
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.creator-content {
  display: flex;
  align-items: center;
  gap: 10px;
}

.creator-content .n-avatar {
  transition: all 0.3s ease;
}

.creator-item:hover .n-avatar {
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(147, 112, 219, 0.5);
}
</style>