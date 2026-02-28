<template>
  <div class="dashboard-container">
    <el-row :gutter="20" class="panel-group">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-title">总党员人数</div>
          <div class="card-value text-blue">{{ summaryData.total_users }} <span class="unit">人</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-title">党支部数量</div>
          <div class="card-value text-red">{{ summaryData.total_orgs }} <span class="unit">个</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-title">累计完成学习</div>
          <div class="card-value text-orange">{{ summaryData.total_studies }} <span class="unit">次</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card">
          <div class="card-title">全平台总积分</div>
          <div class="card-value text-green">{{ summaryData.total_points }} <span class="unit">分</span></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="panel-row">
      <el-col :span="12">
        <el-card shadow="hover" class="data-panel">
          <template #header>
            <div class="section-title">各支部积分活跃度进度</div>
          </template>
          <div class="progress-list" v-if="branchData.length > 0">
            <div v-for="item in branchData" :key="item.name" class="progress-item">
              <div class="item-header">
                <span class="branch-name">{{ item.name }}</span>
                <span class="member-count">
                  <el-tag size="small" type="info" effect="plain">{{ item.members }} 人</el-tag>
                </span>
              </div>
              <div class="progress-wrapper">
                <span class="progress-label">活跃指数：</span>
                <el-progress 
                  :percentage="getPercentage(item.points)" 
                  :stroke-width="12"
                  :color="getProgressColor(getPercentage(item.points))" 
                  :format="() => `${item.points} 分`"
                />
              </div>
            </div>
          </div>
          <el-empty v-else description="暂无支部数据" />
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="data-panel">
          <template #header>
            <div class="section-title">党支部综合积分排行榜</div>
          </template>
          <el-table :data="branchData" stripe style="width: 100%" height="420">
            <el-table-column type="index" label="排名" width="80" align="center">
              <template #default="scope">
                <el-tag :type="scope.$index < 3 ? 'danger' : 'info'" effect="dark" round>
                  TOP {{ scope.$index + 1 }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="支部名称" min-width="150" />
            <el-table-column prop="members" label="党员人数" align="center" width="100" />
            <el-table-column prop="points" label="支部总积分" align="center">
              <template #default="scope">
                <span style="color: #E6A23C; font-weight: bold; font-size: 16px;">
                  {{ scope.row.points }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import request from '../../utils/request' // 引入我们封装好的 axios

// 概览卡片数据源
const summaryData = ref({
  total_users: 0,
  total_orgs: 0,
  total_studies: 0,
  total_points: 0
})

// 支部列表数据源
const branchData = ref<any[]>([])

// 获取最高积分，用于计算进度条的百分比
const maxPoints = computed(() => {
  if (branchData.value.length === 0) return 100
  const max = Math.max(...branchData.value.map(item => item.points))
  return max === 0 ? 100 : max // 防止除以 0
})

// 根据分数计算进度条百分比（0-100）
const getPercentage = (points: number) => {
  return Number(((points / maxPoints.value) * 100).toFixed(1))
}

// 根据百分比动态改变进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 30) return '#F56C6C' // 红色
  if (percentage < 70) return '#E6A23C' // 橙色
  return '#67C23A' // 绿色
}

// 🌐 核心：请求后端数据并进行清洗整合
const fetchDashboardData = async () => {
  try {
    // 假设 system 是你在 Django urls 里的前缀，根据具体路由调整
    const res: any = await request.get('system/stats/dashboard/') 
    
    // 1. 赋值顶部卡片数据
    if (res.cards) {
      summaryData.value = {
        total_users: res.cards.total_users || 0,
        total_orgs: res.cards.total_orgs || 0,
        total_studies: res.cards.total_studies || 0,
        total_points: res.cards.total_points || 0
      }
    }

    // 2. 将后端的 pie_data(人数) 和 bar_data(积分) 合并为一个完整的数组
    const orgMap: Record<string, any> = {}

    // 先遍历 pie_data 存入人数
    if (res.pie_data) {
      res.pie_data.forEach((item: any) => {
        orgMap[item.name] = {
          name: item.name,
          members: item.value,
          points: 0 // 初始化积分为0
        }
      })
    }

    // 再遍历 bar_data 存入积分
    if (res.bar_data && res.bar_data.categories) {
      res.bar_data.categories.forEach((category: string, index: number) => {
        if (!orgMap[category]) {
          orgMap[category] = { name: category, members: 0, points: 0 }
        }
        orgMap[category].points = res.bar_data.values[index]
      })
    }

    // 3. 将 Map 转为数组，并根据积分从高到低排序
    branchData.value = Object.values(orgMap).sort((a, b) => b.points - a.points)

  } catch (error) {
    console.error('获取大屏数据失败:', error)
  }
}

// 组件挂载时自动发起请求
onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped lang="scss">
.dashboard-container {
  padding: 20px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 60px);

  .panel-group {
    margin-bottom: 20px;

    .data-card {
      border-radius: 8px;
      .card-title {
        color: #909399;
        font-size: 14px;
        margin-bottom: 12px;
        font-weight: bold;
      }
      .card-value {
        font-size: 32px;
        font-weight: bold;
        .unit {
          font-size: 14px;
          color: #909399;
          font-weight: normal;
        }
      }
      .text-blue { color: #409EFF; }
      .text-red { color: #c0392b; }
      .text-orange { color: #E6A23C; }
      .text-green { color: #67C23A; }
    }
  }

  .panel-row {
    .data-panel {
      border-radius: 8px;
      height: 100%;

      .section-title {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
        display: flex;
        align-items: center;
        &::before {
          content: '';
          display: inline-block;
          width: 4px;
          height: 16px;
          background-color: #c0392b; 
          margin-right: 8px;
          border-radius: 2px;
        }
      }

      .progress-list {
        padding: 0 10px;
        .progress-item {
          margin-bottom: 24px;
          &:last-child {
            margin-bottom: 0;
          }

          .item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .branch-name {
              font-size: 15px;
              font-weight: 500;
              color: #303133;
            }
          }

          .progress-wrapper {
            display: flex;
            align-items: center;
            
            .progress-label {
              font-size: 13px;
              color: #909399;
              width: 90px;
            }
            .el-progress {
              flex: 1;
              :deep(.el-progress__text) {
                font-size: 13px !important;
                font-weight: bold;
                color: #606266;
                min-width: 50px;
              }
            }
          }
        }
      }
    }
  }
}
</style>