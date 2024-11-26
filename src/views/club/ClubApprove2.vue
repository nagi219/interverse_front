<template>
  <n-space vertical>
    <n-card>
      <template #header>
        <n-h2>俱樂部成員審核</n-h2>
      </template>
      <n-spin :show="loading">
        <n-space vertical>
          <n-alert v-if="error" type="error" :title="error" />
          <template v-else>
            <n-h3>待審核成員</n-h3>
            <n-data-table
              v-if="pendingMembers.length > 0"
              :columns="columns"
              :data="pendingMembers"
              :pagination="false"
            />
            <n-empty v-else description="目前沒有待審核的成員。" />
          </template>
        </n-space>
      </n-spin>
    </n-card>
  </n-space>
</template>

<script setup>
import { ref, onMounted, h } from 'vue';
import { useRoute } from 'vue-router';
import axios from "@/plugins/axios";
import { useMessage } from 'naive-ui';
import {
  NSpace,
  NCard,
  NSpin,
  NAlert,
  NEmpty,
  NDataTable,
  NH2,
  NH3,
  NButton
} from 'naive-ui';

const route = useRoute();
const clubId = route.params.id;
const message = useMessage();

const pendingMembers = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchPendingMembers = async () => {
  try {
    const response = await axios.get(`/clubMember/club/${clubId}/pending-members`);
    pendingMembers.value = response.data;
    loading.value = false;
  } catch (err) {
    console.error('Error fetching pending members:', err);
    error.value = '獲取待審核成員時出錯';
    loading.value = false;
  }
};

const approveMember = async (userId) => {
  try {
    await axios.put(`/clubMember/approve/${clubId}/${userId}`);
    pendingMembers.value = pendingMembers.value.filter(member => member.userId !== userId);
    message.success('成員審核通過');
  } catch (err) {
    console.error('Error approving member:', err);
    message.error('審核成員時出錯');
  }
};

const removeMember = async (userId) => {
  try {
    await axios.delete(`/clubMember/club/${clubId}/user/${userId}`);
    pendingMembers.value = pendingMembers.value.filter(member => member.userId !== userId);
    message.success('成員已刪除');
  } catch (err) {
    console.error('Error removing member:', err);
    message.error('刪除成員時出錯');
  }
};

const columns = [
  {
    title: '用戶名',
    key: 'userName'
  },
  {
    title: '操作',
    key: 'actions',
    render: (row) => {
      return h(NSpace, null, {
        default: () => [
          h(
            NButton,
            {
              strong: true,
              secondary: true,
              type: 'success',
              size: 'small',
              onClick: () => approveMember(row.userId)
            },
            { default: () => '審核通過' }
          ),
          h(
            NButton,
            {
              strong: true,
              secondary: true,
              type: 'error',
              size: 'small',
              onClick: () => removeMember(row.userId)
            },
            { default: () => '刪除' }
          )
        ]
      });
    }
  }
];

onMounted(fetchPendingMembers);
</script>

<style scoped>
.n-card {
  max-width: 800px;
  margin: 0 auto;
}
</style>