<template>
    <div class="ts-app-layout is-fullscreen is-vertical">
      <div class="cell is-secondary is-fluid is-scrollable">
        <div class="ts-container has-vertically-spaced-large">
          <div class="ts-grid is-relaxed">
            <!-- Sidebar -->
            <div class="column is-4-wide">
              <div style="position: sticky; top: 1rem">
                <!-- Sidebar content -->
                <div class="ts-divider is-section"></div>
                <div class="ts-wrap is-middle-aligned">
                  <div class="ts-image is-circular">
                    <img src="./../assets/images/user.png" width="32" />
                  </div>
                  <div class="ts-text is-heavy">{{ userNickname }}</div>
                </div>
                <div class="ts-divider is-section"></div>
                <!-- Menu items -->
                <div class="ts-menu is-start-icon is-separated">
                  <!-- Add your menu items here -->
                </div>
              </div>
            </div>
            
            <!-- Main content -->
            <div class="column is-12-wide">
              <!-- Post creation box -->
              <div class="ts-box">
                <!-- Add your post creation form here -->
              </div>
              
              <!-- Posts list -->
              <n-infinite-scroll style="height: 80%" :distance="10" @load="handleLoad">
                <div v-for="onePost in postList" :key="onePost.id" class="ts-box has-top-spaced">
                  <div class="ts-content">
                    <div class="ts-grid">
                      <div class="column">
                        <div class="ts-image is-circular">
                          <img src="./../assets/images/user.png" width="48" />
                        </div>
                      </div>
                      <div class="column is-fluid">
                        <div class="has-leading-small">
                          <div class="ts-text is-heavy">
                            <a @click="navigateToUserPost(onePost.user.id)" class="a-link">
                              {{ onePost.user.nickname }}
                            </a>
                          </div>
                          <div class="ts-meta is-small is-secondary">
                            <div class="item">
                              <span class="ts-icon is-earth-asia-icon is-end-spaced"></span>公開
                            </div>
                            <a href="#!" class="item">{{ formatDate(onePost.added) }}</a>
                          </div>
                        </div>
                        <div class="has-vertically-spaced-small">
                          <n-ellipsis expand-trigger="click" line-clamp="2" :tooltip="false" class="formatted-content">
                            <p>{{ onePost.content }}</p>
                          </n-ellipsis>
                        </div>
                        
                        <!-- Photos carousel -->
                        <n-carousel
                          v-if="onePost.photos && onePost.photos.length > 0"
                          direction="vertical"
                          dot-placement="right"
                          mousewheel
                          style="width: 100%; height: 240px"
                        >
                          <n-image
                            v-for="onePhoto in onePost.photos"
                            :key="onePhoto.id"
                            :src="onePhoto.base64Photo" 
                            :alt="onePhoto.name"
                            class="image"
                          />
                        </n-carousel>
                      </div>
                    </div>
                    
                    <!-- Post actions -->
                    <div class="ts-divider is-section"></div>
                    <div class="ts-grid is-evenly-divided">
                      <div class="column">
                        <button class="ts-button is-dense is-start-icon is-ghost is-fluid" @click="toggleLike(onePost)">
                          <span :class="['ts-icon', onePost.isLiked ? 'is-thumbs-up-icon' : 'is-thumbs-up-icon is-regular']"></span>
                          讚 {{ onePost.likeCount || 0 }}
                        </button>
                      </div>
                      <div class="column">
                        <button class="ts-button is-dense is-start-icon is-ghost is-fluid">
                          <span class="ts-icon is-comment-icon is-regular"></span>
                          留言
                        </button>
                      </div>
                      <div class="column">
                        <button class="ts-button is-dense is-start-icon is-ghost is-fluid">
                          <span class="ts-icon is-share-from-square-icon is-regular"></span>
                          分享
                        </button>
                      </div>
                    </div>
                    
                    <!-- Comments section -->
                    <div v-if="onePost.comments && onePost.comments.length > 0" class="comments-section">
                      <h6>評論區：</h6>
                      <div v-for="oneComment in onePost.comments" :key="oneComment.id" class="comment">
                        <!-- Comment content -->
                        <div class="comment-content">
                          <!-- ... (rest of the comment structure) ... -->
                        </div>
                        <!-- Comment actions -->
                        <div v-if="oneComment.userId !== null && oneComment.user.id == userStore.userId" class="comment-actions">
                          <!-- ... (comment action buttons) ... -->
                        </div>
                      </div>
                    </div>
                    
                    <!-- Comment input -->
                    <PostComment 
                      :postId="onePost.id" 
                      @comment-added="handleCommentAdded(onePost.id, $event)"
                    ></PostComment>
                  </div>
                </div>
              </n-infinite-scroll>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modals and other components -->
    <updatePostModal ref="updatePostModal" :post="selectedPost" @update:onePost="handlePostUpdate"></updatePostModal>
  </template>
  
    
