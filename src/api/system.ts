import request from '../utils/request'

/**
 * 用户(党员)管理相关接口
 */

// 1. 获取用户列表 (支持分页和搜索)
export function getUserList(params: any) {
  return request({
    url: 'system/users/',
    method: 'get',
    params
  })
}

// 2. 获取当前登录人详细资料 (核心：解决身份错乱)
export function getCurrentUserInfo() {
  return request({
    url: 'system/users/me/',
    method: 'get'
  })
}

// 3. 新增党员
export function addUser(data: any) {
  return request({
    url: 'system/users/',
    method: 'post',
    data
  })
}

// 4. 修改党员信息 (全量更新用 PUT, 局部更新用 PATCH)
export function updateUser(id: number, data: any) {
  return request({
    url: `system/users/${id}/`,
    method: 'patch', // 建议使用 patch，仅发送修改的字段
    data
  })
}

// 5. 重置党员密码
export function resetUserPassword(id: number, data: { password: string }) {
  return request({
    url: `system/users/${id}/reset_password/`,
    method: 'post',
    data
  })
}

// 6. 删除用户
export function deleteUser(id: number) {
  return request({
    url: `system/users/${id}/`,
    method: 'delete'
  })
}

/**
 * 组织/积分相关接口
 */

// 7. 获取组织架构列表 (用于下拉选择分配组织)
export function getOrgList() {
  return request({
    url: 'system/orgs/',
    method: 'get'
  })
}

// 8. 获取个人积分日志
export function getPointsLogs() {
  return request({
    url: 'system/points-logs/', 
    method: 'get'
  })
}

/**
 * 大屏统计接口
 */

// 9. 获取大屏统计数据
export function getDashboardStats() {
  return request({
    url: 'system/stats/dashboard/',
    method: 'get'
  })
}

// src/api/system.ts

// 10. 获取我的支部概况信息
export function getMyBranchInfo() {
  return request({
    url: 'system/my_branch/',
    method: 'get'
  })
}

// src/api/system.ts (在文件最下方补充)

// 获取个人积分明细日志
export function getPointsLogList(params?: any) {
  return request({
    url: 'system/points-logs/',
    method: 'get',
    params
  })
}