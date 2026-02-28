<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="header-box">
          <span style="font-size: 18px; font-weight: bold; color: #ce1126;">📊 支部学情监控</span>
          
          <div v-if="isSuperAdmin" class="org-selector">
            <span style="font-size: 14px; margin-right: 10px; color: #666;">选择查看支部:</span>
            <el-select 
              v-model="selectedOrgId" 
              placeholder="全部支部" 
              clearable 
              @change="fetchStats"
            >
              <el-option 
                v-for="org in orgList" 
                :key="org.id" 
                :label="org.name" 
                :value="org.id" 
              />
            </el-select>
          </div>
        </div>
      </template>

      <el-table :data="statsData" v-loading="loading" border stripe>
        <el-table-column type="expand">
          <template #default="{ row }">
            <div style="padding: 20px; background-color: #f8f9fa;">
              <h4 style="margin-top: 0; color: #409EFF;">📚 学习明细 - {{ row.username }}</h4>
              <el-table :data="row.records" border size="small">
                <el-table-column prop="course_title" label="任务名称" />
                <el-table-column label="状态" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="scope.row.is_completed ? 'success' : 'warning'">
                      {{ scope.row.is_completed ? '已完成' : '学习中' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="progress" label="进度(秒)" width="100" align="center" />
                <el-table-column prop="last_studied_at" label="最后学习时间" width="180" align="center" />
              </el-table>
              <el-empty v-if="row.records.length === 0" description="该党员暂无学习记录" :image-size="60" />
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="user_id" label="ID" width="80" align="center" />
        <el-table-column prop="username" label="党员姓名" width="150" align="center" />
        <el-table-column prop="organization_name" label="所属支部" />
        <el-table-column prop="total_points" label="当前总积分" width="120" align="center">
          <template #default="{ row }">
            <span style="color: #E6A23C; font-weight: bold;">{{ row.total_points }} 分</span>
          </template>
        </el-table-column>
        <el-table-column label="已完成任务数" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info">
              {{ row.records.filter((r: any) => r.is_completed).length }} / {{ row.records.length }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import request from '../../utils/request'
import { getBranchStats } from '../../api/learning'

const userStore = useUserStore()
const loading = ref(false)
const statsData = ref([])

const orgList = ref<any[]>([])
const selectedOrgId = ref<number | undefined>(undefined)

// 判断是否是一级管理员
const isSuperAdmin = computed(() => userStore.userInfo?.role === 'super_admin')

// 获取组织架构列表（仅超管需要）
// 获取组织架构列表（仅超管需要）
const fetchOrgs = async () => {
  if (isSuperAdmin.value) {
    try {
      // 👇 修改这里的路径为 system/orgs/
      const res: any = await request.get('system/orgs/', { params: { size: 100 } })
      orgList.value = res.results || res
    } catch (e) {
      console.error('获取支部列表失败')
    }
  }
}

// 获取统计数据
const fetchStats = async () => {
  loading.value = true
  try {
    const res: any = await getBranchStats({ org_id: selectedOrgId.value })
    statsData.value = res
  } catch (e) {
    console.error('获取学情统计失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrgs()
  fetchStats()
})
</script>

<style scoped>
.app-container { padding: 20px; }
.header-box { display: flex; justify-content: space-between; align-items: center; }
</style>