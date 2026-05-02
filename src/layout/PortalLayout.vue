<template>
  <div class="portal-container">
    <div class="portal-header">
      <div class="header-content">
        <div class="logo"><span class="icon">🚩</span> 智慧党建云平台</div>

        <div class="nav-menu">
          <router-link to="/portal/home" class="nav-item">首页</router-link>
          <router-link to="/portal/news" class="nav-item">时政要闻</router-link>
          <router-link to="/portal/learning" class="nav-item">学习园地</router-link>
          <router-link to="/portal/showcase" class="nav-item">党员风采</router-link>
          <router-link to="/portal/practice" class="nav-item">实践中心</router-link>
        </div>

        <div class="auth-btn">
          <el-button
            v-if="!userStore.token"
            type="warning"
            @click="$router.push('/login')"
          >
            登录 / 注册
          </el-button>

          <el-dropdown v-else>
            <span class="user-link">
              <el-avatar
                :size="30"
                :src="
                  userStore.userInfo?.avatar ||
                  'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png'
                "
              />
              <span style="margin-left: 8px">{{
                userStore.userInfo?.username || "个人中心"
              }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/branch/home')">
                  📱 进入服务端
                </el-dropdown-item>

                <el-dropdown-item
                  v-if="
                    userStore.userInfo?.role === 'super_admin' ||
                    userStore.userInfo?.role === 'branch_admin'
                  "
                  @click="$router.push('/')"
                >
                  ⚙️ 进入后台管理
                </el-dropdown-item>

                <el-dropdown-item divided @click="handleLogout"
                  >🚪 退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </div>

    <div class="portal-main">
      <router-view />
    </div>

    <div class="portal-footer">
      <p>© 2026 智慧党建云平台 版权所有 | 技术支持：全栈开发团队</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "../stores/user";

const userStore = useUserStore();

const handleLogout = () => {
  userStore.logout(); //
  window.location.href = "/portal/home";
};
</script>

<style scoped>
.portal-header {
  height: 64px;
  background-color: #ce1126; /* 党建红 */
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 999;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.logo {
  font-size: 28px; /* 24px -> 28px，让左侧 Logo 更大气 */
  font-weight: bold;
  display: flex;
  align-items: center;
}
.logo .icon {
  margin-right: 10px;
  font-size: 32px; /* 28px -> 32px，图标同步放大 */
}

.nav-menu {
  display: flex;
  gap: 60px; /* 可以将间距从 30px 改为 40px，让导航不那么拥挤 */
}
.nav-item {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 18px; /* 16px -> 18px，导航文字变大 */
  font-weight: 500;
  padding: 8px 0;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;
}
.nav-item:hover,
.router-link-active {
  color: #fff;
  border-bottom-color: #ffd04b; /* 金色下划线 */
}

.user-link {
  display: flex;
  align-items: center;
  color: white;
  cursor: pointer;
}

.portal-main {
  min-height: calc(100vh - 64px - 100px);
  background-color: #f5f7fa;
}

.portal-footer {
  height: 100px;
  background-color: #333;
  color: #999;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
