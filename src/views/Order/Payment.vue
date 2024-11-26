<template>
  <div class="payment-selection">
    <div class="payment-box">
      <div class="payment-header">
        <h3 class="main-title">選擇付款方式</h3>
      </div>
      <div class="payment-content">
        <div class="payment-options">
          <label class="payment-option">
            <input type="radio" name="payment" value="cod" v-model="selectedPayment" />
            貨到付款
          </label>
          <label class="payment-option">
            <input type="radio" name="payment" value="linepay" v-model="selectedPayment" />
            LinePay
          </label>
          <label class="payment-option">
            <input type="radio" name="payment" value="paypal" v-model="selectedPayment" />
            Paypal
          </label>
          <label class="payment-option">
            <input type="radio" name="payment" value="wallet" v-model="selectedPayment" />
            錢包扣款
          </label>
        </div>
      </div>
      <div class="payment-divider"></div>
      <div class="payment-footer">
        <button 
          class="checkout-button" 
          @click="proceedToCheckout"
          :disabled="!selectedPayment"
        >
          前往付款
        </button>
      </div>
    </div>
  </div>
</template>
  
<script setup>
import { onMounted, ref, watch } from 'vue';
import useUserStore from '@/stores/userstore';
import axiosapi from '@/plugins/axios';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';

const products = ref([]);
const total = ref(0);
const selectedPayment = ref('');
const order = ref({});
const status = ref(0);
const paymentMethod = ref(0);
const userStore = useUserStore();
const router = useRouter();

onMounted(() => {
  products.value = JSON.parse(localStorage.getItem('checkoutProducts') || '[]');
  total.value = Number(localStorage.getItem('checkoutTotal') || '0');
  console.log("userId", userStore.userId);
  console.log("物件", products.value);
  console.log("總金額", total.value);
});

watch(selectedPayment, (newValue) => {
  if (newValue === 'linepay') {
    status.value = 1;
    paymentMethod.value = 1;
  } else if (newValue === 'cod') {
    status.value = 2;
    paymentMethod.value = 2;
  } else if (newValue === 'paypal') {
    status.value = 1; // 或者根據您的需求設置適當的狀態
    paymentMethod.value = 3;
  } else {
    status.value = 0;
    paymentMethod.value = 0;
  }
});

function proceedToCheckout() {
  console.log("status", status.value);
  console.log("payment", paymentMethod.value);
  console.log("總金額2", total.value);

  order.value = {
    "paymentMethod": paymentMethod.value,
    "status": status.value,
    "userId": userStore.userId,
    "totalAmount": total.value
  };

  console.log("order", order.value);

  createOrder()
    .then(createOrderDetails)
    .then(processPayment)
    .then(finishCheckout)
    .catch(handleError);
}

function createOrder() {
  return axiosapi.post(`/api/orders`, order.value);
}

function createOrderDetails(orderResponse) {
  console.log("列出order", orderResponse.data.id);
  let request = {
    "orderId": orderResponse.data.id,
    "cartItems": products.value
  };
  return axiosapi.post("/api/orders/create-with-details", request);
}

function processPayment(detailResponse) {
  console.log("detailResponse", detailResponse.data[0].orderId);
  
  switch(paymentMethod.value) {
    case 1:
      return processLinePay(detailResponse.data[0].orderId);
    case 2:
      return processCOD();
    case 3:
      return processPayPal(detailResponse.data[0].orderId);
    default:
      throw new Error("未知的付款方式");
  }
}

function processLinePay(orderId) {
  showWaitingAlert('正在處理 LINE Pay 付款，請稍候...');
  return axiosapi.get(`/api/orders/${orderId}`)
    .then(response => axiosapi.post(`/linePay/pay`, response.data))
    .then(linePayResponse => {
      console.log("linePay", linePayResponse);
      console.log("拿網址", linePayResponse.data.info.paymentUrl.web);
      Swal.close(); // 關閉等待提示
      window.open(linePayResponse.data.info.paymentUrl.web, '_self');
      return axiosapi.delete(`/cart/clear/${userStore.userId}`);
    });
}

function processCOD() {
  return axiosapi.delete(`/cart/clear/${userStore.userId}`);
}

function processPayPal(orderId) {
  showWaitingAlert('正在處理 PayPal 付款，請稍候...');
  return axiosapi.get(`/api/orders/${orderId}`)
    .then(response => axiosapi.post(`/paypal/request`, response.data))
    .then(paypalResponse => {
      console.log("PayPal", paypalResponse);
      if (paypalResponse.data.payerAction) {
        return axiosapi.get(`/paypal/self?url=${paypalResponse.data.self}`)
          .then(() => axiosapi.delete(`/cart/clear/${userStore.userId}`))
          .then(() => {
            Swal.close(); // 關閉等待提示
            window.open(paypalResponse.data.payerAction, '_self');
          });
      } else {
        throw new Error("PayPal 未返回有效的支付 URL");
      }
    })
    .catch(error => {
      Swal.close(); // 確保在出錯時也關閉等待提示
      throw error;
    });
}

function finishCheckout() {
  // Clear localStorage
  localStorage.removeItem('checkoutProducts');
  localStorage.removeItem('checkoutTotal');

  // Redirect to user orders page
  router.push({ name: 'home-link' });
}

function handleError(error) {
  console.error("Error during checkout:", error);
  // 這裡可以添加更多的錯誤處理邏輯，例如顯示錯誤消息給用戶
}

function showWaitingAlert(message) {
  Swal.fire({
    title: '請稍候',
    text: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    }
  });
}
</script>
  
  <style scoped>
.payment-selection {
  background-color: var( --background-color);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(177, 151, 252, 0.2);
}

.payment-box {
  background-color: white;
  border-radius: 10px;
  overflow: hidden;
}

.payment-header {
  background-color: var( --background-color);
  padding: 15px;
}

.main-title {
  color: white;
  margin: 0;
  text-align: center;
  font-weight: bold;
}

.payment-content {
  padding: 20px;
}

.payment-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.payment-option {
  display: flex;
  align-items: center;
  padding: 10px;
  border: 1px solid var( --border-color);  
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.payment-option:hover {
  background-color: var( --background-color);
}

.payment-option input[type="radio"] {
  margin-right: 10px;
}

.payment-divider {
  height: 1px;
  background-color: var( --background-color);
  margin: 0 20px;
}

.payment-footer {
  padding: 20px;
}

.checkout-button {
  width: 100%;
  background-color: var( --background-color);
  color: white;
  border: none;
  padding: 15px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: opacity 0.3s ease;
}

.checkout-button:hover:not(:disabled) {
  background-color: var( --background-color);
  border: none;
}

.checkout-button:disabled {
  background-color: var( --background-color);
  color: white;
  cursor: not-allowed;
}

.checkout-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--border-color);
}
</style>