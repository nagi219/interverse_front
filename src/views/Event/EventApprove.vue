<template>
  <n-config-provider :theme-overrides="themeOverrides">
    <n-card class="event-approve-container">
      <h1>我主辦的活動/工作坊</h1>
      <n-spin :show="loading">
        <n-result v-if="error" status="error" :title="error" />
        <div v-else>
          <!-- 活動列表 -->
          <div v-if="!selectedEvent" class="event-list">
            <n-empty v-if="events.length === 0" description="您還沒有創建任何活動" />
            <n-grid x-gap="12" y-gap="12" cols="1 s:2 m:3 l:4" responsive="screen" v-else>
              <n-grid-item v-for="event in events" :key="event.id">
                <n-card hoverable class="event-card" @click="selectEvent(event)">
                  <template #cover>
                    <img :src="event.coverPhotoUrl || 'default-image.jpg'" alt="活動封面" class="event-cover">
                  </template>
                  <n-space vertical>
                    <n-h3 class="event-name">{{ event.eventName }}</n-h3>
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
                      <n-tag v-if="event.hasPendingMembers" type="warning" size="small">待審核</n-tag>
                    </n-space>
                  </n-space>
                  <template #footer>
                    <n-space justify="end">
                      <n-button size="small" @click.stop="goToEventDetail(event.id)">查看詳情</n-button>
                      <n-button size="small" @click.stop="editEvent(event)">編輯</n-button>
                      <n-button size="small" @click.stop="confirmDelete(event)" type="error" style="background-color: purple">刪除</n-button>
                    </n-space>
                  </template>
                </n-card>
              </n-grid-item>
            </n-grid>
          </div>

          <!-- 待審核參與者列表 -->
          <div v-else>
            <n-page-header :title="selectedEvent.eventName" :subtitle="selectedEvent.clubName || '工作坊'"
              @back="backToEventList">
              <template #extra>
                <n-tag v-if="selectedEvent.hasPendingMembers" type="warning">待審核</n-tag>
              </template>
            </n-page-header>
            <n-h3>待審核參與者</n-h3>
            <n-empty v-if="pendingParticipants.length === 0" description="沒有待審核的參與者" />
            <n-data-table v-else :columns="columns" :data="pendingParticipants" />
          </div>
        </div>
      </n-spin>
    </n-card>

    <!-- 編輯活動模態框 -->
    <n-modal v-model:show="showEditModal">
      <n-card style="width: 600px" title="編輯活動" :bordered="false" size="huge" role="dialog" aria-modal="true">
        <n-form>
          <n-form-item label="活動名稱">
            <n-input v-model:value="editingEvent.eventName" placeholder="活動名稱" />
          </n-form-item>
          <n-form-item label="活動詳情">
            <n-input v-model:value="editingEvent.description" type="textarea" placeholder="活動詳情" />
          </n-form-item>
        </n-form>
        <template #footer>
          <n-button @click="updateEvent" type="primary">保存</n-button>
          <n-button @click="showEditModal = false">取消</n-button>
        </template>
      </n-card>
    </n-modal>
  </n-config-provider>
</template>

<script setup>
import { ref, onMounted, h } from 'vue';
import axios from '@/plugins/axios';
import useUserStore from "@/stores/userstore";
import { useRouter } from 'vue-router';
import {
  NConfigProvider, NCard, NSpin, NResult, NH1, NH2, NH3, NEmpty, NGrid, NGridItem,
  NButton, NDataTable, NTag, NSpace, useMessage, NModal, NForm, NFormItem, NInput,
  useDialog, NPageHeader
} from 'naive-ui';

const userStore = useUserStore();
const message = useMessage();
const dialog = useDialog();
const events = ref([]);
const selectedEvent = ref(null);
const pendingParticipants = ref([]);
const loading = ref(true);
const error = ref(null);
const showEditModal = ref(false);
const editingEvent = ref({});

const themeOverrides = {
  common: {
    primaryColor: '#8E44AD',
    primaryColorHover: '#9B59B6',
    primaryColorPressed: '#7D3C98',
  }
};

