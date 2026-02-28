// src/api/learning.ts
import request from '../utils/request'

// ==========================================
// 前台/通用接口 (你原有的优秀代码)
// ==========================================

// 获取课程列表
export function getCourseList(params?: any) {
  return request({
    url: 'learning/courses/',
    method: 'get',
    params
  })
}

// 获取课程详情
export function getCourseDetail(id: number) {
  return request({
    url: `learning/courses/${id}/`,
    method: 'get'
  })
}

// 发送学习心跳包 (更新进度)
export function updateStudyProgress(data: { course_id: number; current_time: number; is_finished: boolean }) {
  return request({
    url: 'learning/records/update_progress/',
    method: 'post',
    data
  })
}

// 获取我的学习记录
export function getMyStudyRecords() {
  return request({
    url: 'learning/records/',
    method: 'get'
  })
}
export function updateStudyRecord(id: number, data: { feedback: string }) {
  return request({
    url: `learning/records/${id}/`,
    method: 'patch', // 使用 PATCH 仅更新 feedback 字段
    data
  })
}
// ==========================================
// 后台管理接口 (新增)
// ==========================================

// 新增课程 (注意：这里使用 FormData，因为要上传封面图片)
export function addCourse(data: FormData) {
  return request({ 
    url: 'learning/courses/', 
    method: 'post', 
    data 
  })
}

// 修改课程 (同样支持 FormData 修改封面)
export function updateCourse(id: number, data: FormData) {
  return request({ 
    url: `learning/courses/${id}/`, 
    method: 'put', 
    data 
  })
}

// 删除课程
export function deleteCourse(id: number) {
  return request({ 
    url: `learning/courses/${id}/`, 
    method: 'delete' 
  })
}
// src/api/learning.ts (追加在文件末尾)

// ==========================================
// 习题管理接口 (新增)
// ==========================================
// 获取某课程下的所有习题
export function getQuestions(course_id: number) {
  return request({ url: 'learning/questions/', method: 'get', params: { course_id } })
}
// 新增习题
export function addQuestion(data: any) {
  return request({ url: 'learning/questions/', method: 'post', data })
}
// 修改习题
export function updateQuestion(id: number, data: any) {
  return request({ url: `learning/questions/${id}/`, method: 'put', data })
}
// 删除习题
export function deleteQuestion(id: number) {
  return request({ url: `learning/questions/${id}/`, method: 'delete' })
}
// 获取学情统计 (管理员专用)
export function getBranchStats(params?: { org_id?: number | string }) {
  return request({
    url: 'learning/records/branch_stats/',
    method: 'get',
    params
  })
}