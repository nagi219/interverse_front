<template>
  <div class="workshop-form-container">
    <div class="form-header">
      <h3 class="form-title">新增工作坊</h3>
      <button @click="goBack" class="back-button">
        <span class="back-icon">&#8592;</span> 返回
      </button>
    </div>
    <form @submit.prevent="submitWorkshop" class="workshop-form">
      <div class="form-group">
        <label for="eventName">工作坊名稱</label>
        <input type="text" id="eventName" v-model="eventData.eventName" required>
      </div>
      <div class="form-group">
        <label for="coverPhoto">封面照片</label>
        <input type="file" id="coverPhoto" @change="handleFileChange" accept="image/*">
      </div>
      <div class="form-group">
        <label for="location">地點</label>
        <input type="text" id="location" v-model="eventDetailData.location" required>
      </div>
      <div class="form-group">
        <label for="description">描述</label>
        <textarea id="description" v-model="eventDetailData.description" rows="3"></textarea>
      </div>
      <div class="form-row">
        <div class="form-group half-width">
          <label for="startTime">開始時間</label>
          <input type="datetime-local" id="startTime" v-model="eventDetailData.startTime" required>
        </div>
        <div class="form-group half-width">
          <label for="endTime">結束時間</label>
          <input type="datetime-local" id="endTime" v-model="eventDetailData.endTime" required>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group half-width">
          <label for="fee">費用</label>
          <input type="number" id="fee" v-model="eventDetailData.fee" min="0" required>
        </div>
        <div class="form-group half-width">
          <label for="participantMin">最少人數</label>
          <input type="number" id="participantMin" v-model="eventDetailData.participantMin" min="1" required>
        </div>
      </div>
      <div class="form-group">
        <label for="participantMax">人數上限</label>
        <input type="number" id="participantMax" v-model="eventDetailData.participantMax" min="1" required>
      </div>
      <button type="submit" class="submit-button">新增工作坊</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from '@/plugins/axios';
import useUserStore from '@/stores/userstore'
import { useMessage } from 'naive-ui';

const router = useRouter();
const userStore = useUserStore();
let userId = userStore.userId;

const message = useMessage();
const emit = defineEmits(['workshopAdded']);

const eventData = ref({
  eventName: '',
  source: 2,
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

const coverPhoto = ref(null);

const handleFileChange = (event) => {
  coverPhoto.value = event.target.files[0];
};

const formatDateTime = (dateTimeString) => {
  return new Date(dateTimeString).toISOString().slice(0, 19).replace('T', ' ');
};

const submitWorkshop = async () => {
  try {
    const eventResponse = await axios.post('/events/new/Workshop', eventData.value);
    console.log('Event created:', eventResponse.data);

    const eventDetailRequestData = {
      ...eventDetailData.value,
      startTime: formatDateTime(eventDetailData.value.startTime),
      endTime: formatDateTime(eventDetailData.value.endTime),
      event: { id: eventResponse.data.id }
    };
    const eventDetailResponse = await axios.post(`/eventDetail/${eventResponse.data.id}/new`, eventDetailRequestData);
    console.log('EventDetail created:', eventDetailResponse.data);

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

    const combinedEventData = {
      ...eventResponse.data,
      eventDetail: eventDetailResponse.data,
      coverPhotoUrl: coverPhoto.value ? URL.createObjectURL(coverPhoto.value) : null
    };

    emit('workshopAdded', combinedEventData);
    
    eventData.value = { eventName: '', source: 2 };
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

    message.success('工作坊新增成功');
    setTimeout(() => {
      router.go(-1);
    }, 1500);

  } catch (error) {
    console.error('新增工作坊失敗:', error);
    message.error('新增工作坊失敗，請稍後再試');
  }
};

const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.workshop-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-title {
  font-size: 24px;
  color: #333;
}

.back-button {
  background: none;
  border: none;
  color:rgb(177, 151, 252);
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
}

.back-icon {
  margin-right: 5px;
}

.workshop-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-row {
  display: flex;
  gap: 15px;
}

.half-width {
  width: 50%;
}

label {
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

input[type="text"],
input[type="number"],
input[type="datetime-local"],
textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input[type="file"] {
  border: 1px solid #ddd;
  padding: 5px;
  border-radius: 4px;
}

.submit-button {
  background-color:  rgb(177, 151, 252);
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.submit-button:hover {
  background-color: rgb(215, 217, 229);
}
</style>