const router = useRouter();

const goToEventDetail = (eventId) => {
  router.push({ name: 'event-detail-link', params: { id: eventId } });
};

const columns = [
  // { title: '用戶ID', key: 'userId' },
  { title: '用戶名', key: 'userName' },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h('div', [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => approveParticipant(row.userId),
            loading: row.approving,
            disabled: row.deleting,
            class: 'approve-button'
          },
          { default: () => row.approving ? '審核中...' : '批准' }
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => removeParticipant(row.userId),
            loading: row.deleting,
            disabled: row.approving,
            class: 'remove-button'
          },
          { default: () => row.deleting ? '刪除中...' : '刪除' }
        )
      ]);
    }
  }
];

const fetchUserEvents = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/events/creator`, {
      params: { creatorId: userStore.userId }
    });
    events.value = await Promise.all(response.data.map(async event => {
      const [pendingParticipants, eventDetail, eventPhotos] = await Promise.all([
        fetchPendingParticipants(event.id),
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
        clubName: event.clubName || null, // 將 '工作坊' 改為 null
        hasPendingMembers: pendingParticipants.length > 0,
        coverPhotoUrl: coverPhotoUrl
      };
    }));
  } catch (err) {
    console.error('Error fetching user events:', err);
    if (err.response && err.response.status === 401) {
      error.value = '請先登入以查看您的活動';
    } else {
      error.value = '獲取活動列表時出錯';
    }
    events.value = [];
  } finally {
    loading.value = false;
  }
};

const updateEventPendingStatus = async (eventId) => {
  const event = events.value.find(e => e.id === eventId);
  if (event) {
    const pendingParticipants = await fetchPendingParticipants(eventId);
    event.hasPendingMembers = pendingParticipants.length > 0;
  }
};

const editEvent = (event) => {
  editingEvent.value = { ...event };
  showEditModal.value = true;
};

const updateEvent = async () => {
  try {
    const response = await axios.put(`/events/${editingEvent.value.id}/edit`, {
      eventName: editingEvent.value.eventName,
      description: editingEvent.value.description,
    });
    if (response.status === 200) {
      const index = events.value.findIndex(e => e.id === editingEvent.value.id);
      if (index !== -1) {
        events.value[index] = { ...events.value[index], ...editingEvent.value };
      }
      showEditModal.value = false;
      message.success('活動更新成功');
    }
  } catch (error) {
    console.error('更新活動失敗:', error);
    message.error('更新活動失敗');
  }
};

const confirmDelete = (event) => {
  dialog.warning({
    title: '確認刪除',
    content: '您確定要刪除這個活動嗎？此操作不可撤銷。',
    positiveText: '確認刪除',
    negativeText: '取消',
    onPositiveClick: () => deleteEvent(event),
    onNegativeClick: () => { }
  });
};

const deleteEvent = async (event) => {
  try {
    const response = await axios.delete(`/events/${event.id}`);
    if (response.status === 200) {
      events.value = events.value.filter(e => e.id !== event.id);
      message.success('活動已成功刪除');
    }
  } catch (error) {
    console.error('刪除活動失敗:', error);
    message.error('刪除活動失敗，請稍後再試');
  }
};

const selectEvent = async (event) => {
  selectedEvent.value = event;
  loading.value = true;
  try {
    const participants = await fetchPendingParticipants(event.id);
    pendingParticipants.value = participants.map(p => ({
      ...p,
      approving: false,
      deleting: false
    }));
  } catch (err) {
    console.error('Error fetching pending participants:', err);
    message.error('獲取待審核者資訊出錯');
  } finally {
    loading.value = false;
  }
};

const fetchPendingParticipants = async (eventId) => {
  try {
    const response = await axios.get(`/eventParticipant/event/${eventId}/pending-participants`);
    return response.data;
  } catch (err) {
    console.error('Error fetching pending participants:', err);
    return [];
  }
};

const approveParticipant = async (userId) => {
  const participant = pendingParticipants.value.find(p => p.userId === userId);
  if (!participant) return;
  participant.approving = true;
  
  try {
    await axios.put(`/eventParticipant/approve/${selectedEvent.value.id}/${userId}`);
    pendingParticipants.value = pendingParticipants.value.filter(p => p.userId !== userId);
    await updateEventPendingStatus(selectedEvent.value.id);

    if (selectedEvent.value.fee !== 0) {
      // 只有在活動費用不為零時才處理交易
      const { data: transaction } = await axios.get(`/transaction/transNo/${selectedEvent.value.id}/${userId}`);
      if (transaction) {
        try {
          // 將原始交易標記為已完成
          await axios.put(`/transaction/to-completed/${transaction.id}`);

          // 創建新的交易
          const formattedEventId = String(selectedEvent.value.id).padStart(5, '0');
          const formattedUserId = String(userStore.userId).padStart(5, '0');
          await axios.post('/transaction/add', {
            transactionNo: `E${formattedEventId}${selectedEvent.value.eventName}U${formattedUserId}A`, // A=Accept
            amount: Math.abs(transaction.amount),
            paymentMethod: '主辦活動/工作坊',
            status: 1,
            user: {
              id: userStore.userId
            }
          });
        } catch (transactionError) {
          console.error('Error updating transaction:', transactionError);
          console.error('Transaction data:', transaction);
          if (transactionError.response) {
            console.error('Server response:', transactionError.response.data);
          }
          throw new Error('交易更新失敗');
        }
      } else {
        console.warn('對應的交易未找到');
      }
    }
  } catch (err) {
    console.error('Error approving participant or updating transactions:', err);
    message.error('審核參與者時出錯');
    if (err.response) {
      console.error('Server response:', err.response.data);
    }
  } finally {
    participant.approving = false;
  }
};

const removeParticipant = async (userId) => {
  const participant = pendingParticipants.value.find(p => p.userId === userId);
  if (!participant) return;
  participant.deleting = true;
  
  try {
    await axios.delete(`/eventParticipant/event/${selectedEvent.value.id}/user/${userId}`);
    pendingParticipants.value = pendingParticipants.value.filter(p => p.userId !== userId);
    await updateEventPendingStatus(selectedEvent.value.id);

    if (selectedEvent.value.fee !== 0) {
      // 只有在活動費用不為零時才處理交易
      const { data: transaction } = await axios.get(`/transaction/transNo/${selectedEvent.value.id}/${userId}`);
      console.error('Transaction data:', transaction);
      if (transaction) {
        // 將交易標記為失敗
        await axios.put(`/transaction/to-failed/${transaction.id}`);
      } else {
        console.warn('對應的交易未找到');
      }
    }
  } catch (err) {
    console.error('Error removing participant:', err);
    message.error('刪除參與者時出錯');
  } finally {
    participant.deleting = false;
  }
};

const backToEventList = async () => {
  selectedEvent.value = null;
  pendingParticipants.value = [];
  await fetchUserEvents();
};

onMounted(() => {
  fetchUserEvents();
});
</script>

<style scoped>
.event-approve-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-color);
}

.page-title {
  text-align: center;
  margin-bottom: 20px;
}

.section-title {
  margin-bottom: 15px;
  color: var(--text-color);
}

.event-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  background-color: #FAFAFA;
  border: 1px solid var(--border-color);
}

.event-cover {
  width: 100%;
  height: 250px;
  object-fit: cover;
}

.event-name {
  cursor: pointer;
  color: var(--text-color);
}

.event-name:hover {
  color: var(--accent-color);
}

.approve-button,
.remove-button {
  margin-left: 8px;
}

.approve-button {
  background-color: #4CAF50;
}

.remove-button {
  background-color: #f1cfe9;
}

.n-tag {
  margin-right: 8px;
}

h1 {
  color: var(--accent-color);
  margin-bottom: 25px;
  font-weight: 700;
  font-size: 2.2rem;
  text-align: center;
}
</style>