<template>
  <div class="admin-auth-container full-height">
    <div class="admin-auth-layout">
      <div class="side-offset"></div>
      <div class="admin-auth-content">
        <h1 class="admin-auth-title">前往管理者後台</h1>
        <input type="password" v-model="auth" required class="admin-auth-input" placeholder="請輸入驗證碼">
        <button type="button" @click="submit" class="admin-auth-button">送出</button>
      </div>
      <div class="side-offset"></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "@/plugins/axios";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import useAdminStore from "@/stores/adminStore";
import useUserStore from "@/stores/userstore";

const router = useRouter();
const adminStore = useAdminStore();
const userStore = useUserStore();
const message = useMessage();
const auth = ref("");

function submit() {
  let request = {
    auth: auth.value,
  };

  axios
    .post("/auth", request)
    .then(function (response) {
      console.log("Response:", response);

      if (response.status === 200) {
        // 假設後端在認證成功時返回 200
        message.success("認證成功", {
          closable: true,
          duration: 5000,
        });

        //先把其他東西清空
        userStore.resetStore();
        axios.defaults.headers.authorization = "";
        axios.defaults.headers.common["X-User-ID"] = "";

        adminStore.setToken(response.data);
        axios.defaults.headers.authorization = "Bearer " + response.data.token;
        axios.defaults.headers.common["X-User-ID"] = response.data.id;
        router.push("/admin/login");
      }
    })
    .catch(function (error) {
      console.error("Error:", error);
      message.error("認證失敗，請重試");
    });
}
</script>

<style scoped>
.admin-auth-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-color);
}

.admin-auth-layout {
  display: grid;
  grid-template-columns: 250px 1fr 250px;
  width: 80%;
  max-width: 1200px;
}

.admin-auth-content {
  grid-column: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.admin-auth-title {
  color: var(--text-color);
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: bold;
}

.admin-auth-input {
  width: 80%;
  padding: 12px 15px;
  margin-bottom: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 5px;
  background-color: var(--background-color);
  color: var(--text-color);
  font-size: 16px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.admin-auth-input::placeholder {
  color: var(--light-text-color);
}

.admin-auth-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(177, 151, 252, 0.2);
}

.admin-auth-button {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  background-color: var(--primary-color);
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.1s;
}

.admin-auth-button:hover {
  background-color: var(--secondary-color);
}

.admin-auth-button:active {
  transform: scale(0.98);
}

.full-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .admin-auth-layout {
    grid-template-columns: 1fr;
  }

  .admin-auth-content {
    grid-column: 1;
    margin: 0 1rem;
  }

  .admin-auth-title {
    font-size: 2rem;
  }
}
</style>