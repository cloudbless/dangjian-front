<template>
  <div class="app-container">
    <el-card>
      <div class="header-actions" style="margin-bottom: 20px; text-align: right;">
        <el-button type="primary" @click="handleCreate">📺 发布新学习任务</el-button>
      </div>

      <el-table :data="courseList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column label="封面" width="100" align="center">
          <template #default="{ row }">
            <el-image 
              v-if="row.cover" 
              :src="row.cover" 
              style="width: 60px; height: 40px; border-radius: 4px;"
              fit="cover"
              :preview-src-list="[row.cover]"
              preview-teleported
            />
            <span v-else style="color: #999; font-size: 12px;">无封面</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="任务标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="形式" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.course_type === 2" type="success">📝 练习/图文</el-tag>
            <el-tag v-else type="primary">🎬 视频课程</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="性质" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_required ? 'danger' : 'info'">
              {{ row.is_required ? '必修' : '选修' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="points_reward" label="奖励学分" width="90" align="center">
          <template #default="{ row }">
            <span style="color: #E6A23C; font-weight: bold;">+{{ row.points_reward || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="发布时间" width="160" align="center">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString().slice(0, 10) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right" align="center">
          <template #default="{ row }">
            <el-button v-if="row.course_type === 2" link type="success" @click="openQuestionDrawer(row)">管理习题</el-button>
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="700px" 
      destroy-on-close
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="任务标题" required>
          <el-input v-model="form.title" placeholder="例如：二十大精神深度解读第一讲" />
        </el-form-item>
        
        <el-form-item label="任务简介">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="简要描述任务内容..." />
        </el-form-item>

        <el-form-item label="任务形式" required>
          <el-radio-group v-model="form.course_type">
            <el-radio :value="1">🎬 视频课程</el-radio>
            <el-radio :value="2">📝 图文 / 练习题</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="视频地址" required v-if="form.course_type === 1">
          <el-input v-model="form.video_url" placeholder="请输入MP4视频的在线URL链接" />
          <div style="font-size: 12px; color: #999; margin-top: 5px; line-height: 1.4;">
            提示：为保证播放流畅，建议将视频上传至阿里云/腾讯云对象存储后，将链接粘贴于此。
          </div>
        </el-form-item>

        <el-form-item label="图文内容" required v-if="form.course_type === 2">
          <el-input 
            v-model="form.content" 
            type="textarea" 
            :rows="8" 
            placeholder="请输入文章内容、简述，之后可在列表点击“管理习题”添加具体题目..." 
          />
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="任务性质">
              <el-switch 
                v-model="form.is_required" 
                active-text="必修课" 
                inactive-text="选修课" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="奖励学分" required>
              <el-input-number v-model="form.points_reward" :min="1" :max="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="任务封面">
          <el-upload
            class="cover-uploader"
            action="#"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleCoverChange"
          >
            <img v-if="imageUrl" :src="imageUrl" class="cover-preview" />
            <el-icon v-else class="uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div style="font-size: 12px; color: #999;">建议尺寸 16:9，支持 jpg/png 格式</div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确认保存</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="drawerVisible" :title="`管理习题 - ${currentCourseTitle}`" size="50%">
      <div style="margin-bottom: 15px;">
        <el-button type="primary" @click="handleAddQuestion">+ 添加习题</el-button>
      </div>
      
      <el-table :data="questionList" border stripe>
        <el-table-column label="题干" prop="content" show-overflow-tooltip />
        <el-table-column label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.q_type === 'single' ? 'primary' : 'warning'">
              {{ row.q_type === 'single' ? '单选题' : '多选题' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEditQuestion(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDeleteQuestion(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>

    <el-dialog v-model="qDialogVisible" title="习题编辑" width="600px" append-to-body>
      <el-form :model="qForm" label-width="80px">
        <el-form-item label="题目类型">
          <el-radio-group v-model="qForm.q_type" @change="handleTypeChange">
            <el-radio value="single">单选题</el-radio>
            <el-radio value="multiple">多选题</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="题干" required>
          <el-input v-model="qForm.content" type="textarea" :rows="3" placeholder="请输入题目内容" />
        </el-form-item>
        
        <el-form-item label="选项设置" required>
          <div v-for="(opt, index) in qForm.options" :key="index" style="display: flex; margin-bottom: 10px; width: 100%; align-items: center;">
            <el-checkbox v-if="qForm.q_type === 'multiple'" v-model="opt.is_correct" style="margin-right: 15px;"></el-checkbox>
            <el-radio v-else v-model="singleCorrectIndex" :value="index" @change="handleSingleChange(index)" style="margin-right: 15px;">正确</el-radio>
            
            <el-input v-model="opt.content" placeholder="选项内容" style="flex: 1; margin-right: 10px;" />
            <el-button type="danger" link @click="removeOption(index)">删除</el-button>
          </div>
          <el-button type="primary" plain size="small" @click="addOption">+ 增加选项</el-button>
        </el-form-item>

        <el-form-item label="解析(选填)">
          <el-input v-model="qForm.analysis" type="textarea" :rows="2" placeholder="答题后的解析说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="qDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitQuestion" :loading="qSubmitLoading">保存题目</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
// 👇 引入了新增的习题 API
import { 
  getCourseList, addCourse, updateCourse, deleteCourse, 
  getQuestions, addQuestion, updateQuestion, deleteQuestion 
} from '../../api/learning'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// ==========================================
// 1. 课程列表与管理逻辑
// ==========================================
const courseList = ref([])
const loading = ref(false)

const fetchCourses = async () => {
  loading.value = true
  try {
    const res: any = await getCourseList({ page: 1, size: 50 })
    courseList.value = res.results || res
  } finally {
    loading.value = false
  }
}

const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)
const imageUrl = ref('')
const rawFile = ref<File | null>(null)

const form = reactive({
  id: undefined as number | undefined,
  title: '',
  description: '',
  course_type: 1, 
  video_url: '',
  content: '',
  is_required: false,
  points_reward: 10
})

const handleCoverChange = (file: any) => {
  imageUrl.value = URL.createObjectURL(file.raw)
  rawFile.value = file.raw
}

const handleCreate = () => {
  form.id = undefined
  form.title = ''
  form.description = ''
  form.course_type = 1
  form.video_url = ''
  form.content = ''
  form.is_required = false
  form.points_reward = 10
  imageUrl.value = ''
  rawFile.value = null
  
  dialogTitle.value = '发布新学习任务'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  Object.assign(form, row)
  if (!form.course_type) form.course_type = 1 
  
  imageUrl.value = row.cover || ''
  rawFile.value = null
  dialogTitle.value = '编辑学习任务'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title) return ElMessage.warning('任务标题为必填项')
  if (form.course_type === 1 && !form.video_url) return ElMessage.warning('视频地址为必填项')
  if (form.course_type === 2 && !form.content) return ElMessage.warning('图文/练习题内容为必填项')

  submitLoading.value = true
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('description', form.description)
  formData.append('course_type', form.course_type.toString())
  formData.append('is_required', form.is_required ? 'true' : 'false') 
  formData.append('points_reward', form.points_reward.toString()) 
  
  if (form.course_type === 1) formData.append('video_url', form.video_url)
  if (form.course_type === 2) formData.append('content', form.content)
  
  if (rawFile.value) {
    formData.append('cover', rawFile.value)
  }

  try {
    if (form.id) {
      await updateCourse(form.id, formData)
      ElMessage.success('更新成功')
    } else {
      await addCourse(formData)
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    fetchCourses()
  } catch (error) {
    ElMessage.error('操作失败，请检查填写内容')
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该任务吗？这可能会影响正在学习的党员数据！', '危险操作', { type: 'warning' }).then(async () => {
    await deleteCourse(row.id)
    ElMessage.success('删除成功')
    fetchCourses()
  })
}

// ==========================================
// 2. 习题管理逻辑 (新增部分)
// ==========================================
const drawerVisible = ref(false)
const currentCourseId = ref<number | null>(null)
const currentCourseTitle = ref('')
const questionList = ref([])

// 打开习题抽屉
const openQuestionDrawer = async (row: any) => {
  currentCourseId.value = row.id
  currentCourseTitle.value = row.title
  drawerVisible.value = true
  await fetchQuestions()
}

// 获取习题列表
const fetchQuestions = async () => {
  if (!currentCourseId.value) return
  try {
    const res: any = await getQuestions(currentCourseId.value)
    questionList.value = res.results || res
  } catch (err) {
    ElMessage.error('获取题目失败')
  }
}

// === 习题表单弹窗逻辑 ===
const qDialogVisible = ref(false)
const qSubmitLoading = ref(false)
const singleCorrectIndex = ref(-1)

const qForm = ref({
  id: undefined as number | undefined,
  course: null as number | null,
  content: '',
  q_type: 'single',
  analysis: '',
  options: [
    { content: '', is_correct: false },
    { content: '', is_correct: false }
  ]
})

// 切换单选/多选时，重置正确答案
const handleTypeChange = () => {
  singleCorrectIndex.value = -1
  qForm.value.options.forEach(o => o.is_correct = false)
}

// 单选题选中正确答案
const handleSingleChange = (index: number) => {
  qForm.value.options.forEach((opt, i) => {
    opt.is_correct = (i === index)
  })
}

// 增删选项
const addOption = () => qForm.value.options.push({ content: '', is_correct: false })
const removeOption = (index: number) => qForm.value.options.splice(index, 1)

// 打开添加习题弹窗
const handleAddQuestion = () => {
  qForm.value = {
    id: undefined,
    course: currentCourseId.value,
    content: '',
    q_type: 'single',
    analysis: '',
    options: [
      { content: '选项 A', is_correct: false },
      { content: '选项 B', is_correct: false },
      { content: '选项 C', is_correct: false },
      { content: '选项 D', is_correct: false }
    ]
  }
  singleCorrectIndex.value = -1
  qDialogVisible.value = true
}

// 打开编辑习题弹窗
const handleEditQuestion = (row: any) => {
  qForm.value = JSON.parse(JSON.stringify(row))
  if (qForm.value.q_type === 'single') {
    singleCorrectIndex.value = qForm.value.options.findIndex((o: any) => o.is_correct)
  }
  qDialogVisible.value = true
}

// 提交保存习题
const submitQuestion = async () => {
  if (!qForm.value.content) return ElMessage.warning('请输入题干')
  if (qForm.value.options.length < 2) return ElMessage.warning('至少需要两个选项')
  
  const hasCorrect = qForm.value.options.some(o => o.is_correct)
  if (!hasCorrect) return ElMessage.warning('请至少设置一个正确答案')

  qSubmitLoading.value = true
  try {
    if (qForm.value.id) {
      await updateQuestion(qForm.value.id, qForm.value)
      ElMessage.success('修改题目成功')
    } else {
      await addQuestion(qForm.value)
      ElMessage.success('添加题目成功')
    }
    qDialogVisible.value = false
    fetchQuestions()
  } catch (err) {
    ElMessage.error('操作失败，请重试')
  } finally {
    qSubmitLoading.value = false
  }
}

// 删除习题
const handleDeleteQuestion = (id: number) => {
  ElMessageBox.confirm('确定删除该题目吗？', '提示', { type: 'warning' }).then(async () => {
    await deleteQuestion(id)
    ElMessage.success('删除成功')
    fetchQuestions()
  })
}

onMounted(() => {
  fetchCourses()
})
</script>

<style scoped>
.app-container { padding: 20px; }
.cover-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 200px;
  height: 112px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.cover-uploader:hover { border-color: #ce1126; }
.uploader-icon { font-size: 28px; color: #8c939d; }
.cover-preview { width: 100%; height: 100%; object-fit: cover; }
</style>