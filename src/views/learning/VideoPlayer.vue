<template>
  <div class="app-container">
    <el-page-header
      @back="$router.back()"
      :content="course.title"
      style="margin-bottom: 20px"
    />

    <el-row :gutter="20">
      <el-col :span="18">
        <el-card v-loading="loading">
          
          <div class="video-wrapper" v-if="course.course_type === 1 || !course.course_type">
            <video
              v-if="course.video_url"
              :src="course.video_url"
              ref="videoPlayer"
              class="custom-video"
              controls
              controlslist="nodownload"
              @timeupdate="onTimeUpdate"
              @ended="onVideoEnded"
              @play="onPlay"
              @pause="onPause"
            >
              您的浏览器不支持视频播放。
            </video>
            <div v-else style="padding: 100px; text-align: center; color: #fff">
              正在努力加载视频资源...
            </div>

            <div class="cheat-warning" v-show="showWarning">
              <div class="warning-box">
                <span class="icon">⚠️</span>
                <h3>学习已暂停</h3>
                <p>系统检测到您切换了页面，请保持页面专注以继续学习。</p>
                <el-button type="primary" @click="resumePlay">继续学习</el-button>
              </div>
            </div>
          </div>

          <div class="exercise-wrapper" v-else-if="course.course_type === 2">
            <div class="exercise-content">
              {{ course.content }}
            </div>
            
            <div class="exercise-actions">
              <el-button 
                type="success" 
                size="large" 
                @click="onExerciseFinished" 
                :disabled="isCompleted"
              >
                {{ isCompleted ? '✅ 已完成学习' : '📝 我已完成练习 / 阅读' }}
              </el-button>
            </div>
          </div>

        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card>
          <template #header><div>📊 学习进度</div></template>
          <div class="progress-info">
            <p v-if="course.course_type === 1 || !course.course_type">
              已看时长：<strong style="color: #ce1126">{{ Math.floor(currentTime) }}</strong> 秒
            </p>
            <p>
              状态：
              <el-tag v-if="isCompleted" type="success">已完成</el-tag>
              <el-tag v-else type="warning">学习中</el-tag>
            </p>
            <p>
              预计奖励：<strong>{{ course.points_reward }}</strong> 积分
            </p>
          </div>
        </el-card>

        <el-card style="margin-top: 20px" v-if="isCompleted">
          <template #header><div>✍️ 思想汇报</div></template>
          <p style="font-size: 13px; color: #666; line-height: 1.6;">
            您已完成该任务的学习！<br/>
            请返回 <strong>"学习中心 -> 学习档案"</strong> 列表中，点击 <strong>"提交汇报"</strong> 填写您的心得体会。
          </p>
          <el-button type="primary" plain style="margin-top: 10px; width: 100%" @click="$router.push('/branch/learning')">
            返回学习中心
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import { getCourseDetail, updateStudyProgress } from "../../api/learning";
import { ElMessage } from "element-plus";

const route = useRoute();
const loading = ref(true);
const videoPlayer = ref<HTMLVideoElement | null>(null);

// 课程与状态数据
const course = ref<any>({});
const currentTime = ref(0);
const isCompleted = ref(false);
const showWarning = ref(false);

// 心跳定时器
let heartbeatTimer: any = null;

// 1. 获取课程详情
const fetchDetail = async () => {
  const id = Number(route.params.id);
  try {
    const res = await getCourseDetail(id);
    course.value = res;
  } finally {
    loading.value = false;
  }
};

// 2. 视频播放进度更新
const onTimeUpdate = () => {
  if (videoPlayer.value) {
    currentTime.value = videoPlayer.value.currentTime;
  }
};

// 3. 防挂机：监听网页可见性 (仅针对视频)
const handleVisibilityChange = () => {
  if (course.value.course_type === 2) return; // 练习题不需要防挂机

  if (document.hidden && videoPlayer.value && !videoPlayer.value.paused) {
    videoPlayer.value.pause(); // 强制暂停
    showWarning.value = true; // 显示警告
  }
};

const resumePlay = () => {
  showWarning.value = false;
  if (videoPlayer.value) {
    videoPlayer.value.play();
  }
};

// 4. 与后端同步进度
const sendHeartbeat = async (finished = false) => {
  if (!course.value.id) return;
  try {
    const res: any = await updateStudyProgress({
      course_id: course.value.id,
      current_time: Math.floor(currentTime.value),
      is_finished: finished,
    });
    if (res.message && res.message.includes("获得")) {
      ElMessage.success(res.message);
      isCompleted.value = true;
    }
  } catch (error) {
    console.error("进度同步失败");
  }
};

// 视频开始播放时
const onPlay = () => {
  if (!heartbeatTimer) {
    heartbeatTimer = setInterval(() => sendHeartbeat(false), 10000);
  }
};

// 视频暂停时
const onPause = () => {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
  sendHeartbeat(false);
};

// 视频播完
const onVideoEnded = () => {
  isCompleted.value = true;
  sendHeartbeat(true);
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
};

// 👇 新增：练习题/图文专用完成逻辑
const onExerciseFinished = async () => {
  currentTime.value = 100; // 象征性给个进度
  isCompleted.value = true;
  await sendHeartbeat(true); // 直接发送完毕信号
};

onMounted(async () => {
  await fetchDetail();
  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onBeforeUnmount(() => {
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  if (heartbeatTimer) clearInterval(heartbeatTimer);
});
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.video-wrapper {
  position: relative;
  width: 100%;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
}
.custom-video {
  width: 100%;
  max-height: 600px;
  display: block;
}
.cheat-warning {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex; justify-content: center; align-items: center; z-index: 10;
}
.warning-box {
  background: white; padding: 40px; border-radius: 8px; text-align: center;
}
.warning-box .icon { font-size: 40px; }
.warning-box h3 { color: #ce1126; margin: 15px 0; }

.progress-info p { margin: 15px 0; font-size: 15px; }

/* 图文/练习题样式 */
.exercise-wrapper {
  padding: 20px;
  min-height: 400px;
}
.exercise-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap; /* 保持文本中的换行和空格 */
  margin-bottom: 40px;
}
.exercise-actions {
  text-align: center;
  border-top: 1px dashed #eee;
  padding-top: 30px;
}
</style>