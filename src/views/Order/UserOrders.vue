<template>
    <div>
        <div class="ts-breadcrumb is-stepped is-divided" style="justify-content: center;">
            <h3 class="item">訂單資訊</h3>
        </div>
        <div class="cart-container has-top-spaced">
            <div class="cart-list">
                <div class="ts-box">
                    <table class="ts-table">
                        <thead>
                            <tr>
                                <th>訂單編號</th>
                                <th>狀態</th>
                                <th>付款</th>
                                <th>總金額</th>
                                <th>取消</th>
                                <th>詳細資料</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(userOrder, index) in userOrders" :key="userOrder.id">
                                <td>{{ userOrder.id }}</td>
                                <td>{{ getStatus(userOrder.status) }}</td>
                                <td>{{ getPaymentMethod(userOrder.paymentMethod) }}</td>
                                <td>{{ userOrder.totalAmount }}</td>
                                <td>
                                    <button 
                                        v-if="userOrder.status !== 3 && userOrder.status !== 4"
                                        type="button" 
                                        class="btn cancelbtn" 
                                        @click="cancelOrder(userOrder.id,3)"
                                    >
                                        取消訂單
                                    </button>
                                </td>
                                <td>
                                    <button type="button" class="btn btn-primary" @click="openModal(userOrder.orderDetails)">詳細資料</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <OrderModal
    ref="orderModalRef"
    v-model:order="selectedOrder">
    </OrderModal>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axiosapi from '@/plugins/axios';
import useUserStore from '@/stores/userstore';
import OrderModal from '@/components/Order/OrderModal.vue';
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();
const userStore = useUserStore();
const userOrders = ref([]);
const orderModalRef = ref(null);
const selectedOrder = ref({});

onMounted(function () {
    console.log("onMounted UserId", userStore.userId);
    getAllOrdersByUser(userStore.userId);
    cartStore.initializeCartCount();
});

function getAllOrdersByUser(id) {
    axiosapi.get(`/api/orders/user/${id}`).then(function (response) {
        console.log("responseUserOrders1", response.data);
        userOrders.value = response.data;
    })
}

function fetchOrders() {
    getAllOrdersByUser(userStore.userId);
}


// method:1:linePay 2:貨到付款
function getPaymentMethod(method) {
    switch (method) {
        case 1: return 'LinePay';
        case 2: return '貨到付款';
        case 3: return 'PayPal';
        default: return '未知付款方式';
    }
}
//status :1:已付款等待發貨 2:等待確認中 3:已申請取消待確認 4.確認取消訂單
function getStatus(status) {
    switch (status) {
        case 1: return '已付款等待發貨';
        case 2: return '等待確認中';
        case 3: return '已申請取消待確認';
        case 4: return '確認取消訂單';
        default: return '未知狀態';
    }
}

function cancelOrder(id,status){
    console.log("改狀態摟" ,id);
    console.log("改狀態摟" ,status);
    axiosapi.put(`/api/orders/${id}/status`,null,{
        params: {
            newStatus: status
        }
    }).then(function (response){
        fetchOrders();
    })
}

function openModal(order){
    selectedOrder.value = order
    console.log("modal傳過來的",order);
    orderModalRef.value.showModal();
}
</script>

<style scoped>
.ts-breadcrumb.is-stepped.is-divided {
  background-color: var( --background-color) ;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.ts-breadcrumb .item {
  /* background-color: rgb(252, 177, 177); */
  color: #FFFFFF;
  font-weight: 700;
}

.btn-primary {
  margin-right: 10px;
}

.btn-primary:active {
    background-color: var( --background-color);
}

.cancelbtn {
    margin-right: 10px;
    background-color: var(--secondary-color);
    color: white;
}

.cancelbtn:active {
    background-color: var(--secondary-color);
    color: white;
}
</style>