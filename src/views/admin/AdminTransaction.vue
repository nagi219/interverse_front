<template>
  <div class="container mt-4 full-height">
    <div class="row mb-3">
      <div class="col-md-3">
        <label class="form-label">
          <font-awesome-icon :icon="['fas', 'keyboard']" /> 選擇交易類別
        </label>
        <select v-model="selectedOption" class="form-select" @change="fetchTransactions">
          <option value="all">所有交易</option>
          <option value="handling">處理中交易</option>
        </select>
      </div>
      <div class="col-md-7">
        <label class="form-label">
          <font-awesome-icon :icon="['fas', 'filter']" /> 篩選日期
        </label>
        <div class="input-group">
          <input type="date" v-model="startDate" class="form-control">
          <span class="input-group-text">至</span>
          <input type="date" v-model="endDate" class="form-control">
          <button class="btn btn-outline-secondary" @click="clearDates">清空日期</button>
        </div>
      </div>
      <div class="col-md-2">
        <label class="form-label">
          <font-awesome-icon :icon="['fas', 'arrow-down-wide-short']" /> 選擇排序
        </label>
        <select v-model="sortOption" class="form-select" @change="applySorting">
          <option value="dateDesc">日期新到舊</option>
          <option value="dateAsc">日期舊到新</option>
          <option value="priceDesc">價格高到低</option>
          <option value="priceAsc">價格低到高</option>
        </select>
      </div>
    </div>
    <div v-if="loading" class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">加載中...</span>
      </div>
    </div>
    <div v-else>
      <h3>{{ dateRangeText }}</h3>
      <div class="transaction-list">
        <div v-for="transaction in sortedTransactions" :key="transaction.id" class="transaction-card mb-3">
          <div class="row align-items-center">
            <div class="col-md-6">
              <h5 class="mb-0">
                交易號：{{ transaction.transactionNo }}
              </h5>
            </div>
            <div class="col-md-6 text-md-end">
              <span :class="getStatusClass(transaction.status)">{{ getStatusText(transaction.status) }}</span>
            </div>
          </div>
          <hr>
          <div class="row">
            <div class="col-md-3">
              <strong>使用者ID：</strong> {{ transaction.userId }}
            </div>
            <div class="col-md-3">
              <strong>付款方式：</strong> {{ transaction.paymentMethod }}
            </div>
            <div class="col-md-3">
              <strong>金額：</strong> {{ transaction.amount }}
            </div>
            <div class="col-md-3">
              <strong>日期：</strong> {{ formatDate(transaction.added) }}
            </div>
          </div>
        </div>
      </div>

      <div class="financial-summary mt-3 text-end">
        <div class="income"><strong>收入：</strong> {{ income }}</div>
        <div class="expense"><strong>支出：</strong> {{ expense }}</div>
        <hr class="summary-divider"/>
        <div class="total-amount"><strong>總金額：</strong> {{ totalAmount }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import axios from "@/plugins/axios";

const selectedOption = ref('all');
const startDate = ref('');
const endDate = ref('');
const transactions = ref([]);
const loading = ref(false);
const sortOption = ref('dateDesc');

const dateRangeText = computed(() => {
  if (startDate.value && endDate.value) {
    return `${startDate.value} 至 ${endDate.value} 的交易`;
  }
  return '所有日期的交易';
});

const sortedTransactions = computed(() => {
  let sorted = [...filteredTransactions.value];
  switch (sortOption.value) {
    case 'dateDesc':
      sorted.sort((a, b) => new Date(b.added) - new Date(a.added));
      break;
    case 'dateAsc':
      sorted.sort((a, b) => new Date(a.added) - new Date(b.added));
      break;
    case 'priceDesc':
      sorted.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
      break;
    case 'priceAsc':
      sorted.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
      break;
  }
  return sorted;
});

const applySorting = () => {
  // 排序已經通過 computed 屬性自動應用
};

const filteredTransactions = computed(() => {
  if (!startDate.value || !endDate.value) {
    return transactions.value;
  }

  const start = new Date(startDate.value);
  const end = new Date(endDate.value);
  end.setHours(23, 59, 59, 999);  // 設置結束日期為當天的最後一刻

  return transactions.value.filter(t => {
    const date = new Date(t.added);
    return date >= start && date <= end;
  });
});

// 計算收入
const income = computed(() => {
  return filteredTransactions.value
    .filter(transaction => parseFloat(transaction.amount) > 0)
    .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
});

// 計算支出
const expense = computed(() => {
  return filteredTransactions.value
    .filter(transaction => parseFloat(transaction.amount) < 0)
    .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
});

// 計算總金額
const totalAmount = computed(() => {
  return (parseFloat(income.value) + parseFloat(expense.value));
});

const fetchTransactions = async () => {
  loading.value = true;
  const endpoint = selectedOption.value === 'all' ? '/admin/transaction/all' : '/admin/transaction/handling';
  try {
    const response = await axios.get(endpoint);
    transactions.value = response.data;
  } catch (error) {
    console.error('獲取交易數據失敗：', error);
  } finally {
    loading.value = false;
  }
};

const clearDates = () => {
  startDate.value = '';
  endDate.value = '';
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).replace(/\//g, '-');
};

const getStatusText = (status) => {
  switch (status) {
    case 0: return '失敗';
    case 1: return '成功';
    case 2: return '處理中';
    default: return '未知狀態';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'badge bg-danger';
    case 1: return 'badge bg-success';
    case 2: return 'badge bg-warning';
    default: return 'badge bg-secondary';
  }
};

watch(selectedOption, fetchTransactions);

onMounted(fetchTransactions);
</script>

<style scoped>
.form-label {
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: var(--admin-text-color);
}

.transaction-card {
  border: 1px solid var(--admin-border-color);
  border-radius: 8px;
  padding: 20px;
  background-color: var(--admin-secondary-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.badge {
  font-size: 0.9em;
  padding: 0.5em 1em;
}

.badge.bg-danger {
  background-color: #d9534f !important; /* 保持紅色警告 */
}

.badge.bg-success {
  background-color: var(--admin-primary-color) !important;
}

.badge.bg-warning {
  background-color: #f0ad4e !important; /* 保持黃色警告 */
}

.badge.bg-secondary {
  background-color: var(--admin-border-color) !important;
}

hr {
  margin: 15px 0;
  border-top-color: var(--admin-border-color);
}

.financial-summary {
  font-size: 1.2em;
  margin-top: 20px;
  padding: 15px 0;
  color: var(--admin-text-color);
}

.income {
  color: var(--admin-primary-color);
}

.expense {
  color: #d9534f; /* 保持支出為紅色 */
}

.total-amount {
  color: black;
  font-weight: bold;
  margin-top: 10px;
}

.summary-divider {
  width: 30%; /* 設置寬度為容器的 30%，可以根據需要調整 */
  margin-left: auto; /* 將左邊距設為 auto，使其靠右對齊 */
  margin-right: 0; /* 確保右邊沒有邊距 */
  border-top: 1px solid var(--admin-border-color); /* 設置分隔線的顏色和粗細 */
  margin-top: 10px;
  margin-bottom: 10px;
}
.full-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>