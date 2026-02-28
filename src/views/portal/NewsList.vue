<template>
  <div class="news-list-container">
    <div class="page-banner">
      <h1>📰 {{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </div>

    <div class="content-wrapper">
      <div v-loading="loading" class="list-section">
        <div 
          v-for="item in newsList" 
          :key="item.id" 
          class="news-card"
          @click="$router.push(`/portal/article/${item.id}`)"
        >
          <div class="news-cover" v-if="item.cover">
             <el-image :src="item.cover" fit="cover" />
          </div>

          <div class="news-content">
            <h3 class="news-title">{{ item.title }}</h3>
            <p class="news-summary">{{ item.summary || '暂无简介，点击阅读全文...' }}</p>
            <div class="news-meta">
              <span>👤 发布人：{{ item.author_name || '管理员' }}</span>
              <span class="divider">|</span>
              <span>📅 发布日期：{{ new Date(item.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <el-empty v-if="newsList.length === 0" description="暂无相关发布内容" />

        <div class="pagination-box" v-if="total > 0">
          <el-pagination
            background
            layout="prev, pager, next"
            :total="total"
            :page-size="pageSize"
            v-model:current-page="currentPage"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleList } from '../../api/content'
import { ArrowRight } from '@element-plus/icons-vue'

const route = useRoute()

const loading = ref(false)
const newsList = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 动态横幅数据
const pageTitle = ref('')
const pageSubtitle = ref('')

// 根据文章类型动态设置横幅提示语
const setBannerInfo = (type: number) => {
  pageTitle.value = (route.meta.title as string) || '文章列表'
  switch (type) {
    case 1: pageSubtitle.value = '权威发布，实时追踪。把握时代脉搏，学习最新精神。'; break;
    case 3: pageSubtitle.value = '展现先锋模范，弘扬榜样力量，记录优秀党员的点滴。'; break;
    case 5: pageSubtitle.value = '海量党建资料，随时随地充电，提升党员理论素养。'; break;
    case 6: pageSubtitle.value = '汇聚志愿微光，开展便民服务，践行党的初心使命。'; break;
    default: pageSubtitle.value = '聚焦党建工作，传播党的声音。';
  }
}

const fetchNews = async () => {
  loading.value = true
  try {
    // 👇 获取路由中配置好的当前栏目文章类型
    const currentType = Number(route.meta.articleType) || 1
    
    const res: any = await getArticleList({
      article_type: currentType, 
      scope: 'portal', // 👈 核心：只拉取超管发布的公开门户数据
      page: currentPage.value,
      size: pageSize.value
    })
    newsList.value = res.results || res || []
    total.value = res.count || 0
  } catch (error) {
    console.error("获取数据失败", error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchNews()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 👇 核心修复：监听路由变化。因为不同的导航指向同一个组件，Vue会复用组件，我们需要监听参数变化来刷新数据
watch(
  () => route.meta.articleType,
  (newType) => {
    if (newType) {
      currentPage.value = 1
      setBannerInfo(Number(newType))
      fetchNews()
    }
  }
)

onMounted(() => {
  setBannerInfo(Number(route.meta.articleType) || 1)
  fetchNews()
})
</script>

<style scoped>
.news-list-container { background-color: #fcfcfc; min-height: 100vh; }
.page-banner { background: linear-gradient(to right, #ce1126, #ff4d4d); color: white; padding: 60px 20px; text-align: center; }
.page-banner h1 { margin: 0 0 10px; font-size: 32px; letter-spacing: 2px; }
.page-banner p { margin: 0; opacity: 0.9; font-size: 16px; }

.content-wrapper { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }

.news-card { 
  background: white; 
  padding: 25px; 
  margin-bottom: 20px; 
  border-radius: 8px; 
  border: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s;
}

.news-card:hover { 
  transform: translateY(-3px); 
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
  border-color: #ce1126;
}

/* 封面图样式 */
.news-cover {
  width: 160px;
  height: 100px;
  margin-right: 20px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.news-cover .el-image { width: 100%; height: 100%; }

.news-content { flex: 1; }
.news-title { margin: 0 0 12px 0; font-size: 20px; color: #333; }
.news-summary { font-size: 14px; color: #666; margin-bottom: 15px; line-height: 1.6; }
.news-meta { font-size: 13px; color: #999; display: flex; align-items: center; }
.divider { margin: 0 10px; }

.arrow-icon { font-size: 20px; color: #ccc; margin-left: 20px; }
.news-card:hover .arrow-icon { color: #ce1126; }

.pagination-box { margin-top: 40px; display: flex; justify-content: center; }

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #ce1126;
}
</style>