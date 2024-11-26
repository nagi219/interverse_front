<template>
  <n-space vertical>
    <!-- 現有的輸入框 -->
    <n-input v-model:value="title" type="text" placeholder="有創意的文章標題" />
    <n-input
      type="textarea"
      placeholder="大聲說出來你在想什麼?"
      v-model:value="content"
      :autosize="{
        minRows: 3
      }"
    />
    <!-- 新增的 hashtag 輸入框 -->
    <n-input v-model:value="hashtagInput" type="text" placeholder="輸入 hashtag (用空格分隔多個標籤)" @keyup.enter="addHashtag"/>
    <!-- 顯示已添加的 hashtags -->
    <n-space v-if="hashtags.length > 0">
  <template v-for="tag in hashtags" :key="tag">
    <n-tag closable @close="removeHashtag(tag)">
      {{ tag }}
    </n-tag>
  </template>
</n-space>
<div v-else>No hashtags added yet</div>
    <!-- 現有的上傳和提交按鈕 -->
    <n-upload
      ref="upload"
      :custom-request="customRequest"
      :default-file-list="fileList"
      list-type="image-card"
      @change="handleChange"
    >
      發文附圖是基本禮儀
    </n-upload>
    <n-button tertiary @click="submit">提交</n-button>
  </n-space>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from '@/plugins/axios'
import useUserStore from '@/stores/userstore';

const content = ref('')
const title=ref('')
const fileList = ref([])  
const userStore = useUserStore();
let userId = userStore.userId;
const upload = ref(null)

// 新增的 hashtag 相關變量
const hashtagInput = ref('')
const hashtags = ref([])

onMounted(() => {
  console.log('Component mounted. User ID:', userId);
});

const customRequest = ({ file, onFinish, onError }) => {
  const reader = new FileReader();
  reader.readAsDataURL(file.file);
  reader.onload = () => {
    file.url = reader.result;
    onFinish();
  }
  reader.onerror = (error) => {
    onError(error)
  }
}

const handleChange = (options) => {
  fileList.value = options.fileList
}

// 修改後的提交函數
async function submit() {
  try {
    // 處理可能還未添加的最後一個hashtag
    if (hashtagInput.value.trim()) {
      addHashtag();
    }
    const articleDTO = {
      title: title.value,
      content: content.value,
      clubId: 1,
      userId: userId,
      hashtags: hashtags.value  // 添加 hashtags
    };

    const articleResponse = await axios.post('/club/article', articleDTO);
    console.log('Article response:', articleResponse);
    const articleId = articleResponse.data.id

    // 上傳圖片，獲取 URL
    for (const file of fileList.value) {
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('articleId', articleId)
      console.log("發出POST照片請求")
      await axios.post('/club/articlePhoto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
    // 清空內容
    content.value = '';
    title.value = ''
    fileList.value = [];
    hashtags.value = [];  // 清空 hashtags
    if (upload.value) {
      upload.value.clear();
    }

    alert('提交成功');
  } catch (error) {
    console.error('提交失敗', error);
    if (error.response) {
      // 服務器響應了，但狀態碼不在 2xx 範圍內
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      // 請求已經發出，但沒有收到響應
      console.error('No response received:', error.request);
    } else {
      // 在設置請求時發生了一些事情，觸發了錯誤
      console.error('Error message:', error.message);
    }
    alert('提交失敗: ' + (error.response?.data?.message || error.message));
  }
}

// 新增的 hashtag 相關方法
function addHashtag() {
  const newTags = hashtagInput.value.split(' ').filter(tag => tag.trim() !== '')
  hashtags.value = [...new Set([...hashtags.value, ...newTags])]
  hashtagInput.value = ''
  console.log("Current hashtags:", hashtags.value) // 新增這行
}

function removeHashtag(tag) {
  hashtags.value = hashtags.value.filter(t => t !== tag)
}

</script>

<style>
</style>