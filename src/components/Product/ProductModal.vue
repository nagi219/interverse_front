<template>
  <!-- Modal -->
  <div ref="exampleRef" class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Product</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <table>
            <tr>
              <td><input type="hidden" name="id" :value="product.id" readonly @input="modify('id', $event.target.value)">
              </td>
            </tr>
            <tr v-show="isShowCategory">
              <td>Category : </td>
              <td>
                <select name="category" :value="product.category" @change="modify('category', $event.target.value)">
                  <option value="">請選擇類別</option>
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </td>
            </tr>
            <tr>
              <td>Name : </td>
              <td><input type="text" name="name" :value="product.name" @input="modify('name', $event.target.value)">
              </td>
            </tr>
            <tr>
              <td>description : </td>
              <td><input type="text" name="description" :value="product.description"
                  @input="modify('description', $event.target.value)"></td>
            </tr>
            <tr>
              <td>color : </td>
              <td><input type="text" name="color" :value="product.color" @input="modify('color', $event.target.value)">
              </td>
            </tr>
            <tr>
              <td>price : </td>
              <td><input type="number" name="price" :value="product.price"
                  @input="modify('price', $event.target.value)">
              </td>
            </tr>
            <tr>
              <td>photo : </td>
              <td><input type="file" name="photo"  @change="handleFileChange" accept="image/*">
              </td>
            </tr>
          </table>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="emits('insert')" v-show="isShowButtonInsert">新增</button>
          <button type="button" class="btn btn-primary" @click="emits('update')"
            v-show="!isShowButtonInsert">修改</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import bootstrap from 'bootstrap/dist/js/bootstrap.bundle.min.js';
const props = defineProps(["product", "isShowButtonInsert", "categories","isShowCategory"]);
const emits = defineEmits(["update:product", "insert", "update","fileUpload"])


const fileObject = ref(null); // 新增：用於存儲文件對象

function handleFileChange(event) {
  const file = event.target.files[0];
  console.log("123",event.target.files[0]);
  if (file) {
    fileObject.value = file;
    // 只更新文件名，實際文件對象不包含在 product 中
    modify('photo', file.name);
    
    //創建 FormData 並發射 fileUpload 事件
    // const formData = new FormData();
    // formData.append('photo', file);
    // console.log("File name:", file.name);
    // console.log("File size:", file.size);
    // console.log("File type:", file.type);

    // for (let [key, value] of formData.entries()) {
    //   console.log(key, value);
    // }
    emits('fileUpload', file);
  }
}
function modify(key, value) {
  console.log("modify", key, value);
  props.product[key] = value;
  let param = {
    ...props.product, [key]: value
  };
  emits('update:product', param);

}

const exampleRef = ref(null);
const exampleObj = ref(null);

onMounted(function () {
  //如果沒有import bootstrap 後面的new會不知道bootstrap是甚麼
  exampleObj.value = new bootstrap.Modal(exampleRef.value);
});
function showModal() {
  exampleObj.value.show();
}

function hideModal() {
  exampleObj.value.hide();
}
defineExpose({
  showModal, hideModal
});
</script>

<style scoped>

</style>
