<template>
  <div class="ts-container">
    <div class="ts-space"></div>
    <div class="custom-container">
      <div class="ts-content">
        <div class="ts-header is-huge is-center-aligned">俱樂部活動列表</div>
        <div class="ts-space"></div>
        
        <!-- 搜尋輸入框 -->
        <div class="search-container">
          <input 
            v-model="searchQuery" 
            type="text"
            placeholder="搜尋活動或創建者"
            @input="filterEvents"
          >
        </div>

        <!-- 排序 -->
        <div class="sort-container">
          <select v-model="sortOption" @change="sortEvents">
            <option value="dateDesc">日期 (新到舊)</option>
            <option value="dateAsc">日期 (舊到新)</option>
            <option value="nameAsc">名稱 (A-Z)</option>
            <option value="nameDesc">名稱 (Z-A)</option>
          </select>
        </div>


        <!-- 活動列表 -->
        <n-spin :show="loading">
          <n-result
            v-if="error"
            status="error"
            :title="error"
            :description="'獲取活動失敗，請稍後再試。'"
          />
          <n-empty 
            v-else-if="events.length === 0" 
            description="該俱樂部目前沒有活動。"
          >
            <template #extra>
              <!-- <n-button v-if="isMember" @click="createNewEvent" type="primary">
                創建新活動
              </n-button> -->
            </template>
          </n-empty>
          <n-empty 
            v-else-if="filteredEvents.length === 0" 
            description="沒有符合搜索條件的活動。"
          />
          <div v-else class="event-grid">
            <div 
              v-for="event in filteredEvents" 
              :key="event.id" 
              class="event-card"
              @click="goToEventDetail(event.id)"
            >
              <div class="event-image">
                <img 
                  v-if="event.coverPhotoUrl"
                  :src="event.coverPhotoUrl" 
                  :alt="event.eventName"
                >
                <div v-else class="no-photo">無照片</div>
              </div>
              <div class="event-info">
                <div class="event-tag">報名中</div>
                <h3 class="event-name">{{ event.eventName }}</h3>
                <div class="event-creator">
                  <img :src="event.creatorPhotoUrl" :alt="event.creatorName" class="creator-avatar">
                  <span>{{ event.creatorName }}</span>
                </div>
                <p class="event-date">{{ formatDate(event.startTime) }}</p>
                
                <!-- 編輯和刪除按鈕 -->
                <div v-if="canUserEdit(event)" class="action-buttons">
                  <n-button size="small" @click.stop="editEvent(event)" class="custom-button">編輯</n-button>
                  <n-button size="small" @click.stop="confirmDelete(event)" type="error">刪除</n-button>
                </div>
              </div>
            </div>
          </div>
        </n-spin>
      </div>
    </div>

    <!-- 編輯模態框 -->
    <n-modal v-model:show="showEditModal">
      <n-card
        style="width: 600px"
        title="編輯活動"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <n-form>
          <n-form-item label="活動名稱">
            <n-input v-model:value="editingEvent.eventName" placeholder="活動名稱" />
          </n-form-item>
          <n-form-item label="活動詳情">
            <n-input
              v-model:value="editingEvent.description"
              type="textarea"
              placeholder="活動詳情"
            />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-button @click="updateEvent" type="primary">保存</n-button>
          <n-button @click="showEditModal = false">取消</n-button>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from '@/plugins/axios';
import useUserStore from "@/stores/userstore";
import { useRouter } from 'vue-router';
import { useDialog, useMessage } from 'naive-ui';
import {
  NButton, NCard, NEmpty, NForm, NFormItem, 
  NInput, NModal, NResult, NSpace, NSpin
} from 'naive-ui';

const props = defineProps({
  clubId: {
    type: Number,
    required: true
  },
  isMember: {
    type: Boolean,
    required: true
  }
});

const router = useRouter();
const userStore = useUserStore();
const dialog = useDialog();
const message = useMessage();

const events = ref([]);
const filteredEvents = ref([]);
const loading = ref(true);
const error = ref(null);
const showEditModal = ref(false);
const editingEvent = ref({});
const searchQuery = ref('');
const sortOption = ref('dateDesc');

