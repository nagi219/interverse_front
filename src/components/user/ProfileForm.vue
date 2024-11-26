<template>
  <div class="container update-form">
    <h6 class="section-title">編輯個人資料</h6>
    <Vueform size="md" :display-errors="false" ref="form$" :endpoint="false">
      <TextElement
        name="email"
        input-type="email"
        :rules="['required', 'max:255', 'email']"
        field-name="Email"
        label="Email"
        :default="email"
      />

      <TextElement
        name="nickname"
        rules="required"
        label="暱稱"
        :default="nickname"
      />

      <RadiogroupElement
        name="gender"
        view="tabs"
        :default="gender"
        :items="[
          { value: '男', label: '男' },
          { value: '女', label: '女' },
          { value: '其他', label: '其他' },
          { value: '不透漏', label: '不透漏' },
        ]"
        label="性別"
        :rules="['required']"
      />

      <PhoneElement
        name="phoneNumber"
        :rules="['required']"
        field-name="電話號碼"
        :allow-incomplete="true"
        :unmask="false"
        label="電話號碼"
        :default="phoneNumber"
      />
      <!-- <SelectElement name="country1" :search="true" :native="false" input-type="search" autocomplete="disabled"
                placeholder="國籍" items="/json/countries.json" :columns="{
                    container: 6,
                    label: 12,
                    wrapper: 12,
                }" /> -->
      <TextElement
        name="country"
        rules="required"
        label="國籍"
        :default="country"
        :columns="{
          container: 6,
          label: 12,
          wrapper: 12,
        }"
      />
      <TextElement
        name="city"
        label="居住城市"
        rules="required"
        :default="city"
        :columns="{
          container: 6,
          label: 12,
          wrapper: 12,
        }"
      />
      <DateElement
        name="birthday"
        label="生日"
        field-name="生日"
        :default="birthday"
        :rules="['required', 'before:today']"
        display-format="YYYY-MM-DD"
      />

      <TextareaElement name="bio" label="自介" :default="bio" />
      <ButtonElement
        name="register"
        button-label="更新"
        size="lg"
        :submits="true"
        @click="updateProfile"
      />
      <ButtonElement
        name="cancel"
        button-label="取消"
        size="lg"
        @click="cancelUpdate"
      />
    </Vueform>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "@/plugins/axios";
import useUserStore from "@/stores/userstore";

/*元件內變數與方法Start*/
const props = defineProps({
  email: String,
  nickname: String,
  phoneNumber: String,
  country: String,
  city: String,
  birthday: String,
  gender: String,
  bio: String,
});

const emit = defineEmits(["update-success"]);
/*元件內變數與方法End*/

const form$ = ref(null);

const userStore = useUserStore();
const userId = userStore.userId;

function updateProfile() {
  const formInstance = form$.value;

  let request = {
    email: formInstance.data.email,
    nickname: formInstance.data.nickname,
    phoneNumber: formInstance.data.phoneNumber,
    country: formInstance.data.country,
    city: formInstance.data.city,
    birthday: formInstance.data.birthday,
    gender: formInstance.data.gender,
    bio: formInstance.data.bio,
  };

  console.log(request);
  axios
    .put(`/user/secure/${userId}`, request)
    .then(function (response) {
      console.log("response", response);

      if (response.data.success) {
        //成功的邏輯
        emit("update-success");
      } else {
        
        Object.keys(form$.value.data).forEach((key) => {
          form$.value.el$(key).messageBag.clear();
        });
        // 處理後端返回的錯誤訊息

        if (Array.isArray(response.data.messages)) {
          response.data.messages.forEach((message) => {
            if (message.includes("email")) {
              formInstance.el$("email").messageBag.append(message, "error");
            } else if (message.includes("電話")) {
              formInstance
                .el$("phoneNumber")
                .messageBag.append(message, "error");
            }
          });
        }
      }
    })
    .catch(function (error) {
      console.log("error", error);
      formInstance.el$("email").messageBag.append("更新失敗，請稍後再試。");
    });
}

function cancelUpdate() {
  if (form$.value) {
    form$.value.reset();
  }
  // 清除所有錯誤訊息
  Object.keys(form$.value.data).forEach((key) => {
    form$.value.el$(key).messageBag.clear();
  });
}
</script>

<style scope>
.update-form {
  width: 75%;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--background-color);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(228, 186, 182, 0.1);
}

.section-title {
  color: var(--accent-color);
  font-weight: bold;
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .update-form {
    width: 100%;
  }
}
</style>
