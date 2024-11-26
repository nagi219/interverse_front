<template>

    <div class="card">
        <div class="card-body">
            <h5 class="card-title">{{ category.name }}</h5>
            <div>
                <span  style="margin-right: 10px; margin-left: 1050px;">
                    <button type="button" class="ts-button" @click="emits('openUpdate','update',category.id)">開啟修改</button>
                </span>
                <span >
                    <button type="button" class="ts-button" @click="emits('delete',category.id)">刪除</button>
                </span>
            </div>
        </div>
    </div>

</template>

<script setup>
    const props = defineProps(["category"]);
    const emits = defineEmits(["openUpdate","delete"]) 
</script>

<style scoped>

.ts-button{
border: 0;   background-color: var(--ts-primary-400) 
}

</style>