<template>
  <div class="branch-container">
    <div class="branch-header">
      <div class="header-inner">
        <div class="brand">
          <span class="logo-icon">🚩</span>
          <span class="org-name" :title="orgName">{{ orgName }}</span>

          <el-tag
            v-if="isViewing"
            type="warning"
            effect="dark"
            size="small"
            class="viewing-tag"
          >
            👀 <span class="tag-text">超管视察中</span>
          </el-tag>

          <span class="sys-name">党员学习端</span>
        </div>

        <div class="nav-menu">
          <router-link to="/branch/home" class="nav-item">支部信息</router-link>
          <router-link to="/branch/learning" class="nav-item">学习大厅</router-link>
          <router-link to="/branch/practice" class="nav-item">实践中心</router-link>
          <router-link to="/branch/profile" class="nav-item">个人中心</router-link>
          <router-link v-if="isAdmin" to="/branch/courses" class="nav-item admin-nav">任务管理</router-link>
          <router-link v-if="isAdmin" to="/branch/stats" class="nav-item admin-nav">学情监控</router-link>
        </div>

        <div class="user-area">
          <el-button
            v-if="isViewing"
            type="danger"
            plain
            size="small"
            @click="exitViewing"
            class="exit-btn"
          >
            退出视察
          </el-button>

          <el-dropdown>
            <span class="user-dropdown-link">
              <el-avatar
                :size="32"
                :src="userStore.userInfo?.avatar || defaultAvatar"
              />
              <span class="username">{{ userStore.userInfo?.username }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/portal/home')">返回公共门户</el-dropdown-item>
                <el-dropdown-item
                  v-if="userStore.userInfo?.role === 'super_admin'"
                  @click="$router.push('/dashboard')"
                >进入管理后台</el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="branch-main">
      <router-view v-slot="{ Component }">
        <transition name="fade-transform" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

const userStore = useUserStore();
const router = useRouter();
const defaultAvatar = "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";

const isAdmin = computed(() => {
  const role = userStore.userInfo?.role;
  return role === "branch_admin" || role === "super_admin";
});

const viewingOrgName = ref(localStorage.getItem("viewingOrgName"));

const isViewing = computed(() => {
  return viewingOrgName.value !== null && userStore.userInfo?.role === "super_admin";
});

const orgName = computed(() => {
  if (isViewing.value) return viewingOrgName.value;
  return userStore.userInfo?.organization_name || "未分配支部";
});

const exitViewing = () => {
  localStorage.removeItem("viewingOrgId");
  localStorage.removeItem("viewingOrgName");
  viewingOrgName.value = null;
  ElMessage.success("已退出支部视察模式");
  router.push("/system/orgs");
};

const handleLogout = () => {
  localStorage.removeItem("viewingOrgId");
  localStorage.removeItem("viewingOrgName");
  userStore.logout();
  router.push("/login");
};
</script>

<style scoped>
.branch-container {
  min-height: 100vh;
  background-color: #f4f6f8;
}

.branch-header {
  height: 64px;
  background-color: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

/* 品牌区域：核心解决宽度挤压问题 */
.brand {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  max-width: 35%; /* 限制左侧最大占比 */
  min-width: 0; 
}

.org-name {
  font-size: 20px; /* 稍微下调，平衡空间 */
  font-weight: bold;
  color: #ce1126;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 文字过长显示省略号 */
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
  flex-shrink: 0;
}

.viewing-tag {
  margin: 0 10px;
  flex-shrink: 0;
}

.sys-name {
  font-size: 14px;
  color: #999;
  border-left: 1px solid #eee;
  padding-left: 12px;
  margin-left: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 导航菜单：自动占据剩余空间 */
.nav-menu {
  display: flex;
  flex: 1; 
  justify-content: flex-end; /* 导航项靠右排列，给左侧支部名留空间 */
  margin: 0 15px;
  min-width: 0;
  overflow: hidden;
}

.nav-item {
  text-decoration: none;
  color: #666;
  font-size: 16px; /* 18px 改为 16px 更标准 */
  padding: 0 12px; /* 减小 padding */
  height: 64px;
  line-height: 64px;
  font-weight: 500;
  white-space: nowrap;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  flex-shrink: 0;
}

.nav-item:hover {
  color: #ce1126;
  background-color: #fff9f9;
}

.router-link-active {
  color: #ce1126;
  border-bottom-color: #ce1126;
  background-color: #fff9f9;
}

.admin-nav {
  color: #e6a23c;
}

/* 用户区域 */
.user-area {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.exit-btn {
  margin-right: 15px;
}

.user-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;
}

.username {
  margin-left: 8px;
  color: #333;
  font-weight: 500;
  font-size: 14px;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 响应式断点优化 */
@media screen and (max-width: 1100px) {
  .sys-name { display: none; } /* 隐藏副标题 */
  .tag-text { display: none; } /* Tag 只保留图标 */
  .nav-item { padding: 0 8px; font-size: 15px; }
}

.branch-main {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.fade-transform-leave-active,
.fade-transform-enter-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(-20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>