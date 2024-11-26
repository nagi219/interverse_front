<template>
    <template>
        <n-result status="500" title="500 Server Error"
            description="伺服器錯誤，請稍後再試">
            <template #footer>
                <n-button @click="toHome">回上一頁</n-button>
            </template>
        </n-result>
    </template>
</template>

<script setup>
import  { useRouter } from 'vue-router';
const router = useRouter();

function toHome() {

    router.go(-1);
}

</script>

<style></style>