// src/api/content.ts
import request from '../utils/request'

export function getArticleList(params: any) {
  return request({
    url: 'content/articles/',
    method: 'get',
    params
  })
}

export function getArticleDetail(id: number) {
  return request({
    url: `content/articles/${id}/`,
    method: 'get'
  })
}

// 注意：涉及图片上传，通常用 FormData，但这里我们先传 JSON 简单处理
// 如果要传文件，axios 需要配置 headers: { 'Content-Type': 'multipart/form-data' }
export function addArticle(data: any) {
  return request({
    url: 'content/articles/',
    method: 'post',
    data
  })
}

export function updateArticle(id: number, data: any) {
  return request({
    url: `content/articles/${id}/`,
    method: 'put',
    data
  })
}

export function deleteArticle(id: number) {
  return request({
    url: `content/articles/${id}/`,
    method: 'delete'
  })
}