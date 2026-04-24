<template>
  <div class="branch-learning-container">
    
    <div class="learning-notice" v-if="requiredTodoCount > 0">
      <el-alert 
        :title="`📢 学习通知：您有 ${requiredTodoCount} 个【必修】学习任务尚未完成，请抓紧时间学习！`" 
        type="warning" 
        show-icon 
        :closable="false"
      />
    </div>

    <el-card shadow="never" class="main-card">
      <div class="section-header">
        <h3 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">📚 支部学习大厅</h3>
      </div>
      
      <div v-loading="loading" class="course-grid">
        <el-row :gutter="20">
          <el-col :span="6" v-for="course in allCourses" :key="course.id" style="margin-bottom: 20px;">
            <el-card :body-style="{ padding: '0px' }" shadow="hover" class="course-card">
              <div class="cover-wrapper" @click="goToPlay(course.id)">
                <el-image :src="course.cover || defaultCover" class="course-cover" fit="cover" />
                <div class="play-overlay"><el-icon><VideoPlay /></el-icon></div>
                
                <div class="course-tag" :class="course.is_required ? 'tag-danger' : 'tag-info'">
                  {{ course.is_required ? '必修' : '选修' }}
                </div>

                <div v-if="course.my_record?.is_completed" class="completed-stamp">
                  ✅ 已完成
                </div>
              </div>
              
              <div class="course-info">
                <h4 class="course-title" :title="course.title">{{ course.title }}</h4>
                <p class="course-points">⭐ 奖励：+{{ course.points_reward || 0 }} 积分</p>
                
                <div class="progress-box" v-if="course.my_record?.is_completed">
                  <el-progress :percentage="100" status="success" :stroke-width="8" />
                  <span class="progress-text" style="color: #67C23A;">🎉 已完成学习</span>
                </div>
                <div class="progress-box" v-else-if="course.my_record">
                  <el-progress :percentage="calcProgress(course)" :stroke-width="8" status="warning" />
                  <span class="progress-text">已看 {{ Math.floor(course.my_record.progress || 0) }} 秒</span>
                </div>
                <div class="progress-box" v-else>
                  <el-progress :percentage="0" :stroke-width="8" />
                  <span class="progress-text">尚未开始</span>
                </div>

                <div style="margin-top: 15px;">
                  <el-button 
                    v-if="!course.my_record?.is_completed" 
                    type="danger" 
                    plain 
                    class="action-btn" 
                    @click="goToPlay(course.id)"
                  >
                    {{ course.my_record ? '▶ 继续学习' : '▶ 开始学习' }}
                  </el-button>
                  
                  <el-button 
                    v-else 
                    type="success" 
                    plain 
                    class="action-btn" 
                    @click="openFeedbackDialog(course)"
                  >
                    {{ course.my_record?.feedback ? '📝 修改思想汇报' : '✍️ 提交思想汇报' }}
                  </el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-empty v-if="allCourses.length === 0" description="支部暂未发布任何学习任务" />
      </div>
    </el-card>

    <el-dialog v-model="feedbackVisible" title="提交思想汇报 / 学习心得" width="600px">
      <div style="margin-bottom: 15px; color: #666;">
        当前课程：<strong>{{ currentCourse?.title }}</strong>
      </div>
      <el-input
        v-model="feedbackContent"
        type="textarea"
        :rows="6"
        placeholder="请结合课程内容，谈谈您的感悟与体会。思想汇报将提交至支部管理端供书记查阅..."
      />
      <template #footer>
        <el-button @click="feedbackVisible = false">取消</el-button>
        <el-button type="danger" @click="submitFeedback" :loading="submitLoading">提交汇报</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCourseList, getMyStudyRecords, updateStudyRecord } from '../../api/learning'
import { VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const defaultCover = 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80&w=400&h=250'

const loading = ref(true)

// 核心数据
const allCourses = ref<any[]>([])
const myRecords = ref<any[]>([])

// 弹窗控制
const feedbackVisible = ref(false)
const submitLoading = ref(false)
const currentCourse = ref<any>(null)
const feedbackContent = ref('')

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const resCourses: any = await getCourseList({ scope: 'branch', size: 100 })
    const courseData = resCourses.results || resCourses || []

    const resRecords: any = await getMyStudyRecords()
    const recordData = resRecords.results || resRecords || []

    // 数据缝合
    allCourses.value = courseData.map((course: any) => {
      const record = recordData.find((r: any) => r.course === course.id)
      return { ...course, my_record: record || null }
    })
  } catch (error) {
    console.error('获取学习数据失败', error)
  } finally {
    loading.value = false
  }
}

// 必修课未完成统计
const requiredTodoCount = computed(() => {
  return allCourses.value.filter(c => c.is_required && (!c.my_record || !c.my_record.is_completed)).length
})

// 计算进度百分比
const calcProgress = (course: any) => {
  if (!course.my_record || !course.my_record.progress) return 0
  const percent = Math.floor((course.my_record.progress / 600) * 100)
  return percent > 95 ? 95 : percent
}

const goToPlay = (courseId: number) => {
  router.push(`/learning/video/${courseId}`)
}

const openFeedbackDialog = (course: any) => {
  currentCourse.value = course
  feedbackContent.value = course.my_record?.feedback || ''
  feedbackVisible.value = true
}

const submitFeedback = async () => {
  if (!feedbackContent.value.trim()) {
    return ElMessage.warning('心得体会内容不能为空')
  }
  submitLoading.value = true
  try {
    const recordId = currentCourse.value.my_record.id
    await updateStudyRecord(recordId, { feedback: feedbackContent.value })
    ElMessage.success('思想汇报提交成功，支部管理端已同步！')
    feedbackVisible.value = false
    fetchData() 
  } catch (error) {
    ElMessage.error('提交失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.branch-learning-container { margin-top: 10px; }
.learning-notice { margin-bottom: 20px; }
.main-card { min-height: 600px; }

.course-grid { padding: 10px 0; }
.course-card { border: 1px solid #ebeef5; border-radius: 8px; overflow: hidden; position: relative; }

.cover-wrapper { position: relative; height: 160px; cursor: pointer; overflow: hidden; background-color: #f5f7fa; }
.course-cover { width: 100%; height: 100%; transition: transform 0.3s; }
.cover-wrapper:hover .course-cover { transform: scale(1.05); }

.play-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;
  opacity: 0; transition: opacity 0.3s; color: white; font-size: 40px; z-index: 1;
}
.cover-wrapper:hover .play-overlay { opacity: 1; }

.course-tag {
  position: absolute; top: 10px; right: 10px; padding: 4px 10px;
  font-size: 13px; font-weight: bold; color: white; border-radius: 4px; z-index: 2;
}
.tag-danger { background-color: #f56c6c; box-shadow: 0 2px 4px rgba(245, 108, 108, 0.4); }
.tag-info { background-color: #909399; }

/* 👇 已完成印章特效 */
.completed-stamp {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-15deg);
  border: 4px solid #67C23A;
  color: #67C23A;
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: 2px;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.3);
  z-index: 3;
  pointer-events: none; /* 让点击事件能穿透到背后的图片 */
}

.course-info { padding: 18px; }
.course-title { margin: 0 0 10px 0; font-size: 16px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: bold; }
.course-points { font-size: 14px; color: #E6A23C; margin: 0 0 15px 0; font-weight: bold; }

.progress-box { margin-bottom: 5px; }
.progress-text { font-size: 13px; color: #999; margin-top: 8px; display: inline-block; font-weight: 500; }

.action-btn { width: 100%; font-size: 15px; font-weight: bold; }
</style>