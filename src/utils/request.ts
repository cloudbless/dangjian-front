// src/utils/request.ts
import axios from 'axios'
import { ElMessage } from 'element-plus'

// 1. 创建 axios 实例
const service = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // 指向你的 Django 后端
  timeout: 5000 // 请求超时时间
})

// 2. 请求拦截器 (自动贴邮票)
service.interceptors.request.use(
  (config) => {
    // 从本地存储中获取 Token
    const token = localStorage.getItem('token')
    if (token) {
      // 如果有 Token，就加到 Header 里
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 3. 响应拦截器 (自动处理错误)
service.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 如果 Token 过期 (401)，强制跳转回登录页
    if (error.response && error.response.status === 401) {
      ElMessage.error('登录过期，请重新登录')
      localStorage.removeItem('token')
      window.location.href = '/login'
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    return Promise.reject(error)
  }
)

export default service