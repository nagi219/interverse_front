<template>
  <div class="payment-container">
    <div class="payment-header">
      <img src="/interverse navlogo.png" alt="Interverse Logo" class="logo">
    </div>
    <div class="payment-form">
      <form @submit.prevent="handleSubmit" id="payment-form" aria-label="信用卡支付表單">
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
          <label for="name">持卡人姓名</label>
          <input type="text" id="name" required/>
        </div>
        <div class="form-group">
          <label for="card-element" aria-label="信用卡資訊輸入區域">信用卡資訊</label>
          <div id="card-element">
            <!-- A Stripe Element will be inserted here. -->
          </div>
          <!-- Used to display form errors. -->
          <div id="card-errors" role="alert" aria-live="polite">
            {{ cardErrors }}
          </div>
        </div>
        <button type="submit">
          儲值 ${{ amount }}
        </button>
      </form>

      <div class="powered-by">
        <span>powered by</span>
        <font-awesome-icon :icon="['fab', 'stripe']" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { loadStripe } from "@stripe/stripe-js";
import axios from "@/plugins/axios";
import { useRouter } from "vue-router";
import useUserStore from "@/stores/userstore";
import { useDepositStore } from "@/stores/depositStore";

const userStore = useUserStore();
const userId = userStore.userId;
const router = useRouter();

const depositStore = useDepositStore();
const amount = depositStore.depositAmount;

const stripe = ref(null);
const card = ref(null);
const cardErrors = ref("");

onMounted(async () => {
  // 載入 Stripe
  stripe.value = await loadStripe(
    "pk_test_51PtkQIP1MEI3D9bvY2dSwQeGWfXWl8LBLP4XBXtnU6BwrpECvUVbn4Jn7OwXbNgUuOYRwhIt0LGwNYwY6ZVZ0DTx005c4jRv46"
  );
  const elements = stripe.value.elements();

  // 定義樣式
  const style = {
    base: {
      fontSize: "16px",
      color: "#32325d",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  };
  // 創建 card 元素
  card.value = elements.create("card", { style: style });
  // 掛載到 DOM
  card.value.mount("#card-element");

  // 處理驗證錯誤
  card.value.on("change", (event) => {
    if (event.error) {
      cardErrors.value = event.error.message;
    } else {
      cardErrors.value = "";
    }
  });
});

const handleSubmit = async () => {
  if (!stripe.value || !card.value) {
    console.error("Stripe 未初始化，請稍後再試。");
    return;
  }

  try {
    const result = await stripe.value.createToken(card.value);
    if (result.error) {
      cardErrors.value = result.error.message;
    } else {
      await stripeTokenHandler(result.token);
    }
  } catch (error) {
    console.error("支付處理錯誤:", error);
    cardErrors.value = "支付處理出錯，請稍後再試。";
  }
};

const stripeTokenHandler = async (token) => {
  let chargeResponse;
  try {
    // 先處理支付
    chargeResponse = await axios.post("/transaction/charge", {
      token: token.id,
      amount: amount * 100,
    });
    console.log("Payment successful:", chargeResponse.data);

    // 支付成功後，將交易紀錄寫進資料庫
    const transactionData = {
      transactionNo: chargeResponse.data,
      status: 1,
      amount: amount,
      paymentMethod: "Stripe",
      user: {
        id: userId,
      },
    };
    console.log("Sending transaction data:", JSON.stringify(transactionData));

    const addTransactionResponse = await axios.post(
      "/transaction/add",
      transactionData
    );
    console.log("Transaction added:", addTransactionResponse.data);

    // 重新導回profile頁面
    router.push("/user/profile");
  } catch (error) {
    console.error("Operation failed:", error);
    if (chargeResponse && chargeResponse.data) {
      // 支付成功但後端處理失敗
      console.error("Payment succeeded but backend processing failed");
    } else {
      // 支付失敗
      console.error("Payment failed");
      cardErrors.value = "Payment failed. Please try again.";
    }
  }
};
</script>

<style scoped>
.payment-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 30px;
  background-color: var(--light-background);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(151, 113, 91, 0.1);
  margin-bottom: 100px; /* 添加底部 margin */
}

.payment-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  max-width: 200px;
  margin-bottom: 20px;
}

h1 {
  color: var(--accent-color);
  font-size: 2rem;
  margin-bottom: 20px;
}

.payment-form {
  /* background-color: var(--background-color); */
  padding: 30px;
  border-radius: 12px;
}

.card-icons {
  text-align: center;
  margin-bottom: 20px;
}

.card-icons svg {
  font-size: 32px;
  margin: 0 10px;
  color: var(--accent-color);
}

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-color);
  font-weight: 600;
}

input,
.amount,
#card-element {
  width: 100%;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 16px;
  background-color: var(--light-background);
  color: var(--text-color);
}

.amount {
  font-weight: 700;
  font-size: 1.2rem;
}

#card-errors {
  color: var(--danger-color);
  font-size: 14px;
  margin-top: 10px;
}

button {
  width: 100%;
  padding: 14px;
  background-color: var(--primary-color);
  color: var(--text-color);
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: var(--secondary-color);
  transform: translateY(-2px);
}

button:disabled {
  background-color: var(--border-color);
  cursor: not-allowed;
}

.powered-by {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  color: var(--text-color-light);
  font-size: 14px;
}

.powered-by span {
  margin-right: 8px;
}

.powered-by svg {
  font-size: 24px;
  color: #6772e5; /* Stripe 的標誌藍色 */
}

@media (max-width: 768px) {
  .payment-container {
    padding: 20px;
    margin: 30px auto;
  }

  .payment-form {
    padding: 20px;
  }

  .card-icons svg {
    font-size: 24px;
  }

  button {
    font-size: 16px;
  }

  .powered-by {
    font-size: 12px;
  }

  .powered-by svg {
    font-size: 20px;
  }
}
</style>