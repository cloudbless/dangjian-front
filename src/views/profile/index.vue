<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="box-card" v-loading="userLoading">
          <template #header>
            <div class="card-header">
              <span>👤 党员名片</span>
            </div>
          </template>

          <div class="profile-info" v-if="userInfo">
            <el-avatar
              :size="100"
              :src="
                userInfo.avatar ||
                'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
              "
            />
            <h2 class="username">{{ userInfo.username }}</h2>

            <div class="info-list">
              <div class="info-item">
                <span>🏅 政治面貌：</span>
                <el-tag type="danger" size="small">中共党员</el-tag>
              </div>
              <div class="info-item">
                <span>🏢 所属组织：</span>
                <span>{{ userInfo.organization_name || "暂无归属" }}</span>
              </div>
              <div class="info-item">
                <span>📱 手机号码：</span>
                <span>{{ userInfo.phone || "未绑定" }}</span>
              </div>
              <div class="info-item">
                <span>🔑 账号角色：</span>
                <el-tag size="small" effect="plain">{{
                  roleMap[userInfo.role] || "普通党员"
                }}</el-tag>
              </div>
            </div>

            <div class="points-display">
              <div class="points-title">累计学习积分</div>
              <div class="points-number">{{ userInfo.total_points || 0 }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="16">
        <el-card class="box-card">
          <el-tabs v-model="activeTab" class="profile-tabs">
            <el-tab-pane label="📚 学习档案" name="learning">
              <div v-loading="recordsLoading" class="tab-content">
                <el-timeline v-if="records && records.length > 0">
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
                        <el-tag
                          v-if="record.is_completed"
                          type="success"
                          size="small"
                          >已学完</el-tag
                        >
                        <el-tag v-else type="warning" size="small"
                          >上次学至 {{ record.progress }} 秒</el-tag
                        >
                      </div>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
                <el-empty
                  v-else
                  description="暂无学习记录，快去云端党校加油吧！"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="🪙 积分记录" name="points">
              <div v-loading="pointsLoading" class="tab-content">
                <el-table
                  :data="pointsLogs"
                  stripe
                  style="width: 100%"
                  max-height="500"
                >
                  <el-table-column label="变动时间" width="180">
                    <template #default="{ row }">
                      {{ formatTime(row.created_at) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    prop="reason"
                    label="变动原因"
                    min-width="180"
                  />
                  <el-table-column label="分值变动" width="100" align="center">
                    <template #default="{ row }">
                      <span class="point-change-plus"
                        >+{{ row.change_amount }}</span
                      >
                    </template>
                  </el-table-column>
                </el-table>
                <el-empty
                  v-if="pointsLogs.length === 0"
                  description="暂无积分明细"
                />
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
import { getCurrentUserInfo, getPointsLogs } from "../../api/system"; // 确保 api 文件里有这个接口
import { getMyStudyRecords } from "../../api/learning";
import { ElMessage } from "element-plus";

// 数据定义
const activeTab = ref("learning");
const userLoading = ref(true);
const recordsLoading = ref(true);
const pointsLoading = ref(true);

const userInfo = ref<any>(null);
const records = ref<any[]>([]);
const pointsLogs = ref<any[]>([]);

const roleMap: any = {
  super_admin: "超级管理员",
  branch_admin: "支部管理员",
  user: "普通党员",
};

// 🎯 核心逻辑：精准获取“我的”个人信息
const fetchUserInfo = async () => {
  userLoading.value = true;
  try {
    // 💡 这里不再用 getUserList，而是用 me 接口，防止身份错乱
    const res: any = await getCurrentUserInfo();
    userInfo.value = res;
  } catch (error) {
    ElMessage.error("无法加载个人信息");
  } finally {
    userLoading.value = false;
  }
};

// 获取学习档案
const fetchRecords = async () => {
  recordsLoading.value = true;
  try {
    const res: any = await getMyStudyRecords();
    // 兼容带分页和不带分页的返回
    records.value = res.results || res;
  } finally {
    recordsLoading.value = false;
  }
};

// 获取积分明细
const fetchPointsLogs = async () => {
  pointsLoading.value = true;
  try {
    const res: any = await getPointsLogs();
    pointsLogs.value = res.results || res;
  } finally {
    pointsLoading.value = false;
  }
};

// 时间格式化小工具
const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const date = new Date(timeStr);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

onMounted(() => {
  fetchUserInfo();
  fetchRecords();
  fetchPointsLogs();
});
</script>

<style scoped>
.app-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);
}
.card-header {
  font-weight: bold;
  border-left: 4px solid #ce1126;
  padding-left: 12px;
  font-size: 16px;
}
.profile-info {
  text-align: center;
  padding: 20px 0;
}
.username {
  margin: 15px 0 5px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}
.info-list {
  text-align: left;
  margin: 30px 0;
  padding: 0 30px;
}
.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  font-size: 14px;
  color: #606266;
  border-bottom: 1px dashed #ebeef5;
  padding-bottom: 10px;
}

.points-display {
  margin: 20px 30px;
  background: linear-gradient(135deg, #fff5f5 0%, #ffecec 100%);
  padding: 25px;
  border-radius: 15px;
  border: 1px solid #ffccd0;
  box-shadow: 0 6px 16px rgba(206, 17, 38, 0.08);
}
.points-title {
  font-size: 13px;
  color: #ce1126;
  margin-bottom: 8px;
  font-weight: bold;
  letter-spacing: 1px;
}
.points-number {
  font-size: 48px;
  color: #ce1126;
  font-weight: 900;
  line-height: 1;
  font-family: "Helvetica Neue", Arial, sans-serif;
}

.profile-tabs {
  margin-top: -10px;
}
.tab-content {
  min-height: 300px;
  padding: 15px 10px;
}
.course-title {
  margin: 0 0 12px 0;
  color: #333;
  font-size: 15px;
}
.point-change-plus {
  color: #67c23a;
  font-weight: bold;
  font-size: 15px;
}

:deep(.el-tabs__item.is-active) {
  color: #ce1126;
  font-weight: bold;
}
:deep(.el-tabs__active-bar) {
  background-color: #ce1126;
}
:deep(.el-timeline-item__timestamp) {
  font-weight: bold;
  color: #909399;
}
</style>
