<template>
    <div class="product-management  admin-theme full-height">
    <h3 class="main-title">商品管理</h3>
    <div class="control-panel">
      <button type="button" class="ts-button is-primary" @click="openModal('insert')">開啟新增</button>
      <input type="text" class="ts-input" placeholder="請輸入產品名稱">
      <select class="ts-select" style="color: saddlebrown; border: 1px solid saddlebrown;">
        <option disabled selected >選擇類別</option>
        <!-- 添加類別選項 -->
      </select>
    </div>
        <!-- <div class="col-4">
            下拉選單元件
        </div> -->
        <!-- <br> -->
        
        <div class="pagination-container">
            <!-- 分頁組件 -->
        </div>
        
        <div class="product-grid">
            <div v-for="product in products" :key="product.id" class="product-item">
                <ProductCard 
                :product="product" 
                @delete="callRemove(product.id)" 
                @open-update="openModal"
                />
            </div>
        </div>
        <ProductModal
        ref="productModal"
        v-model:product="product" 
        :categories="categories"
        :is-show-button-insert="isShowButtonInsert" 
        :is-show-category="isShowCategory"
        @insert="callCreate" 
        @update="callModify"
        @fileUpload="handleFileUpload"
        />
    </div>
    </template>

<script setup>
import { ref, onMounted } from 'vue';
import axiosapi from '@/plugins/axios';
import ProductCard from '@/components/Product/ProductCard.vue';
const products = ref([]);//用AJAX接收進來的全部資料 
const categories = ref([]);//接資料進來
const fileObject = ref(null);

//進入頁面先做的事情start 把所以種類讀進來
onMounted(function () {
    getAllProducts()
    getAllCategories()
});
function getAllProducts() {
    axiosapi.get(`/products`).then(function (response) {
        console.log("response", response)
        products.value = response.data

    })
}
function getAllCategories() {
    axiosapi.get(`/categories`).then(function (response) {
        console.log("response", response)
        categories.value = response.data
    })
}

//進入頁面先做的事情end



//Modal start
import ProductModal from '@/components/Product/ProductModal.vue';
const product = ref({});
const category = ref({});//新增或修改時拿來存category的
const productModal = ref(null);//v-model雙向資料綁定的對象 控制開關
const isShowButtonInsert = ref(true);
const isShowCategory = ref(true);

function openModal(action, id) {
    console.log("openModal", action, id)
    if (action === "insert") {
        isShowButtonInsert.value = true;
        isShowCategory.value =true;
        product.value = ({});
    } else {
        isShowButtonInsert.value = false;
        isShowCategory.value =false;
        //有多拿到一個id參數 要做findbyid
        axiosapi.get(`/products/${id}`).then(function (response) {
            console.log("response", response)
            product.value =    {  id:response.data.id,
                                name:response.data.name,
                                description:response.data.description,
                                color:response.data.color,
                                price:response.data.price
                                };
            console.log("responseProduct", product.value);

        })
    }
    productModal.value.showModal();
}
//Modal end

//新增
function callCreate() {
    console.log("callCreate", product.value);
    console.log("callCreate", product.value.category);
    axiosapi.get(`/categories/${product.value.category}`).then(function (response) {
        console.log("response", response)
        category.value = {
            id: response.data.id,
            name: response.data.name
        };
        let request = {
            "name": product.value.name,
            "description": product.value.description,
            "color": product.value.color,
            "price": product.value.price,
            "categories": category.value
        };

        return axiosapi.post("/products", request);
    }).then(function (productResponse) {
        console.log("Product created", productResponse);
        if (fileObject.value) {
            const formData = new FormData();
            formData.append('file', fileObject.value);
            formData.append('productId', productResponse.data.id);

            return axiosapi.post("/api/product-photos", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
        return Promise.resolve();
    }).then(() => {
        getAllProducts(); // Call getAllProducts after creating the product
        productModal.value.hideModal();
    }).catch(error => {
        console.error("Error in callCreate:", error);
    });
}

// 處理文件选择
function handleFileUpload(event) {
    console.log("file",event)
    fileObject.value = event;
}

//修改

function callModify() {
    console.log("callModify", product.value);
    console.log("callModify", product.value.id);

    let request = {
        "name": product.value.name,
        "description": product.value.description,
        "color": product.value.color,
        "price": product.value.price
    };
    axiosapi.put(`/products/${product.value.id}`, request).then(function(response) {
        console.log("Product modify", response);
        if (fileObject.value) {
            const formData = new FormData();
            formData.append('file', fileObject.value);
            formData.append('productId', response.data.id);

            return axiosapi.post("/api/product-photos", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
        return Promise.resolve();
    }).then(() => {
        getAllProducts(); // Call getAllProducts after modifying the product
        productModal.value.hideModal();
    }).catch(error => {
        console.error("Error in callModify:", error);
    });
}

//刪除
function callRemove(id){
    console.log("callRemove",id);
    axiosapi.delete(`/products/${id}`).then(function(response){
        getAllProducts(); // Call getAllProducts after removing the product
    }).catch(error => {
        console.error("Error in callRemove:", error);
    });
}

//重新導頁面的function 之後要加在新增刪除修改後面



</script>

<style scoped>
.product-management {
  padding: 20px;
  background-color:"#DECEBF"; 
}

.main-title {
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 20px;
}

.control-panel {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.ts-input, .ts-select {
  flex: 1;
  background-color: var(--background-color);
}

.pagination-container {
  margin: 20px 0;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.3s ease;
}

.product-item:hover {
    box-shadow: 0 4px 15px rgba(133, 97, 77, 0.2);
}

.full-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .control-panel {
    flex-direction: column;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>