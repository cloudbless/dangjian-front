import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in cardData" :key="item.title">
        <el-card shadow="hover" class="data-card">
          <template #header>
            <div class="card-header">
              <span>{{ item.icon }} {{ item.title }}</span>
            </div>
          </template>
          <div class="card-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>📊 党员组织分布</span>
            </div>
          </template>
          <div
            ref="pieChartRef"
            style="height: 350px"
            v-loading="loading"
          ></div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <div class="chart-header">
              <span>📈 支部活跃度排名 (Top 5)</span>
            </div>
          </template>
          <div
            ref="barChartRef"
            style="height: 350px"
            v-loading="loading"
          ></div>
        </el-card>
      </el-col>
    </el-row>

    <el-card
      v-if="userRole === 'super_admin' || userRole === 'branch_admin'"
      class="welcome-card"
      style="margin-top: 20px"
    >
      <h3>⚡ 快捷操作</h3>

      <el-button
        v-if="userRole === 'super_admin' || userRole === 'branch_admin'"
        type="primary"
        plain
        @click="$router.push('/content/news')"
      >
        发布新闻
      </el-button>

      <el-button type="success" plain @click="$router.push('/system/users')">
        新增党员
      </el-button>

      <el-button
        v-if="userRole === 'super_admin'"
        type="warning"
        plain
        @click="$router.push('/system/orgs')"
      >
        调整架构
      </el-button>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import * as echarts from "echarts";
import { ElMessage } from "element-plus";
import { getDashboardStats } from "../../api/system";

// 🎯 引入 UserStore，用于获取当前登录人的角色
import { useUserStore } from "../../stores/user";

const userStore = useUserStore();
// 动态计算角色，如果未拉取到则默认降级为 member
const userRole = computed(() => userStore.userInfo?.role || "member");

const loading = ref(true);

const cardData = ref([
  { title: "党员总数", value: "加载中...", icon: "📚" },
  { title: "累计学习", value: "加载中...", icon: "🔥" },
  { title: "支部数量", value: "加载中...", icon: "🚩" },
  { title: "全网总积分", value: "加载中...", icon: "⭐" },
]);

const pieChartRef = ref<HTMLElement | null>(null);
const barChartRef = ref<HTMLElement | null>(null);
let pieChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;

const initPieChart = (data: any[]) => {
  if (!pieChartRef.value) return;
  pieChart = echarts.init(pieChartRef.value);

  const option = {
    tooltip: { trigger: "item" },
    legend: { bottom: "0%", left: "center" },
    series: [
      {
        name: "党员人数",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
        label: { show: false, position: "center" },
        emphasis: { label: { show: true, fontSize: 20, fontWeight: "bold" } },
        data: data,
      },
    ],
  };
  pieChart.setOption(option);
};

const fetchDashboardData = async () => {
  try {
    loading.value = true;
    const res: any = await getDashboardStats();

    // 更新顶部卡片数据
    cardData.value = [
      { title: "党员总数", value: `${res.cards.total_users} 人`, icon: "📚" },
      { title: "累计学习", value: `${res.cards.total_studies} 次`, icon: "🔥" },
      { title: "支部数量", value: `${res.cards.total_orgs} 个`, icon: "🚩" },
      { title: "全网总积分", value: `${res.cards.total_points} 分`, icon: "⭐" },
    ];

    // 🚩 关键：先关闭 loading，再在 nextTick 中初始化图表
    loading.value = false; 
    
    await nextTick(); // 等待 loading 遮罩彻底消失，DOM 尺寸稳定
    
    initPieChart(res.pie_data);
    initBarChart(res.bar_data.categories, res.bar_data.values);
  } catch (error) {
    console.error(error);
    loading.value = false;
    ElMessage.error("获取大屏统计数据失败");
  }
};

const initBarChart = (categories: string[], values: number[]) => {
  if (!barChartRef.value) return;

  // 🚩 优化：如果已经存在实例则销毁重建，防止黑屏或残留
  if (barChart) {
    barChart.dispose();
  }
  barChart = echarts.init(barChartRef.value);

  const option = {
    backgroundColor: 'transparent', // 显式设为透明，防止背景变黑
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: "3%", right: "4%", bottom: "10%", containLabel: true },
    xAxis: {
      type: "category",
      data: categories,
      axisTick: { alignWithLabel: true },
      axisLabel: { color: '#666' } // 显式文字颜色
    },
    yAxis: { 
      type: "value",
      axisLabel: { color: '#666' }
    },
    series: [
      {
        name: "总活跃积分",
        type: "bar",
        barWidth: "50%",
        data: values,
        itemStyle: {
          // 🚩 检查颜色定义，确保没有拼写错误
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "#ce1126" },
            { offset: 1, color: "#ff7f7f" },
          ]),
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };
  barChart.setOption(option);
};

const handleResize = () => {
  pieChart?.resize();
  barChart?.resize();
};

onMounted(() => {
  fetchDashboardData();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  pieChart?.dispose();
  barChart?.dispose();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}
.card-header {
  font-weight: bold;
  color: #666;
}
.card-value {
  font-size: 28px;
  font-weight: bold;
  color: #ce1126;
  text-align: center;
  padding: 10px 0;
}
.chart-header {
  font-weight: bold;
}
</style>