<script setup>
    
    import {onMounted, ref, watch , computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from '@/plugins/axios';
import useUserStore from '@/stores/userstore';
import UpdatePostModal from "@/views/userPost/updatePostModal.vue";
import PostComment from "@/views/userPost/PostComment.vue";
import { useMessage } from 'naive-ui'


const userStore = useUserStore();
const userId = userStore.userId;
const userIdUrl = ref();
const route = useRoute();

const userNickname=userStore.nickname
//初始化
const updatePostModal =ref(null);
const selectedPost=ref(null)
const editingCommentId=ref(null)
const editedComment =ref(null)
const message=useMessage()
const router = useRouter();
const currentUserId = computed(() => userStore.userId);
const viewingUserId = ref(null);
const viewingUserName = ref('');

const postList = ref([])

function initializeViewingUserId() {
  viewingUserId.value = route.params.id || currentUserId.value;
  console.log("Initialized viewingUserId:", viewingUserId.value);
  console.log("Current logged in userId:", currentUserId.value);
  if (viewingUserId.value) {
    fetchUserName();
    showUserPostList();
  } else {
    console.error("viewingUserId is not set");
  }
}

onMounted(() => {
  initializeViewingUserId();
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
    await Promise.all(postList.value.map(post => fetchComments(post.id)));
    await checkLikeStatus();
  } catch (error) {
    console.error("Error fetching user posts:", error);
    message.error("Failed to fetch posts");
    postList.value = [];
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
        if(post.likeCount=null){
            post.likeCount=0;
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
function fetchComments(postId){
    axios.get(`/postComment/${postId}`)
    .then(response => {
        const postIndex = postList.value.findIndex(post => post.id=== postId);
        if(postIndex !==-1){
            postList.value[postIndex].comments = response.data
        }
    })
    .catch(error => {
        console.error(`Error fetching comments for post ${postId}:`, error);
    })
}

//渲染PostPhoto
// function fetchPhoto(postId){
//     axios.get(`/postPhoto/${postId}`)
//     .then(response=>  {
//         const postIndex = postList.value.findIndex(post => post.id === postId);
//         if(postIndex !== -1){
//             postList.value[postIndex].photos = response.data
//         }
//     })
//     .catch(error => {
//         console.error(`Error fetching photos for post ${postId}:`, error)
//     })
// }

//即時更新comment
function handleCommentAdded(postId, newComment){
    //在 postList 中尋找 ID 等於 postId 的貼文。findIndex 方法會返回該貼文在陣列中的索引。如果沒有找到，返回 -1    
    const postIndex = postList.value.findIndex(post => post.id === postId);
    // 如果找到了對應的貼文
    if(postIndex !== -1){
        // 如果該貼文尚未有留言，則初始化為空陣列
        if(!postList.value[postIndex].comments){
            postList.value[postIndex].comments=[]
        }
        // 更新留言後保留 user.nickname，如果 newComment.user 不存在，則使用預設的 userNickname
        newComment.user = newComment.user || {nickname: userNickname}
        // 將新留言添加到對應貼文的留言列表中
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
function updatePost(onePost){
    onePost.value={
            id : onePost.id,
            content : onePost.content,
        
        }
        selectedPost.value={...onePost}
        console.log(selectedPost.value)
    updatePostModal.value.showModal();
}

// 即時更新貼文
function handlePostUpdate(updatePost){
    const index = postList.value.findIndex(post => post.id=== updatePost.id);
    if(index !== -1){
        postList.value[index]=updatePost
    }
}

function deletePost(onePost){
    confirm("確定要刪除嗎");
    
    if(true){
        axios.delete(`/userPost/${onePost.id}`)
        .then(response=>{
            postList.value = postList.value.filter(post => post.id!==onePost.id)
            console.log(`Post with id ${onePost.id} deleted`)
            })
        .catch(error => {
            console.error("Error fetching user posts:", error);
        })
    }
}

function editComment(oneComment){
    editingCommentId.value = oneComment.id
    editedComment.value = oneComment.comment
}

function cancelEdit(){
    editingCommentId.value = null;
    editedComment.value = ''
}

async function saveComment(oneComment) {
    try{
        const response = await axios.put(`/postComment/${oneComment.id}`, {newComment:editedComment.value})
    //更新前端畫面
    oneComment.comment = editedComment.value

    //重置編輯狀態
    editingCommentId.value = null
    editedComment.value=''
    }catch(error){
        console.error('更新評論失敗', error)
        //可以添加錯誤處理邏輯 (顯示錯誤提示)
    }
}

async function deleteComment(oneComment, postId){
    if (window.confirm("確定要刪除嗎")){
        try{await axios.delete(`/postComment/${oneComment.id}`)

            // 如果找到了Post（即 postIndex 不等於 -1），則使用 filter 方法從該Post的評論列表中移除被刪除的評論。
            const postIndex = postList.value.findIndex(post => post.id === postId)
            console.log(postIndex)
            if(postIndex !== -1){
                postList.value[postIndex].comments= postList.value[postIndex].comments.filter(comment => comment.id !== oneComment.id)
                console.log(postList.value)
            }
            message.success('評論已成功刪除')
        }catch(error){
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


</script>
    
<style>
    
</style>