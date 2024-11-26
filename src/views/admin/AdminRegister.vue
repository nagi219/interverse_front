<template>
  <div class="fullscreen-container full-height">
  <div class="container">
    <div class="row h-100">
      <div class="col-lg-10 col-xl-9 mx-auto">
        <div
          class="card flex-row border-0 shadow rounded-3 overflow-hidden"
        >
          <div class="card-img-left d-none d-md-flex">
            <!-- Background image for card set in CSS! -->
          </div>
          <div class="card-body p-4 p-sm-5">
            <Vueform
              size="md"
              :display-errors="false"
              ref="form$"
              :endpoint="false"
              class="custom-vueform"
            >
              <StaticElement name="register_title" content="新增員工" tag="h1" />
              <StaticElement name="divider" tag="hr" />

              <TextElement
                name="accountNumber"
                placeholder="請輸入帳號"
                rules="required"
              />

              <TextElement
                name="password"
                input-type="password"
                :rules="['required', 'min:8']"
                field-name="Password"
                placeholder="請輸入密碼"
              />

              <TextElement
                name="nickname"
                placeholder="請輸入暱稱"
                :columns="{
                  container: 6,
                  label: 12,
                  wrapper: 12,
                }"
                rules="required"
              />

              <SelectElement
                name="authority"
                :columns="{
                  container: 6,
                  label: 12,
                  wrapper: 12,
                }"
                :items="['管理部', '財務部', '人資部', '行銷部']"
                placeholder="請選擇權限"
                default="人資部"
                :rules="['required']"
              />

              <StaticElement name="divider_1" tag="hr" />
              <ButtonElement
                name="register"
                button-label="註冊"
                :full="true"
                size="lg"
                @click="register"
                :submits="true"
              />
            </Vueform>
          </div>
        </div>
      </div>
    </div>
  </div>
      
</div>
</template>

<script setup>
import { ref } from "vue";
import axios from "@/plugins/axios";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";

const form$ = ref(null);
const router = useRouter();
const message = useMessage();

function register() {
  const formInstance = form$.value;

  let request = {
    accountNumber: formInstance.data.accountNumber,
    password: formInstance.data.password,
    nickname: formInstance.data.nickname,
    authority: formInstance.data.authority,
  };

  console.log(request);
  axios
    .post("/admin/register", request)
    .then(function (response) {
      console.log("response", response);

      if (response.status === 201) {
        message.success("註冊成功，請登入", {
          closable: true,
          duration: 5000,
        });
        router.push("/admin/login");
      }
    })
    .catch(function (error) {
      console.log("error", error);

      // 清除所有欄位的錯誤訊息
      Object.keys(formInstance.data).forEach((key) => {
        formInstance.el$(key).messageBag.clear();
      });

      if (error.response) {
        switch (error.response.status) {
          case 400: // BAD REQUEST
            // message.error("請輸入所有必填欄位");
            break;
          case 409: // CONFLICT
            formInstance
              .el$("accountNumber")
              .messageBag.append("此帳號已被註冊", "error");
            break;
          case 500: // INTERNAL SERVER ERROR
            formInstance
              .el$("accountNumber")
              .messageBag.append("註冊過程中發生錯誤，請稍後再試", "error");
            break;
          default:
            formInstance
              .el$("accountNumber")
              .messageBag.append("發生未知錯誤", "error");
        }
      } else {
        console.log("error", error);
      }
    });
}
</script>

<style scoped>
.fullscreen-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.card-img-left {
  width: 100%;
    background: scroll center
      url("/admin\ register\ pic.jpg");
  background-size: cover;
}

.btn-google {
  color: white;
  background-color: #ea4335;
}

/* Custom styles for Vueform */
.custom-vueform :deep(.vf-primary-color) {
  --vf-primary-color: 104, 117, 109 !important;  /* #68756D in RGB */
  --vf-primary-darker-color: 78, 88, 82 !important;  /* Slightly darker shade for hover effects */
}

.custom-vueform :deep(.vf-bg-primary) {
  background-color: rgb(var(--vf-primary-color)) !important;
}

.custom-vueform :deep(.vf-border-primary) {
  border-color: rgb(var(--vf-primary-color)) !important;
}

.custom-vueform :deep(.vf-text-primary) {
  color: rgb(var(--vf-primary-color)) !important;
}

/* .custom-vueform :deep(.vf-btn-primary:hover) {
  background-color: rgb(var(--vf-primary-darker-color)) !important;
} */

.custom-vueform :deep(.vf-input:focus),
.custom-vueform :deep(.vf-select:focus) {
  border-color: #B57B66 !important;
  box-shadow: 0 0 0 3px rgba(181, 123, 102, 0.3) !important;
}

.full-height {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
