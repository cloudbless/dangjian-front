<template>
  <div class="login-container">
    <div class="login-box">
      <h2>党建云平台</h2>
      <p class="subtitle">智慧党建 · 强国有我</p>

      <el-form :model="loginForm" class="login-form">
        <el-form-item>
          <el-input
            v-model="loginForm.username"
            placeholder="请输入账号"
            size="large"
          >
            <template #prefix>👤</template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            show-password
          >
            <template #prefix>🔒</template>
          </el-input>
        </el-form-item>

        <el-button
          type="danger"
          class="login-btn"
          :loading="loading"
          @click="handleLogin"
          size="large"
        >
          立即登录
        </el-button>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { ElMessage } from "element-plus";

const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const loginForm = reactive({
  username: "",
  password: "",
});

const handleLogin = async () => {
  // 1. 基础校验
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning("请输入账号和密码");
    return;
  }

  loading.value = true;

  try {
    // 2. 核心改进：先彻底清空一次旧缓存（防止登录后身份错乱）
    userStore.logout();

    // 3. 调用登录（确保你的 store.login 内部如果失败会 throw error）
    await userStore.login(loginForm);

    // 4. 走到这一步说明 await 成功了
    ElMessage.success("登录成功");

    // 5. 使用 replace 替代 push，防止用户点击浏览器返回键又回到登录页
    router.replace('/portal/home');
  } catch (error: any) {
    // 🎯 核心修复：捕获具体错误并弹出提示
    console.error("登录失败详情:", error);

    // 尝试从 error 对象中提取后端返回的错误消息
    // 如果是密码错误，后端通常返回 401 或 400
    const errorMsg =
      error.response?.data?.detail ||
      error.response?.data?.non_field_errors?.[0] ||
      "账号或密码错误，请重试";

    ElMessage.error(errorMsg);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  /* 一个喜庆的红色渐变背景，你也可以换成具体的图片 */
  background: linear-gradient(135deg, #ce1126 0%, #8a0c1a 100%);
}

.login-box {
  width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
}

h2 {
  color: #ce1126; /* 党建红 */
  margin-bottom: 10px;
  font-size: 28px;
  font-weight: bold;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
}

.login-btn {
  width: 100%;
  font-weight: bold;
  letter-spacing: 2px;
}
</style>
