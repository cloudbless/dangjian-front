<template>
  <div class="app-container">
    <el-card>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreate">✍️ 发布文章</el-button>
      </div>

      <el-table :data="list" v-loading="loading" border style="margin-top: 20px">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="article_type" label="类型" width="120">
          <template #default="{ row }">
            <el-tag v-if="row.article_type === 1">今日时政</el-tag>
            <el-tag v-else-if="row.article_type === 2" type="warning">通知公告</el-tag>
            <el-tag v-else-if="row.article_type === 3" type="success">党员风采</el-tag>
            <el-tag v-else type="info">支部动态</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="author_name" label="发布人" width="120" />
        <el-table-column prop="created_at" label="发布时间" width="180">
          <template #default="{ row }">
            {{ new Date(row.created_at).toLocaleString() }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
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
      width="900px" 
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form :model="form" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="16">
            <el-form-item label="文章标题" required>
              <el-input v-model="form.title" placeholder="请输入文章标题" />
            </el-form-item>
            <el-form-item label="文章摘要">
              <el-input v-model="form.summary" type="textarea" rows="3" placeholder="简要介绍文章内容..." />
            </el-form-item>
          </el-col>
          
          <el-col :span="8">
            <el-form-item label="封面图">
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
              <div class="upload-tip">建议 16:9 比例，jpg/png 格式</div>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="文章类型">
          <el-select v-model="form.article_type" style="width: 200px">
            <el-option label="今日时政" :value="1" />
            <el-option label="通知公告" :value="2" />
            <el-option label="党员风采" :value="3" />
            <el-option label="支部动态" :value="4" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="正文内容">
          <div style="border: 1px solid #ccc; width: 100%;">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
            />
            <Editor
              style="height: 400px; overflow-y: hidden;"
              v-model="form.content"
              :defaultConfig="editorConfig"
              mode="default"
              @onCreated="handleCreated"
            />
          </div>
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
import { ref, reactive, onMounted, shallowRef, onBeforeUnmount } from 'vue'
import { getArticleList, addArticle, updateArticle, deleteArticle } from '../../../api/content'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import '@wangeditor/editor/dist/css/style.css'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'

// --- 编辑器相关 ---
const editorRef = shallowRef()
const toolbarConfig = {}
// --- 编辑器相关配置 ---
const editorConfig = { 
  placeholder: '请输入正文内容...',
  MENU_CONF: {
    // 配置上传图片
    uploadImage: {
      // 后端上传接口地址
      server: 'http://127.0.0.1:8000/api/upload/image/', 
      // 单个文件的最大体积限制 (2M)
      maxFileSize: 2 * 1024 * 1024,
      // 自定义上传参数
      fieldName: 'wangeditor-uploaded-image',
      // 请求头，如果后端开启了 JWT 认证，这里需要传 Token
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      // 上传成功后的回调（可选，用于调试）
      onSuccess(file: File, res: any) {
        console.log('图片上传成功', res)
      },
      // 上传失败
      onFailed(file: File, res: any) {
        ElMessage.error('图片上传失败')
      }
    }
  }
}

onBeforeUnmount(() => {
    const editor = editorRef.value
    if (editor == null) return
    editor.destroy()
})

const handleCreated = (editor: any) => {
  editorRef.value = editor
}

// --- 封面上传逻辑 ---
const imageUrl = ref('')
const rawFile = ref<File | null>(null)

const handleCoverChange = (file: any) => {
  // 预览图片
  imageUrl.value = URL.createObjectURL(file.raw)
  // 保存文件对象用于提交
  rawFile.value = file.raw
}

// --- 业务逻辑 ---
const loading = ref(false)
const submitLoading = ref(false)
const list = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')

const form = reactive({
  id: undefined,
  title: '',
  summary: '',
  article_type: 1,
  content: ''
})

const getList = async () => {
  loading.value = true
  const res: any = await getArticleList({})
  list.value = res.results || res
  loading.value = false
}

const handleCreate = () => {
  form.id = undefined
  form.title = ''
  form.summary = ''
  form.article_type = 1
  form.content = ''
  imageUrl.value = ''
  rawFile.value = null
  dialogTitle.value = '发布新文章'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  Object.assign(form, row)
  imageUrl.value = row.cover // 显示已有封面
  rawFile.value = null // 重置新上传文件
  dialogTitle.value = '编辑文章'
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.title) return ElMessage.warning('标题不能为空')
  
  submitLoading.value = true
  // === 关键：使用 FormData 包装数据以支持文件上传 ===
  const formData = new FormData()
  formData.append('title', form.title)
  formData.append('summary', form.summary)
  formData.append('article_type', form.article_type.toString())
  formData.append('content', form.content)
  
  if (rawFile.value) {
    formData.append('cover', rawFile.value)
  }

  try {
    if (form.id) {
      await updateArticle(form.id, formData)
      ElMessage.success('更新成功')
    } else {
      await addArticle(formData)
      ElMessage.success('发布成功')
    }
    dialogVisible.value = false
    getList()
  } catch (err) {
    console.error(err)
  } finally {
    submitLoading.value = false
  }
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm('确认删除该文章吗?', '提示', { type: 'warning' }).then(async () => {
    await deleteArticle(row.id)
    ElMessage.success('已删除')
    getList()
  })
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.app-container { padding: 20px; }
.header-actions { display: flex; justify-content: flex-end; }

/* 上传组件样式 */
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
  transition: border-color 0.3s;
}
.cover-uploader:hover {
  border-color: #ce1126;
}
.uploader-icon {
  font-size: 28px;
  color: #8c939d;
}
.cover-preview {
  width: 200px;
  height: 112px;
  object-fit: cover;
}
.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  line-height: 1.4;
}
</style>