<template>
  <div class="branch-container">
    <div class="branch-header">
      <div class="header-inner">
        <div class="brand">
          <span class="logo-icon">🚩</span>
          <span class="org-name">{{ orgName }}</span>

          <el-tag
            v-if="isViewing"
            type="warning"
            effect="dark"
            size="small"
            style="margin: 0 10px"
          >
            👀 超管视察中
          </el-tag>

          <span class="sys-name">党员学习端</span>
        </div>

        <div class="nav-menu">
          <router-link to="/branch/home" class="nav-item">支部信息</router-link>
          <router-link to="/branch/learning" class="nav-item"
            >学习大厅</router-link
          >
          <router-link
            v-if="isAdmin"
            to="/branch/courses"
            class="nav-item admin-nav"
            >任务管理</router-link
          >
          <router-link
            v-if="isAdmin"
            to="/branch/stats"
            class="nav-item admin-nav"
            >学情监控</router-link
          >
          <router-link to="/branch/practice" class="nav-item"
            >实践中心</router-link
          >
          <router-link to="/branch/profile" class="nav-item"
            >个人中心</router-link
          >
        </div>

        <div class="user-area" style="display: flex; align-items: center">
          <el-button
            v-if="isViewing"
            type="danger"
            plain
            size="small"
            @click="exitViewing"
            style="margin-right: 20px"
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
                <el-dropdown-item @click="$router.push('/portal/home')"
                  >返回公共门户</el-dropdown-item
                >
                <el-dropdown-item
                  v-if="userStore.userInfo?.role === 'super_admin'"
                  @click="$router.push('/dashboard')"
                  >进入管理后台</el-dropdown-item
                >
                <el-dropdown-item divided @click="handleLogout"
                  >退出登录</el-dropdown-item
                >
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
const defaultAvatar =
  "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";

const isAdmin = computed(() => {
  const role = userStore.userInfo?.role;
  return role === "branch_admin" || role === "super_admin";
});

// ==========================================
// 🚀 视察模式核心逻辑
// ==========================================
const viewingOrgName = ref(localStorage.getItem("viewingOrgName"));

// 判断是否处于超管视察模式
const isViewing = computed(() => {
  return (
    viewingOrgName.value !== null && userStore.userInfo?.role === "super_admin"
  );
});

// 动态展示当前支部名称 (视察时优先展示正在视察的支部)
const orgName = computed(() => {
  if (isViewing.value) return viewingOrgName.value;
  return userStore.userInfo?.organization_name || "未分配支部";
});

// 退出视察模式
const exitViewing = () => {
  localStorage.removeItem("viewingOrgId");
  localStorage.removeItem("viewingOrgName");
  viewingOrgName.value = null;
  ElMessage.success("已退出支部视察模式");
  router.push("/system/orgs"); // 退回后台的组织架构页
};
// ==========================================

const handleLogout = () => {
  // 退出登录时记得清空视察状态
  localStorage.removeItem("viewingOrgId");
  localStorage.removeItem("viewingOrgName");
  userStore.logout();
  router.push("/login");
};
</script>

<style scoped>
/* 原有样式保持不变 */
.branch-container {
  min-height: 100vh;
  background-color: #f4f6f8;
}
.branch-header {
  height: 60px;
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
.brand {
  display: flex;
  align-items: center;
}
.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}
.org-name {
  font-size: 18px;
  font-weight: bold;
  color: #ce1126;
}
.sys-name {
  font-size: 14px;
  color: #666;
  border-left: 1px solid #ccc;
  padding-left: 10px;
  margin-left: 10px;
}
.nav-menu {
  display: flex;
  gap: 10px;
}
.nav-item {
  text-decoration: none;
  color: #666;
  font-size: 16px;
  padding: 0 20px;
  height: 60px;
  line-height: 60px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
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
.admin-nav:hover,
.admin-nav.router-link-active {
  color: #e6a23c;
  border-bottom-color: #e6a23c;
  background-color: #fdf6ec;
}
.user-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  outline: none;
}
.username {
  margin-left: 10px;
  color: #333;
  font-weight: 500;
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
