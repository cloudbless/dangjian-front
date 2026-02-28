<template>
  <div class="app-container">
    <el-card class="box-card">
      <div class="header-actions">
        <el-button type="primary" @click="handleAddRoot">➕ 新增一级党委</el-button>
        <el-button type="default" @click="getList">🔄 刷新</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="orgList"
        style="width: 100%; margin-top: 20px"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      >
        <el-table-column prop="name" label="组织名称" min-width="200">
          <template #default="scope">
            <span v-if="scope.row.level === 1">🚩 </span>
            <span v-else>📂 </span>
            {{ scope.row.name }}
          </template>
        </el-table-column>
        
        <el-table-column prop="description" label="简介" min-width="150" />
        
        <el-table-column label="层级" width="100" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.level === 1" type="danger">一级党委</el-tag>
            <el-tag v-else-if="scope.row.level === 2" type="warning">党总支</el-tag>
            <el-tag v-else type="success">党支部</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="350" align="center">
          <template #default="scope">
            <el-button 
              v-if="userStore.userInfo?.role === 'super_admin'" 
              link 
              type="success" 
              @click="enterBranch(scope.row)"
            >
              🚀 进入支部
            </el-button>
            <el-button link type="primary" @click="handleAddChild(scope.row)">➕ 添加下级</el-button>
            <el-button link type="primary" @click="handleEdit(scope.row)">✏️ 编辑</el-button>
            <el-button link type="danger" @click="handleDelete(scope.row)">🗑️ 删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="上级组织" v-if="parentName">
          <el-tag type="info">{{ parentName }}</el-tag>
        </el-form-item>

        <el-form-item label="组织名称">
          <el-input v-model="form.name" placeholder="例如：软件学院 student 党支部" />
        </el-form-item>
        
        <el-form-item label="层级">
           <el-input-number v-model="form.level" disabled />
        </el-form-item>

        <el-form-item label="简介">
          <el-input v-model="form.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getOrgList, addOrg, updateOrg, deleteOrg } from '../../../api/org'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router' // 👇 引入路由
import { useUserStore } from '../../../stores/user' // 👇 引入用户 Store

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const orgList = ref([]) 
const dialogVisible = ref(false)
const dialogTitle = ref('')
const parentName = ref('') 

const form = reactive<any>({
  id: undefined,
  name: '',
  parent: null,
  level: 1,
  description: ''
})

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res: any = await getOrgList()
    orgList.value = res.results || res 
  } finally {
    loading.value = false
  }
}

// 👇 新增：超管进入支部视察逻辑
const enterBranch = (row: any) => {
  // 1. 将正在视察的支部信息存入本地存储，供 BranchLayout 和拦截器使用
  localStorage.setItem('viewingOrgId', row.id.toString())
  localStorage.setItem('viewingOrgName', row.name)
  
  ElMessage.success(`正在以视察模式进入: ${row.name}`)
  
  // 2. 跳转到支部端首页
  router.push('/branch/home')
}

// 1. 新增一级党委
const handleAddRoot = () => {
  resetForm()
  form.level = 1
  form.parent = null
  parentName.value = '' 
  dialogTitle.value = '新增一级党委'
  dialogVisible.value = true
}

// 2. 新增下级
const handleAddChild = (row: any) => {
  resetForm()
  form.parent = row.id      
  form.level = row.level + 1 
  parentName.value = row.name  
  dialogTitle.value = '新增下级组织'
  dialogVisible.value = true
}

// 3. 编辑
const handleEdit = (row: any) => {
  Object.assign(form, row)
  parentName.value = '' 
  dialogTitle.value = '编辑组织'
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  form.id = undefined
  form.name = ''
  form.description = ''
  form.parent = null
  form.level = 1
}

// 提交
const submitForm = async () => {
  if (form.name === '') {
    ElMessage.warning('请输入组织名称')
    return
  }

  try {
    if (form.id) {
      await updateOrg(form.id, form)
      ElMessage.success('修改成功')
    } else {
      await addOrg(form)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    getList()
  } catch (err) {
    ElMessage.error('操作失败')
  }
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除 "${row.name}" 及其所有下级吗?`, '警告', {
    type: 'warning'
  }).then(async () => {
    await deleteOrg(row.id)
    ElMessage.success('删除成功')
    getList()
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.header-actions {
  margin-bottom: 20px;
}
/* 鼠标悬停在视察按钮上的特殊样式 */
.el-button--success.is-link:hover {
  background-color: #f0f9eb;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>