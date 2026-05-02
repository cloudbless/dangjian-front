<!-- src/views/system/user/RecordEdit.vue -->
<template>
  <div class="app-container">
    <div class="header-bar">
      <el-button @click="$router.back()">⬅ 返回列表</el-button>
      <h2>编辑党员纪实档案 - {{ userInfo.real_name || userInfo.username }}</h2>
      <el-button type="primary" :loading="saving" @click="handleSave">💾 保存档案</el-button>
    </div>

    <el-card class="form-card" v-loading="loading">
      <el-tabs tab-position="left" style="min-height: 600px;">
        
        <el-tab-pane label="一、基础信息补充">
          <el-form :model="form" label-width="140px" class="record-form">
            <el-row :gutter="40">
              <el-col :span="12"><el-form-item label="民族"><el-input v-model="form.nation" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="籍贯"><el-input v-model="form.native_place" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="班级/部门"><el-input v-model="form.class_name" /></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="二、申请入党">
          <el-form :model="form" label-width="150px" class="record-form">
            <el-row :gutter="40">
              <el-col :span="12"><el-form-item label="递交申请书时间"><el-date-picker v-model="form.app_submit_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="组织谈话时间"><el-date-picker v-model="form.app_talk_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="谈话人"><el-input v-model="form.app_talker" /></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="三、积极分子确定与考察">
          <el-form :model="form" label-width="160px" class="record-form">
            <el-row :gutter="40">
              <el-col :span="12"><el-form-item label="优团/党员推荐时间"><el-date-picker v-model="form.activist_recommend_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="确定积极分子时间"><el-date-picker v-model="form.activist_confirm_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="公示时间"><el-date-picker v-model="form.activist_public_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="上级审批时间"><el-date-picker v-model="form.activist_approve_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="推荐情况"><el-input type="textarea" v-model="form.activist_recommend_desc" rows="2" /></el-form-item>
            <el-form-item label="表决情况"><el-input type="textarea" v-model="form.activist_vote_desc" rows="2" /></el-form-item>
            <el-form-item label="公示情况"><el-input type="textarea" v-model="form.activist_public_desc" rows="2" /></el-form-item>
            <el-form-item label="上级党委审批意见"><el-input type="textarea" v-model="form.activist_approve_opinion" rows="2" /></el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="四、培养联系人">
          <el-form :model="form" label-width="140px" class="record-form">
            <el-row :gutter="40">
              <el-col :span="12"><el-form-item label="联系人1 姓名"><el-input v-model="form.contact1_name" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="联系人1 电话"><el-input v-model="form.contact1_phone" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="联系人2 姓名"><el-input v-model="form.contact2_name" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="联系人2 电话"><el-input v-model="form.contact2_phone" /></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="五、发展对象确定">
          <el-form :model="form" label-width="160px" class="record-form">
            <el-row :gutter="40">
              <el-col :span="12"><el-form-item label="群众座谈会时间"><el-date-picker v-model="form.target_mass_meeting_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="大会讨论时间"><el-date-picker v-model="form.confirm_target_meeting_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="公示时间"><el-date-picker v-model="form.target_public_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="发展对象培训时间"><el-date-picker v-model="form.target_train_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="审批时间"><el-date-picker v-model="form.target_approve_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12">
                <el-form-item label="政审情况">
                  <el-radio-group v-model="form.target_pol_check">
                    <el-radio label="合格">合格</el-radio>
                    <el-radio label="不合格">不合格</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="公示情况"><el-input type="textarea" v-model="form.target_public_desc" rows="2" /></el-form-item>
            <el-form-item label="审批意见"><el-input type="textarea" v-model="form.target_approve_opinion" rows="2" /></el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="六/七、预备党员接收与介绍人">
          <el-form :model="form" label-width="160px" class="record-form">
            <el-divider content-position="left">预备党员接收流程</el-divider>
            <el-row :gutter="40">
              <el-col :span="12"><el-form-item label="预审时间"><el-date-picker v-model="form.probation_pre_check_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="拟接收公示时间"><el-date-picker v-model="form.probation_public_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="大会讨论接收时间"><el-date-picker v-model="form.probation_meeting_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="派人谈话时间"><el-date-picker v-model="form.probation_talk_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="上级审批时间"><el-date-picker v-model="form.probation_approve_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="谈话人"><el-input v-model="form.probation_talker" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="培训情况"><el-input type="textarea" v-model="form.probation_train_desc" rows="2" /></el-form-item>
            <el-form-item label="公示情况"><el-input type="textarea" v-model="form.probation_public_desc" rows="2" /></el-form-item>
            <el-form-item label="表决情况"><el-input type="textarea" v-model="form.probation_vote_desc" rows="2" /></el-form-item>
            <el-form-item label="上级党委审批意见"><el-input type="textarea" v-model="form.probation_approve_opinion" rows="2" /></el-form-item>

            <el-divider content-position="left">入党介绍人信息</el-divider>
            <el-row :gutter="40">
              <el-col :span="8"><el-form-item label="介绍人1姓名"><el-input v-model="form.intro1_name" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="职务" label-width="60px"><el-input v-model="form.intro1_post" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="电话" label-width="60px"><el-input v-model="form.intro1_phone" /></el-form-item></el-col>
              
              <el-col :span="8"><el-form-item label="介绍人2姓名"><el-input v-model="form.intro2_name" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="职务" label-width="60px"><el-input v-model="form.intro2_post" /></el-form-item></el-col>
              <el-col :span="8"><el-form-item label="电话" label-width="60px"><el-input v-model="form.intro2_phone" /></el-form-item></el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="八、预备党员考察和转正">
          <el-form :model="form" label-width="160px" class="record-form">
            <el-row :gutter="40">
              <el-col :span="12"><el-form-item label="转正申请时间"><el-date-picker v-model="form.regular_apply_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="群众座谈时间"><el-date-picker v-model="form.regular_mass_meeting_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="转正公示时间"><el-date-picker v-model="form.regular_public_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="支部大会讨论时间"><el-date-picker v-model="form.regular_meeting_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
              <el-col :span="12"><el-form-item label="上级审批时间"><el-date-picker v-model="form.regular_approve_time" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item></el-col>
            </el-row>
            <el-form-item label="公示情况"><el-input type="textarea" v-model="form.regular_public_desc" rows="2" /></el-form-item>
            <el-form-item label="表决情况"><el-input type="textarea" v-model="form.regular_vote_desc" rows="2" /></el-form-item>
            <el-form-item label="上级审批意见"><el-input type="textarea" v-model="form.regular_approve_opinion" rows="2" /></el-form-item>
          </el-form>
        </el-tab-pane>

      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getUserDetail, updateUserRecord } from '../../../api/system'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userId = Number(route.params.id)

