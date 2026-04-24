<template>
  <div class="home-container">
    <el-carousel trigger="click" height="400px">
      <el-carousel-item v-for="(item, index) in 3" :key="index">
        <div class="banner-item" :class="'banner-' + (index + 1)">
          <h1>知行智链 · 智慧党建</h1>
          <p>学思践悟，知行合一。打造集学习、实践、管理于一体的党建平台</p>
        </div>
      </el-carousel-item>
    </el-carousel>

    <div class="content-wrapper">
      
      <el-row :gutter="40" class="section-row">
        <el-col :span="14">
          <div class="section-title">
            <h2>📰 今日时政</h2>
            <span class="more" @click="$router.push('/portal/news')">查看更多 ></span>
          </div>
          <div class="news-list" v-loading="loadingNews">
            <div v-for="news in newsList" :key="news.id" class="news-item" @click="goToDetail(news.id)">
              <div class="news-info">
                <h3 class="card-title-text">{{ news.title }}</h3>
                <div class="news-meta">
                  <span>📅 {{ new Date(news.created_at).toLocaleDateString() }}</span>
                  <span style="margin-left: 10px">👤 {{ news.author_name || '管理员' }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="newsList.length === 0" description="暂无时政新闻" />
          </div>
        </el-col>

        <el-col :span="10">
          <div class="section-title">
            <h2>📚 学习园地</h2>
            <span class="more" @click="$router.push('/portal/learning')">查看更多 ></span>
          </div>
          <div class="news-list" v-loading="loadingLearning">
            <div v-for="item in learningList" :key="item.id" class="news-item" @click="goToDetail(item.id)">
              <div class="news-info">
                <h3 class="card-title-text">{{ item.title }}</h3>
                <div class="news-meta">
                  <span>📅 {{ new Date(item.created_at).toLocaleDateString() }}</span>
                  <span style="margin-left: 10px">👤 {{ item.author_name || '管理员' }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="learningList.length === 0" description="暂无学习资料" />
          </div>
        </el-col>
      </el-row>

      <div class="section-row">
        <div class="section-title">
          <h2>📸 党员风采</h2>
          <span class="more" @click="$router.push('/portal/showcase')">查看更多 ></span>
        </div>
        <el-row :gutter="20" v-loading="loadingShowcase">
          <el-col :span="6" v-for="item in showcaseList" :key="item.id">
            <el-card :body-style="{ padding: '0px' }" shadow="hover" class="style-card" @click="goToDetail(item.id)">
              <img :src="item.cover || defaultCover" class="image" />
              <div style="padding: 14px;">
                <h4 class="card-title-text">{{ item.title }}</h4>
                <p class="desc">{{ item.summary || '展现先锋模范作用，践行初心使命。' }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-if="showcaseList.length === 0" description="暂无风采展示" />
      </div>

      <div class="section-row">
        <div class="section-title">
          <h2>🤝 实践中心</h2>
          <span class="more" @click="$router.push('/portal/practice')">查看更多 ></span>
        </div>
        <el-row :gutter="20" v-loading="loadingPractice">
          <el-col :span="6" v-for="item in practiceList" :key="item.id">
            <el-card :body-style="{ padding: '0px' }" shadow="hover" class="style-card" @click="goToDetail(item.id)">
              <img :src="item.cover || defaultCover" class="image" />
              <div style="padding: 14px;">
                <h4 class="card-title-text">{{ item.title }}</h4>
                <p class="desc">{{ item.summary || '汇聚志愿微光，开展便民服务。' }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-if="practiceList.length === 0" description="暂无实践活动风采" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticleList } from '../../api/content'
import { useRouter } from 'vue-router'

const router = useRouter()
const defaultCover = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400&h=250'

// 数据定义
const newsList = ref<any[]>([])
const learningList = ref<any[]>([])
const showcaseList = ref<any[]>([])
const practiceList = ref<any[]>([])

// 加载状态
const loadingNews = ref(false)
const loadingLearning = ref(false)
const loadingShowcase = ref(false)
const loadingPractice = ref(false)

// 拉取所有板块数据 (全加上 scope: 'portal')
const fetchData = async () => {
  // 1. 获取今日时政 (类型 1, 4条)
  loadingNews.value = true
  try {
    const res: any = await getArticleList({ article_type: 1, scope: 'portal', page: 1, size: 4 })
    newsList.value = res.results || res || []
  } finally { loadingNews.value = false }

  // 2. 获取学习园地 (类型 5, 4条)
  loadingLearning.value = true
  try {
    const res: any = await getArticleList({ article_type: 5, scope: 'portal', page: 1, size: 4 })
    learningList.value = res.results || res || []
  } finally { loadingLearning.value = false }

  // 3. 获取党员风采 (类型 3, 4条)
  loadingShowcase.value = true
  try {
    const res: any = await getArticleList({ article_type: 3, scope: 'portal', page: 1, size: 4 })
    showcaseList.value = res.results || res || []
  } finally { loadingShowcase.value = false }

  // 4. 获取实践中心 (类型 6, 4条)
  loadingPractice.value = true
  try {
    const res: any = await getArticleList({ article_type: 6, scope: 'portal', page: 1, size: 4 })
    practiceList.value = res.results || res || []
  } finally { loadingPractice.value = false }
}

const goToDetail = (id: number) => {
  router.push(`/portal/article/${id}`)
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
/* 标题省略号处理防止长标题撑破卡片 */
.card-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-item {
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  justify-content: center; 
  align-items: center; 
  color: white; 
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
/* 新增：加大 Banner 标题和副标题字体 */
.banner-item h1 {
  font-size: 48px; /* 原来受全局影响，现在明确给大一点 */
  margin-bottom: 10px;
  letter-spacing: 2px;
}
.banner-item p {
  font-size: 20px; /* 增加副标题字体 */
  letter-spacing: 1px;
}

.banner-1 { background: linear-gradient(135deg, #ce1126 0%, #ff4d4d 100%); }
.banner-2 { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }
.banner-3 { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }

.content-wrapper { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.section-row { margin-bottom: 50px; }

.section-title { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  border-bottom: 2px solid #ce1126; 
  margin-bottom: 20px; 
  padding-bottom: 10px; 
}
/* 栏目大标题：22px -> 26px */
.section-title h2 { margin: 0; color: #333; font-size: 26px; } 
/* 查看更多：14px -> 16px */
.more { cursor: pointer; color: #666; font-size: 16px; transition: color 0.3s; }
.more:hover { color: #ce1126; }

.news-item { padding: 15px 0; border-bottom: 1px dashed #eee; cursor: pointer; transition: all 0.3s; }
.news-item:hover { transform: translateX(5px); color: #ce1126; }
/* 列表新闻标题：16px -> 18px，加粗一些 */
.news-info h3 { margin: 0 0 8px; font-size: 18px; font-weight: 500; color: inherit; }
/* 新闻时间作者：12px -> 14px */
.news-meta { font-size: 14px; color: #999; }

.style-card { cursor: pointer; transition: all 0.3s; height: 300px; /* 高度稍微增加一点容纳大字体 */ }
.style-card:hover { transform: translateY(-5px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #ce1126; }
.image { width: 100%; height: 160px; object-fit: cover; display: block; }
/* 卡片内小标题：强制设置 18px */
.style-card h4.card-title-text { font-size: 18px; margin-top: 0; margin-bottom: 5px; }
/* 卡片描述：13px -> 14px */
.desc { font-size: 14px; color: #999; margin-top: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; line-height: 1.6; }
</style>