<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="box-card" v-loading="userLoading">
          <template #header>
            <div class="card-header">
              <span>👤 个人详细档案</span>
            </div>
          </template>

          <div class="profile-info" v-if="userInfo">
            <el-avatar
              :size="100"
              :src="userInfo.avatar || 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'"
            />
            <h2 class="username">{{ userInfo.real_name || userInfo.username }}</h2>
            <el-tag type="danger" effect="dark" size="small">{{ roleMap[userInfo.role] || "普通党员" }}</el-tag>

            <div class="info-list">
              <div class="info-item">
                <span class="label">性 别</span>
                <span class="value">{{ userInfo.gender === 1 ? '男' : '女' }}</span>
              </div>
              <div class="info-item">
                <span class="label">手机号码</span>
                <span class="value">{{ userInfo.phone || "未绑定" }}</span>
              </div>
              <div class="info-item">
                <span class="label">入党时间</span>
                <span class="value">{{ userInfo.join_party_date || "未填写" }}</span>
              </div>
              <div class="info-item">
                <span class="label">出生日期</span>
                <span class="value">{{ userInfo.birthday || "未填写" }}</span>
              </div>
              <div class="info-item">
                <span class="label">所属组织</span>
                <span class="value">{{ userInfo.organization_name || "系统直属" }}</span>
              </div>
              <div class="info-item no-border">
                <span class="label">身份证号</span>
                <span class="value">{{ userInfo.identity_card ? formatID(userInfo.identity_card) : "未录入" }}</span>
              </div>
            </div>

            <div class="points-display">
              <div class="points-title">我的累计积分</div>
              <div class="points-number">{{ userInfo.total_points || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="box-card">
          <el-tabs v-model="activeTab" class="profile-tabs">
            
            <el-tab-pane name="tasks">
              <template #label>
                <span class="tab-label">🚩 必修任务 <el-badge :value="taskTotal" :hidden="taskTotal === 0" /></span>
              </template>
              <div v-loading="tasksLoading" class="tab-content" style="padding-top: 0;">
                <el-tabs v-model="taskSubTab" type="border-card" class="sub-tabs">
                  
                  <el-tab-pane label="⏳ 待完成" name="unfinished">
                    <el-table :data="requiredTasksUnfinished" stripe style="width: 100%">
                      <el-table-column prop="title" label="课程名称" min-width="200" />
                      <el-table-column label="奖励积分" width="90" align="center">
                        <template #default="{ row }">
                          <span style="color: #E6A23C; font-weight: bold;">+{{ row.points_reward }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="操作" width="100" align="center">
                        <template #default="{ row }">
                          <el-button type="danger" size="small" @click="goToStudy(row.id)">去学习</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <el-empty v-if="requiredTasksUnfinished.length === 0" description="太棒了！待办必修任务已全部清空" />
                  </el-tab-pane>

                  <el-tab-pane label="✅ 已完成" name="finished">
                    <el-table :data="requiredTasksFinished" stripe style="width: 100%">
                      <el-table-column prop="title" label="课程名称" min-width="200" />
                      <el-table-column label="获得积分" width="90" align="center">
                        <template #default="{ row }">
                          <span style="color: #67C23A; font-weight: bold;">+{{ row.points_reward }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column label="状态" width="100" align="center">
                        <template #default="{ row }">
                          <el-button type="info" plain size="small" @click="goToStudy(row.id)">温故知新</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <el-empty v-if="requiredTasksFinished.length === 0" description="暂无已完成的必修任务" />
                  </el-tab-pane>

                </el-tabs>
              </div>
            </el-tab-pane>

            <el-tab-pane label="🤝 我的实践" name="practice">
              <div v-loading="practiceLoading" class="tab-content">
                <el-table :data="myPractices" stripe>
                  <el-table-column prop="activity_title" label="活动名称" min-width="180" />
                  <el-table-column label="报名时间" width="160">
                    <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
                  </el-table-column>
                  <el-table-column label="当前状态" width="120" align="center">
                    <template #default="{ row }">
                      <el-tag v-if="row.status === 0" type="info">待审核</el-tag>
                      <el-tag v-else-if="row.status === 1" type="primary">已通过</el-tag>
                      <el-tag v-else-if="row.status === 2" type="danger">已驳回</el-tag>
                      <el-tag v-else-if="row.status === 3" type="success">已发分</el-tag>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="myPractices.length === 0" description="还没有参加过实践活动哦" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="📚 学习记录" name="learning">
              <div v-loading="recordsLoading" class="tab-content">
                <el-timeline v-if="records.length > 0">
                  <el-timeline-item
                    v-for="record in records"
                    :key="record.id"
                    :timestamp="formatTime(record.last_studied_at)"
                    :type="record.is_completed ? 'success' : 'warning'"
                    placement="top"
                  >
                    <el-card shadow="hover">
                      <h4 class="course-title">{{ record.course_title }}</h4>
                      <div class="record-status">
                        <el-tag v-if="record.is_completed" type="success" size="small">已完成</el-tag>
                        <el-tag v-else type="warning" size="small">进行中 ({{ record.progress }}秒)</el-tag>
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
                <el-empty v-else description="暂无历史学习数据" />
              </div>
            </el-tab-pane>

            <el-tab-pane label="🪙 积分记录" name="points">
              <div v-loading="pointsLoading" class="tab-content">
                <el-table :data="pointsLogs" stripe max-height="500">
                  <el-table-column label="时间" width="160">
                    <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
                  </el-table-column>
                  <el-table-column prop="reason" label="原因" min-width="180" />
                  <el-table-column label="变动" width="80" align="center">
                    <template #default="{ row }">
                      <span class="point-plus">+{{ row.change_amount }}</span>
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty v-if="pointsLogs.length === 0" description="暂无积分变动记录" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router'
import { getCurrentUserInfo, getPointsLogs } from "../../api/system";
import { getMyStudyRecords, getCourseList } from "../../api/learning";
import { getMyPracticeRegistrations } from "../../api/practice";
import { ElMessage } from "element-plus";

const router = useRouter()

// 状态控制
const activeTab = ref("tasks");
const taskSubTab = ref("unfinished"); // 必修任务内的子Tab状态
const userLoading = ref(true);
const tasksLoading = ref(false);
const recordsLoading = ref(false);
const practiceLoading = ref(false);
const pointsLoading = ref(false);

// 数据存储
const userInfo = ref<any>(null);
const records = ref<any[]>([]);
const pointsLogs = ref<any[]>([]);
const myPractices = ref<any[]>([]);

// 🎯 将必修任务拆分为两个数组
const requiredTasksUnfinished = ref<any[]>([]);
const requiredTasksFinished = ref<any[]>([]);
const taskTotal = ref(0);

const roleMap: any = {
  super_admin: "超级管理员",
  branch_admin: "支部书记",
  member: "正式党员",
};

// 统一的学习跳转逻辑
const goToStudy = (courseId: number) => {
  // 👇 核心修复：加上 /branch 路由前缀
  router.push(`/branch/learning/video/${courseId}`)
}

// 1. 获取个人详细信息
const fetchUserInfo = async () => {
  userLoading.value = true;
  try {
    const res: any = await getCurrentUserInfo();
    userInfo.value = res;
  } catch (error) {
    ElMessage.error("获取个人档案失败");
  } finally {
    userLoading.value = false;
  }
};

// 2. 获取必修课 (同时获取完成和未完成的)
const fetchRequiredTasks = async () => {
  tasksLoading.value = true;
  try {
    // 拉取未完成的必修课
    const resUnfinished: any = await getCourseList({ 
      is_required: true, 
      is_completed: false,
      page: 1,
      page_size: 50 // 👈 修改：改为 page_size
    });
    requiredTasksUnfinished.value = resUnfinished.results || resUnfinished || [];
    taskTotal.value = requiredTasksUnfinished.value.length; 

    // 拉取已完成的必修课
    const resFinished: any = await getCourseList({ 
      is_required: true, 
      is_completed: true,
      page: 1,
      page_size: 50 // 👈 修改：改为 page_size
    });
    requiredTasksFinished.value = resFinished.results || resFinished || [];
  } finally {
    tasksLoading.value = false;
  }
};

// 3. 获取已报名的实践活动
const fetchMyPractices = async () => {
  practiceLoading.value = true;
  try {
    const res: any = await getMyPracticeRegistrations();
    myPractices.value = res.results || res;
  } finally {
    practiceLoading.value = false;
  }
};

// 4. 获取历史学习记录
const fetchRecords = async () => {
  recordsLoading.value = true;
  try {
    const res: any = await getMyStudyRecords();
    records.value = res.results || res;
  } finally {
    recordsLoading.value = false;
  }
};

// 5. 获取积分明细
const fetchPointsLogs = async () => {
  pointsLoading.value = true;
  try {
    const res: any = await getPointsLogs();
    pointsLogs.value = res.results || res;
  } finally {
    pointsLoading.value = false;
  }
};

// 工具函数
const formatTime = (timeStr: string) => {
  if (!timeStr) return "-";
  return new Date(timeStr).toLocaleString("zh-CN", {
    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit"
  });
};

const formatID = (id: string) => {
  if (!id) return "";
  return id.replace(/^(.{4})(.*)(.{4})$/, "$1**********$3"); // 脱敏处理
};

onMounted(() => {
  fetchUserInfo();
  fetchRequiredTasks();
  fetchMyPractices();
  fetchRecords();
  fetchPointsLogs();
});
</script>

<style scoped>
.app-container {
  padding: 25px;
  background-color: #f8f9fa;
  min-height: calc(100vh - 84px);
}

.card-header {
  font-weight: bold;
  color: #333;
  border-left: 4px solid #ce1126;
  padding-left: 12px;
}

.profile-info {
  text-align: center;
  padding: 10px 0;
}

.username {
  margin: 15px 0 8px;
  color: #2c3e50;
  font-size: 22px;
}

.info-list {
  text-align: left;
  margin: 25px 0;
  padding: 0 20px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
  font-size: 14px;
}
.info-item.no-border { border-bottom: none; }
.info-item .label { color: #909399; }
.info-item .value { color: #303133; font-weight: 500; }

.points-display {
  margin: 20px 15px;
  background: linear-gradient(135deg, #ce1126 0%, #e63946 100%);
  padding: 20px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(206, 17, 38, 0.2);
}

.points-title { font-size: 12px; opacity: 0.9; margin-bottom: 5px; }
.points-number { font-size: 36px; font-weight: bold; font-family: 'Din Condensed', sans-serif; }

.tab-content { padding: 10px 0; min-height: 400px; }
.course-title { margin: 0 0 10px; font-size: 16px; color: #333; }
.point-plus { color: #67c23a; font-weight: bold; }

/* 必修任务子Tab优化样式 */
.sub-tabs { margin-top: 15px; box-shadow: none; border-radius: 8px; }

:deep(.el-tabs__item) { font-size: 15px; height: 50px; }
:deep(.el-tabs__item.is-active) { color: #ce1126; font-weight: bold; }
:deep(.el-tabs__active-bar) { background-color: #ce1126; }
</style>