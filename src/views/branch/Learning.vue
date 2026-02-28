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
      <el-tabs v-model="activeTab" class="custom-tabs">
        
        <el-tab-pane :label="`📋 学习任务 (${todoList.length})`" name="todo">
          <div v-loading="loading" class="course-grid">
            <el-row :gutter="20">
              <el-col :span="6" v-for="course in todoList" :key="course.id">
                <el-card :body-style="{ padding: '0px' }" shadow="hover" class="course-card">
                  <div class="cover-wrapper" @click="goToPlay(course.id)">
                    <el-image :src="course.cover || defaultCover" class="course-cover" fit="cover" />
                    <div class="play-overlay"><el-icon><VideoPlay /></el-icon></div>
                    <div class="course-tag" :class="course.is_required ? 'tag-danger' : 'tag-info'">
                      {{ course.is_required ? '必修' : '选修' }}
                    </div>
                  </div>
                  <div class="course-info">
                    <h4 class="course-title">{{ course.title }}</h4>
                    <p class="course-points">⭐ 奖励：+{{ course.points_reward || 0 }} 积分</p>
                    
                    <div class="progress-box" v-if="course.my_record">
                      <el-progress :percentage="calcProgress(course)" :stroke-width="8" status="warning" />
                      <span class="progress-text">已看 {{ Math.floor(course.my_record.progress || 0) }} 秒</span>
                    </div>
                    <div class="progress-box" v-else>
                      <el-progress :percentage="0" :stroke-width="8" />
                      <span class="progress-text">尚未开始</span>
                    </div>

                    <el-button type="danger" plain class="action-btn" @click="goToPlay(course.id)">
                      {{ course.my_record ? '继续学习' : '开始学习' }}
                    </el-button>
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-empty v-if="todoList.length === 0" description="太棒了，您已完成所有学习任务！" />
          </div>
        </el-tab-pane>

        <el-tab-pane :label="`🏆 学习档案 (${doneList.length})`" name="done">
          <div v-loading="loading">
            <el-table :data="doneList" stripe style="width: 100%">
              <el-table-column label="课程名称" prop="title" min-width="250" show-overflow-tooltip />
              <el-table-column label="获得积分" width="120" align="center">
                <template #default="{ row }">
                  <span style="color: #E6A23C; font-weight: bold;">+{{ row.points_reward || 0 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="学习心得" min-width="300">
                <template #default="{ row }">
                  <span v-if="row.my_record?.feedback" class="feedback-text">{{ row.my_record.feedback }}</span>
                  <el-tag v-else type="info">尚未提交心得体会</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="center" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" @click="openFeedbackDialog(row)">
                    {{ row.my_record?.feedback ? '修改汇报' : '✍️ 提交汇报' }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

      </el-tabs>
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
const activeTab = ref('todo')

// 核心数据
const allCourses = ref<any[]>([])
const myRecords = ref<any[]>([])

// 弹窗控制
const feedbackVisible = ref(false)
const submitLoading = ref(false)
const currentCourse = ref<any>(null)
const feedbackContent = ref('')

// 1. 获取数据并做“数据缝合”
const fetchData = async () => {
  loading.value = true
  try {
    // 拉取支部课程 (scope: 'branch')
    const resCourses: any = await getCourseList({ scope: 'branch', size: 100 })
    const courseData = resCourses.results || resCourses || []

    // 拉取我的学习记录
    const resRecords: any = await getMyStudyRecords()
    const recordData = resRecords.results || resRecords || []

    // 缝合：将 record 绑定到 course 上
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

// 2. 衍生计算属性
const todoList = computed(() => {
  return allCourses.value.filter(c => !c.my_record || !c.my_record.is_completed)
})

const doneList = computed(() => {
  return allCourses.value.filter(c => c.my_record && c.my_record.is_completed)
})

const requiredTodoCount = computed(() => {
  return todoList.value.filter(c => c.is_required).length
})

// 3. 计算进度条百分比 (假设平均一节课 10 分钟 = 600秒 用于视觉展示，如果后端没返回总时长的话)
const calcProgress = (course: any) => {
  if (!course.my_record || !course.my_record.progress) return 0
  // 这里可以根据实际视频时长修改，目前给个简单的算法：最多 95%（看完才是 100%）
  const percent = Math.floor((course.my_record.progress / 600) * 100)
  return percent > 95 ? 95 : percent
}

// 4. 跳转到已有的视频播放器页面
const goToPlay = (courseId: number) => {
  // 注意：你需要确保 router/index.ts 中有 `/learning/video/:id` 这个路由配置
  router.push(`/learning/video/${courseId}`)
}

// 5. 提交心得体会逻辑
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
    fetchData() // 刷新列表数据
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

/* 课程卡片网格样式 */
.course-grid { padding: 10px 0; }
.course-card { margin-bottom: 20px; border: 1px solid #ebeef5; border-radius: 8px; overflow: hidden; }

.cover-wrapper { position: relative; height: 140px; cursor: pointer; overflow: hidden; }
.course-cover { width: 100%; height: 100%; transition: transform 0.3s; }
.cover-wrapper:hover .course-cover { transform: scale(1.05); }

.play-overlay {
  position: absolute; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center;
  opacity: 0; transition: opacity 0.3s; color: white; font-size: 40px;
}
.cover-wrapper:hover .play-overlay { opacity: 1; }

.course-tag {
  position: absolute; top: 10px; right: 10px; padding: 2px 8px;
  font-size: 12px; color: white; border-radius: 4px; z-index: 2;
}
.tag-danger { background-color: #f56c6c; }
.tag-info { background-color: #909399; }

.course-info { padding: 15px; }
.course-title { margin: 0 0 10px 0; font-size: 15px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.course-points { font-size: 13px; color: #E6A23C; margin: 0 0 15px 0; font-weight: bold; }

.progress-box { margin-bottom: 15px; }
.progress-text { font-size: 12px; color: #999; margin-top: 5px; display: inline-block; }

.action-btn { width: 100%; }

.feedback-text { color: #666; font-size: 13px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>