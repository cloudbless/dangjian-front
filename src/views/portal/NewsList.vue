<template>
  <div class="news-list-container">
    <div class="page-banner">
      <h1>📰 时政要闻</h1>
      <p>权威发布，实时追踪。把握时代脉搏，学习最新精神。</p>
    </div>

    <div class="content-wrapper">
      <div v-loading="loading" class="list-section">
        <div 
          v-for="item in newsList" 
          :key="item.id" 
          class="news-card"
          @click="$router.push(`/portal/article/${item.id}`)"
        >
          <div class="news-content">
            <h3 class="news-title">{{ item.title }}</h3>
            <p class="news-summary">{{ item.summary || '点击阅读全文...' }}</p>
            <div class="news-meta">
              <span>👤 发布人：{{ item.author_name }}</span>
              <span class="divider">|</span>
              <span>📅 发布日期：{{ new Date(item.created_at).toLocaleDateString() }}</span>
            </div>
          </div>
          <el-icon class="arrow-icon"><ArrowRight /></el-icon>
        </div>

        <el-empty v-if="newsList.length === 0" description="暂无相关新闻公告" />

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
import { ref, onMounted } from 'vue'
import { getArticleList } from '../../api/content'
import { ArrowRight } from '@element-plus/icons-vue'

const loading = ref(false)
const newsList = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchNews = async () => {
  loading.value = true
  try {
    const res: any = await getArticleList({
      article_type: 1, // 只获取“今日时政”
      page: currentPage.value,
      size: pageSize.value
    })
    newsList.value = res.results || []
    total.value = res.count || 0
  } catch (error) {
    console.error("获取新闻失败", error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchNews()
  // 滚动回顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
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

.news-content { flex: 1; }
.news-title { margin: 0 0 12px 0; font-size: 20px; color: #333; }
.news-summary { font-size: 14px; color: #666; margin-bottom: 15px; line-height: 1.6; }
.news-meta { font-size: 13px; color: #999; display: flex; align-items: center; }
.divider { margin: 0 10px; }

.arrow-icon { font-size: 20px; color: #ccc; margin-left: 20px; }
.news-card:hover .arrow-icon { color: #ce1126; }

.pagination-box { margin-top: 40px; display: flex; justify-content: center; }

/* 深度选择器修改分页颜色 */
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #ce1126;
}
</style>