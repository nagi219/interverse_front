<template>
    <n-space vertical>
        <n-input
            type="textarea"
            placeholder="你在想什麼?"
            v-model:value="content"
            :autosize="{
            minRows: 3
            }"
        />
        <n-upload
            ref="upload"
            :custom-request="customRequest"
            :default-file-list="fileList"
            list-type="image-card"
            @change="handleChange"
        >
            上傳圖片
        </n-upload>
        <n-button tertiary @click="submit">提交</n-button>
    </n-space>
</template>

<script setup>
import { ref } from 'vue'
import axios from '@/plugins/axios'
import useUserStore from '@/stores/userstore';


const content = ref('')
const fileList = ref([])  
const userStore = useUserStore();
let userId = userStore.userId;
const postId=ref(null)
const upload=ref(null)

const customRequest=({file, onFinish, onError}) =>{
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

// 提交
async function submit() {
  console.log(userId+'44444')
  try {
  //axios.post 返回一個 Promise，所以使用 await 來等待請求完成並獲取回應。
  const postResponse = await axios.post('/userPost', {
    content:content.value,
    user:{
      id:userId
    }
  }) 
  const postId = postResponse.data.id
  
  //遍歷 fileList.value 中的每個檔案。
  for(const file of fileList.value){
    //創建一個 FormData 物件，用於處理檔案上傳
    const formData = new FormData();
    //formData.append('file', file.file);: 將檔案添加到FormData 物件中，file.file 是檔案本身。
    formData.append('file', file.file);
    //將之前獲取的 postId 添加到 FormData 中，用於將圖片與指定的貼文關聯。
    formData.append('postId', postId)

    //使用 axios 發送 POST 請求到 /postPhoto，並附上 formData，Content-Type 設為 multipart/form-data，以便處理檔案上傳。
    await axios.post('/postPhoto', formData,{
      headers:{
        'Content-Type': 'multipart/form-data'
      }
    })
  }
  alert('提交成功');
  //清空內容
  content.value='';
  fileList.value=[];
  // 如果 upload.value 存在，調用其 clear 方法來清除上傳控件中的檔案（假設 upload 是一個檔案上傳控件）。
  if(upload.value){
    upload.value.clear()
  }
}catch(error){
  console.error('提交失敗', error);
  alert('提交失敗!');
}
}

</script>
<style>
</style>