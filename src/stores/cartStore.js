import { defineStore } from 'pinia';
import axiosapi from '@/plugins/axios'; // 確保這個路徑正確

export const useCartStore = defineStore('cart', {
  state: () => ({
    cartItemCount: 0
  }),
  actions: {
    updateCartCount(count) {
      this.cartItemCount = count;
    },
    async initializeCartCount(userId) {
      try {
        const response = await axiosapi.get(`/cart/user/${userId}`);
        const products = response.data;
        const totalCount = products.reduce((sum, product) => sum + product.vol, 0);
        this.updateCartCount(totalCount);
      } catch (error) {
        console.error("Error fetching cart count:", error);
        this.cartItemCount = 0;
      }
    }
  }
});