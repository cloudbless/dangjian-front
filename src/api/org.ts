// src/api/org.ts
import request from '../utils/request'

// 1. 获取组织列表 (树形结构)
export function getOrgList() {
  return request({
    url: 'system/orgs/',
    method: 'get'
  })
}

// 2. 新增组织
export function addOrg(data: any) {
  return request({
    url: 'system/orgs/',
    method: 'post',
    data
  })
}

// 3. 修改组织
export function updateOrg(id: number, data: any) {
  return request({
    url: `system/orgs/${id}/`,
    method: 'put',
    data
  })
}

// 4. 删除组织
export function deleteOrg(id: number) {
  return request({
    url: `system/orgs/${id}/`,
    method: 'delete'
  })
}