<template>
    <div class="modal" tabindex="-1" ref="modalRef">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">訂單詳情</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <table class="ts-table">
                        <thead>
                            <tr>
                                <th>品 名</th>
                                <th>數 量</th>
                                <th>單 價</th>
                                <th>金 額</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="singleorder in order" :key="singleorder.productId">
                                <td>{{ productNames[singleorder.productId] || '載入中...' }}</td>
                                <td>{{ singleorder.quantity }}</td>
                                <td>{{ singleorder.price }}</td>
                                <td>{{ singleorder.subtotal }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">關閉</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch, reactive } from 'vue';
import { Modal } from 'bootstrap';
import axiosapi from '@/plugins/axios';

const props = defineProps(["order"]);
const emit = defineEmits(["update:order"]);

const modalRef = ref(null);
let modalInstance = null;
const productNames = reactive({});

onMounted(() => {
    modalInstance = new Modal(modalRef.value);
});

async function findProductName(id) {
    if (productNames[id]) return;
    try {
        const response = await axiosapi.get(`/products/${id}`);
        console.log("responseProductName", response.data.name);
        productNames[id] = response.data.name;
    } catch (error) {
        console.error("Error fetching product name:", error);
        productNames[id] = '獲取失敗';
    }
}

function showModal() {
    if (modalInstance) {
        modalInstance.show();
    }
}

function hideModal() {
    if (modalInstance) {
        modalInstance.hide();
    }
}

defineExpose({
    showModal,
    hideModal
});

watch(() => props.order, (newOrder) => {
    if (newOrder && newOrder.length > 0) {
        showModal();
        newOrder.forEach(item => findProductName(item.productId));
    }
}, { deep: true });
</script>

<style scoped>
.modal-dialog {
    max-width: 800px;
}

.modal-content {
    border-radius: 15px;
    box-shadow: 0 5px 15px rgba(177, 151, 252, 0.2);
    border: none;
    background-color: var(--background-color);
}

.modal-header {
    background-color: var(--primary-color);
    border-bottom: 1px solid var(--border-color);
    padding: 1.5rem;
    border-top-left-radius: 15px;
    border-top-right-radius: 15px;
}

.modal-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
}

.btn-close {
    color: white;
}

.modal-body {
    max-height: 70vh;
    overflow-y: auto;
    padding: 1.5rem;
}

.ts-table {
    width: 100%;
    margin-bottom: 0;
    color: var(--text-color);
    border-collapse: separate;
    border-spacing: 0;
    background-color: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 5px rgba(177, 151, 252, 0.1);
}

.ts-table thead th {
    background-color: var( --background-color);
    color: white;
    font-weight: 600;
    text-transform: uppercase;
    font-size: 14px;
    padding: 1rem;
    /* border-bottom: 2px solid rgb(252, 192, 192); */
}

.ts-table tbody td {
    padding: 1rem;
    border-bottom: var( --border-color);
    transition: background-color 0.3s ease;
}

.ts-table tbody tr:last-child td {
    border-bottom: none;
}

.ts-table tbody tr:hover td {
    background-color: var( --background-color);
}

.modal-footer {
    background-color: var(--background-color);
    border-top: 1px solid var(--border-color);
    padding: 1rem 1.5rem;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
}

.btn-secondary {
    background-color: var( --background-color);
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    font-size: 1rem;
    border-radius: 5px;
    transition: all 0.2s ease-in-out;
}

.btn-secondary:hover {
    background-color:var( --background-color);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 5px rgba(177, 151, 252, 0.2);
}

@media (max-width: 768px) {
    .modal-dialog {
        margin: 0.5rem;
    }

    .modal-body {
        padding: 1rem;
    }

    .ts-table thead th,
    .ts-table tbody td {
        padding: 0.75rem;
    }
}
</style>