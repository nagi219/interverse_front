import { defineStore } from 'pinia'

export const useDepositStore = defineStore('deposit', {
  state: () => ({
    depositAmount: 0,
    paymentMethod: '',
  }),
  actions: {
    setDepositAmount(amount) {
      this.depositAmount = amount
    },
    setPaymentMethod(method) {
      this.paymentMethod = method
    },
  }
})