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
            <el-tag v-if="scope.row.role === 'super_admin'" type="danger" effect="dark">党委书记</el-tag>
            <el-tag v-else-if="scope.row.role === 'branch_admin'" type="warning" effect="dark">党支部书记</el-tag>
            <el-tag v-else-if="scope.row.role === 'member'" type="danger" effect="plain">正式党员</el-tag>
            <!-- 👇 新增：预备党员的标签展示 -->
            <el-tag v-else-if="scope.row.role === 'probationary_member'" type="warning" effect="plain">预备党员</el-tag>
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
        
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="scope">
            <el-button size="small" type="primary" plain @click="handleEdit(scope.row)">编辑</el-button>
            
            <!-- 👇 新增：纪实档案跳转按钮 -->
            <el-button size="small" type="success" plain @click="$router.push(`/system/users/record/${scope.row.id}`)">纪实档案</el-button>
            
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
                <!-- 👇 新增：预备党员的选择项 -->
                <el-option label="预备党员" value="probationary_member" />
                <el-option label="党支部书记" value="branch_admin" />
                <el-option label="党委书记" value="super_admin" />
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

    <!-- 🎯 优化：党员发展全流程数字档案名片侧边抽屉 -->
    <el-drawer v-model="cardVisible" title="📜 党员发展纪实数字档案" direction="rtl" size="55%">
      <div v-if="activeUser" class="drawer-content">
        <!-- 头部简要信息 -->
        <div class="user-avatar-box">
          <el-avatar :size="80" :src="activeUser.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'" />
          <h3>{{ activeUser.real_name || activeUser.username }}</h3>
          <el-tag type="danger" effect="dark" size="small">{{ activeUser.organization_name || '未分配支部' }}</el-tag>
          <p style="margin-top: 10px; color: #ce1126; font-weight: bold;">累计积分：{{ activeUser.total_points }} 分</p>
        </div>

        <!-- 1. 基础信息 -->
        <el-descriptions title="一、 基础信息" :column="2" border size="small" class="record-section">
          <el-descriptions-item label="姓名">{{ activeUser.real_name || activeUser.username }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ activeUser.gender === 1 ? '男' : (activeUser.gender === 2 ? '女' : '未知') }}</el-descriptions-item>
          <el-descriptions-item label="民族">{{ activeUser.nation || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="籍贯">{{ activeUser.native_place || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="班级/部门">{{ activeUser.class_name || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="电话号码">{{ activeUser.phone || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="身份证号码" :span="2">{{ activeUser.identity_card || '未填写' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 2. 申请入党[cite: 3] -->
        <el-descriptions title="二、 申请入党" :column="2" border size="small" class="record-section">
          <el-descriptions-item label="递交入党申请书时间" :span="2">{{ activeUser.app_submit_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="党组织派人谈话时间">{{ activeUser.app_talk_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="谈话人">{{ activeUser.app_talker || '未填写' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 3. 入党积极分子的确定和培养教育[cite: 3] -->
        <el-descriptions title="三、 入党积极分子的确定和培养教育" :column="2" border size="small" class="record-section">
          <el-descriptions-item label="优团/党员推荐时间">{{ activeUser.activist_recommend_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="推荐情况">{{ activeUser.activist_recommend_desc || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="确定积极分子时间">{{ activeUser.activist_confirm_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="表决情况">{{ activeUser.activist_vote_desc || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="公示时间">{{ activeUser.activist_public_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="公示情况">{{ activeUser.activist_public_desc || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="上级党委审批时间">{{ activeUser.activist_approve_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="上级党委审批意见">{{ activeUser.activist_approve_opinion || '未填写' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 4. 培养联系人[cite: 3] -->
        <el-descriptions title="四、 培养联系人" :column="2" border size="small" class="record-section">
          <el-descriptions-item label="联系人(1)姓名">{{ activeUser.contact1_name || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ activeUser.contact1_phone || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="联系人(2)姓名">{{ activeUser.contact2_name || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ activeUser.contact2_phone || '未填写' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 5. 发展对象的确定和考察[cite: 3] -->
        <el-descriptions title="五、 发展对象的确定和考察" :column="2" border size="small" class="record-section">
          <el-descriptions-item label="入党征求党内外群众意见座谈会时间" :span="2">{{ activeUser.target_mass_meeting_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="支委会/支部大会讨论确定为发展对象会议时间" :span="2">{{ activeUser.confirm_target_meeting_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="公示时间">{{ activeUser.target_public_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="公示情况">{{ activeUser.target_public_desc || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="上级党委审批时间">{{ activeUser.target_approve_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="上级党委审批意见">{{ activeUser.target_approve_opinion || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="发展对象培训时间">{{ activeUser.target_train_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="政审情况">{{ activeUser.target_pol_check || '未填写' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 6. 预备党员的接收[cite: 3] -->
        <el-descriptions title="六、 预备党员的接收" :column="2" border size="small" class="record-section">
          <el-descriptions-item label="上级党委预审时间">{{ activeUser.probation_pre_check_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="培训情况">{{ activeUser.probation_train_desc || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="拟接收为预备党员公示时间">{{ activeUser.probation_public_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="公示情况">{{ activeUser.probation_public_desc || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="支部大会讨论接收为预备党员时间">{{ activeUser.probation_meeting_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="表决情况">{{ activeUser.probation_vote_desc || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="上级党委派人谈话时间">{{ activeUser.probation_talk_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="谈话人">{{ activeUser.probation_talker || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="上级党委审批时间">{{ activeUser.probation_approve_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="上级党委审批意见">{{ activeUser.probation_approve_opinion || '未填写' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 7. 入党介绍人[cite: 3] -->
        <el-descriptions title="七、 入党介绍人" :column="2" border size="small" class="record-section">
          <el-descriptions-item label="介绍人(1)姓名">{{ activeUser.intro1_name || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="职务">{{ activeUser.intro1_post || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话" :span="2">{{ activeUser.intro1_phone || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="介绍人(2)姓名">{{ activeUser.intro2_name || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="职务">{{ activeUser.intro2_post || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话" :span="2">{{ activeUser.intro2_phone || '未填写' }}</el-descriptions-item>
        </el-descriptions>

        <!-- 8. 预备党员的教育考察和转正[cite: 3] -->
        <el-descriptions title="八、 预备党员的教育考察和转正" :column="2" border size="small" class="record-section" style="margin-bottom: 30px;">
          <el-descriptions-item label="转正申请时间">{{ activeUser.regular_apply_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="转正征求党内外群众意见座谈时间">{{ activeUser.regular_mass_meeting_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="预备党员转正公示时间">{{ activeUser.regular_public_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="公示情况">{{ activeUser.regular_public_desc || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="支部大会讨论转为正式党员时间">{{ activeUser.join_party_date || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="表决情况">{{ activeUser.regular_vote_desc || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="审批时间">{{ activeUser.regular_approve_time || '未填写' }}</el-descriptions-item>
          <el-descriptions-item label="上级党委审批意见">{{ activeUser.regular_approve_opinion || '未填写' }}</el-descriptions-item>
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

/* 党员详细档案抽屉样式 */
.drawer-content { 
  padding: 0 15px; 
  height: 100%; 
  overflow-y: auto; 
}
.user-avatar-box { 
  text-align: center; 
  margin-bottom: 25px; 
  padding-bottom: 15px; 
  border-bottom: 2px solid #ce1126; 
}
.user-avatar-box h3 { 
  margin: 15px 0 5px; 
  font-size: 22px; 
  color: #333; 
}
.record-section {
  margin-bottom: 25px;
}
/* 调整标题样式使其更醒目 */
:deep(.el-descriptions__title) {
  font-size: 16px;
  color: #ce1126;
  border-left: 4px solid #ce1126;
  padding-left: 8px;
  margin-bottom: 10px;
}
/* 调整左侧 Label 背景色和宽度 */
:deep(.el-descriptions__label) { 
  width: 140px; 
  color: #606266; 
  background-color: #fafafa !important;
  font-weight: bold;
}
</style>