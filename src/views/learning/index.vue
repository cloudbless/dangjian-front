<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>🎓 云端党校 - 课程大厅</span>
        </div>
      </template>

      <el-row :gutter="20" v-loading="loading">
        <el-col :span="6" v-for="course in courseList" :key="course.id" style="margin-bottom: 20px;">
          <el-card :body-style="{ padding: '0px' }" shadow="hover" class="course-card">
            <div class="course-cover" :style="{ backgroundImage: course.cover ? `url(${course.cover})` : 'linear-gradient(135deg, #ce1126 0%, #ff4d4d 100%)' }">
              <span class="type-tag" :style="{ background: course.course_type === 2 ? '#67C23A' : '#409EFF' }">
                {{ course.course_type === 2 ? '📝 图文/练习' : '🎬 视频课程' }}
              </span>
              
              <span class="req-tag" :class="course.is_required ? 'is-req' : 'is-opt'">
                {{ course.is_required ? '必修' : '选修' }}
              </span>
              
              <span class="points-tag">+{{ course.points_reward }} 积分</span>
            </div>
            <div style="padding: 14px">
              <h3 class="course-title" :title="course.title">{{ course.title }}</h3>
              <p class="course-desc">{{ course.description || '暂无简介' }}</p>
              <div class="bottom">
                <span class="publisher">发布人: {{ course.publisher_name || '管理员' }}</span>
                
                <el-button 
                  :type="course.my_record?.is_completed ? 'success' : 'danger'" 
                  size="small" 
                  @click="goToStudy(course)"
                >
                  {{ course.my_record?.is_completed ? '✅ 已完成' : '立即学习' }}
                </el-button>
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
import { getCourseList, getMyStudyRecords } from '../../api/learning'
import { useUserStore } from '../../stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const courseList = ref<any[]>([])

const fetchCourses = async () => {
  loading.value = true
  try {
    // 1. 获取所有课程列表
    const res: any = await getCourseList()
    const courseData = res.results || res || []

    // 2. 如果用户已登录，获取学习记录
    let recordData: any[] = []
    if (userStore.token) {
      try {
        const resRecords: any = await getMyStudyRecords()
        recordData = resRecords.results || resRecords || []
      } catch (e) {
        console.error('获取学习记录失败', e)
      }
    }

    // 3. 数据缝合：将学习记录绑定到对应课程上
    courseList.value = courseData.map((course: any) => {
      const record = recordData.find((r: any) => r.course === course.id)
      return { ...course, my_record: record || null }
    })

  } finally {
    loading.value = false
  }
}

const goToStudy = (course: any) => {
  if (course.course_type === 2) {
    router.push(`/branch/learning/exam/${course.id}`)
  } else {
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

/* 👇 新增：必修/选修标签样式，位置排在类型标签后面 */
.req-tag {
  position: absolute;
  top: 10px;
  left: 105px; 
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.req-tag.is-req { background: #f56c6c; } /* 必修红色 */
.req-tag.is-opt { background: #909399; } /* 选修灰色 */

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