const fetchClubEvents = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await axios.get('/events');
    const clubEvents = response.data.filter(event =>
      event.source === 1 && Number(event.clubId) === Number(props.clubId)
    );
    
    events.value = await Promise.all(clubEvents.map(async (event) => {
      try {
        const [detailResponse, photosResponse, creatorPhotoResponse] = await Promise.all([
          axios.get(`/eventDetail/${event.id}/show`),
          axios.get(`/eventPhoto/event/${event.id}`),
          axios.get(`/user/secure/profile-photo/${event.eventCreatorId}`)
        ]);
        
        let coverPhotoUrl = null;
        if (photosResponse.data && photosResponse.data.length > 0) {
          const coverPhoto = photosResponse.data.find(photo => photo.isCover) || photosResponse.data[0];
          coverPhotoUrl = `${import.meta.env.VITE_API_URL}/eventPhoto/${event.id}/${coverPhoto.id}`;
        }

        return {
          ...event,
          ...detailResponse.data,
          coverPhotoUrl: coverPhotoUrl,
          creatorPhotoUrl: creatorPhotoResponse.data || null
        };
      } catch (error) {
        console.error(`獲取事件 ${event.id} 的詳情或照片失敗:`, error);
        return event;
      }
    }));
    filterEvents();
  } catch (err) {
    console.error('獲取俱樂部活動失敗:', err);
    error.value = '獲取活動失敗，請稍後再試。';
  } finally {
    loading.value = false;
  }
};

const filterEvents = () => {
  filteredEvents.value = events.value.filter(event => 
    event.eventName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    event.creatorName.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
  sortEvents();
};

const sortEvents = () => {
  filteredEvents.value.sort((a, b) => {
    switch (sortOption.value) {
      case 'dateAsc':
        return new Date(a.startTime || 0) - new Date(b.startTime || 0);
      case 'dateDesc':
        return new Date(b.startTime || 0) - new Date(a.startTime || 0);
      case 'nameAsc':
        return a.eventName.localeCompare(b.eventName);
      case 'nameDesc':
        return b.eventName.localeCompare(a.eventName);
      default:
        return 0;
    }
  });
};

const formatDate = (dateString) => {
  if (!dateString) return '未設置時間';
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('zh-TW', options);
};

const canUserEdit = (event) => {
  return userStore.userId === event.eventCreatorId;
};

const editEvent = (event) => {
  editingEvent.value = { ...event };
  showEditModal.value = true;
};

const updateEvent = async () => {
  try {
    const response = await axios.put(`/events/${editingEvent.value.id}/edit`, {
      source: 1,
      eventName: editingEvent.value.eventName,
      eventCreator: { id: userStore.userId },
      description: editingEvent.value.description,
      club: { id: props.clubId }
    });
    if (response.status === 200) {
      const index = events.value.findIndex(e => e.id === editingEvent.value.id);
      if (index !== -1) {
        events.value[index] = { ...events.value[index], ...editingEvent.value };
      }
      showEditModal.value = false;
      filterEvents(); // 重新過濾和排序事件
      message.success('活動更新成功');
    }
  } catch (error) {
    console.error('更新活動失敗:', error);
    message.error('更新活動失敗');
  }
};

const goToEventDetail = (eventId) => {
  router.push({ name: 'event-detail-link', params: { id: eventId } });
};

const confirmDelete = (event) => {
  dialog.warning({
    title: '確認刪除',
    content: '您確定要刪除這個活動嗎？此操作不可撤銷。',
    positiveText: '確認刪除',
    negativeText: '取消',
    onPositiveClick: () => deleteEvent(event),
    onNegativeClick: () => {}
  });
};

const deleteEvent = async (event) => {
  try {
    const response = await axios.delete(`/events/${event.id}`);
    if (response.status === 200) {
      events.value = events.value.filter(e => e.id !== event.id);
      filterEvents(); // 重新過濾和排序事件
      message.success('活動已成功刪除');
    }
  } catch (error) {
    console.error('刪除活動失敗:', error);
    message.error('刪除活動失敗，請稍後再試');
  }
};

const createNewEvent = () => {
  // 可添加創建新活動的邏輯(導航到創建活動頁面)
  router.push({ name: 'create-club-event', params: { clubId: props.clubId } });
};

onMounted(() => {
  console.log("ClubEvents mounted with clubId:", props.clubId);
  fetchClubEvents();
});

// 當 clubId 改變時重新獲取數據
watch(() => props.clubId, fetchClubEvents);

// 當搜索查詢改變時重新過濾事件
watch(searchQuery, filterEvents);

// 當排序選項改變時重新排序事件
watch(sortOption, sortEvents);

// 將 fetchClubEvents 方法暴露給父組件
defineExpose({ fetchClubEvents });
</script>

<style scoped>
.custom-container {
  width: 90%;
  margin: 0 auto;
}

.search-container, .sort-container {
  margin-bottom: 20px;
}

.search-container input, .sort-container select {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.event-card {
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.event-image {
  height: 300px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-info {
  padding: 15px;
}

.event-tag {
  display: inline-block;
  background: #FFD700;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  margin-bottom: 10px;
}

.event-name {
  font-size: 18px;
  margin-bottom: 10px;
}

.event-creator {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.creator-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.event-date {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.no-photo {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f0f0f0;
  color: #999;
}

.action-buttons {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
}

.action-buttons .n-button {
  margin-left: 10px;
}

.custom-button {
  background-color: #FFB6C1 !important;
  color: #FFF !important;
}

.custom-button:hover {
  background-color: #FFA07A !important;
}
</style>