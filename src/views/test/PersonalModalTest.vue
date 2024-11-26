<template>
    <div class="container">
      <div class="well text-center">
        <!-- 头像和触发按钮 -->
        <img
          src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRbezqZpEuwGSvitKy3wrwnth5kysKdRqBW54cAszm_wiutku3R"
          alt="aboutme"
          width="140"
          height="140"
          class="rounded-circle"
          @click="showModal = true"
          style="cursor: pointer"
        />
        <h3>nickname</h3>
      </div>
  
      <!-- Modal -->
      <div
        class="modal fade"
        tabindex="-1"
        :class="{ show: showModal }"
        :style="{ display: showModal ? 'block' : 'none' }"
        @click.self="showModal = false"
      >
        <div class="modal-dialog modal-zoom">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">會員詳細資訊</h5>
              <button type="button" class="btn-close" @click="showModal = false"></button>
            </div>
            <div class="modal-body text-center">
              <img
                src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRbezqZpEuwGSvitKy3wrwnth5kysKdRqBW54cAszm_wiutku3R"
                alt="aboutme"
                width="140"
                height="140"
                class="rounded-circle mb-3"
              />
              <h3 class="media-heading">nickname</h3>
              <span class="badge rounded-pill text-bg-primary badge-margin"><font-awesome-icon :icon="['fas', 'location-dot']" /> 美國</span>
              <span class="badge rounded-pill text-bg-primary badge-margin"><font-awesome-icon :icon="['fas', 'cake-candles']" /> 27歲</span>
              <span class="badge rounded-pill text-bg-primary badge-margin"><font-awesome-icon :icon="['fas', 'venus-mars']" /> 女</span>
              <hr />
              <p class="text-left"><strong>Bio: </strong><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sem dui, tempor sit amet commodo a, vulputate vel tellus.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showModal = false">
                I've heard enough about Joe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  const showModal = ref(false);

  </script>
  
  <style scoped>
  /* 使 modal 居中对齐 */
  .modal-dialog {
    margin-top: 10%;
  }
  
  /* 修复 Bootstrap 样式冲突 */
  .modal.show {
    display: block !important;
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
  
  /* 移除遮罩背景的默认样式 */
  .modal-backdrop {
    display: none;
  }

  .badge-margin {
  margin-right: 8px; /* 可根据需要调整 */
}
  </style>
  