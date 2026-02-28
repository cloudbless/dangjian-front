<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🎓 云端党校 - 必修课程</span>
        </div>
      </template>

      <el-row :gutter="20" v-loading="loading">
        <el-col :span="6" v-for="course in courseList" :key="course.id" style="margin-bottom: 20px;">
          <el-card :body-style="{ padding: '0px' }" shadow="hover" class="course-card">
            <div class="course-cover" :style="{ backgroundImage: course.cover ? `url(${course.cover})` : 'linear-gradient(135deg, #ce1126 0%, #ff4d4d 100%)' }">
              <span class="type-tag" :style="{ background: course.course_type === 2 ? '#67C23A' : '#409EFF' }">
                {{ course.course_type === 2 ? '📝 图文/练习' : '🎬 视频课程' }}
              </span>
              
              <span class="points-tag">+{{ course.points_reward }} 积分</span>
            </div>
            <div style="padding: 14px">
              <h3 class="course-title">{{ course.title }}</h3>
              <p class="course-desc">{{ course.description || '暂无简介' }}</p>
              <div class="bottom">
                <span class="publisher">发布人: {{ course.publisher_name }}</span>
                <el-button type="danger" size="small" @click="goToStudy(course)">立即学习</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <el-empty v-if="courseList.length === 0" description="暂无课程发布" style="width: 100%;" />
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCourseList } from '../../api/learning'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const courseList = ref<any[]>([])

const fetchCourses = async () => {
  loading.value = true
  try {
    const res: any = await getCourseList()
    courseList.value = res.results || res
  } finally {
    loading.value = false
  }
}

// 👇 修改：根据 course_type 跳转到不同的页面
// 👇 修改：跳转路径前加上 /branch
const goToStudy = (course: any) => {
  if (course.course_type === 2) {
    // 图文/练习类型 -> 跳转到支部端的在线答题页
    router.push(`/branch/learning/exam/${course.id}`)
  } else {
    // 默认视频类型 -> 跳转到支部端的视频播放页
    router.push(`/branch/learning/video/${course.id}`)
  }
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.app-container { padding: 20px; }
.card-header { font-weight: bold; font-size: 18px; color: #ce1126; }
.course-card { transition: all 0.3s; cursor: pointer; }
.course-card:hover { transform: translateY(-5px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
.course-cover {
  height: 150px;
  background-size: cover;
  background-position: center;
  position: relative;
}
/* 👇 新增：课程类型标签样式 */
.type-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.points-tag {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 193, 7, 0.9);
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}
.course-title { margin: 0; font-size: 16px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.course-desc { font-size: 13px; color: #999; margin: 10px 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.bottom { display: flex; justify-content: space-between; align-items: center; margin-top: 15px; }
.publisher { font-size: 12px; color: #999; }
</style>