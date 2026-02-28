<template>
  <div class="app-container">
    <el-card v-loading="loading" class="exam-card">
      <template #header>
        <div class="exam-header">
          <h2>{{ courseInfo.title || '在线练习' }}</h2>
          <el-button @click="router.back()">返回列表</el-button>
        </div>
      </template>

      <div v-if="courseInfo.content" class="course-content" v-html="courseInfo.content"></div>
      <el-divider v-if="courseInfo.content && questions.length > 0">以下为课后练习</el-divider>

      <el-empty v-if="questions.length === 0 && !loading" description="暂无练习题" />

      <div v-for="(q, index) in questions" :key="q.id" class="question-item">
        <div class="q-title">
          <el-tag size="small" :type="q.q_type === 'single' ? 'primary' : 'warning'" style="margin-right: 8px;">
            {{ q.q_type === 'single' ? '单选' : '多选' }}
          </el-tag>
          <strong>{{ index + 1 }}. {{ q.content }}</strong>
        </div>

        <div v-if="q.q_type === 'single'" class="q-options">
          <el-radio-group v-model="userAnswers[q.id]" :disabled="isSubmitted">
            <el-radio 
              v-for="(opt, oIndex) in q.options" 
              :key="opt.id" 
              :value="opt.id"
              class="option-row"
            >
              {{ String.fromCharCode(65 + Number(oIndex)) }}. {{ opt.content }}
            </el-radio>
          </el-radio-group>
        </div>

        <div v-if="q.q_type === 'multiple'" class="q-options">
          <el-checkbox-group v-model="userAnswers[q.id]" :disabled="isSubmitted">
            <el-checkbox 
              v-for="(opt, oIndex) in q.options" 
              :key="opt.id" 
              :value="opt.id"
              class="option-row"
            >
              {{ String.fromCharCode(65 +Number(oIndex)) }}. {{ opt.content }}
            </el-checkbox>
          </el-checkbox-group>
        </div>

        <div v-if="isSubmitted" class="q-analysis" :class="checkAnswer(q) ? 'is-correct' : 'is-wrong'">
          <div style="margin-bottom: 5px;">
            <el-icon v-if="checkAnswer(q)" color="#67C23A"><Select /></el-icon>
            <el-icon v-else color="#F56C6C"><CloseBold /></el-icon>
            <span :style="{ color: checkAnswer(q) ? '#67C23A' : '#F56C6C', marginLeft: '5px', fontWeight: 'bold' }">
              {{ checkAnswer(q) ? '回答正确' : '回答错误' }}
            </span>
          </div>
          <div><strong>正确答案：</strong> {{ getCorrectAnswersText(q) }}</div>
          <div v-if="q.analysis" style="margin-top: 5px; color: #666;"><strong>解析：</strong> {{ q.analysis }}</div>
        </div>
      </div>

      <div class="submit-action" v-if="questions.length > 0">
        <el-button type="primary" size="large" @click="submitExam" v-if="!isSubmitted">提交答卷</el-button>
        <el-button type="success" size="large" @click="router.back()" v-else>完成学习</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Select, CloseBold } from '@element-plus/icons-vue'
// 引入你之前写好的 API
import { getCourseDetail, getQuestions, updateStudyProgress } from '../../api/learning'

const route = useRoute()
const router = useRouter()
const courseId = Number(route.params.id)

const loading = ref(false)
const courseInfo = ref<any>({})
const questions = ref<any[]>([])
const userAnswers = ref<Record<number, any>>({})
const isSubmitted = ref(false)

// 获取页面数据
const fetchData = async () => {
  loading.value = true
  try {
    // 1. 获取课程/文章内容
    const detailRes: any = await getCourseDetail(courseId)
    courseInfo.value = detailRes

    // 2. 获取习题
    const qRes: any = await getQuestions(courseId)
    questions.value = qRes.results || qRes

    // 3. 初始化答案结构
    questions.value.forEach(q => {
      if (q.q_type === 'single') {
        userAnswers.value[q.id] = null // 单选存选项ID
      } else {
        userAnswers.value[q.id] = [] // 多选存选项ID数组
      }
    })
  } catch (error) {
    ElMessage.error('获取数据失败')
  } finally {
    loading.value = false
  }
}

// 提取正确答案文本（如：A, B）
const getCorrectAnswersText = (q: any) => {
  const corrects = q.options.map((opt: any, index: number) => opt.is_correct ? String.fromCharCode(65 + index) : null).filter(Boolean)
  return corrects.join(', ')
}

// 检查单题是否答对
const checkAnswer = (q: any) => {
  const ans = userAnswers.value[q.id]
  const correctOpts = q.options.filter((o: any) => o.is_correct).map((o: any) => o.id)

  if (q.q_type === 'single') {
    return correctOpts.includes(ans)
  } else {
    // 多选题比对数组
    if (!ans || ans.length !== correctOpts.length) return false
    const sortedAns = [...ans].sort()
    const sortedCor = [...correctOpts].sort()
    return sortedAns.every((val, index) => val === sortedCor[index])
  }
}

// 提交答卷
const submitExam = () => {
  // 检查是否都做了
  const allAnswered = questions.value.every(q => {
    const ans = userAnswers.value[q.id]
    if (q.q_type === 'single') return ans !== null
    if (q.q_type === 'multiple') return ans.length > 0
    return false
  })

  if (!allAnswered) {
    return ElMessage.warning('请回答完所有题目后再提交')
  }

  ElMessageBox.confirm('确定要交卷吗？', '提示', { type: 'info' }).then(async () => {
    isSubmitted.value = true
    
    // 计算正确数
    let correctCount = 0
    questions.value.forEach(q => {
      if (checkAnswer(q)) correctCount++
    })
    
    const scoreRate = correctCount / questions.value.length
    
    // 如果全对或者正确率达到标准（这里暂时只要提交就算完成，你可以根据需求改）
    if (scoreRate >= 0.6 || questions.value.length === 0) {
      ElMessage.success(`恭喜！你答对了 ${correctCount} 道题！`)
      // 发送学习完成的请求，获取积分
      try {
        const res: any = await updateStudyProgress({
          course_id: courseId,
          current_time: 100, // 假装进度满了
          is_finished: true  // 关键标志位，触发后端积分逻辑
        })
        if (res.is_completed) {
          ElMessage.success(res.message || '学习任务已完成！')
        }
      } catch (err) {
        console.log('积分获取失败', err)
      }
    } else {
      ElMessage.warning(`你答对了 ${correctCount} 道题，正确率偏低，请查看解析！`)
      // 没及格的话，可以不发 is_finished 请求，要求重做
    }
  })
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.app-container { padding: 20px; max-width: 900px; margin: 0 auto; }
.exam-header { display: flex; justify-content: space-between; align-items: center; }
.course-content { margin-bottom: 30px; line-height: 1.6; color: #333; }
.question-item { margin-bottom: 30px; padding: 15px; border: 1px solid #ebeef5; border-radius: 8px; background: #fafafa; }
.q-title { font-size: 16px; margin-bottom: 15px; }
.option-row { display: block; margin-bottom: 15px; white-space: normal; height: auto; line-height: 1.5; }
.q-analysis { margin-top: 15px; padding: 15px; border-radius: 4px; font-size: 14px; }
.is-correct { background-color: #f0f9eb; border-left: 4px solid #67C23A; }
.is-wrong { background-color: #fef0f0; border-left: 4px solid #F56C6C; }
.submit-action { text-align: center; margin-top: 40px; }
</style>