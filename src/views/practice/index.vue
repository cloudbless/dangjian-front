<template>
  <div class="app-container">
    <el-card>
      <div class="header-actions" style="margin-bottom: 20px;">
        <el-button type="primary" @click="handleCreate">🚩 发布新实践活动</el-button>
      </div>

      <el-table :data="activityList" v-loading="loading" border>
        <el-table-column prop="title" label="活动主题" min-width="180" show-overflow-tooltip />
        <el-table-column prop="location" label="地点" width="150" show-overflow-tooltip />
        <el-table-column label="活动时间" width="280">
          <template #default="{ row }">
            {{ new Date(row.start_time).toLocaleString() }} - {{ new Date(row.end_time).toLocaleTimeString() }}
          </template>
        </el-table-column>
        <el-table-column label="名额/已报" width="100" align="center">
          <template #default="{ row }">
            {{ row.current_signups }} / {{ row.capacity }}
          </template>
        </el-table-column>
        <el-table-column prop="points_reward" label="奖励积分" width="90" align="center">
          <template #default="{ row }">
            <el-tag type="warning" effect="dark">+{{ row.points_reward }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" @click="openSignUpManage(row)">审核报名</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="活动主题" required>
          <el-input v-model="form.title" placeholder="例如：社区清理垃圾志愿服务" />
        </el-form-item>
        <el-form-item label="活动地点" required>
          <el-input v-model="form.location" placeholder="例如：阳光苑社区党群服务中心" />
        </el-form-item>
        <el-form-item label="活动时间" required>
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="招募人数" required>
              <el-input-number v-model="form.capacity" :min="1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="奖励积分" required>
              <el-input-number v-model="form.points_reward" :min="1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="活动详情">
          <el-input type="textarea" v-model="form.content" :rows="4" placeholder="请输入活动具体要求..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认发布</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="drawerVisible" :title="`报名管理 - ${currentActivity?.title}`" size="50%">
      <el-table :data="signupList" v-loading="drawerLoading" border>
        <el-table-column prop="user_name" label="党员姓名" width="120" />
        <el-table-column label="报名时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="info">待审核</el-tag>
            <el-tag v-else-if="row.status === 1" type="primary">报名成功</el-tag>
            <el-tag v-else-if="row.status === 3" type="success">已签到(发积分)</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button 
              v-if="row.status !== 3" 
              type="success" 
              size="small" 
              @click="handleConfirm(row)"
            >
              ✅ 确认签到 (发积分)
            </el-button>
            <span v-else style="color: #67C23A; font-size: 13px;">积分已发放</span>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getPracticeList, addPractice, updatePractice, deletePractice, getSignUpList, confirmAttendance } from '../../api/practice'
import { ElMessage, ElMessageBox } from 'element-plus'

// --- 活动列表逻辑 ---
const loading = ref(false)
const activityList = ref<any[]>([])

const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getPracticeList()
    activityList.value = res.results || res
  } finally {
    loading.value = false
  }
}

// --- 发布/编辑表单逻辑 ---
const dialogVisible = ref(false)
const dialogTitle = ref('发布新活动')
const timeRange = ref<[string, string] | null>(null)
const form = reactive({
  id: undefined as number | undefined,
  title: '',
  location: '',
  content: '',
  start_time: '',
  end_time: '',
  capacity: 50,
  points_reward: 5
})

const handleCreate = () => {
  form.id = undefined
  form.title = ''
  form.location = ''
  form.content = ''
  form.capacity = 50
  form.points_reward = 5
  timeRange.value = null
  dialogTitle.value = '发布新活动'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  Object.assign(form, row)
  timeRange.value = [row.start_time, row.end_time]
  dialogTitle.value = '编辑活动'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title || !timeRange.value) {
    return ElMessage.warning('请填写完整带星号的必填项')
  }
  form.start_time = timeRange.value[0]
  form.end_time = timeRange.value[1]

  try {
    if (form.id) {
      await updatePractice(form.id, form)
      ElMessage.success('更新成功')
    } else {
      await addPractice(form)
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    fetchList()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('删除后相关报名记录也会被清空，确认删除?', '警告', { type: 'warning' }).then(async () => {
    await deletePractice(row.id)
    ElMessage.success('已删除')
    fetchList()
  })
}

// --- 报名审核逻辑 (Drawer抽屉) ---
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const signupList = ref<any[]>([])
const currentActivity = ref<any>(null)

const openSignUpManage = async (row: any) => {
  currentActivity.value = row
  drawerVisible.value = true
  drawerLoading.value = true
  try {
    // 过滤：只获取当前活动 id 的报名记录
    const res: any = await getSignUpList({ activity: row.id })
    signupList.value = res.results || res
  } finally {
    drawerLoading.value = false
  }
}

// 核心：确认签到，发放积分
const handleConfirm = async (row: any) => {
  ElMessageBox.confirm(`确认【${row.user_name}】已参与活动并为其发放积分吗？`, '签到确认', { type: 'success' }).then(async () => {
    try {
      const res: any = await confirmAttendance(row.id)
      ElMessage.success(res.message || '签到成功，已发放积分')
      // 刷新名单
      openSignUpManage(currentActivity.value)
    } catch (e) {
      ElMessage.error('操作失败')
    }
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.app-container { padding: 20px; }
</style>