// src/api/practice.ts
import request from '../utils/request'

// === 前台/公共接口 ===
// 获取实践活动列表
export function getPracticeList(params?: any) {
  return request({ url: 'practice/activities/', method: 'get', params })
}
// 党员报名实践活动
export function signUpActivity(data: { activity: number }) {
  return request({ url: 'practice/signups/', method: 'post', data })
}

// === 后台管理员接口 ===
// 新增活动
export function addPractice(data: any) {
  return request({ url: 'practice/activities/', method: 'post', data })
}
// 更新活动
export function updatePractice(id: number, data: any) {
  return request({ url: `practice/activities/${id}/`, method: 'put', data })
}
// 删除活动
export function deletePractice(id: number) {
  return request({ url: `practice/activities/${id}/`, method: 'delete' })
}
// 获取报名名单 (可以传 activity_id 进行过滤)
export function getSignUpList(params?: any) {
  return request({ url: 'practice/signups/', method: 'get', params })
}
// 管理员确认签到并发送积分
export function confirmAttendance(id: number) {
  return request({ url: `practice/signups/${id}/confirm_attendance/`, method: 'post' })
}