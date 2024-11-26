<template>
  <div>
    <h2 v-if="viewingUserId != currentUserId">
      查看用戶 {{ viewingUserName || '載入中...' }} 的動態牆
    </h2>
    <h2 v-else>這是您的個人動態牆</h2>
    <!-- 其餘模板保持不變 -->
  </div>

  <div v-if="isLoading" class="loading-indicator">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">加載中…</span>
      </div>
    </div>

  <div v-else class="page-container">
    <section class="left-section">
      <div class="user-profile d-flex align-items-center mb-3">
    <div class="user-avatar me-3">
      <div v-if="photo" class="avatar-container">
        <img :src="`${photo}`" :alt="userData.nickname || 'User Photo'" class="rounded-circle" />
      </div>
      <div v-else class="default-avatar rounded-circle">
        {{ (userData.accountNumber || "無").charAt(0).toUpperCase() }}
      </div>
    </div>
    <div class="flex-grow-1">
      <h5 class="mb-2">{{ userData.nickname }}</h5>
      <div v-if="viewingUserId != currentUserId">
        <button v-if="friendStatus === 'not_friend'" @click="switchFriendStatus"
          class="btn btn-outline-secondary btn-sm">
          加好友
        </button>
        <button v-else-if="friendStatus === 'pending_sent'" @click="switchFriendStatus"
          class="btn btn-outline-secondary btn-sm">
          取消好友邀請
        </button>
        <button v-else-if="friendStatus === 'friends'" @click="switchFriendStatus"
          class="btn btn-outline-secondary btn-sm">
          刪除好友
        </button>
        <div v-else-if="friendStatus === 'pending_received'" class="dropdown">
          <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" id="friendRequestDropdown"
            @click="toggleDropdown" aria-expanded="false">
            回應好友邀請
          </button>
          <ul class="dropdown-menu" :class="{ 'show': isDropdownOpen }" aria-labelledby="friendRequestDropdown">
            <li><a class="dropdown-item" href="#" @click.prevent="acceptFriendRequest">接受</a></li>
            <li><a class="dropdown-item" href="#" @click.prevent="declineFriendRequest">拒絕</a></li>
          </ul>
        </div>
      </div>
    </div>
  </div>


      <hr />

      <table class="table table-borderless">
        <tr>
          <td><font-awesome-icon :icon="['fas', 'location-dot']" style="color: #97715B; background-color: transparent;" /></td>
          <td>{{ userData.country }} , {{ userData.city }}</td>
        </tr>
        <tr>
          <td><font-awesome-icon :icon="['fas', 'cake-candles']" style="color: #97715B; background-color: transparent;"/></td>
          <td>{{ userData.age }} 歲</td>
        </tr>
        <tr>
          <td><font-awesome-icon :icon="['fas', 'venus-mars']" style="color: #97715B; background-color: transparent;"/></td>
          <td>{{ userData.gender }}</td>
        </tr>
      </table>
      <hr />

      <div class="aboutme">
        <h5>關於我</h5>
        <p>{{ userData.bio }}</p>
      </div>
    </section>


    <div class="main-content">
      <!-- 新增: 創建貼文部分 -->
      <div class="create-post-section"v-if="viewingUserId == currentUserId">
          <n-space vertical>
            <n-input
              type="textarea"
              placeholder="你在想什麼?"
              v-model:value="newPostContent"
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
            <n-button tertiary @click="submitNewPost">提交</n-button>
          </n-space>
        </div>
