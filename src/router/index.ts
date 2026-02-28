// src/router/index.ts
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import Login from "../views/Login.vue";
import Layout from "../layout/index.vue"; // 引入后台布局
import PortalLayout from "../layout/PortalLayout.vue"; // 引入前台布局
import BranchLayout from "../layout/BranchLayout.vue"; // 引入支部布局

const routes: Array<RouteRecordRaw> = [
  // 1. 登录页
  {
    path: "/login",
    name: "Login",
    component: Login,
  },

  // 2. 前台门户 (Portal) - 面向群众，不需要登录也能访问
  {
    path: "/portal",
    component: PortalLayout,
    redirect: "/portal/home",
    children: [
      {
        path: "home",
        name: "PortalHome",
        component: () => import("../views/portal/index.vue"),
        meta: { title: "门户首页" },
      },
      {
        path: "article/:id",
        name: "ArticleDetail",
        component: () => import("../views/portal/ArticleDetail.vue"),
        meta: { title: "文章详情" },
      },
      {
        path: "news",
        name: "PortalNews",
        component: () => import("../views/portal/NewsList.vue"),
        meta: { title: "时政要闻", articleType: 1 }, 
      },
      {
        path: "learning",
        name: "PortalLearning",
        component: () => import("../views/portal/NewsList.vue"),
        meta: { title: "学习园地", articleType: 5 }, 
      },
      {
        path: "showcase",
        name: "PortalShowcase",
        component: () => import("../views/portal/NewsList.vue"),
        meta: { title: "党员风采", articleType: 3 }, 
      },
      {
        path: "practice",
        name: "PortalPractice",
        component: () => import("../views/portal/NewsList.vue"),
        meta: { title: "实践中心", articleType: 6 }, 
      },
    ],
  },

  // 3. 支部端 (Branch) - 将学习中心和管理功能迁入此处
  {
    path: "/branch",
    component: BranchLayout,
    redirect: "/branch/home",
    children: [
      {
        path: "home",
        name: "BranchHome",
        component: () => import("../views/branch/Home.vue"),
        meta: { title: "支部信息" },
      },
      // 👇 修改：替换原有的 BranchLearning，指向我们刚写好的学习大厅
      {
        path: "learning",
        name: "BranchLearning",
        component: () => import("../views/learning/index.vue"), 
        meta: { title: "学习中心" },
      },
      // 👇 新增：将云端党校管理移动到支部端
      {
        path: "courses",
        name: "BranchCourseManage",
        component: () => import("../views/learning/CourseManage.vue"), 
        meta: { title: "学习任务管理" },
      },
      // 👇 新增：将视频播放页移动到支部端
      {
        path: "learning/video/:id",
        name: "BranchVideoPlayer",
        component: () => import("../views/learning/VideoPlayer.vue"),
        meta: { title: "视频学习" },
      },
      // 👇 新增：将在线答题页移动到支部端
      {
        path: "learning/exam/:id",
        name: "BranchExamPlayer",
        component: () => import("../views/learning/Exam.vue"),
        meta: { title: "在线练习" },
      },
      {
        path: "practice",
        name: "BranchPractice",
        component: () => import("../views/branch/Practice.vue"),
        meta: { title: "实践中心" },
      },
      {
        path: "profile",
        name: "BranchProfile",
        component: () => import("../views/branch/Profile.vue"),
        meta: { title: "个人中心" },
      },
      // 👇 在原有的 branch/courses 路由下方，新增学情统计路由
      {
        path: "stats",
        name: "BranchStats",
        component: () => import("../views/learning/BranchStats.vue"),
        meta: { title: "学情监控" },
      },
    ],
  },

  // 4. 后台管理系统 (Admin) - 已移除 learning 相关路由
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../views/dashboard/index.vue"),
        meta: { title: "首页" },
      },
      {
        path: "system/users",
        name: "UserList",
        component: () => import("../views/system/user/index.vue"),
        meta: { title: "党员管理" },
      },
      {
        path: "system/orgs",
        name: "OrgList",
        component: () => import("../views/system/org/index.vue"),
        meta: { title: "组织架构" },
      },
      {
        path: "content/news",
        name: "NewsList",
        component: () => import("../views/content/news/index.vue"),
        meta: { title: "新闻发布" },
      },
      {
        path: "profile",
        name: "Profile",
        component: () => import("../views/profile/index.vue"),
        meta: { title: "个人中心" },
      },
      {
        path: "practice",
        name: "PracticeAdmin",
        component: () => import("../views/practice/index.vue"),
        meta: { title: "活动管理" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");
  if (to.path === "/login" || to.path.startsWith("/portal")) {
    next();
    return;
  }
  if (!token) {
    next("/login");
  } else {
    next();
  }
});

export default router;