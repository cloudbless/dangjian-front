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
                <h3>{{ news.title }}</h3>
                <div class="news-meta">
                  <span>📅 {{ new Date(news.created_at).toLocaleDateString() }}</span>
                  <span style="margin-left: 10px">👤 {{ news.author_name }}</span>
                </div>
              </div>
            </div>
            <el-empty v-if="newsList.length === 0" description="暂无时政新闻" />
          </div>
        </el-col>

        <el-col :span="10">
          <div class="section-title">
            <h2>📚 学习园地</h2>
            <span class="more" @click="$router.push('/learning')">进入学习端 ></span>
          </div>
          <el-card shadow="hover" class="study-card" @click="$router.push('/learning')">
            <div class="study-content">
              <h3>云端党校视频课程</h3>
              <p>在线学习党课，修满学分，提升自我。</p>
              <el-tag type="danger">🔥 学习拿积分</el-tag>
            </div>
            <img src="https://cube.elemecdn.com/6/94/4d3ea53c084bad6931a56d5158a48jpeg.jpeg" alt="study" class="study-img">
          </el-card>
          <el-card shadow="hover" class="study-card" style="margin-top: 15px;" @click="$router.push('/learning')">
            <div class="study-content">
              <h3>支部书记讲党课</h3>
              <p>学习新思想，争做新青年</p>
              <el-tag type="warning">⭐ 必修任务</el-tag>
            </div>
          </el-card>
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
          <span class="more" @click="$router.push('/portal/practice')">去报名 ></span>
        </div>
        <el-row :gutter="20" v-loading="loadingPractice">
          <el-col :span="8" v-for="item in practiceList" :key="item.id">
            <el-card shadow="hover" class="practice-card">
              <div class="practice-header">
                <el-tag :type="item.status === 0 ? 'success' : 'info'" effect="dark">
                  {{ item.status === 0 ? '报名中' : '已截止' }}
                </el-tag>
                <span class="points">+{{ item.points_reward }} 实践积分</span>
              </div>
              <h3 style="margin: 15px 0;" class="card-title-text">{{ item.title }}</h3>
              <p class="practice-info">📍 地点：{{ item.location }}</p>
              <p class="practice-info">⏰ 时间：{{ new Date(item.start_time).toLocaleString() }}</p>
              <el-button 
                type="danger" 
                plain 
                style="width: 100%; margin-top: 15px;"
                @click="$router.push('/portal/practice')"
              >查看详情</el-button>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-if="practiceList.length === 0" description="暂无实践活动" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getArticleList } from '../../api/content'
import { getPracticeList } from '../../api/practice' // 确保你之前定义了此接口
import { useRouter } from 'vue-router'

const router = useRouter()
const defaultCover = 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400&h=250'

// 数据定义
const newsList = ref<any[]>([])
const showcaseList = ref<any[]>([])
const practiceList = ref<any[]>([])

// 加载状态
const loadingNews = ref(false)
const loadingShowcase = ref(false)
const loadingPractice = ref(false)

// 拉取所有板块数据
const fetchData = async () => {
  // 1. 获取今日时政 (类型 1, 4条)
  loadingNews.value = true
  try {
    const res: any = await getArticleList({ article_type: 1, page: 1, size: 4 })
    newsList.value = res.results || []
  } finally { loadingNews.value = false }

  // 2. 获取党员风采 (类型 3, 4条)
  loadingShowcase.value = true
  try {
    const res: any = await getArticleList({ article_type: 3, page: 1, size: 4 })
    showcaseList.value = res.results || []
  } finally { loadingShowcase.value = false }

  // 3. 获取实践活动 (3条)
  loadingPractice.value = true
  try {
    const res: any = await getPracticeList({ page: 1, size: 3 })
    practiceList.value = res.results || []
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
/* 保持你原有的样式，仅增加一个标题省略号处理防止长标题撑破卡片 */
.card-title-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.banner-item {
  height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}
.banner-1 { background: linear-gradient(135deg, #ce1126 0%, #ff4d4d 100%); }
.banner-2 { background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); }
.banner-3 { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }

.content-wrapper { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
.section-row { margin-bottom: 50px; }

.section-title { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #ce1126; margin-bottom: 20px; padding-bottom: 10px; }
.section-title h2 { margin: 0; color: #333; font-size: 22px; }
.more { cursor: pointer; color: #666; font-size: 14px; transition: color 0.3s; }
.more:hover { color: #ce1126; }

.news-item { padding: 15px 0; border-bottom: 1px dashed #eee; cursor: pointer; transition: all 0.3s; }
.news-item:hover { transform: translateX(5px); color: #ce1126; }
.news-info h3 { margin: 0 0 8px; font-size: 16px; color: inherit; }
.news-meta { font-size: 12px; color: #999; }

.study-card { cursor: pointer; display: flex; align-items: center; }
.study-card :deep(.el-card__body) { display: flex; width: 100%; justify-content: space-between; align-items: center;}
.study-content h3 { margin: 0 0 10px 0; font-size: 16px;}
.study-content p { font-size: 13px; color: #666; margin-bottom: 10px;}
.study-img { width: 80px; height: 80px; border-radius: 4px; object-fit: cover;}

.style-card { cursor: pointer; transition: all 0.3s; height: 280px; }
.style-card:hover { transform: translateY(-5px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
.image { width: 100%; height: 160px; object-fit: cover; display: block; }
.desc { font-size: 13px; color: #999; margin-top: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.practice-card { border-top: 4px solid #67C23A; min-height: 220px; }
.practice-header { display: flex; justify-content: space-between; align-items: center; }
.points { font-weight: bold; color: #E6A23C; font-size: 14px; }
.practice-info { font-size: 13px; color: #666; margin: 8px 0; }
</style>