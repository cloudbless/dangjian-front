<template>
  <div class="app-container">
    <el-card class="search-box">
      <el-form :inline="true" :model="queryParams">
        <el-form-item label="姓名/账号">
          <el-input v-model="queryParams.username" placeholder="请输入关键词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery">🔍 搜索</el-button>
          <el-button type="success" @click="handleAdd">➕ 新增党员</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-box">
      <el-table :data="userList" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        
        <el-table-column label="党员姓名(点击查看档案)" width="180">
          <template #default="scope">
            <el-link type="primary" :underline="false" @click="showUserCard(scope.row)">
              <span style="font-weight: bold;">{{ scope.row.real_name || scope.row.username }}</span>
            </el-link>
          </template>
        </el-table-column>

        <el-table-column label="角色" width="130" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.role === 'super_admin'" type="danger" effect="dark">党总支管理员</el-tag>
            <el-tag v-else-if="scope.row.role === 'branch_admin'" type="warning" effect="dark">支部书记</el-tag>
            <el-tag v-else-if="scope.row.role === 'member'" type="danger" effect="plain">正式党员</el-tag>
            <el-tag v-else type="info">{{ scope.row.role }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="organization_name" label="所属组织" min-width="150" />
        <el-table-column prop="phone" label="手机号" width="130" />
        
        <el-table-column label="性别" width="80" align="center">
          <template #default="scope">
            <el-tag v-if="scope.row.gender === 1" size="small">男</el-tag>
            <el-tag v-else-if="scope.row.gender === 2" type="danger" size="small">女</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="total_points" label="学习积分" width="100" sortable align="center" />
        
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="warning" plain @click="handleResetPwd(scope.row)">重置</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="650px" top="5vh">
      <el-form :model="form" label-width="90px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="登录账号">
              <el-input v-model="form.username" :disabled="!!form.id" placeholder="必填，用于登录" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名">
              <el-input v-model="form.real_name" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号码">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别">
              <el-select v-model="form.gender" style="width: 100%">
                <el-option label="男" :value="1" />
                <el-option label="女" :value="2" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号">
              <el-input v-model="form.identity_card" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="出生日期">
              <el-date-picker v-model="form.birthday" type="date" value-format="YYYY-MM-DD" style="width: 100%" placeholder="选择日期" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="系统角色">
              <el-select v-model="form.role" style="width: 100%">
                <el-option label="正式党员" value="member" />
                <el-option label="支部管理员" value="branch_admin" />
                <el-option label="党总支管理员" value="super_admin" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="入党时间">
              <el-date-picker v-model="form.join_party_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" placeholder="选择日期" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="所属组织">
          <el-tree-select 
            v-model="form.organization" 
            :data="orgOptions" 
            :props="{ label: 'name', value: 'id', children: 'children' }"
            node-key="id"
            placeholder="请选择归属党支部" 
            style="width: 100%" 
            clearable
            check-strictly
          />
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
        <p style="color: #999; font-size: 12px; margin-left: 80px;">重置后请告知党员及时登录修改</p>
      </el-form>
      <template #footer>
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="warning" @click="submitResetPwd">确认重置</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="cardVisible" title="📜 党员数字档案" direction="rtl" size="400px">
      <div v-if="activeUser" class="drawer-content">
        <div class="user-avatar-box">
          <el-avatar :size="90" :src="activeUser.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
          <h3>{{ activeUser.real_name || activeUser.username }}</h3>
          <el-tag type="danger" effect="dark" size="small">{{ activeUser.organization_name || '未分配支部' }}</el-tag>
        </div>

        <el-descriptions :column="1" border size="default" class="user-desc">
          <el-descriptions-item label="登录账号">{{ activeUser.username }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ activeUser.gender === 1 ? '男' : (activeUser.gender === 2 ? '女' : '未知') }}</el-descriptions-item>
          <el-descriptions-item label="手机号码">{{ activeUser.phone || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ activeUser.identity_card || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ activeUser.birthday || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="入党时间">{{ activeUser.join_party_date || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="当前积分">
            <span style="color: #ce1126; font-weight: bold; font-size: 16px;">{{ activeUser.total_points }} 分</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
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

// 🎯 名片抽屉控制
const cardVisible = ref(false)
const activeUser = ref<any>(null)

const queryParams = reactive({ page: 1, size: 10, username: '' })

// 🎯 初始化表单数据（包含所有新增字段）
const form = reactive<any>({
  id: undefined,
  username: '',
  real_name: '',
  gender: 1,
  identity_card: '',
  birthday: '',
  join_party_date: '',
  role: 'member', 
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
  // 恢复默认的空表单
  Object.assign(form, { 
    id: undefined, username: '', real_name: '', gender: 1, 
    identity_card: '', birthday: '', join_party_date: '',
    role: 'member', organization: null, phone: '' 
  })
  dialogTitle.value = '新增党员档案'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  Object.assign(form, row)
  dialogTitle.value = '编辑党员信息'
  dialogVisible.value = true
}

// 🎯 触发侧边栏名片
const showUserCard = (row: any) => {
  activeUser.value = row
  cardVisible.value = true
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
  ElMessageBox.confirm(`确认删除党员 [${row.real_name || row.username}] 的档案吗? 该操作不可逆！`, '严重警告', { 
    type: 'error',
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
.table-box { border-radius: 8px; }
.pagination-container { margin-top: 20px; display: flex; justify-content: flex-end; }

/* 名片抽屉样式优化 */
.drawer-content { padding: 0 10px; }
.user-avatar-box { 
  text-align: center; 
  margin-bottom: 30px; 
  padding-bottom: 20px; 
  border-bottom: 1px dashed #eee; 
}
.user-avatar-box h3 { margin: 15px 0 10px; font-size: 20px; color: #333; }
.user-desc { margin-top: 20px; }
:deep(.el-descriptions__label) { width: 100px; color: #666; background-color: #fafafa !important;}
</style>