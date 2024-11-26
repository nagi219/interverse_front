<template>
    <div  class="payment-form">
    <form @submit.prevent="handleSubmit" id="payment-form">
        <h2>Stripe付款</h2>
        <div class="card-icons">
            <font-awesome-icon :icon="['fab', 'cc-visa']" />
            <font-awesome-icon :icon="['fab', 'cc-mastercard']" />
            <font-awesome-icon :icon="['fab', 'cc-amex']" />
            <font-awesome-icon :icon="['fab', 'cc-discover']" />
            <font-awesome-icon :icon="['fab', 'cc-jcb']" />
        </div>
        <div class="form-group">
            <label>儲值金額</label>
            <div class="amount">$ {{ amount }}</div>
        </div>
        <div class="form-group">
            <label for="name">金融卡姓名</label>
            <input type="text" id="name" />
        </div>
        <div class="form-group">
            <label for="card-element">金融卡資訊</label>
            <div id="card-element">
                <!-- A Stripe Element will be inserted here. -->
            </div>
            <!-- Used to display form errors. -->
            <div id="card-errors" role="alert">{{ cardErrors }}</div>
        </div>
        <button type="submit">儲值 ${{ amount }}</button>
    </form>

</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import axios from '@/plugins/axios'
import { useRouter } from 'vue-router'
import useUserStore from "@/stores/userstore";
import { useDepositStore } from '@/stores/depositStore'

const userStore = useUserStore();
const userId = userStore.userId;
const router = useRouter()

const depositStore = useDepositStore()
const amount = depositStore.depositAmount

const stripe = ref(null)
const card = ref(null)
const cardErrors = ref('')

onMounted(async () => {
    // 載入 Stripe
    stripe.value = await loadStripe('pk_test_51PtkQIP1MEI3D9bvY2dSwQeGWfXWl8LBLP4XBXtnU6BwrpECvUVbn4Jn7OwXbNgUuOYRwhIt0LGwNYwY6ZVZ0DTx005c4jRv46')
    const elements = stripe.value.elements();

    // 定義樣式
    const style = {
        base: {
            fontSize: '16px',
            color: '#32325d',
            '::placeholder': {
                color: '#aab7c4'
            }
        },
        invalid: {
            color: '#fa755a',
            iconColor: '#fa755a'
        }
    }
    // 創建 card 元素
    card.value = elements.create("card", { style: style })
    // 掛載到 DOM
    card.value.mount('#card-element')

    // 處理驗證錯誤
    card.value.on('change', (event) => {
        if (event.error) {
            cardErrors.value = event.error.message
        } else {
            cardErrors.value = ''
        }
    });
})

const handleSubmit = async () => {
    if (!stripe.value || !card.value) {
        console.error('Stripe not initialized')
        return
    }

    const result = await stripe.value.createToken(card.value)

    if (result.error) {
        cardErrors.value = result.error.message
    } else {
        await stripeTokenHandler(result.token)
    }
}

const stripeTokenHandler = async (token) => {
    let chargeResponse;
    try {
        // 先處理支付
        chargeResponse = await axios.post('/transaction/charge', {
            token: token.id,
            amount: amount * 100
        });
        console.log('Payment successful:', chargeResponse.data);

        // 支付成功後，將交易紀錄寫進資料庫
        const transactionData = {
            transactionNo: chargeResponse.data, // 確保這個字段名稱正確
            status: 1,
            amount: amount,
            paymentMethod: 'Stripe',
            user: {
                id: userId
            }
        };
        console.log('Sending transaction data:', JSON.stringify(transactionData));

        const addTransactionResponse = await axios.post('/transaction/add', transactionData);
        console.log('Transaction added:', addTransactionResponse.data);

        // 重新導回profile頁面
        router.push('/user/profile');

    } catch (error) {
        console.error('Operation failed:', error);
        if (chargeResponse && chargeResponse.data) {
            // 支付成功但後端處理失敗
            console.error('Payment succeeded but backend processing failed');
        } else {
            // 支付失敗
            console.error('Payment failed');
            cardErrors.value = 'Payment failed. Please try again.';
        }
    }
};
</script>

<style scoped>
.payment-form {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    margin-top: 50px;
}

h2 {
    text-align: center;
    color: #333;
    margin-bottom: 20px;
}

.card-icons {
    text-align: center;
    margin-bottom: 20px;
}

.card-icons svg {  /* 更新為svg選擇器 */
    font-size: 24px;
    margin: 0 5px;
    color: #6772e5;
}

.form-group {
    margin-bottom: 20px;
}

label {
    display: block;
    margin-bottom: 5px;
    color: #6b7c93;
    font-weight: 300;
}

input, .amount, #card-element {
    width: 100%;
    padding: 10px;
    border: 1px solid #e6e6e6;
    border-radius: 4px;
    font-size: 16px;
}

.amount {
    background-color: #f6f9fc;
    color: #32325d;
    font-weight: 500;
}

#card-errors {
    color: #fa755a;
    font-size: 14px;
    margin-top: 10px;
}

button {
    width: 100%;
    padding: 12px;
    background-color: #5ee7df;
    color: #fff;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #4cc3bb;
}

button:disabled {
    background-color: #b5b5b5;
    cursor: not-allowed;
}
</style>