<template>
  <div class="article-detail-container" v-loading="loading">
    <div v-if="article" class="article-wrapper">
      <div class="article-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/portal/home' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ getTypeName(article.article_type) }}</el-breadcrumb-item>
        </el-breadcrumb>
        
        <h1 class="title">{{ article.title }}</h1>
        
        <div class="meta">
          <span>📅 发布时间：{{ new Date(article.created_at).toLocaleString() }}</span>
          <span>👤 作者：{{ article.author_name }}</span>
          <span>🏢 组织：{{ article.organization_name || '系统发布' }}</span>
        </div>
      </div>

      <div v-if="article.cover" class="article-cover">
        <img :src="article.cover" alt="cover" />
      </div>

      <div class="article-content rich-text-content" v-html="article.content"></div>

      <div class="article-footer">
        <div class="actions">
          <el-button type="danger" plain round @click="handleLike">
            ❤️ 点赞 ({{ likeCount }})
          </el-button>
          <el-button type="info" plain round @click="$router.back()">
            🔙 返回列表
          </el-button>
        </div>
      </div>
    </div>
    
    <el-empty v-else-if="!loading" description="文章去火星了..." />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getArticleDetail } from '../../api/content'
import { ElMessage } from 'element-plus'

const route = useRoute()
const loading = ref(false)
const article = ref<any>(null)
const likeCount = ref(Math.floor(Math.random() * 100)) // 模拟点赞数

const fetchDetail = async () => {
  // 错误写法：const id = route.params.id
  // 正确写法：使用 Number() 或 parseInt() 进行转换
  const id = Number(route.params.id) 

  if (isNaN(id)) {
    ElMessage.error('无效的文章ID')
    return
  }

  loading.value = true
  try {
    // 现在的 id 是 number 类型了，符合 API 的要求
    const res: any = await getArticleDetail(id)
    article.value = res
  } catch (error) {
    ElMessage.error('获取文章详情失败')
  } finally {
    loading.value = false
  }
}

const getTypeName = (type: number) => {
  const map: any = { 1: '今日时政', 2: '通知公告', 3: '党员风采', 4: '支部动态' }
  return map[type] || '详情'
}

const handleLike = () => {
  likeCount.value++
  ElMessage.success('感谢点赞！')
}

onMounted(() => {
  fetchDetail()
  // 切换页面自动滚到顶部
  window.scrollTo(0, 0)
})
</script>

<style scoped>
.article-detail-container {
  background-color: #fff;
  min-height: 100vh;
  padding: 40px 20px;
}
.article-wrapper {
  max-width: 900px;
  margin: 0 auto;
}

.article-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}
.article-header .title {
  font-size: 32px;
  color: #333;
  margin: 25px 0;
  line-height: 1.4;
}
.article-header .meta {
  color: #888;
  font-size: 14px;
  display: flex;
  gap: 20px;
}

.article-cover {
  margin-bottom: 30px;
  text-align: center;
}
.article-cover img {
  max-width: 100%;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 富文本内容的核心样式适配 */
.rich-text-content {
  line-height: 1.8;
  color: #444;
  font-size: 17px;
}
/* 必须加这行，防止富文本里的图片太大撑破容器 */
.rich-text-content :deep(img) {
  max-width: 100%;
  height: auto !important;
  border-radius: 4px;
}
.rich-text-content :deep(p) {
  margin-bottom: 1.2em;
}

.article-footer {
  margin-top: 60px;
  padding-top: 30px;
  border-top: 1px solid #eee;
  text-align: center;
}
</style>