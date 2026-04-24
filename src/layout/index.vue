<template>
  <el-container class="layout-container">
    <el-aside width="220px" class="aside-menu">
      <div class="logo"><span class="icon">🚩</span> 党建云平台</div>
      <el-menu
        active-text-color="#ce1126"
        background-color="#304156"
        text-color="#bfcbd9"
        :default-active="activeMenu"
        router
      >
        <el-menu-item index="/">
          <span>📊 首页概览</span>
        </el-menu-item>

        <el-sub-menu
          index="/system"
          v-if="userRole === 'super_admin' || userRole === 'branch_admin'"
        >
          <template #title>
            <span>🏢 组织管理</span>
          </template>
          <el-menu-item index="/system/users">党员管理</el-menu-item>
          <el-menu-item index="/system/orgs" v-if="userRole === 'super_admin'"
            >组织架构</el-menu-item
          >
        </el-sub-menu>

        <el-sub-menu index="/content" v-if="userRole === 'super_admin' || userRole === 'branch_admin'">
          <template #title>
            <span>📰 内容中心</span>
          </template>
          <el-menu-item index="/content/news">新闻发布</el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/practice" v-if="userRole === 'super_admin' || userRole === 'branch_admin'">
          <el-icon><Flag /></el-icon>
          <template #title>实践活动管理</template>
        </el-menu-item>

      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="breadcrumb">后台管理系统</div>

        <div class="right-menu">
          <el-tooltip effect="dark" content="前往前台门户" placement="bottom">
            <el-button
              type="primary"
              link
              style="margin-right: 20px; font-size: 16px"
              @click="$router.push('/portal/home')"
            >
              <el-icon><Monitor /></el-icon> 前台门户
            </el-button>
          </el-tooltip>

          <el-dropdown>
            <span class="el-dropdown-link">
              {{ userStore.userInfo?.username || "正在加载..." }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile')"
                  >👤 个人中心</el-dropdown-item
                >
                <el-dropdown-item divided @click="handleLogout"
                  >🚪 退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { Flag, VideoCamera, ArrowDown } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

// 当前激活菜单
const activeMenu = computed(() => route.path);

// 动态角色获取
const userRole = computed(() => userStore.userInfo?.role || "user");

// 退出登录
const handleLogout = () => {
  userStore.logout();
  router.push("/login");
};

// 🎯 新增：生命周期钩子
onMounted(async () => {
  // 如果本地有 Token 但没有用户信息（比如按了 F5），则去后端补抓一次身份
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.getUserInfo();
    } catch (error) {
      console.error("自动拉取身份失败", error);
      router.push("/login");
    }
  }
});
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.aside-menu {
  background-color: #304156;
  color: white;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  font-size: 22px; /* 20px -> 22px */
  font-weight: bold;
  background-color: #ce1126;
  color: white;
}
/* 覆盖 Element Plus 侧边栏菜单字号 */
:deep(.el-menu-item), :deep(.el-sub-menu__title) {
  font-size: 16px;
}
.header {
  background-color: white;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}
/* 新增面包屑字体大小 */
.breadcrumb {
  font-size: 18px; 
  font-weight: bold;
  color: #333;
}
.el-main {
  background-color: #f0f2f5;
  padding: 20px;
}
.el-dropdown-link {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-weight: 500;
  color: #333;
  font-size: 16px; /* 用户名变大 */
}
</style>