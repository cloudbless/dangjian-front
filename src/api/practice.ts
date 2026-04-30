// src/api/practice.ts
import request from '../utils/request'

// === 前台/公共接口 ===
// 获取实践活动列表
export function getPracticeList(params?: any) {
  return request({ url: 'practice/activities/', method: 'get', params })
}
// 👇 修复前台报名404：将 signups 改为 registrations
export function signUpActivity(data: { activity: number }) {
  return request({ url: 'practice/registrations/', method: 'post', data })
}
// 个人中心：获取我的报名记录
export function getMyPracticeRegistrations(params?: any) {
  return request({ url: '/practice/registrations/my/', method: 'get', params })
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
// 👇 修复后台拉取名单404：将 signups 改为 registrations
export function getSignUpList(params?: any) {
  return request({ url: 'practice/registrations/', method: 'get', params })
}

// 👇 核心新增：第一阶段（审核报名：1通过，2驳回）
export function auditSignUp(id: number, data: { status: number }) {
  return request({ url: `practice/registrations/${id}/audit/`, method: 'post', data })
}

// 👇 核心新增：第二阶段（发放积分）
export function grantPoints(id: number) {
  return request({ url: `practice/registrations/${id}/grant_points/`, method: 'post' })
}
export function cancelSignUpActivity(activityId: number) {
  return request({ 
    url: `/practice/activities/${activityId}/cancel_signup/`, 
    method: 'post' 
  })
}