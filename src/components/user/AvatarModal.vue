<template>
  <div class="modal-backdrop" @click="$emit('close')"></div>
  <div class="modal" @click.self="closeModal">
    <div class="modal-dialog modal-zoom">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">會員詳細資訊</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body text-center">
          <div v-if="friend.photo" class="friend-photo mb-3">
            <img
              :src="friend.photo"
              :alt="friend.nickname || 'Friend'"
              width="140"
              height="140"
              class="rounded-circle"
            />
          </div>
          <div v-else class="friend-photo default-avatar mb-3">
            {{ (friend.accountNumber || "無").charAt(0).toUpperCase() }}
          </div>
          <h3 class="media-heading">
            {{ friend.nickname || "無" }}
          </h3>
          <span class="badge rounded-pill text-bg-primary badge-margin">
            <font-awesome-icon :icon="['fas', 'location-dot']" />
            {{ friend.country || "未知" }} , {{ friend.city || "未知" }}
          </span>
          <span class="badge rounded-pill text-bg-primary badge-margin">
            <font-awesome-icon :icon="['fas', 'cake-candles']" />
            {{ friend.age || "0" }}歲
          </span>
          <span class="badge rounded-pill text-bg-primary badge-margin">
            <font-awesome-icon :icon="['fas', 'venus-mars']" />
            {{ friend.gender || "未知" }}
          </span>
          <hr />
          <p class="text-left">
            <strong>個人簡介: </strong><br />{{ friend.bio || "無" }}
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="navigateToUserPost">
            前往 @ {{ friend.accountNumber }} 的個人首頁
          </button>
          <button type="button" class="btn btn-secondary" @click="$emit('close')">
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const props = defineProps({
  friend: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const emit = defineEmits(['close']);

const navigateToUserPost = () => {
  router.push({
    name: 'user-post-link',
    params: { id: props.friend.id }
  });
  emit('close');
};

const closeModal = (event) => {
  // 確保點擊的是modal背景或modal本身,而不是modal內容
  if (event.target.classList.contains('modal-backdrop') || event.target.classList.contains('modal')) {
    emit('close');
  }
};

</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  display: block;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  overflow-x: hidden;
  overflow-y: auto;
}
/* 使 modal 居中对齐 */
.modal-dialog {
  margin: 10% auto;
  max-width: 500px;
}
/* 定义放大动画 */
@keyframes zoomIn {
  0% {
    transform: scale(0.7);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 应用动画到 modal */
.modal-zoom {
  animation: zoomIn 0.4s ease forwards;
  transform-origin: center center;
}

.friend-photo {
  width: 140px;
  height: 140px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
}

.friend-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-avatar {
  background-color: var(--secondary-color);
  color: var(--text-color);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 60px;
  font-weight: bold;
}

.badge-margin {
  margin-right: 8px;
}
</style>