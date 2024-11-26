<template>
    <div>
        <div class="ts-breadcrumb is-stepped is-divided cart-title-container ">
            <h2>我的購物車</h2>
        </div>
        <div class="cart-container has-top-spaced">
            <div class="cart-list">
                <div class="ts-box">
                    <table class="ts-table">
                        <thead>
                            <tr class="tr">
                                <th>#</th>
                                <th>商品圖片</th>
                                <th>名稱</th>
                                <th>金額</th>
                                <th>數量</th>
                                <th>小計</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(product, index) in products" :key="product.productId">
                                <td>{{ index + 1 }}</td>
                                <td>
                                    <img :src="`${path}/products/${product.productId}/latestphoto`"
                                        :alt="product.productName" style="cursor: pointer;">
                                </td>
                                <td>{{ product.productName }}</td>
                                <td>NT$ {{ product.price }}</td>
                                <td>
                                    <div class="quantity-control">
                                        <button @click="decrementQuantity(product)"
                                            class="ts-button is-fluid is-primary" 
                                            :disabled="product.vol <= 0"><font-awesome-icon icon="fa-solid fa-minus" /></button>
                                        <input type="number" v-model="product.vol" @change="onQuantityChange(product)"
                                            class="ts-input is-small" min="1">
                                        <button @click="incrementQuantity(product)"
                                            class="ts-button is-fluid is-primary"><font-awesome-icon icon="fa-solid fa-plus" /></button>
                                    </div>
                                </td>
                                <td>NT$ {{ product.price * product.vol }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="checkout-summary">
                <div class="ts-box">
                    <div class="ts-content is-padded">
                        <div class="ts-header is-heavy">訂單摘要</div>
                        <div class="ts-divider"></div>
                        <div class="ts-flex is-vertical">
                            <div class="ts-flex">
                                <div class="ts-text" style="margin-top: 20px;">總金額：</div>
                                <div class="ts-text is-strong">NT$ {{ calculateTotalAmount }}</div>
                            </div>
                            <div class="ts-space"></div>
                            <button class="ts-button is-fluid is-primary" @click="proceedToCheckout"  style="margin-top: 20px;">前往付款</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted, computed, watch } from 'vue'
import axiosapi from '@/plugins/axios';
import useUserStore from '@/stores/userstore';
import { useCartStore } from '@/stores/cartStore';

const cartStore = useCartStore();
const path = import.meta.env.VITE_API_URL;
const userStore = useUserStore();
const router = useRouter();
const products = ref([]);
const totalAmount = ref(0);

const calculateTotalAmount = computed(() => {
    return products.value.reduce((total, product) => total + (product.price * product.vol), 0);
});

watch(calculateTotalAmount, (newValue) => {
    totalAmount.value = newValue;
});

onMounted(() => {
    console.log(userStore.userId);
    getUserCart(userStore.userId);
    cartStore.initializeCartCount(userStore.userId);
});

function getUserCart(userId){
    axiosapi.get(`/cart/user/${userId}`).then(function (productResponse) {
        console.log("列出清單", productResponse.data);
        
        products.value = productResponse.data;
    });

}



function proceedToCheckout() {
    console.log("前往結帳");
    localStorage.setItem('checkoutProducts', JSON.stringify(products.value));
    localStorage.setItem('checkoutTotal', totalAmount.value);
    router.push({ name: 'order-payment' });
}

function onQuantityChange(product) {
    if (product.vol <= 0) {
        // 如果數量減到0或更低，觸發刪除
        deleteCartItem(product);
        return;
    }
    
    
    // Ensure the quantity is at least 1
    product.vol = Math.max(1, product.vol);
    // You can implement your AJAX call here to update the server
    console.log(`Quantity changed for product ${product.productId}: ${product.vol}`);
    console.log(`userid ${userStore.userId}`);


    let cartupdate = {
        "usersId": userStore.userId,
        "productsId": product.productId,
        "vol": product.vol
    }



    axiosapi.put(`/cart/update`, cartupdate).then(function (Response) {
        console.log("購物車更新", Response.data);
        cartStore.initializeCartCount(userStore.userId);
    });


}

function incrementQuantity(product) {
    product.vol++;
    onQuantityChange(product);
}

function decrementQuantity(product) {
    if (product.vol > 1) {
        product.vol--;
        onQuantityChange(product);
    } else if (product.vol === 1) {
        // 當數量為1時，再次減少會觸發刪除
        deleteCartItem(product);
    }
}


function deleteCartItem(product){
    console.log("減少的userId", product.userId);
    console.log("減少的productId",product.productId)
    
    
    axiosapi.delete(`/cart/delete?userId=${product.userId}&productId=${product.productId}`).then(function (Response) {
        console.log("購物車更新", Response.data);
        getUserCart(userStore.userId);
        cartStore.initializeCartCount(userStore.userId);
    });


}
</script>

<style scoped>
body {
    width: 1800px;
    margin: 0 auto;
}

.cart-container {
    display: flex;
    gap: 20px;
    margin-bottom: 50px; /* 增加底部 margin，避免與 footer 重疊 */
}

.cart-list {
    flex: 1;
}

.checkout-summary {
    width: 300px;
}

.ts-table img {
    max-width: 100px;
    height: auto;
    border-radius: 4px;
    transition: transform 0.2s;
}


.ts-table img:hover {
    transform: scale(1.1);
}

.checkout-summary .ts-box {
    background-color: var(--background-color);
    border: 2px solid var(--primary-color);
}

.checkout-summary .ts-header {
    color: var(--primary-color);
}

.quantity-control {
    display: flex;
    align-items: center;
}

.quantity-control input {
    width: 50px;
    text-align: center;
    margin: 0 5px;
}

.quantity-control button {
    padding: 0 8px;
}

th {
background-color: #97715B !important;
color: white !important;
padding: 0px;
}

.ts-button {
    padding: 5px;
    margin: 2px;
    width: 5px;
}

h2 {
    color: var(--text-color);
    text-align: center;
    font-weight: bold;
}

.cart-title-container {
    display: flex;
    justify-content: center;
    margin-bottom: 20px; /* 可以根據需要調整 */
}
</style>