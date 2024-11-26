<template>
  <div class="ts-container">
    <div class="ts-space"></div>
    <div class="custom-container">
      <div class="ts-content">
        <h1>工作坊活動列表</h1>
        <div class="ts-space"></div>
        
        <!-- 分類標籤 -->
        <div class="category-tabs">
          <button class="active"></button>
        </div>

        <div class="search-and-add">

          <!-- 新增工作坊按鈕 -->
            <router-link 
              :to="{ name: 'event-addWorkshop-link' }" 
              class="ts-button custom-button"
              style="margin: 0px 0px 10px 0px ;"
            >
              新增工作坊
            </router-link>
            
        <!-- 搜索輸入框 -->
        <div class="search-container">
          <input 
            v-model="searchQuery" 
            type="text"
            placeholder="來探索有趣的工作坊吧"
            @input="filterEvents"
          >
        </div>

      </div>
        <!-- 工作坊列表 -->
        <div v-if="loading" class="spinner-container">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">載入中</span>
          </div>
        </div>
        <div v-else-if="filteredEvents.length === 0" class="ts-center">
          沒有找到工作坊活動
        </div>
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
              <p class="event-date">{{ formatDate(event.startTime) }} - {{ formatDate(event.endTime) }}</p>
              <p class="event-location">{{ event.location }}</p>
              
              <!-- 編輯和刪除按鈕 -->
              <div v-if="canUserEdit(event)" class="action-buttons">
                <n-button size="small" @click.stop="editEvent(event)" class="custom-button">編輯</n-button>
                <n-button size="small" @click.stop="confirmDelete(event)" type="error">刪除</n-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 編輯模態框 -->
    <n-modal v-model:show="showEditModal">
      <n-card
        style="width: 600px"
        title="編輯工作坊"
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
import { ref, onMounted } from 'vue';
import axios from '@/plugins/axios';
import useUserStore from "@/stores/userstore";
import { useRouter } from 'vue-router';
import { useDialog, useMessage } from 'naive-ui';
import { NButton, NModal, NCard, NForm, NFormItem, NInput, NSpin } from 'naive-ui';

const router = useRouter();
const userStore = useUserStore();
const dialog = useDialog();
const message = useMessage();

const events = ref([]);
const filteredEvents = ref([]);
const searchQuery = ref('');
const sortOption = ref('dateDesc');
const loading = ref(true);
const showEditModal = ref(false);
const editingEvent = ref({});

const fetchEvents = async () => {
  try {
    const response = await axios.get('/events');
    const workshopEvents = response.data.filter(event => event.source === 2);
    
    const eventsWithDetails = await Promise.all(workshopEvents.map(async (event) => {
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
    events.value = eventsWithDetails;
    filterEvents();
  } catch (error) {
    console.error('獲取工作坊列表失敗:', error);
    message.error('獲取工作坊列表失敗');
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
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
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
      source: 2,
      eventName: editingEvent.value.eventName,
      eventCreator: { id: userStore.userId },
      description: editingEvent.value.description
    });
    if (response.status === 200) {
      const index = events.value.findIndex(e => e.id === editingEvent.value.id);
      if (index !== -1) {
        events.value[index] = { ...events.value[index], ...editingEvent.value };
      }
      showEditModal.value = false;
      filterEvents(); // 重新過濾和排序事件
      message.success('更新工作坊成功');
    }
  } catch (error) {
    console.error('更新工作坊失敗:', error);
    message.error('更新工作坊失敗');
  }
};

const goToEventDetail = (eventId) => {
  router.push({ name: 'event-detail-link', params: { id: eventId } });
};

const confirmDelete = (event) => {
  dialog.warning({
    title: '確認刪除',
    content: '您確定要刪除這個工作坊嗎？此操作不可撤銷。',
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
      filteredEvents.value = filteredEvents.value.filter(e => e.id !== event.id);
      message.success('工作坊已成功刪除');
    }
  } catch (error) {
    console.error('刪除工作坊失敗:', error);
    message.error('刪除工作坊失敗，請稍後再試');
  }
};

onMounted(() => {
  fetchEvents();
});
</script>

<style scoped>
.custom-container {
  width: 90%;
  margin: 0 auto;
}

.category-tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.category-tab {
  background: none;
  border: none;
  padding: 10px 20px;
  margin: 0 5px;
  cursor: pointer;
  font-size: 16px;
}

.category-tab.active {
  font-weight: bold;
  border-bottom: 2px solid #000;
}

.search-container {
  width: 50%;
  margin-right: 20px;
}

.search-and-add {
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.search-container input {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background-color: var(--light-background);
  color: var(--text-color);
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.event-card {
  background: var(--light-background);
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
  background: var(--secondary-color);
  color: var(--text-color);
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  margin-bottom: 10px;
}

.event-name {
  font-size: 18px;
  margin-bottom: 10px;
  color: var(--text-color);
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

.event-date, .event-location {
  font-size: 14px;
  color: var(--light-text-color);
  margin-bottom: 5px;
}

.no-photo {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--light-background);
  color: var(--muted-color);
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
  background-color: #97715B !important;
  color: #FFF !important;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-right: 10px;
}

.custom-button:hover {
  background-color: var(--secondary-color) !important;
  color: var(--text-color) !important;
}

h1 {
  color: var(--accent-color);
  margin-bottom: 25px;
  font-weight: 700;
  font-size: 2.2rem;
  text-align: center;
}

.spinner-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px; 
}

.spinner-border {
  width: 3rem; 
  height: 3rem;
  color: var(--accent-color) !important;
}

</style>