<!-- 貼文列表 -->
      <n-infinite-scroll style="height: 80%" :distance="10" @load="handleLoad">
        <div v-for="onePost in postList" :key="onePost.id" class="item">
          <div class="post-actions">
            <div v-if="onePost.userId !== null && onePost.user.id == userStore.userId">
              <button class="btn btn-outline-secondary btn-sm" @click="updatePost(onePost)">編輯</button>
              <button class="btn btn-outline-danger btn-sm" @click=deletePost(onePost)>刪除</button>
            </div>
          </div>
          <div class="post-header">
            <div class="post-date"> {{ formatDate(onePost.added) }}</div>
            <div class="post-content-layout">
    <div class="user-info-column">
      <img v-if="onePost.user.avatar" :src="onePost.user.avatar" alt="User Avatar" class="user-avatar">
      <div v-else class="default-avatar">{{ onePost.user.nickname.charAt(0).toUpperCase() }}</div>
      <a @click="navigateToUserPost(onePost.user.id)" class="a-link post-author">
        {{ onePost.user.nickname }}
      </a>
    </div>

    <div class="post-text-column">
      <n-ellipsis expand-trigger="click" line-clamp="2" :tooltip="false" class="formatted-content">
        <p>{{ onePost.content }}</p>
      </n-ellipsis>
    </div>

    <div class="post-image-column">
      <n-carousel v-if="onePost.photos && onePost.photos.length > 0" direction="vertical" dot-placement="right"
        mousewheel style="width: 100%; height: 240px">
        <n-image v-for="onePhoto in onePost.photos" :key="onePhoto.id" :src="onePhoto.base64Photo"
          :alt="onePhoto.name" class="image" />
      </n-carousel>
    </div>
  </div>
            <div class="post-like">
              <font-awesome-icon :icon="onePost.isLiked ? ['fas', 'heart'] : ['far', 'heart']"
                @click="toggleLike(onePost)" :style="{ color: onePost.isLiked ? 'red' : 'black', cursor: 'pointer' }" />
              <span class="like-count">{{ onePost.likeCount || 0 }}</span>
            </div>
            <!-- 留言 -->
            <div v-if="onePost.comments && onePost.comments.length > 0" class="comments-section">
              <h6>評論區：</h6>
              <div v-for="oneComment in onePost.comments" :key="oneComment.id" class="comment">
  <div class="comment-content">
    <div class="comment-user">
      <img v-if="oneComment.user && oneComment.user.avatar" :src="oneComment.user.avatar" alt="User Avatar" class="user-avatar">
      <div v-else class="default-avatar">{{ (oneComment.user?.nickname || '未知用戶').charAt(0).toUpperCase() }}</div>
      <a @click="navigateToUserPost(oneComment.user.id)" class="a-link">
        <span>{{ oneComment.user?.nickname || '未知用戶' }}:</span>
      </a>
                </div>
    <div v-if="editingCommentId === oneComment.id" class="edit-comment-form">
      <n-input
        v-model:value="editedComment"
        type="textarea"
        placeholder="編輯您的評論"
        :autosize="{ minRows: 3, maxRows: 5 }"
        class="edit-comment-textarea"
      />
      <div class="edit-comment-actions">
        <n-button type="primary" size="small" @click="saveComment(oneComment)">
          <template #icon><i class="fas fa-check"></i></template>
          保存
        </n-button>
        <n-button type="default" size="small" @click="cancelEdit">
          <template #icon><i class="fas fa-times"></i></template>
          取消
        </n-button>
      </div>
    </div>
    <div v-else class="comment-text">{{ oneComment.comment }}</div>
    <div class="comment-date">{{ formatDate(oneComment.added) }}</div>
    <div class="comment-like">
      <font-awesome-icon :icon="oneComment.isLiked ? ['fas', 'heart'] : ['far', 'heart']"
        @click="toggleCommentLike(oneComment)"
        :style="{ color: oneComment.isLiked ? 'red' : 'black', cursor: 'pointer' }" />
      <span class="like-count">{{ oneComment.likeCount || 0 }}</span>
    </div>
  </div>
  <div v-if="oneComment.userId !== null && oneComment.user.id == userStore.userId" class="comment-actions">
    <n-button v-if="editingCommentId !== oneComment.id" type="primary" size="small" @click="editComment(oneComment)">
      <template #icon><i class="fas fa-edit"></i></template>
      編輯
    </n-button>
    <button class="btn btn-outline-danger btn-sm" @click="deleteComment(oneComment, onePost.id)">
      <font-awesome-icon :icon="['fas', 'trash']" />
    </button>
  </div>
