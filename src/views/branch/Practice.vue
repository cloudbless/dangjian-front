<template>
  <div class="branch-practice-container">
    <el-card shadow="never" class="main-card">
      <el-tabs v-model="activeTab" class="custom-tabs">
        
        <el-tab-pane label="🙌 志愿活动报名" name="activities">
          <div v-loading="loadingAct" class="activity-grid">
            <el-row :gutter="20">
              <el-col :span="8" v-for="item in activities" :key="item.id">
                <el-card shadow="hover" class="activity-card" :class="{'is-ended': item.status === 2}">
                  <div class="act-header">
                    <el-tag v-if="item.status === 0" type="success" effect="dark">报名中</el-tag>
                    <el-tag v-else-if="item.status === 1" type="warning" effect="dark">进行中</el-tag>
                    <el-tag v-else type="info" effect="dark">已结束</el-tag>
                    
                    <span class="act-points">+{{ item.points_reward }} 积分</span>
                  </div>
                  
                  <h3 class="act-title">{{ item.title }}</h3>
                  
                  <div class="act-info">
                    <p><el-icon><Location /></el-icon> 地点：{{ item.location }}</p>
                    <p><el-icon><Calendar /></el-icon> 时间：{{ new Date(item.start_time).toLocaleString() }}</p>
                    <p><el-icon><User /></el-icon> 招募：{{ item.capacity }} 人</p>
                  </div>
                  
                  <div class="act-desc">{{ item.description || '暂无详细介绍' }}</div>
                  
                  <div class="act-action">
                    <el-button 
                      type="danger" 
                      style="width: 100%" 
                      :disabled="item.status !== 0"
                      @click="handleSignUp(item)"
                      :loading="submitLoading === item.id"
                    >
                      {{ item.status === 0 ? '立即报名' : '报名已截止' }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-empty v-if="activities.length === 0" description="支部近期暂无实践活动" />
          </div>
        </el-tab-pane>

        <el-tab-pane label="📸 支部实践成果" name="showcase">
          <div v-loading="loadingShow" class="showcase-grid">
            <el-row :gutter="20">
              <el-col :span="6" v-for="item in showcases" :key="item.id">
                <el-card :body-style="{ padding: '0px' }" shadow="hover" class="showcase-card" @click="goToShowcase(item.id)">
                  <el-image 
                    :src="item.cover || defaultCover" 
                    class="showcase-img" 
                    fit="cover" 
                  />
                  <div class="showcase-content">
                    <h4 class="showcase-title">{{ item.title }}</h4>
                    <p class="showcase-summary">{{ item.summary || '展现先锋模范作用，践行初心使命。' }}</p>
                    <div class="showcase-meta">
                      <span>{{ new Date(item.created_at).toLocaleDateString() }}</span>
                      <span>发布: {{ item.author_name || '管理员' }}</span>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-empty v-if="showcases.length === 0" description="暂无实践成果展示" />
          </div>
        </el-tab-pane>

      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getPracticeList, signUpActivity } from '../../api/practice'
import { getArticleList } from '../../api/content'
import { ElMessage } from 'element-plus'
import { Location, Calendar, User } from '@element-plus/icons-vue'

const router = useRouter()
const defaultCover = 'https://images.unsplash.com/photo-1593113563332-6a84eb8eabdb?auto=format&fit=crop&q=80&w=400&h=250'

const activeTab = ref('activities')

// 数据状态
const loadingAct = ref(false)
const activities = ref<any[]>([])
const submitLoading = ref<number | null>(null)

const loadingShow = ref(false)
const showcases = ref<any[]>([])

// 1. 获取本支部发布的实践活动 (带上 scope: 'branch')
const fetchActivities = async () => {
  loadingAct.value = true
  try {
    const res: any = await getPracticeList({ scope: 'branch', page: 1, size: 50 })
    activities.value = res.results || res || []
  } catch (error) {
    console.error('获取实践活动失败', error)
  } finally {
    loadingAct.value = false
  }
}

// 2. 报名活动逻辑
const handleSignUp = async (activity: any) => {
  submitLoading.value = activity.id
  try {
    await signUpActivity({ activity: activity.id })
    ElMessage.success('🎉 报名成功！请按时前往指定地点参加活动。')
    // 报名成功后可选择重新拉取数据或刷新状态
  } catch (error: any) {
    // 捕获后端的 IntegrityError 400 报错提示
    const errMsg = error.response?.data?.detail || error.response?.data?.error || '报名失败，可能您已经报名过该活动'
    ElMessage.warning(errMsg)
  } finally {
    submitLoading.value = null
  }
}

// 3. 获取本支部的实践成果展示 (类型 6，且带上 scope: 'branch')
const fetchShowcases = async () => {
  loadingShow.value = true
  try {
    const res: any = await getArticleList({ article_type: 6, scope: 'branch', page: 1, size: 20 })
    showcases.value = res.results || res || []
  } catch (error) {
    console.error('获取成果展示失败', error)
  } finally {
    loadingShow.value = false
  }
}

// 4. 跳转到文章详情页阅读图文
const goToShowcase = (id: number) => {
  router.push(`/portal/article/${id}`)
}

onMounted(() => {
  fetchActivities()
  fetchShowcases()
})
</script>

<style scoped>
.branch-practice-container { margin-top: 10px; }
.main-card { min-height: 600px; }
.custom-tabs :deep(.el-tabs__item.is-active) { color: #ce1126; font-weight: bold; }
.custom-tabs :deep(.el-tabs__active-bar) { background-color: #ce1126; }

/* === 活动大厅样式 === */
.activity-grid { padding: 10px 0; }
.activity-card { margin-bottom: 20px; border-radius: 8px; transition: all 0.3s; position: relative; }
.activity-card:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); border-color: #ce1126; }
.is-ended { opacity: 0.7; filter: grayscale(50%); }

.act-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.act-points { font-weight: bold; color: #E6A23C; font-size: 14px; }

.act-title { margin: 0 0 15px 0; font-size: 18px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.act-info { background-color: #f8f9fa; padding: 10px 15px; border-radius: 6px; margin-bottom: 15px; }
.act-info p { margin: 5px 0; font-size: 13px; color: #666; display: flex; align-items: center; }
.act-info .el-icon { margin-right: 8px; font-size: 14px; }

.act-desc { font-size: 13px; color: #999; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 36px; }

.act-action { border-top: 1px dashed #ebeef5; padding-top: 15px; }

/* === 成果展示图文卡片样式 === */
.showcase-grid { padding: 10px 0; }
.showcase-card { margin-bottom: 20px; border-radius: 8px; cursor: pointer; transition: all 0.3s; height: 280px; }
.showcase-card:hover { transform: translateY(-4px); box-shadow: 0 6px 16px rgba(0,0,0,0.08); }

.showcase-img { width: 100%; height: 150px; display: block; }

.showcase-content { padding: 15px; }
.showcase-title { margin: 0 0 8px 0; font-size: 15px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.showcase-summary { font-size: 12px; color: #666; margin: 0 0 15px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 34px; }

.showcase-meta { display: flex; justify-content: space-between; font-size: 12px; color: #999; }
</style>