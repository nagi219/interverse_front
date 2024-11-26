<template>
  <!-- Modal -->
  <div ref="exampleRef" class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
    aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">分類</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <table>
            <tr>
              
              <td><input type="hidden" name="id" :value="category.id" readonly @input="modify('id',$event.target.value)"></td>
            </tr>
            <tr>
              <td>名稱 : </td>
              <td><input type="text" name="name" :value="category.name" @input="modify('name',$event.target.value)"></td>
            </tr>
          </table>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="emits('insert')" v-show="isShowButtonInsert">新增</button>
          <button type="button" class="btn btn-primary" @click="emits('update')" v-show="!isShowButtonInsert">修改</button>
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
const props = defineProps(["category","isShowButtonInsert"]);
const emits = defineEmits(["update:category","insert","update"])
function modify(key,value){
  console.log("modify",key,value);
  props.category[key]=value;
  // 再加一個物件進去 透過相同name覆蓋 叫出v-model綁定的事件 透過function modify(key,value)中的參數接收上方input的內容串接成param 再透過雙向資料綁定傳參數給前面
  let param ={
    ...props.category,[key]:value
  }
  emits('update:category',param);

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

<style></style>
