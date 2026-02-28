<template>
  <div class="branch-home-container">
    <el-row :gutter="20">
      
      <el-col :span="8">
        <el-card class="org-card" shadow="hover" v-loading="loadingOrg">
          <template #header>
            <div class="card-header">
              <span>🚩 支部组织架构</span>
            </div>
          </template>
          
          <div class="org-content">
            <h2 class="org-name">{{ orgInfo.org_name }}</h2>
            <p class="org-desc">{{ orgInfo.description || '深入学习贯彻党的方针政策，发挥基层党组织战斗堡垒作用。' }}</p>
            
            <div class="org-stats">
              <div class="stat-item">
                <div class="stat-value">{{ orgInfo.total_members }} <span class="unit">名</span></div>
                <div class="stat-label">支部党员总数</div>
              </div>
            </div>

            <el-divider border-style="dashed" />

            <div class="committee-box">
              <h3>👨‍💼 支部委员会</h3>
              <div v-if="orgInfo.admins && orgInfo.admins.length > 0">
                <el-tag 
                  v-for="(name, index) in orgInfo.admins" 
                  :key="index" 
                  class="admin-tag" 
                  type="danger" 
                  effect="light"
                >
                  {{ index === 0 ? '书记' : '委员' }}：{{ name }}
                </el-tag>
              </div>
              <el-empty v-else description="暂未设置支部管理员" :image-size="60" />
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card shadow="hover" class="news-card">
          <el-tabs v-model="activeTab" class="branch-tabs">
            
            <el-tab-pane label="📸 支部动态" name="dynamics">
              <div v-loading="loadingNews" class="article-list">
                <div 
                  v-for="item in dynamicsList" 
                  :key="item.id" 
                  class="article-item"
                  @click="goToDetail(item.id)"
                >
                  <el-image v-if="item.cover" :src="item.cover" class="article-cover" fit="cover" />
                  <div class="article-info">
                    <h4 class="article-title">{{ item.title }}</h4>
                    <p class="article-summary">{{ item.summary || '点击查看动态详情...' }}</p>
                    <div class="article-meta">
                      <span>发布人: {{ item.author_name }}</span>
                      <span>{{ new Date(item.created_at).toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
                <el-empty v-if="dynamicsList.length === 0" description="本支部暂无动态" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="📢 支部通知" name="notices">
              <div v-loading="loadingNews" class="article-list">
                <div 
                  v-for="item in noticeList" 
                  :key="item.id" 
                  class="article-item notice-item"
                  @click="goToDetail(item.id)"
                >
                  <div class="notice-icon"><el-icon><BellFilled /></el-icon></div>
                  <div class="article-info">
                    <h4 class="article-title">{{ item.title }}</h4>
                    <div class="article-meta" style="margin-top: 8px;">
                      <span>发布人: {{ item.author_name }}</span>
                      <span>{{ new Date(item.created_at).toLocaleString() }}</span>
                    </div>
                  </div>
                </div>
                <el-empty v-if="noticeList.length === 0" description="本支部暂无通知" />
              </div>
            </el-tab-pane>

          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyBranchInfo } from '../../api/system'
import { getArticleList } from '../../api/content'
import { BellFilled } from '@element-plus/icons-vue'

const router = useRouter()
const activeTab = ref('dynamics')

// 数据状态
const loadingOrg = ref(false)
const orgInfo = ref<any>({})

const loadingNews = ref(false)
const dynamicsList = ref<any[]>([])
const noticeList = ref<any[]>([])

// 1. 获取支部基本信息与架构
const fetchOrgInfo = async () => {
  loadingOrg.value = true
  try {
    const res = await getMyBranchInfo()
    orgInfo.value = res
  } catch (error) {
    console.error('获取支部信息失败', error)
  } finally {
    loadingOrg.value = false
  }
}

// 2. 获取本支部发布的动态和通知 (关键：带上 scope: 'branch')
const fetchArticles = async () => {
  loadingNews.value = true
  try {
    // 拉取支部动态 (类型 4)
    const resDyn: any = await getArticleList({ article_type: 4, scope: 'branch', page: 1, size: 5 })
    dynamicsList.value = resDyn.results || resDyn || []

    // 拉取通知公告 (类型 2)
    const resNot: any = await getArticleList({ article_type: 2, scope: 'branch', page: 1, size: 5 })
    noticeList.value = resNot.results || resNot || []
  } catch (error) {
    console.error('获取支部内容失败', error)
  } finally {
    loadingNews.value = false
  }
}

const goToDetail = (id: number) => {
  // 复用门户端详情页组件即可展示文章内容
  router.push(`/portal/article/${id}`)
}

onMounted(() => {
  fetchOrgInfo()
  fetchArticles()
})
</script>

<style scoped>
.branch-home-container {
  padding-top: 10px;
}

.card-header { font-weight: bold; font-size: 16px; color: #333; }

/* 组织架构卡片样式 */
.org-card { height: 100%; min-height: 500px; }
.org-name { color: #ce1126; margin-top: 10px; margin-bottom: 10px; font-size: 22px; }
.org-desc { color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 30px; }

.org-stats { background: #fff9f9; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #ffe6e6; }
.stat-value { font-size: 32px; font-weight: bold; color: #ce1126; }
.stat-value .unit { font-size: 14px; font-weight: normal; }
.stat-label { font-size: 13px; color: #999; margin-top: 5px; }

.committee-box h3 { font-size: 16px; color: #333; margin-bottom: 15px; }
.admin-tag { margin-right: 10px; margin-bottom: 10px; font-size: 14px; padding: 15px 12px; }

/* 文章列表样式 */
.news-card { min-height: 500px; }
.branch-tabs :deep(.el-tabs__item.is-active) { color: #ce1126; font-weight: bold; }
.branch-tabs :deep(.el-tabs__active-bar) { background-color: #ce1126; }

.article-list { padding: 10px 0; }
.article-item { 
  display: flex; 
  padding: 15px; 
  border-bottom: 1px solid #f0f0f0; 
  cursor: pointer; 
  transition: all 0.3s;
  border-radius: 6px;
}
.article-item:hover { background-color: #fafafa; transform: translateX(5px); }
.article-item:last-child { border-bottom: none; }

.article-cover { width: 120px; height: 80px; border-radius: 4px; margin-right: 15px; flex-shrink: 0; }
.article-info { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.article-title { margin: 0 0 8px 0; font-size: 16px; color: #333; }
.article-summary { font-size: 13px; color: #666; margin: 0 0 8px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.article-meta { display: flex; justify-content: space-between; font-size: 12px; color: #999; }

/* 通知专属样式 */
.notice-item { align-items: center; }
.notice-icon { 
  width: 40px; height: 40px; 
  background-color: #fff1f0; color: #ce1126; 
  border-radius: 50%; 
  display: flex; justify-content: center; align-items: center; 
  font-size: 20px; margin-right: 15px; 
}
</style>