</div>
</div>
</div>
<!-- 留言輸入框 -->
<!-- 把屬性傳給子元件 -->
<PostComment :postId="onePost.id" @comment-added="handleCommentAdded(onePost.id, $event)"></PostComment>
</div>
</n-infinite-scroll>
</div>
<updatePostModal ref="updatePostModal" :post="selectedPost" @update:onePost="handlePostUpdate">
</updatePostModal>
</div>
</template>

<script setup>
import { onMounted, ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from '@/plugins/axios';
import useUserStore from '@/stores/userstore';
import UpdatePostModal from "./updatePostModal.vue";
import PostComment from "./PostComment.vue";
import { useMessage } from 'naive-ui'


const userStore = useUserStore();
const userId = userStore.userId;
const userIdUrl = ref();
const route = useRoute();

const userNickname = userStore.nickname
//初始化
const updatePostModal = ref(null);
const selectedPost = ref(null)
const editingCommentId = ref(null)
const editedComment = ref(null)
const message = useMessage()
const router = useRouter();
const currentUserId = computed(() => userStore.userId);
const viewingUserId = ref(null);
const viewingUserName = ref('');

const postList = ref([])


const userData = ref({});
const photo = ref('');
const friendStatus = ref('not_friend');
const isDropdownOpen = ref(false);
const isLoading = ref(true);

const newPostContent = ref('')
const fileList = ref([])
const upload = ref(null)

function initializeViewingUserId() {
  viewingUserId.value = route.params.id || currentUserId.value;
  console.log("Initialized viewingUserId:", viewingUserId.value);
  console.log("Current logged in userId:", currentUserId.value);
  if (viewingUserId.value) {
    fetchUserName();
    showUserPostList();
    fetchFriendStatus();
  } else {
    console.error("viewingUserId is not set");
  }
}

onMounted(() => {
  initializeViewingUserId();
  callFind();
});


// 監聽路由變化
watch([() => route.params.id, currentUserId], ([newId, newCurrentId]) => {
  console.log("Route params or current user changed. New ID:", newId, "New current user ID:", newCurrentId);
  initializeViewingUserId();
}, { immediate: true });

// 監聽 currentUserId 變化
watch(currentUserId, (newId) => {
  console.log("Current user ID changed:", newId);
  if (!route.params.id) {
    initializeViewingUserId();
  }
});

const navigateToUserPost = (userId) => {
  if (userId && userId.toString() !== viewingUserId.value) {
    console.log("Navigating to user post:", userId);
    router.push(`/post/userPost/${userId}`);
  } else {
    console.log("Already viewing the requested user's posts or invalid userId");
  }
};

async function fetchUserName() {
  try {
    const response = await axios.get(`/user/findName/${viewingUserId.value}`);
    viewingUserName.value = response.data; // API 直接返回暱稱字符串
    console.log("Fetched user name:", viewingUserName.value);
  } catch (error) {
    console.error('Error fetching user name:', error);
    viewingUserName.value = '未知用戶';
  }
}

// 渲染post

async function showUserPostList() {
  try {
    console.log("Fetching posts for viewingUserId:", viewingUserId.value);
    const response = await axios.get(`/userPost/showUserAllPost/${viewingUserId.value}`);
    console.log("Response data:", response.data);
    postList.value = Array.isArray(response.data) ? response.data : [];

    // 獲取每個貼文作者的頭像
    for (let post of postList.value) {
      post.user.avatar = await fetchUserAvatar(post.user.id);
      
      // 獲取每個評論作者的頭像
      if (post.comments && post.comments.length > 0) {
        for (let comment of post.comments) {
          comment.user.avatar = await fetchUserAvatar(comment.user.id);
        }
      }
    }
    await Promise.all(postList.value.map(post => fetchComments(post.id)));
    await checkLikeStatus();
  } catch (error) {
    console.error("Error fetching user posts:", error);
    message.error("Failed to fetch posts");
    postList.value = [];
  }
}

// 新增函數來獲取用戶頭像
async function fetchUserAvatar(userId) {
  try {
    const response = await axios.get(`/user/secure/profile-photo/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user avatar:', error);
    return null;
  }
}

// 檢查按讚狀態
async function checkLikeStatus() {
  for (const post of postList.value) {
    try {
      const response = await axios.get(`/postLike`, {
        params: { userId: userId, postId: post.id }
      });
      post.isLiked = response.data;
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  }
}

// 切換按讚狀態
async function toggleLike(post) {
  try {
    await axios.post('/postLike', null, {
      params: { userId: userId, postId: post.id, type: 1 }
    });
    post.isLiked = !post.isLiked;
    if (post.likeCount = null) {
      post.likeCount = 0;
    }
    post.likeCount = (post.likeCount) + (post.isLiked ? 1 : 0);
    message.success(post.isLiked ? '已按讚!' : '已取消讚!');
  } catch (error) {
    console.error('Error toggling like:', error);
    message.error('更新按讚狀態失敗');
  }
}

async function updateLikeCount(post) {
  try {
    const response = await axios.get(`/userPost/${post.id}/likeCount`);
    post.likeCount = response.data;
  } catch (error) {
    console.error('Error fetching like count:', error);
  }
}

//渲染comment
async function fetchComments(postId) {
  try {
    const response = await axios.get(`/postComment/${postId}`);
    const postIndex = postList.value.findIndex(post => post.id === postId);
    
    if (postIndex !== -1) {
      const comments = response.data;
      // 為每個評論獲取用戶頭像
      for (let comment of comments) {
        comment.user.avatar = await fetchUserAvatar(comment.user.id);
      }
      postList.value[postIndex].comments = comments;
    }
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
  }
}

//即時更新comment
async function handleCommentAdded(postId, newComment) {
  const postIndex = postList.value.findIndex(post => post.id === postId);
  if (postIndex !== -1) {
    if (!postList.value[postIndex].comments) {
      postList.value[postIndex].comments = []
    }
    newComment.user = newComment.user || { nickname: userNickname }
    // 獲取新評論作者的頭像
    newComment.user.avatar = await fetchUserAvatar(newComment.user.id);
    postList.value[postIndex].comments.push(newComment)
  }
}


// 檢查按讚狀態
async function checkCommentLikeStatus() {
  for (const post of postList.value) {
    if (post.comments) {
      for (const comment of post.comments) {
        try {
          const response = await axios.get(`/postCommentLike`, {
            params: { userId: userId, commentId: comment.id }
          });
          comment.isLiked = response.data;
        } catch (error) {
          console.error('Error checking comment like status:', error);
        }
      }
    }
  }
}

// 切換按讚狀態
async function toggleCommentLike(comment) {
  try {
    await axios.post('/postCommentLike', null, {
      params: { userId: userId, commentId: comment.id }
    });
    comment.isLiked = !comment.isLiked;
    comment.likeCount = comment.likeCount || 0;
    comment.likeCount += comment.isLiked ? 1 : -1;
    message.success(comment.isLiked ? '已對評論按讚!' : '已取消評論讚!');
  } catch (error) {
    console.error('Error toggling comment like:', error);
    message.error('更新評論按讚狀態失敗');
  }
}

//載入更多
const count = ref(6);
const handleLoad = () => {
  count.value += 1;
};

//修改post
function updatePost(onePost) {
  onePost.value = {
    id: onePost.id,
    content: onePost.content,

  }
  selectedPost.value = { ...onePost }
  console.log(selectedPost.value)
  updatePostModal.value.showModal();
}

// 即時更新貼文
function handlePostUpdate(updatePost) {
  const index = postList.value.findIndex(post => post.id === updatePost.id);
  if (index !== -1) {
    postList.value[index] = updatePost
  }
}

function deletePost(onePost) {
  confirm("確定要刪除嗎");

  if (true) {
    axios.delete(`/userPost/${onePost.id}`)
      .then(response => {
        postList.value = postList.value.filter(post => post.id !== onePost.id)
        console.log(`Post with id ${onePost.id} deleted`)
      })
      .catch(error => {
        console.error("Error fetching user posts:", error);
      })
  }
}

function editComment(oneComment) {
  editingCommentId.value = oneComment.id
  editedComment.value = oneComment.comment
  console.log("開始編輯" +editedComment.value)
}

function cancelEdit() {
  editingCommentId.value = null;
  editedComment.value = ''
}

async function saveComment(oneComment) {
  try {
  const response = await axios.put(`/postComment/${oneComment.id}`, {
      id: oneComment.id,
      comment: editedComment.value
    });
    console.log("editedComment.value:" +  editedComment.value)
    console.log(response.data);
    // 更新前端数据
    const postIndex = postList.value.findIndex(post => post.comments.some(comment => comment.id === oneComment.id));
    if (postIndex !== -1) {
      const commentIndex = postList.value[postIndex].comments.findIndex(comment => comment.id === oneComment.id);
      if (commentIndex !== -1) {
        postList.value[postIndex].comments[commentIndex].comment = editedComment.value;
      }
    }
    // 重置编辑状态
    editingCommentId.value = null;
    editedComment.value = '';
    message.success('成功更新評論');
  } catch (error) {
    console.error('更新評論失敗', error);
    message.error('更新評論失敗');
  }
}

async function deleteComment(oneComment, postId) {
  if (window.confirm("確定要刪除嗎")) {
    try {
      await axios.delete(`/postComment/${oneComment.id}`)

      // 如果找到了Post（即 postIndex 不等於 -1），則使用 filter 方法從該Post的評論列表中移除被刪除的評論。
      const postIndex = postList.value.findIndex(post => post.id === postId)
      console.log(postIndex)
      if (postIndex !== -1) {
        postList.value[postIndex].comments = postList.value[postIndex].comments.filter(comment => comment.id !== oneComment.id)
        console.log(postList.value)
      }
      message.success('評論已成功刪除')
    } catch (error) {
      message.error("刪除評論時發生錯誤:")
      console.error("刪除評論時發生錯誤:", error)
    }
  }
}






//格式化時間
function formatDate(dateString) {
  if (!dateString) return '無效日期'; // 提供默認值或處理無效情況
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '無效日期'; // 檢查日期是否有效
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    weekday: 'long',
    timeZone: 'Asia/Taipei' // 可根據需要調整時區
  };
  return new Intl.DateTimeFormat('zh-TW', options).format(date);
}

//取得動態牆用戶資訊
function callFind() {
  isLoading.value = true;
  Promise.all([
    axios.get(`/user/secure/${viewingUserId.value}`),
    axios.get(`/user/secure/profile-photo/${viewingUserId.value}`)
  ]).then(([userResponse, photoResponse]) => {
    // 處理用戶數據
    userData.value = userResponse.data;
    // 處理照片數據
    photo.value = photoResponse.data;
  }).catch((error) => {
    console.log("error", error);
  }).finally(() => {
    isLoading.value = false;
  });
}

const customRequest = ({file, onFinish, onError}) => {
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

async function submitNewPost() {
  try {
    const postResponse = await axios.post('/userPost', {
      content: newPostContent.value,
      user: {
        id: userId
      }
    })
    const postId = postResponse.data.id

    for(const file of fileList.value) {
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('postId', postId)

      await axios.post('/postPhoto', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }
    message.success('貼文發布成功');
    newPostContent.value = '';
    fileList.value = [];
    if(upload.value) {
      upload.value.clear()
    }
    // 重新加載貼文列表
    await showUserPostList();
  } catch(error) {
    console.error('發布貼文失敗', error);
    message.error('發布貼文失敗');
  }
}


//好友邀請回應的dropdown
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

//取得好友狀態，初始化時用
async function fetchFriendStatus() {
  try {
    const response = await axios.get(`/friend/friend-status/${currentUserId.value}/${viewingUserId.value}`);
    friendStatus.value = response.data.status;
    console.log("好友狀態:", friendStatus.value);
  } catch (error) {
    console.error("獲取好友狀態時出錯:", error);
    friendStatus.value = 'not_friend'; // 設置默認狀態
  }
}

const switchFriendStatus = async () => {
  try {
    const response = await axios.get(`/friend/switch-status/${currentUserId.value}/${viewingUserId.value}`);
    friendStatus.value = response.data.status;
  } catch (error) {
    console.error('切換好友狀態時出錯:', error);
  }
};

const acceptFriendRequest = async () => {
  try {
    await axios.get(`/friend/switch-status/${currentUserId.value}/${viewingUserId.value}`);
    friendStatus.value = 'friends';
  } catch (error) {
    console.error('接受好友請求時出錯:', error);
  }
};

const declineFriendRequest = async () => {
  try {
    await axios.get(`/friend/decline-request/${currentUserId.value}/${viewingUserId.value}`);
    friendStatus.value = 'not_friend';
  } catch (error) {
    console.error('拒絕好友請求時出錯:', error);
  }
};


</script>
<style scoped>
/* 全局变量定义 */
:root {
  --primary-pink: #FFB6C1;
  --secondary-pink: #FFC0CB;
  --light-pink: #FFF0F5;
  --very-light-pink: #FFFAFB;
  --dark-pink: #FF69B4;
  --text-color: #333;
  --background-color: #FFE4E1;
}

/* 整体页面样式 */
.user-post-page {
  width: 100%;
  background-color: var(--background-color);
  color: var(--text-color);
  font-family: 'Arial', sans-serif;
}

/* 标题样式 */
h2 {
  color: #97715B;
  text-align: center;
  margin: 30px 0;
  font-size: 2.5em;
}

/* 页面容器 */
.page-container {
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #FFF5EE; /* 淺蜜桃色 */
  border-radius: 10px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
  margin-bottom: 50px
}

/* 左侧部分 */
.left-section {
  width: 250px;
  padding-right: 20px;
  border-right: 1px solid var(--primary-pink);
  /* background-color: #FFF0F5; 淺粉紅色,比 page-container 稍深 */
  border-radius: 10px 0 0 10px;
}

/* 主内容区 */
.main-content {
  flex: 1;
  padding-left: 20px;
  background-color: #FFF5EE; /* 純白色 */
  border-radius: 0 10px 10px 0;
}

/* 帖子项目样式 */
.item {
  background-color: #FFFFFF;
  border: 30px solid var(--primary-pink);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  padding: 25px;
  position: relative;
  transition: all 0.3s ease;
}

.item:hover {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

/* 貼文頭部樣式 */
.post-header {
  border-bottom: 1px solid var(--light-pink);

}

.post-date {
  font-size: 0.9em;
  color: #888;
}


post-author {
  font-weight: bold;
  color: var(--dark-pink);
  font-size: 1.1em;
  margin-top: 5px;
}

/* Post 內容樣式 */
.formatted-content {
  background-color: var(--very-light-pink);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
}

/* 点赞部分 */
.post-like,
.comment-like {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 1.1em; /* 增加字體大小 */
}

.post-like .font-awesome-icon,
.comment-like .font-awesome-icon {
  font-size: 1.2em; /* 增加圖標大小 */
}

/* 點讚部分樣式 */
.post-like {
  background-color: var(--very-light-pink);
  border-radius: 8px;
  padding: 10px;
}

/* 評論區樣式 */
.comments-section {
  background-color: var(--light-pink);
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
}

.comment {
  background-color: #FFFFFF;
  border: 1px solid var(--primary-pink);
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
}

.comment:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.btn {
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  font-size: 1.1em;
}

.btn-outline-secondary {
  color: #97715B;
  border: 1px solid #97715B;
  background-color: transparent;
}

.btn-outline-secondary:hover {
  background-color: #97715B;
  color: white;
}

.btn-outline-danger {
  color: #dc3545;
  border: 1px solid #dc3545;
  background-color: transparent;
}

.btn-outline-danger:hover {
  background-color: #dc3545;
  color: white;
}

/* 链接样式 */
.a-link {
  cursor: pointer;
  color: #97715B;
  text-decoration: none;
  transition: color 0.3s ease;
}

.a-link:hover {
  color: var(--dark-pink);
}

/* 用户头像 */
.avatar-container,
.default-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--secondary-pink);
}

.avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  color: white;
  background-color: var(--primary-pink);
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

/* 圖片輪播樣式 */
.n-carousel {
  background-color: var(--light-pink);
  border-radius: 8px;
  padding: 10px;
}

.image {
  width: auto;
  height: 200px;
  object-fit: contain;
  border-radius: 8px;
  margin-top: 10px;
}

/* Naive UI 组件样式覆盖 */
:deep(.n-button) {
  background-color: #F3D2A8;
  border-color: #F3D2A8;
  color: #97715B;
}

:deep(.n-button:hover) {
  background-color: #EEC48D;
  border-color: #EEC48D;
}

:deep(.n-button--default) {
  background-color: var(--secondary-pink);
  border-color: var(--secondary-pink);
  color: var(--text-color);
}

:deep(.n-button--default:hover) {
  background-color: var(--primary-pink);
  border-color: var(--primary-pink);
}

:deep(.n-input) {
  border-color: var(--primary-pink);
}

:deep(.n-input:focus) {
  border-color: var(--dark-pink);
  box-shadow: 0 0 0 2px rgba(255, 105, 180, 0.2);
}

:deep(.n-image) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .page-container {
    flex-direction: column;
  }



  .main-content {
    padding-left: 0;
  }
}

@media (max-width: 768px) {
  .btn {
    font-size: 0.9em;
    padding: 6px 12px;
  }

  h2 {
    font-size: 2em;
  }
}

@media (max-width: 480px) {
  .item {
    padding: 15px;
  }

  .avatar-container,
  .default-avatar {
    width: 50px;
    height: 50px;
  }
}

.n-carousel {
  background-color: #FFF5EE; /* 非常淺的粉紅色 */
  padding: 10px;
  border-radius: 8px;
}

.comments-section {
  background-color: #FFF5EE; /* 淺蜜桃色 */
  padding: 15px;
  border-radius: 8px;
  margin-top: 20px;
}

/* 2. onePost的按鈕調整 */
.post-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
}

.post-actions .btn {
  padding: 5px 10px;
  font-size: 0.8em;
  margin: 2px
}

/* 確保.item有相對定位 */
.item {
  position: relative;
  white-space: pre-wrap;
  /* 其他現有樣式保持不變 */
}

/* 3. oneComment的按鈕調整 */
.comment {
  border: 1px solid #FFB6C1; /* 淺粉色邊框 */
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  background-color: #FFFFFF; /* 白色背景 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* 輕微陰影效果 */
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.comment-content {
  flex: 1;
}

.comment-actions {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-left: 10px;
}

.comment-actions .btn,
.comment-actions .n-button {
  padding: 3px 8px;
  font-size: 0.8em;
}

/* 調整評論內容的佈局 */
.comment-text {
  margin-top: 5px;
  margin-bottom: 5px;
}

.comment-date {
  font-size: 0.8em;
  color: #666;
}

.comment-user {
  font-weight: bold;
  color: #FF69B4; /* 使用深粉色 */
}

/* 創建貼文部分樣式 */
.create-post-section {
  background-color: white;
  border: 2px dashed var(--primary-pink);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  padding: 25px;
}

/* 使用者頭貼樣式 */
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-avatar, .default-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
}

.default-avatar {
  background-color: var(--primary-pink);
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.comment-user {
  display: flex;
  align-items: center;
}

.comment-user .user-avatar,
.comment-user .default-avatar {
  width: 25px;
  height: 25px;
  margin-right: 8px;
}

.left-section .user-avatar {
  width: 80px;  /* 調整為更大的尺寸 */
  height: 80px; /* 調整為更大的尺寸 */
  margin-right: 15px;
}

.left-section .avatar-container,
.left-section .default-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
}

.left-section .avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.left-section .default-avatar {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32px; /* 調整字體大小 */
  font-weight: bold;
  color: white;
  background-color: var(--primary-pink);
}

/* 用戶資料區域樣式 */
.left-section .user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.left-section .flex-grow-1 {
  flex-grow: 1;
}

.left-section h5 {
  margin-bottom: 5px;
  font-size: 1.2em;
  color: var(--dark-pink);
}

/* 調整按鈕樣式 */
.left-section .btn-outline-secondary {
  font-size: 0.9em;
  padding: 5px 10px;
}
.aboutme{
  white-space: pre-wrap;
  text-align: center;
}
</style>