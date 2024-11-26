<template>
  <div class="mt-4">
    <h3 class="text-lg font-semibold mb-2">新增活動</h3>
    <form @submit.prevent="submitEvent" class="space-y-4">
      <div>
        <label for="eventName" class="block text-sm font-medium text-gray-700">活動名稱</label>
        <input type="text" id="eventName" v-model="eventData.eventName" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      </div>
      <!-- 新增封面照片上傳 -->
      <div>
        <label for="coverPhoto" class="block text-sm font-medium text-gray-700">封面照片</label>
        <input type="file" id="coverPhoto" @change="handleFileChange" accept="image/*" class="mt-1 block w-full">
      </div>
      <div>
        <label for="location" class="block text-sm font-medium text-gray-700">地點</label>
        <input type="text" id="location" v-model="eventDetailData.location" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      </div>
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700">描述</label>
        <textarea id="description" v-model="eventDetailData.description" rows="3"
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
      </div>
      <div>
        <label for="startTime" class="block text-sm font-medium text-gray-700">開始時間</label>
        <input type="datetime-local" id="startTime" v-model="eventDetailData.startTime" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      </div>
      <div>
        <label for="endTime" class="block text-sm font-medium text-gray-700">結束時間</label>
        <input type="datetime-local" id="endTime" v-model="eventDetailData.endTime" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      </div>
      <div>
        <label for="fee" class="block text-sm font-medium text-gray-700">費用</label>
        <input type="number" id="fee" v-model="eventDetailData.fee" min="0" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      </div>
      <div>
        <label for="participantMin" class="block text-sm font-medium text-gray-700">最少人數</label>
        <input type="number" id="participantMin" v-model="eventDetailData.participantMin" min="1" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      </div>
      <div>
        <label for="participantMax" class="block text-sm font-medium text-gray-700">人數上限</label>
        <input type="number" id="participantMax" v-model="eventDetailData.participantMax" min="1" required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
      </div>
      <button type="submit" class=" text-white font-bold py-2 px-4 rounded "style="background-color: purple;">
        新增活動
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from '@/plugins/axios';
import useUserStore from '@/stores/userstore'
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';

const router = useRouter();
const message = useMessage();
const userStore = useUserStore();
let userId = userStore.userId;

const props = defineProps({
  clubId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['eventAdded']);

const coverPhoto = ref(null);

const handleFileChange = (event) => {
  coverPhoto.value = event.target.files[0];
};

const eventData = ref({
  eventName: '',
  source: 1, // 表示這是一個社團活動
  club: { id: props.clubId },
  eventCreator: { id: userId }
});

const eventDetailData = ref({
  location: '',
  description: '',
  startTime: '',
  endTime: '',
  fee: 0,
  participantMin: 1,
  participantMax: 1
});

const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toISOString().slice(0, 19).replace('T', ' ');
};

const submitEvent = async () => {
  try {
    // 步驟 1: 創建 Event
    const eventRequestData = {
      ...eventData.value,
      clubId: props.clubId
    };
    console.log('Event 請求數據:', eventRequestData);

    const eventResponse = await axios.post('/events/new/Event', eventRequestData);
    console.log('Event created:', eventResponse.data);

    // 步驟 2: 創建 EventDetail
    const eventDetailRequestData = {
      ...eventDetailData.value,
      startTime: formatDateTime(eventDetailData.value.startTime),
      endTime: formatDateTime(eventDetailData.value.endTime),
      event: { id: eventResponse.data.id }
    };
    console.log('EventDetail 請求數據:', eventDetailRequestData);

    const eventDetailResponse = await axios.post(`/eventDetail/${eventResponse.data.id}/new`, eventDetailRequestData);
    console.log('EventDetail created:', eventDetailResponse.data);

    // 步驟 3: 上傳封面照片
    if (coverPhoto.value) {
      const formData = new FormData();
      formData.append('file', coverPhoto.value);
      formData.append('eventId', eventResponse.data.id);
      formData.append('uploaderId', userId);

      const photoResponse = await axios.post('/eventPhoto/new', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Cover photo uploaded:', photoResponse.data);
    }

    // 合併 Event 和 EventDetail 數據
    const combinedEventData = {
      ...eventResponse.data,
      eventDetail: eventDetailResponse.data,
      coverPhotoUrl: coverPhoto.value ? URL.createObjectURL(coverPhoto.value) : null
    };

    emit('eventAdded', combinedEventData);

    // 重置表單
    eventData.value = { 
      eventName: '', 
      source: 1,
      club: { id: props.clubId },
      eventCreator: { id: userId }
    };
    eventDetailData.value = {
      location: '',
      description: '',
      startTime: '',
      endTime: '',
      fee: 0,
      participantMin: 1,
      participantMax: 1
    };
    coverPhoto.value = null;

    message.success('活動新增成功');
    
  } catch (error) {
    console.error('添加活動失敗:', error);
    message.error('添加活動失敗: ' + error.message);
  }
};
</script>
<style scoped>
/* 表單容器樣式 */
.mt-4 {
  background-color: #f9fafb;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* 標題樣式 */
h3 {
  color: #374151;
  font-size: 1.25rem;
}

/* 表單標籤樣式 */
label {
  color: #4a5568;
}

/* 表單輸入框樣式 */
input, textarea, select {
  width: 100%;
  padding: 10px;
  border: 1px solid #d2d6dc;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

input:focus, textarea:focus, select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);
  outline: none;
}

/* 表單元素間距 */
.space-y-4 > * + * {
  margin-top: 16px;
}

/* 上傳照片按鈕樣式 */
input[type="file"] {
  padding: 8px;
  border: 1px solid #d2d6dc;
  border-radius: 8px;
  background-color: #edf2f7;
}

/* 提交按鈕樣式 */
button[type="submit"] {
  background-color: #4f46e5;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 8px;
  transition: background-color 0.3s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

button[type="submit"]:hover {
  background-color: #4338ca;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}

button[type="submit"]:active {
  background-color: #3730a3;
}

button[type="submit"]:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
  box-shadow: none;
}

/* 表單容器的響應式設計 */
@media (max-width: 640px) {
  .mt-4 {
    padding: 15px;
  }

  button[type="submit"] {
    width: 100%;
  }
}
</style>