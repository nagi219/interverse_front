<template>
        <div class="admin-theme full-height">
        <div class="ts-breadcrumb is-stepped is-divided" style="justify-content: center;">
            <h3 class="item">訂單資訊</h3>
        </div>
        <div class="cart-container has-top-spaced">
            <div class="cart-list">
                <div class="ts-box">
                    <table class="ts-table">
                        <thead>
                            <tr class="tr">
                                <th>訂單編號</th>
                                <th>狀態</th>
                                <th>付款方式</th>
                                <th>總金額</th>
                                <th>確認訂單</th>
                                <th>詳細資料</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(OrderByStatus, index) in OrdersByStatus" :key="OrdersByStatus.id">
                                <td>{{ OrderByStatus.id }}</td>
                                <td>{{ getStatus(OrderByStatus.status) }}</td>
                                <td>{{ getPaymentMethod(OrderByStatus.paymentMethod) }}</td>
                                <td>{{ OrderByStatus.totalAmount }}</td>
                                <td>
                                    <button 
                                        type="button" 
                                        class="btn btn-primary cancelbtn" 
                                        @click="corfirm(OrderByStatus.id,4)">
                                        確認訂單取消 
                                    </button>
                                </td>
                                <td>
                                    <button type="button" class="btn btn-primary detailbtn" @click="openModal(OrderByStatus.orderDetails)">詳細資料</button>
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
    
<script setup >
    import { ref, onMounted } from 'vue';
    import axiosapi from '@/plugins/axios';
    import useUserStore from '@/stores/userstore';
    import OrderModal from '@/components/Order/OrderModal.vue';
    

    const userStore = useUserStore();
    const OrdersByStatus = ref([]);
    const orderModalRef = ref(null);
    const selectedOrder = ref({});



    onMounted(function () {
    console.log("onMounted UserId", userStore.userId);
    getAllOrdersByStatus(3);
});

    function getAllOrdersByStatus(status){
        axiosapi.get(`/api/orders/status/${status}`).then(function (response) {
        console.log("responseUserOrdersStarus", response.data);
        OrdersByStatus.value = response.data;
    })

    }

    // method:1:linePay 2:貨到付款
function getPaymentMethod(method) {
    switch (method) {
        case 1: return 'LinePay';
        case 2: return '貨到付款';
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

function openModal(order){
    selectedOrder.value = order
    console.log("modal傳過來的",order);
    orderModalRef.value.showModal();
}


function corfirm(id,status){
    console.log("改狀態摟" ,id);
    console.log("改狀態摟" ,status);
    axiosapi.put(`/api/orders/${id}/status`,null,{
        params: {
            newStatus: status
        }
    }).then(function (response){
        getAllOrdersByStatus(3);
    })
}
</script>


    
<style scoped> 
    .cancelbtn {
    margin-right: 10px;
    background-color: var(--primary-color);
    color: white;
}

/* .cancelbtn:active {
    background-color: var(--primary-color);
    color: white;
} */

.ts-table :is(thead,tfoot) tr :is(th,td) {
    background:var( --background-color);
    color: #6B5147;
    padding: 20px;
    font-size: 15px;
}

.detailbtn:active {
    background-color:var( --background-color) ;
}

tbody{
    background-color:var( --secondary-color) ;
}

.full-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

</style>