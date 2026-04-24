<template>
  <div class="app-container">
    <el-card class="search-box">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="用户名">
          <el-input v-model="queryParams.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">🔍 搜索</el-button>
          <el-button type="success" @click="handleAdd">➕ 新增党员</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-box">
      <el-table :data="userList" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column label="角色" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.role === 'super_admin'" type="danger">党总支管理员</el-tag>
            <el-tag v-else-if="scope.row.role === 'branch_admin'" type="warning">支部管理员</el-tag>
            <el-tag v-else-if="scope.row.role === 'member'" type="success">正式党员</el-tag>
            <el-tag v-else type="info">{{ scope.row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="organization_name" label="所属组织" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="total_points" label="积分" width="90" sortable />
        
        <el-table-column label="操作" width="240" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="warning" @click="handleResetPwd(scope.row)">重置</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="getList"
          @current-change="getList"
        />
      </div>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="用户名">
          <el-input v-model="form.username" :disabled="!!form.id" />
        </el-form-item>
        
        <el-form-item label="所属组织">
          <el-tree-select 
            v-model="form.organization" 
            :data="orgOptions" 
            :props="{ label: 'name', value: 'id', children: 'children' }"
            node-key="id"
            placeholder="请选择支部" 
            style="width: 100%" 
            clearable
            check-strictly
          />
        </el-form-item>

        <el-form-item label="角色">
          <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
            <el-option label="正式党员" value="member" />
            <el-option label="支部管理员" value="branch_admin" />
            <el-option label="党总支管理员" value="super_admin" />
          </el-select>
        </el-form-item>

        <el-form-item label="手机号">
          <el-input v-model="form.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定保存</el-button>
      </template>
    </el-dialog>

    <el-dialog title="重置党员密码" v-model="pwdVisible" width="400px">
      <el-form label-width="80px">
        <el-form-item label="新密码">
          <el-input v-model="newPwd" placeholder="请输入新密码" show-password />
        </el-form-item>
        <p style="color: #999; font-size: 12px; margin-left: 80px;">重置后请告知党员及时修改</p>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="warning" @click="submitResetPwd">确认重置</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
// 🎯 补全了 resetUserPassword 的导入
import { getUserList, addUser, updateUser, deleteUser, getOrgList, resetUserPassword } from '../../../api/system'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const userList = ref([])
const total = ref(0)
const orgOptions = ref<any[]>([])

// 弹窗控制
const dialogVisible = ref(false)
const dialogTitle = ref('')
const pwdVisible = ref(false)
const newPwd = ref('123456')
const currentUserId = ref(0)

const queryParams = reactive({ page: 1, size: 10, username: '' })

const form = reactive<any>({
  id: undefined,
  username: '',
  role: 'member', // 🎯 初始值也改为 'member'
  organization: null,
  phone: ''
})

const getList = async () => {
  loading.value = true
  try {
    const res: any = await getUserList(queryParams)
    userList.value = res.results
    total.value = res.count
  } finally {
    loading.value = false
  }
}

const fetchOrgs = async () => {
  try {
    const res: any = await getOrgList()
    orgOptions.value = res.results || res
  } catch (e) {
    console.error("加载组织失败", e)
  }
}

const handleQuery = () => { queryParams.page = 1; getList(); }

const handleAdd = () => {
  Object.assign(form, { id: undefined, username: '', role: 'member', organization: null, phone: '' })
  dialogTitle.value = '新增党员'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  // 🎯 将整行数据拷贝到表单
  // 注意：后端返回的 row.organization 应该是 ID，如果是对象则需要 row.organization.id
  Object.assign(form, row)
  dialogTitle.value = '编辑党员信息'
  dialogVisible.value = true
}

const submitForm = async () => {
  try {
    if (form.id) {
      await updateUser(form.id, form)
      ElMessage.success('修改成功')
    } else {
      await addUser({ ...form, password: 'password123' }) 
      ElMessage.success('新增成功，初始密码 password123')
    }
    dialogVisible.value = false
    getList()
  } catch (error: any) {
    // 捕获后端返回的详细错误并展示
    const errorData = error.response?.data
    if (errorData) {
      const firstError = Object.values(errorData)[0]
      ElMessage.error(Array.isArray(firstError) ? firstError[0] : '保存失败')
    }
  }
}

const handleResetPwd = (row: any) => {
  currentUserId.value = row.id
  newPwd.value = '123456'
  pwdVisible.value = true
}

const submitResetPwd = async () => {
  try {
    await resetUserPassword(currentUserId.value, { password: newPwd.value })
    ElMessage.success('密码重置成功')
    pwdVisible.value = false
  } catch (error) {
    ElMessage.error('密码重置失败')
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除党员 [${row.username}] 吗?`, '警告', { 
    type: 'warning',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消'
  }).then(async () => {
    await deleteUser(row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

onMounted(() => {
  getList()
  fetchOrgs()
})
</script>

<style scoped>
.app-container { padding: 20px; }
.search-box { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }
</style>