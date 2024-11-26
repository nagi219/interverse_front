<template>
  <n-card class="club-edit-container">
    <n-h1>編輯俱樂部</n-h1>
    <n-spin :show="loading">
      <n-result v-if="!loading && !hasPermission" status="error" title="權限錯誤" description="您沒有權限編輯此俱樂部。" />
      <n-form v-if="!loading && hasPermission" @submit.prevent="submitForm" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
        <n-form-item label="社團名稱" required>
          <n-input v-model:value="club.clubName" placeholder="請輸入社團名稱" />
        </n-form-item>
        
        <n-form-item label="描述">
          <n-input v-model:value="club.description" type="textarea" placeholder="請輸入描述" />
        </n-form-item>
        
        <n-form-item label="公開">
          <n-select v-model:value="club.isPublic" :options="[
            { label: '是', value: 1 },
            { label: '否', value: 0 }
          ]" />
        </n-form-item>
        
        <n-form-item label="是否同意社群規範">
          <n-select v-model:value="club.isAllowed" :options="[
            { label: '是', value: 1 }
          ]" />
          <n-button text tag="a" href="https://drive.google.com/file/d/14jGMWdXsWNkDZRVSLhYuLdcbNhR7oZF2/view?usp=sharing" target="_blank">
            查看社群規範
          </n-button>
        </n-form-item>
  
        <n-form-item label="照片">
          <n-upload
            accept="image/*"
            :default-upload="false"
            @change="handleFileUpload"
          >
            <n-button>選擇檔案</n-button>
          </n-upload>
        </n-form-item>
  
        <n-form-item v-if="photoPreview" label="照片預覽">
          <div class="photo-preview">
            <n-image
              :src="photoPreview"
              alt="照片預覽"
              object-fit="cover"
              :width="200"
              :height="200"
            />
          </div>
        </n-form-item>
        
        <n-form-item>
          <n-space>
            <n-button type="primary" attr-type="submit">更新俱樂部</n-button>
            <n-button @click="$router.go(-1)">取消</n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-spin>
    <n-alert v-if="errorMessage" type="error" :title="errorMessage" />
  </n-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";
import {
  NCard, NSpin, NResult, NForm, NFormItem, NInput, NSelect, NButton,
  NSpace, NUpload, NImage, NAlert, NH1, useMessage
} from 'naive-ui';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const message = useMessage()


const loading = ref(true);
const hasPermission = ref(false);
const errorMessage = ref('');
const photoFile = ref(null);
const photoPreview = ref(null);

const clubId = route.params.id;

const club = ref({
  clubName: '',
  description: '',
  isPublic: 1,
  isAllowed: 1,
  clubCreator: { id: null },
  photo: null
});

const handleFileUpload = ({ file }) => {
  if (file.file) {
    // 檢查文件大小（限制為 5MB）
    if (file.file.size > 5 * 1024 * 1024) {
      errorMessage.value = '文件大小不能超過 5MB';
      return;
    }
    // 檢查文件類型
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.file.type)) {
      errorMessage.value = '只允許上傳 JPG、PNG 或 GIF 格式的圖片';
      return;
    }
    photoFile.value = file.file;
    photoPreview.value = URL.createObjectURL(file.file);
  }
};

const fetchClubDetails = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/clubs/${clubId}`);
    club.value = {
      ...response.data,
      isPublic: response.data.isPublic ? 1 : 0,
      isAllowed: response.data.isAllowed ? 1 : 0,
      clubCreator: { id: response.data.clubCreator }
    };
    if (club.value.photo) {
      // 只存文件名，而不是完整的 URL
      club.value.photo = club.value.photo.split('/').pop();
      photoPreview.value = `${import.meta.env.VITE_API_URL}/clubs/photo/${club.value.photo}`;
    }
    hasPermission.value = club.value.clubCreator.id === userStore.userId;
    loading.value = false;
  } catch (error) {
    console.error('Error fetching club details:', error);
    errorMessage.value = '獲取俱樂部詳情時出錯';
    loading.value = false;
  }finally {
    loading.value = false;
  }
};

const submitForm = async () => {
  if (!hasPermission.value) {
    errorMessage.value = '您沒有權限編輯此俱樂部';
    return;
  }

  const formData = new FormData();

  // 確保 clubCreator 是正确的格式
  const clubData = {
    ...club.value,
    clubCreator: { id: club.value.clubCreator.id }
  };

  // 如果沒有新的照片文件，就不包含 photo 字段
  if (!photoFile.value) {
    delete clubData.photo;
  }

  formData.append('club', new Blob([JSON.stringify(clubData)], {
    type: 'application/json'
  }));

  if (photoFile.value) {
    formData.append('photo', photoFile.value);
  }

  try {
    const response = await axios.put(`/clubs/${clubId}/edit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
     // 顯示成功提示
     message.success('俱樂部更新成功！');
    
    // 短暫延遲後返回上一頁
    setTimeout(() => {
      router.back();
    }, 500);
    } catch (error) {
    console.error('Error updating club:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      errorMessage.value = `更新失敗: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      errorMessage.value = '無法連接到伺服器，請檢查網絡連接';
    } else {
      errorMessage.value = `請求設置錯誤: ${error.message}`;
    }
    message.error(errorMessage.value);
  }
};

onMounted(fetchClubDetails);
</script>

<style scoped>
.club-edit-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.photo-preview {
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
}
</style>