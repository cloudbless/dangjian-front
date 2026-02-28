<template>
  <div class="branch-profile-container">
    <el-row :gutter="20">
      
      <el-col :span="8">
        
        <el-card shadow="hover" class="profile-card">
          <div class="user-header">
            <el-avatar :size="80" :src="userInfo.avatar || defaultAvatar" class="avatar-shadow" />
            <h2 class="username">{{ userInfo.username }}</h2>
            <p class="role-text">{{ getRoleName(userInfo.role) }}</p>
          </div>
          
          <div class="user-details">
            <div class="detail-item">
              <span class="label">所属支部：</span>
              <span class="value">{{ userInfo.organization_name || '暂无支部' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">手机号码：</span>
              <span class="value">{{ userInfo.phone || '未绑定' }}</span>
            </div>
          </div>
        </el-card>

        <el-card shadow="hover" class="tree-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">🌱 我的成长树</div>
          </template>
          
          <div class="tree-visual-area">
            <div class="tree-stage" :class="'stage-' + currentLevel.level">
              {{ currentLevel.icon }}
            </div>
            <h3 class="tree-title">{{ currentLevel.title }}</h3>
            <p class="tree-desc">{{ currentLevel.desc }}</p>
          </div>

          <div class="points-progress">
            <div class="points-info">
              <span>当前积分：<strong class="highlight-points">{{ currentPoints }}</strong></span>
              <span v-if="nextLevel">距离升级还需：{{ nextLevel.minPoints - currentPoints }} 分</span>
              <span v-else>您已达到最高等级！</span>
            </div>
            <el-progress 
              :percentage="progressPercentage" 
              :stroke-width="12" 
              :color="currentLevel.color" 
              striped 
              striped-flow
            />
          </div>
        </el-card>

      </el-col>

      <el-col :span="16">
        <el-card shadow="hover" class="timeline-card">
          <template #header>
            <div class="card-header">
              <span>⭐ 积分获取流水</span>
              <span class="total-badge">累计获得：{{ currentPoints }} 分</span>
            </div>
          </template>
          
          <div class="timeline-wrapper" v-loading="loading">
            <el-timeline v-if="pointsLogs.length > 0">
              <el-timeline-item
                v-for="log in pointsLogs"
                :key="log.id"
                :timestamp="new Date(log.created_at).toLocaleString()"
                :type="log.change_amount > 0 ? 'success' : 'danger'"
                placement="top"
              >
                <el-card shadow="never" class="log-card">
                  <div class="log-content">
                    <span class="log-reason">{{ log.reason }}</span>
                    <span class="log-amount" :class="{'is-positive': log.change_amount > 0}">
                      {{ log.change_amount > 0 ? '+' : '' }}{{ log.change_amount }}
                    </span>
                  </div>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            
            <el-empty v-else description="您还没有获得过积分，快去学习中心看看吧！">
              <el-button type="primary" @click="$router.push('/branch/learning')">前往学习</el-button>
            </el-empty>

            <div class="pagination-box" v-if="total > 0">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="total"
                :page-size="pageSize"
                v-model:current-page="currentPage"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </el-card>
      </el-col>

    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { getPointsLogList } from '../../api/system'

const userStore = useUserStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 获取当前用户信息
const userInfo = computed(() => userStore.userInfo || {})
const currentPoints = computed(() => userInfo.value.total_points || 0)

// --- 1. 先明确定义树的类型接口 ---
interface GrowthLevel {
  level: number;
  minPoints: number;
  title: string;
  desc: string;
  icon: string;
  color: string;
}

// --- 2. 显式指定数组类型为 GrowthLevel[] ---
const growthLevels: GrowthLevel[] = [
  { level: 1, minPoints: 0, title: '初生种子', desc: '刚加入组织的新生力量，充满希望。', icon: '🌱', color: '#909399' },
  { level: 2, minPoints: 50, title: '破土幼苗', desc: '汲取理论养分，逐渐展现生机。', icon: '🌿', color: '#67C23A' },
  { level: 3, minPoints: 150, title: '茁壮小树', desc: '积极参与实践，枝叶日益丰满。', icon: '🌲', color: '#409EFF' },
  { level: 4, minPoints: 300, title: '参天大树', desc: '理论扎实，实践丰富，发挥模范带头作用！', icon: '🌳', color: '#E6A23C' },
  { level: 5, minPoints: 600, title: '累累硕果', desc: '卓越的党员标兵，为组织结出丰硕成果！', icon: '🍎🌳', color: '#ce1126' },
]

// --- 3. 显式指定 computed 返回的必定是一个 GrowthLevel ---
const currentLevel = computed<GrowthLevel>(() => {
  for (let i = growthLevels.length - 1; i >= 0; i--) {
    if (currentPoints.value >= growthLevels[i].minPoints) {
      return growthLevels[i];
    }
  }
  return growthLevels[0]; // 绝对会返回一个有效对象
})

// --- 4. 显式指定可能为 null，并且加上安全访问 ---
const nextLevel = computed<GrowthLevel | null>(() => {
  if (!currentLevel.value) return null; // 安全校验
  
  const currentIndex = growthLevels.findIndex(l => l.level === currentLevel.value.level)
  if (currentIndex !== -1 && currentIndex < growthLevels.length - 1) {
    return growthLevels[currentIndex + 1];
  }
  return null; // 已满级
})

// --- 5. 计算进度条百分比 ---
const progressPercentage = computed<number>(() => {
  if (!nextLevel.value) return 100; // 满级
  
  const currentLevelMin = currentLevel.value.minPoints;
  const targetPoints = nextLevel.value.minPoints;
  
  const percent = ((currentPoints.value - currentLevelMin) / (targetPoints - currentLevelMin)) * 100;
  return Math.min(Math.floor(percent), 100);
})


// --- 积分流水逻辑 ---
const loading = ref(false)
const pointsLogs = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const fetchPointsLogs = async () => {
  loading.value = true
  try {
    const res: any = await getPointsLogList({ page: currentPage.value, size: pageSize.value })
    pointsLogs.value = res.results || res || []
    total.value = res.count || 0
  } catch (error) {
    console.error('获取积分明细失败', error)
  } finally {
    loading.value = false
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchPointsLogs()
}

// 辅助方法：翻译角色
const getRoleName = (role: string) => {
  const roleMap: Record<string, string> = {
    'super_admin': '一级管理员',
    'branch_admin': '支部管理员',
    'member': '普通党员'
  }
  return roleMap[role] || '普通党员'
}

onMounted(() => {
  // 为了确保积分是最新的，每次进入页面重新拉取一次当前用户信息
  userStore.getUserInfo()
  fetchPointsLogs()
})
</script>

<style scoped>
.branch-profile-container { margin-top: 10px; }
.card-header { font-weight: bold; font-size: 16px; color: #333; display: flex; justify-content: space-between; align-items: center; }

/* 个人名片样式 */
.profile-card { text-align: center; padding-bottom: 20px; }
.avatar-shadow { box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 2px solid #fff; margin-top: 10px; }
.username { margin: 15px 0 5px 0; font-size: 22px; color: #333; }
.role-text { color: #ce1126; font-size: 14px; margin-bottom: 25px; font-weight: bold; }

.user-details { text-align: left; background: #f8f9fa; padding: 20px; border-radius: 8px; }
.detail-item { margin-bottom: 12px; font-size: 14px; }
.detail-item:last-child { margin-bottom: 0; }
.detail-item .label { color: #999; display: inline-block; width: 80px; }
.detail-item .value { color: #333; font-weight: 500; }

/* 成长树样式 */
.tree-visual-area { text-align: center; padding: 20px 0; }
.tree-stage { font-size: 80px; line-height: 1; margin-bottom: 15px; text-shadow: 0 10px 20px rgba(0,0,0,0.1); transition: transform 0.3s; }
.tree-stage:hover { transform: scale(1.1); }
.tree-title { margin: 0 0 10px 0; color: #333; font-size: 18px; }
.tree-desc { font-size: 13px; color: #666; padding: 0 20px; line-height: 1.6; }

.points-progress { margin-top: 20px; border-top: 1px dashed #eee; padding-top: 20px; }
.points-info { display: flex; justify-content: space-between; font-size: 13px; color: #666; margin-bottom: 10px; }
.highlight-points { color: #ce1126; font-size: 16px; font-weight: bold; }

/* 积分流水样式 */
.timeline-card { min-height: 600px; }
.total-badge { font-size: 14px; color: #ce1126; background: #fff1f0; padding: 4px 10px; border-radius: 20px; border: 1px solid #ffa39e; }
.timeline-wrapper { padding: 10px 20px 10px 5px; }

.log-card { border-radius: 6px; background-color: #fcfcfc; }
.log-content { display: flex; justify-content: space-between; align-items: center; }
.log-reason { font-size: 14px; color: #333; }
.log-amount { font-size: 16px; font-weight: bold; color: #f56c6c; }
.log-amount.is-positive { color: #67C23A; }

.pagination-box { display: flex; justify-content: center; margin-top: 30px; }
</style>