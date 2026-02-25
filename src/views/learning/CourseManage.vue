<template>
  <div class="app-container">
    <el-card>
      <div class="header-actions" style="margin-bottom: 20px; text-align: right;">
        <el-button type="primary" @click="handleCreate">📺 发布新课程</el-button>
      </div>

      <el-table :data="courseList" v-loading="loading" border stripe>
        <el-table-column prop="id" label="ID" width="60" />
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
        <el-table-column prop="title" label="课程标题" min-width="200" show-overflow-tooltip />
        <el-table-column label="课程类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_required ? 'danger' : 'info'">
              {{ row.is_required ? '必修课' : '选修课' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="credit" label="奖励学分" width="100" align="center">
          <template #default="{ row }">
            <span style="color: #E6A23C; font-weight: bold;">+{{ row.credit || row.points || 0 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="发布时间" width="160">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString().slice(0, 10) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog 
      v-model="dialogVisible" 
      :title="dialogTitle" 
      width="650px" 
      destroy-on-close
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="课程标题" required>
          <el-input v-model="form.title" placeholder="例如：二十大精神深度解读第一讲" />
        </el-form-item>
        
        <el-form-item label="课程简介">
          <el-input v-model="form.description" type="textarea" :rows="3" placeholder="简要描述课程内容..." />
        </el-form-item>

        <el-form-item label="视频地址" required>
          <el-input v-model="form.video_url" placeholder="请输入MP4视频的在线URL链接" />
          <div style="font-size: 12px; color: #999; margin-top: 5px;">
            提示：为保证播放流畅，建议将视频上传至阿里云/腾讯云对象存储后，将链接粘贴于此。
          </div>
        </el-form-item>

        <el-row>
          <el-col :span="12">
            <el-form-item label="课程类型">
              <el-switch 
                v-model="form.is_required" 
                active-text="必修课" 
                inactive-text="选修课" 
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="奖励学分" required>
              <el-input-number v-model="form.credit" :min="1" :max="50" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="课程封面">
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
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">确认发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { getCourseList, addCourse, updateCourse, deleteCourse } from '../../api/learning'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

// --- 列表逻辑 ---
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

// --- 表单与封面上传逻辑 ---
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitLoading = ref(false)

const imageUrl = ref('')
const rawFile = ref<File | null>(null)

// 注意：这里的字段名(credit/points)需与你的 Django 模型保持一致
const form = reactive({
  id: undefined,
  title: '',
  description: '',
  video_url: '',
  is_required: false,
  credit: 5
})

const handleCoverChange = (file: any) => {
  imageUrl.value = URL.createObjectURL(file.raw)
  rawFile.value = file.raw
}

const handleCreate = () => {
  form.id = undefined
  form.title = ''
  form.description = ''
  form.video_url = ''
  form.is_required = false
  form.credit = 5
  imageUrl.value = ''
  rawFile.value = null
  
  dialogTitle.value = '发布新课程'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  Object.assign(form, row)
  // 如果后端传过来的是 True/False，前端 el-switch 绑定的是 boolean，这里通常可以直接用
  imageUrl.value = row.cover || ''
  rawFile.value = null
  dialogTitle.value = '编辑课程'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title || !form.video_url) {
    return ElMessage.warning('课程标题和视频地址为必填项')
  }

  submitLoading.value = true
  // 使用 FormData 打包数据以支持图片上传
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('description', form.description)
  formData.append('video_url', form.video_url)
  // boolean 值转为字符串传递给 Django
  formData.append('is_required', form.is_required ? 'true' : 'false') 
  formData.append('credit', form.credit.toString())
  
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
  ElMessageBox.confirm('确认删除该课程吗？这可能会影响正在学习的党员数据！', '危险操作', { type: 'warning' }).then(async () => {
    await deleteCourse(row.id)
    ElMessage.success('删除成功')
    fetchCourses()
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