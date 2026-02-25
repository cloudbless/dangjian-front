import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '../utils/request'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')
  // 从本地反序列化用户信息
  const userInfo = ref<any>(JSON.parse(localStorage.getItem('userInfo') || 'null'))

  async function getUserInfo() {
    // 🎯 呼叫后端的 /me 接口
    const res: any = await request.get('system/users/me/')
    userInfo.value = res
    localStorage.setItem('userInfo', JSON.stringify(res))
    return res
  }

  async function login(loginForm: any) {
    // 登录前先清场
    logout()
    
    const res: any = await request.post('token/', loginForm)
    token.value = res.access
    localStorage.setItem('token', res.access)
    
    // 🎯 核心逻辑：登录后立刻同步拉取“名片”
    await getUserInfo()
    return res
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    // 强制清理所有残留
    localStorage.clear()
  }

  return { token, userInfo, login, logout, getUserInfo }
})