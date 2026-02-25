<template>
  <div class="practice-container">
    <div class="page-header">
      <h1>🤝 实践中心</h1>
      <p>知行合一，服务群众。快来报名参与支部的线下志愿活动吧！</p>
    </div>

    <div class="content-wrapper" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="8" v-for="item in activityList" :key="item.id" style="margin-bottom: 30px;">
          <el-card shadow="hover" class="activity-card" :body-style="{ padding: '0px' }">
            <div class="cover-box" :style="{ backgroundImage: item.cover ? `url(${item.cover})` : 'linear-gradient(135deg, #67C23A 0%, #E6A23C 100%)' }">
              <div class="status-badge">
                <el-tag v-if="item.status === 0" type="success" effect="dark">报名中</el-tag>
                <el-tag v-else-if="item.status === 1" type="warning" effect="dark">进行中</el-tag>
                <el-tag v-else type="info" effect="dark">已结束</el-tag>
              </div>
            </div>

            <div class="info-box">
              <h3 class="title" :title="item.title">{{ item.title }}</h3>
              <div class="meta-item">
                <span class="icon">📍</span> {{ item.location }}
              </div>
              <div class="meta-item">
                <span class="icon">⏰</span> {{ new Date(item.start_time).toLocaleString() }}
              </div>
              <div class="meta-item">
                <span class="icon">👥</span> 已报/名额：{{ item.current_signups }} / {{ item.capacity }} 人
              </div>
              <div class="meta-item points">
                <span class="icon">✨</span> 奖励积分：+{{ item.points_reward }} 分
              </div>

              <div class="action-box">
                <el-button 
                  type="primary" 
                  style="width: 100%;" 
                  :disabled="item.status !== 0 || item.current_signups >= item.capacity"
                  @click="handleSignUp(item.id)"
                >
                  {{ item.status !== 0 ? '不在报名期' : (item.current_signups >= item.capacity ? '名额已满' : '立即报名') }}
                </el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-empty v-if="activityList.length === 0" description="近期暂无实践活动发布" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getPracticeList, signUpActivity } from '../../api/practice'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const activityList = ref<any[]>([])

// 获取活动列表
const fetchList = async () => {
  loading.value = true
  try {
    const res: any = await getPracticeList()
    activityList.value = res.results || res
  } catch (error) {
    console.error("获取实践活动失败", error)
  } finally {
    loading.value = false
  }
}

// 处理报名点击
const handleSignUp = async (activityId: number) => {
  // 1. 检查是否登录 (报名必须是党员身份)
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessageBox.confirm('您需要登录后才能报名参与实践活动，是否前往登录？', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push('/login')
    }).catch(() => {})
    return
  }

  // 2. 确认报名
  ElMessageBox.confirm('确认报名参加该志愿活动吗？', '报名确认', {
    confirmButtonText: '确定报名',
    cancelButtonText: '我再想想',
    type: 'info'
  }).then(async () => {
    try {
      await signUpActivity({ activity: activityId })
      ElMessage.success('🎉 报名成功！请等待管理员审核。')
      fetchList() // 刷新列表，更新已报名人数
    } catch (error: any) {
      // 如果后端报错（比如重复报名），提示用户
      if (error.response && error.response.status === 400) {
         ElMessage.warning('您已经报名过该活动，请勿重复操作。')
      } else {
         ElMessage.error('报名失败，请稍后再试。')
      }
    }
  }).catch(() => {})
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.page-header { background: #ce1126; color: white; padding: 40px 20px; text-align: center; margin-bottom: 30px; }
.page-header h1 { margin: 0 0 10px 0; font-size: 28px; }
.page-header p { margin: 0; opacity: 0.9; }

.content-wrapper { max-width: 1200px; margin: 0 auto; padding: 0 20px 40px; }

.activity-card { border-radius: 8px; overflow: hidden; transition: all 0.3s; }
.activity-card:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }

.cover-box { height: 160px; background-size: cover; background-position: center; position: relative; }
.status-badge { position: absolute; top: 10px; right: 10px; }

.info-box { padding: 20px; }
.title { margin: 0 0 15px 0; font-size: 18px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meta-item { font-size: 14px; color: #666; margin-bottom: 8px; display: flex; align-items: center; }
.meta-item .icon { margin-right: 8px; font-size: 16px; }
.points { color: #E6A23C; font-weight: bold; margin-bottom: 20px; }

.action-box { margin-top: 20px; border-top: 1px dashed #eee; padding-top: 15px; }
</style>