const loading = ref(false)
const saving = ref(false)
const userInfo = ref<any>({})

const form = reactive<any>({
  nation: '', native_place: '', class_name: '',
  app_submit_time: '', app_talk_time: '', app_talker: '',
  activist_recommend_time: '', activist_recommend_desc: '', activist_confirm_time: '',
  activist_vote_desc: '', activist_public_time: '', activist_public_desc: '',
  activist_approve_opinion: '', activist_approve_time: '',
  contact1_name: '', contact1_phone: '', contact2_name: '', contact2_phone: '',
  target_mass_meeting_time: '', confirm_target_meeting_time: '', target_public_time: '',
  target_public_desc: '', target_approve_opinion: '', target_approve_time: '',
  target_train_time: '', target_pol_check: '',
  probation_pre_check_time: '', probation_train_desc: '', probation_public_time: '',
  probation_public_desc: '', probation_meeting_time: '', probation_vote_desc: '',
  probation_talk_time: '', probation_talker: '', probation_approve_opinion: '',
  probation_approve_time: '',
  intro1_name: '', intro1_post: '', intro1_phone: '', intro2_name: '', intro2_post: '', intro2_phone: '',
  regular_apply_time: '', regular_mass_meeting_time: '', regular_public_time: '',
  regular_public_desc: '', regular_meeting_time: '', regular_vote_desc: '',
  regular_approve_opinion: '', regular_approve_time: ''
})

const fetchDetail = async () => {
  loading.value = true
  try {
    const res: any = await getUserDetail(userId)
    userInfo.value = res
    // 后端返回的数据我们已经拍平了，直接赋给 form 即可自动映射数据
    Object.keys(form).forEach(key => {
      if (res[key] !== undefined) form[key] = res[key]
    })
  } finally {
    loading.value = false
  }
}

const handleSave = async () => {
  saving.value = true
  try {
    // 👇 核心修复：深拷贝一份表单数据，清洗掉空字符串
    const payload = { ...form }
    Object.keys(payload).forEach(key => {
      // 如果字段是空字符串，强制转为 null，防止 Django 的 DateField 报错
      if (payload[key] === '') {
        payload[key] = null
      }
    })

    // 👇 把清洗干净的 payload 发给后端
    await updateUserRecord(userId, payload)
    ElMessage.success('档案保存成功！')
  } catch (error: any) {
    // 顺便把后端的具体报错打印出来，以后排错更方便
    console.error('保存失败详情:', error.response?.data)
    ElMessage.error('保存失败，请检查填写内容格式')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  if (userId) fetchDetail()
})
</script>

<style scoped>
.app-container { padding: 20px; }
.header-bar { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 20px; 
}
.header-bar h2 { margin: 0; color: #303133; }
.form-card { border-radius: 8px; }
.record-form { padding: 20px; }
:deep(.el-tabs__item) { height: 60px; line-height: 60px; font-size: 15px; }
:deep(.el-tabs__item.is-active) { color: #ce1126; font-weight: bold; }
</style>