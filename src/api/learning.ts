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