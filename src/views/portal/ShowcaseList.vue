<template>
  <div class="showcase-container">
    <div class="showcase-header">
      <h1>📸 党员风采</h1>
      <p>记录闪光瞬间，汇聚榜样力量。展现新时代党员精神面貌。</p>
    </div>

    <div class="content-wrapper" v-loading="loading">
      <el-row :gutter="25">
        <el-col 
          :xs="24" :sm="12" :md="8" :lg="6" 
          v-for="item in showcaseList" 
          :key="item.id"
          class="card-col"
        >
          <el-card 
            class="showcase-card" 
            :body-style="{ padding: '0px' }" 
            shadow="hover"
            @click="$router.push(`/portal/article/${item.id}`)"
          >
            <div class="card-image-wrapper">
              <img 
                v-if="item.cover" 
                :src="item.cover" 
                class="card-image" 
              />
              <div v-else class="image-placeholder">
                <span>{{ item.title.substring(0, 2) }}</span>
              </div>
              <div class="image-overlay">
                <span class="view-btn">查看事迹</span>
              </div>
            </div>

            <div class="card-info">
              <h3 class="card-title">{{ item.title }}</h3>
              <p class="card-summary">{{ item.summary || '立足岗位显身手，服务群众守初心...' }}</p>
              <div class="card-footer">
                <span class="author">👤 {{ item.author_name }}</span>
                <span class="date">{{ new Date(item.created_at).toLocaleDateString() }}</span>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          background
          layout="prev, pager, next"
          :total="total"
          :page-size="pageSize"
          @current-change="handlePageChange"
        />
      </div>

      <el-empty v-if="showcaseList.length === 0" description="暂无风采记录，欢迎投稿！" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticleList } from '../../api/content'

const loading = ref(false)
const showcaseList = ref<any[]>([])
const total = ref(0)
const pageSize = ref(12)
const currentPage = ref(1)

const fetchShowcase = async () => {
  loading.value = true
  try {
    const res: any = await getArticleList({
      article_type: 3, // 对应后端：党员风采类型
      page: currentPage.value,
      size: pageSize.value
    })
    showcaseList.value = res.results || []
    total.value = res.count || 0
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchShowcase()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(fetchShowcase)
</script>

<style scoped>
.showcase-container { background-color: #f8f9fa; min-height: 100vh; }
.showcase-header { 
  background: linear-gradient(135deg, #ce1126 0%, #8b0d1a 100%); 
  color: white; 
  padding: 70px 20px; 
  text-align: center;
}
.showcase-header h1 { font-size: 36px; margin-bottom: 15px; letter-spacing: 4px; }
.showcase-header p { font-size: 18px; opacity: 0.8; font-weight: 300; }

.content-wrapper { max-width: 1400px; margin: 0 auto; padding: 40px 20px; }

.card-col { margin-bottom: 30px; }
.showcase-card { 
  border: none; 
  border-radius: 12px; 
  overflow: hidden; 
  cursor: pointer; 
  transition: transform 0.3s;
}
.showcase-card:hover { transform: translateY(-10px); }

.card-image-wrapper { position: relative; height: 220px; overflow: hidden; }
.card-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.showcase-card:hover .card-image { transform: scale(1.1); }

.image-placeholder { 
  width: 100%; height: 100%; 
  background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%);
  display: flex; align-items: center; justify-content: center;
  font-size: 40px; color: white; font-weight: bold;
}

.image-overlay {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;
  opacity: 0; transition: opacity 0.3s;
}
.showcase-card:hover .image-overlay { opacity: 1; }
.view-btn { border: 2px solid white; color: white; padding: 8px 20px; border-radius: 20px; font-weight: bold; }

.card-info { padding: 20px; }
.card-title { margin: 0 0 10px; font-size: 18px; color: #2c3e50; line-height: 1.4; height: 50px; overflow: hidden; }
.card-summary { font-size: 14px; color: #7f8c8d; line-height: 1.6; margin-bottom: 15px; height: 45px; overflow: hidden; }

.card-footer { 
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid #f1f1f1; padding-top: 15px; font-size: 12px; color: #95a5a6;
}

.pagination-wrapper { margin-top: 50px; display: flex; justify-content: center; }
:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #ce1126;
}
</style>