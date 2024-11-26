<template>
  <n-card class="club-create-container">
    <n-h1>新增俱樂部</n-h1>
    <n-spin :show="loading">
      <n-form @submit.prevent="submitForm" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
        <n-form-item label="俱樂部名稱" required>
          <n-input v-model:value="club.clubName" placeholder="請輸入俱樂部名稱" />
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
        
        <n-form-item label="遵守社群規範">
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
            <n-button type="primary" attr-type="submit">新增俱樂部</n-button>
            <n-button @click="$router.push({ name: 'club-all-link' })">取消</n-button>
          </n-space>
        </n-form-item>
      </n-form>
    </n-spin>
    <n-alert v-if="errorMessage" type="error" :title="錯誤" :description="errorMessage" />
  </n-card>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";
import {
  NCard, NSpin, NForm, NFormItem, NInput, NSelect, NButton,
  NSpace, NUpload, NImage, NAlert, NH1,useMessage
} from 'naive-ui';

const router = useRouter();
const userStore = useUserStore();
const message = useMessage(); 
const loading = ref(false);
const errorMessage = ref('');
const photoFile = ref(null);
const photoPreview = ref(null);

const club = ref({
  clubName: '',
  description: '',
  isPublic: 1,
  isAllowed: 1,
  clubCreator: { id: userStore.userId },
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

const submitForm = async () => {
  loading.value = true;
  const formData = new FormData();

  const clubData = {
    ...club.value,
    clubCreator: { id: club.value.clubCreator.id }
  };

  formData.append('club', new Blob([JSON.stringify(clubData)], {
    type: 'application/json'
  }));

  if (photoFile.value) {
    formData.append('photo', photoFile.value);
  }

  try {
    const response = await axios.post('/clubs/new', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Club created:', response.data);
    message.success('俱樂部創建成功，您已自動加入該俱樂部！');
    router.push({ name: 'club-all-link' });
  } catch (error) {
    console.error('Error creating club:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      errorMessage.value = `創建失敗: ${JSON.stringify(error.response.data)}`;
    } else if (error.request) {
      errorMessage.value = '無法連接到伺服器，請檢查網絡連接';
    } else {
      errorMessage.value = `請求設置錯誤: ${error.message}`;
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.club-create-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  background-color: #FBE4E1;
  margin-bottom: 50px;
}

.photo-preview {
  width: 200px;
  height: 200px;
  overflow: hidden;
  border-radius: 4px;
}
</style>