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
          <el-date-picker v-model="timeRange" type="datetimerange" value-format="YYYY-MM-DDTHH:mm:ss" style="width: 100%" />
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
          <el-input type="textarea" v-model="form.content" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确认发布</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="drawerVisible" :title="`报名管理 - ${currentActivity?.title}`" size="55%">
      <el-table :data="signupList" v-loading="drawerLoading" border>
        <el-table-column label="党员姓名" width="120">
          <template #default="{ row }">{{ row.username || row.user_name }}</template>
        </el-table-column>
        <el-table-column label="报名时间" width="170">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="当前状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="info">待审核</el-tag>
            <el-tag v-else-if="row.status === 1" type="primary">已通过</el-tag>
            <el-tag v-else-if="row.status === 2" type="danger">已驳回</el-tag>
            <el-tag v-else-if="row.status === 3" type="success">已发分</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作流程管理" min-width="200">
          <template #default="{ row }">
            <template v-if="row.status === 0">
              <el-button type="primary" size="small" plain @click="handleAudit(row, 1)">允许参与</el-button>
              <el-button type="danger" size="small" plain @click="handleAudit(row, 2)">驳回报名</el-button>
            </template>

            <template v-else-if="row.status === 1">
              <el-button type="warning" size="small" @click="handleGrantPoints(row)">🏆 结项发分</el-button>
              <el-button type="info" size="small" link @click="handleAudit(row, 0)">撤回审核</el-button>
            </template>

            <template v-else-if="row.status === 2">
              <span style="color: #F56C6C; font-size: 13px; margin-right: 10px;">已驳回</span>
              <el-button type="info" size="small" link @click="handleAudit(row, 0)">撤回重审</el-button>
            </template>

            <span v-else-if="row.status === 3" style="color: #67C23A; font-size: 13px; font-weight: bold;">流程已结束 (积分已发)</span>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
// 👇 引入新的 api 方法
import { getPracticeList, addPractice, updatePractice, deletePractice, getSignUpList, auditSignUp, grantPoints } from '../../api/practice'
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
  id: undefined as number | undefined, title: '', location: '', content: '', start_time: '', end_time: '', capacity: 50, points_reward: 5
})

const handleCreate = () => {
  form.id = undefined; form.title = ''; form.location = ''; form.content = ''; form.capacity = 50; form.points_reward = 5; timeRange.value = null
  dialogTitle.value = '发布新活动'; dialogVisible.value = true
}

const handleEdit = (row: any) => {
  Object.assign(form, row)
  timeRange.value = [row.start_time, row.end_time]
  dialogTitle.value = '编辑活动'; dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title || !timeRange.value) return ElMessage.warning('请填写完整')
  form.start_time = timeRange.value[0]; form.end_time = timeRange.value[1]
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
  } catch (error) { ElMessage.error('操作失败') }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除?', '警告', { type: 'warning' }).then(async () => {
    await deletePractice(row.id)
    ElMessage.success('已删除'); fetchList()
  })
}

// --- 报名审核抽屉逻辑 ---
const drawerVisible = ref(false)
const drawerLoading = ref(false)
const signupList = ref<any[]>([])
const currentActivity = ref<any>(null)

const openSignUpManage = async (row: any) => {
  currentActivity.value = row
  drawerVisible.value = true
  drawerLoading.value = true
  try {
    const res: any = await getSignUpList({ activity: row.id })
    signupList.value = res.results || res
  } finally {
    drawerLoading.value = false
  }
}

// 👇 动作1：审核操作 (1 通过, 2 驳回)
const handleAudit = async (row: any, status: number) => {
  const actionText = status === 1 ? '允许其参与' : '驳回'
  const name = row.username || row.user_name
  ElMessageBox.confirm(`确认${actionText}【${name}】的报名请求吗？`, '审核提示', { type: 'warning' }).then(async () => {
    try {
      await auditSignUp(row.id, { status })
      ElMessage.success('操作成功')
      openSignUpManage(currentActivity.value) // 刷新抽屉列表
    } catch (e) {
      ElMessage.error('审核操作失败')
    }
  })
}

// 👇 动作2：发分操作
const handleGrantPoints = async (row: any) => {
  const name = row.username || row.user_name
  ElMessageBox.confirm(`活动结束后，确认给【${name}】发放 ${currentActivity.value.points_reward} 积分吗？`, '发放奖励', { type: 'success' }).then(async () => {
    try {
      const res: any = await grantPoints(row.id)
      ElMessage.success(res.message || '积分发放成功')
      openSignUpManage(currentActivity.value) // 刷新抽屉列表
    } catch (e: any) {
      // 显示后端返回的具体拦截错误（如：已发放过）
      ElMessage.error(e.response?.data?.error || '积分发放失败')
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