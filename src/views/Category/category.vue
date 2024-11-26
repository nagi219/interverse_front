<template>
    <div class="category-management  admin-theme full-height" >
      <h3 class="main-title">分類管理</h3>
      
      <!-- 新增分類表單 -->
      <form @submit.prevent="addCategory" class="add-category-form">
        <div class="input-group">
          <input v-model="newCategory" placeholder="輸入新分類名稱" required style="margin-right: 10px;">  
          <button type="submit" class="add-button">新增分類</button>
        </div>
      </form>
      <br>
      <!-- 分類列表 -->
      <table class="category-table">
        <thead>
          <tr>
            <th>分類名稱</th>
            <th style="text-align: center;">
              修改 / 刪除
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in paginatedCategories" :key="category.id">
            <td>
              <div v-if="editingId === category.id" class="edit-input">
                <input v-model="editingName" @keyup.enter="updateCategory(category.id)">
              </div>
              <span v-else>{{ category.name }}</span>
            </td>
            <td class="operation-column">
              <button v-if="editingId === category.id" @click="updateCategory(category.id)" class="edit-button" >
                <span class="ts-icon is-floppy-disk-icon"></span>
              </button>
              <button v-else @click="startEditing(category)" class="edit-button">
                <span class="ts-icon is-pen-to-square-icon"></span>
              </button>
              <button @click="deleteCategory(category.id)" class="delete-button">
                <span class="ts-icon is-trash-can-icon"></span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <!-- 分頁 -->
      <!-- <Paginate
      v-model="currentPage"
      :page-count="pageCount"
      :page-range="3"
      :margin-pages="1"
      :click-handler="handlePageChange"
      :prev-text="'上一頁'"
      :next-text="'下一頁'"
      :container-class="'pagination'"
      :page-class="'page-item'"
      :page-link-class="'page-link'"
      :prev-class="'page-item'"
      :prev-link-class="'page-link'"
      :next-class="'page-item'"
      :next-link-class="'page-link'"
      :active-class="'active'"
    /> -->
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import axiosapi from '@/plugins/axios';
  import Paginate from 'vuejs-paginate-next';
  import Swal from 'sweetalert2';
  import { useRouter } from 'vue-router';
  
  const router = useRouter();
  
  const categories = ref([]);
  const newCategory = ref('');
  const editingId = ref(null);
  const editingName = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 8;
  
  onMounted(async () => {
    await fetchCategories();
  });
  
  // 分頁
  const paginatedCategories = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return categories.value.slice(start, end);
  });
  
  function getPageCount() {
    return Math.ceil(categories.value.length / itemsPerPage);
  }
  
  function handlePageChange(page) {
    currentPage.value = page;
  }
  
  // 分類操作
  async function fetchCategories() {
    try {
      const response = await axiosapi.get('/categories');
      categories.value = response.data;
    } catch (error) {
      handleApiError(error, '獲取分類失敗');
    }
  }
  
  async function addCategory() {
    try {
      await axiosapi.post('/categories', { name: newCategory.value });
      newCategory.value = '';
      await fetchCategories();
      Swal.fire({
        title: '成功！',
        text: '新增成功！',
        icon: 'success',
        confirmButtonColor: '#85614D  ',
        confirmButtonText: '確認'
      });
    } catch (error) {
      handleApiError(error, '新增失敗，請重試。');
    }
  }
  
  function startEditing(category) {
    editingId.value = category.id;
    editingName.value = category.name;
  }
  
  async function updateCategory(id) {
    try {
      await axiosapi.put(`/categories/${id}`, { name: editingName.value });
      editingId.value = null;
      await fetchCategories();
      Swal.fire({
        title: '成功！',
        text: '修改成功！',
        icon: 'success',
        confirmButtonColor: '#85614D',
        confirmButtonText: '確認'
      });
    } catch (error) {
      handleApiError(error, '修改失敗，請重試。');
    }
  }
  
  async function deleteCategory(id) {
    const result = await Swal.fire({
      title: '確定要刪除這個分類嗎？',
      text: "此操作無法撤銷！",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#85614D',
      cancelButtonColor: '#9e9e9e',
      confirmButtonText: '是的，刪除它！',
      cancelButtonText: '取消'
    });
  
    if (result.isConfirmed) {
      try {
        await axiosapi.delete(`/categories/${id}`);
        await fetchCategories();
        Swal.fire({
          title: '成功！',
          text: '刪除成功！',
          icon: 'success',
          confirmButtonColor: '#85614D',
          confirmButtonText: '確認'
        });
      } catch (error) {
        handleApiError(error, '刪除分類失敗');
      }
    }
  }
  
  function handleApiError(error, defaultMessage) {
    console.error('API Error:', error);
    let errorMessage = defaultMessage;
  
    if (error.response) {
      if (error.response.status === 403) {
        errorMessage = '您沒有權限執行此操作';
        router.push('/secure/login');
      } else if (error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
    }
  
    Swal.fire({
      title: '錯誤',
      text: errorMessage,
      icon: 'error',
      confirmButtonColor: '#B197FC',
      confirmButtonText: '確認'
    });
  }
  </script>
  
  <style scoped>
.category-management {
  background-color:"#DECEBF"; /* 極淡的紫羅蘭色背景*/
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(177, 151, 252, 0.2);
}

.main-title {
  text-align: center;
  color: #85614D; /* 主色 */
  margin-bottom: 20px;
  font-weight: bold;
}

.add-category-form {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
}

.input-group input {
  flex-grow: 1;
  padding: 10px;
  border: 1px solid #85614D; /* 主色邊框 */
  border-radius: 5px 0 0 5px;
  color: #3A3042; /* 文字顏色 */
  background-color: var(--background-color);
}

.add-button {
  background-color:  #85614D; /* 對比色按鈕 */
  color: white; /* 文字顏色 */
  border: none;
  padding: 10px 20px;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  font-weight: bold;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.category-table th, .category-table td {
  border: 1px solid  var(--border-color); /* 主色邊框 */
  padding: 10px;
  color: #3A3042; /* 文字顏色 */
}

.category-table th {
  background-color: #85614D; /* 主色表頭 */
  color: white;
}

.category-name-column {
  text-align: left;
  width: 70%;
}

.operation-column {
  text-align: center;
  width: 30%;
}

.operation-label {
  font-size: 0.8em;
  color: var(--secondary-color); /* 輔色標籤 */
  margin-top: 5px;
}

.operation-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 5px;
}

.edit-button, .delete-button {
  color: #85614D;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  margin: 1.5px;
  font-size: 21px;
}

.delete-button {
  color: #85614D; /* 文字顏色 */
}

.pagination {
  display: flex;
  justify-content: center;
  list-style-type: none;
  padding: 0;
}

.page-item {
  margin: 0 5px;
  padding: 5px 10px;
  border: 1px solid #85614D; /* 主色邊框 */
  cursor: pointer;
  border-radius: 5px;
  color: #85614D; /* 主色文字 */
}

.page-item.active {
  background-color: #85614D; /* 主色活動頁 */
  color: white;
}

/* 懸停效果 */
.add-button:hover, .edit-button:hover, .delete-button:hover, .page-item:hover {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

/* 輸入框焦點效果 */
.input-group input:focus {
  outline: none;
  box-shadow: 0 0 0 2px #85614D;
}

/* 按鈕焦點效果 */
.add-button:focus, .edit-button:focus, .delete-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(177, 151, 252, 0.5);
}
.full-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>