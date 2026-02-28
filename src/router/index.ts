// src/router/index.ts
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import Login from "../views/Login.vue";
import Layout from "../layout/index.vue"; // 引入后台布局
import PortalLayout from "../layout/PortalLayout.vue"; // 引入前台布局
import BranchLayout from "../layout/BranchLayout.vue";
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
      // 👇 下面的四个栏目，统一指向一个通用的图文列表组件，通过 props 或 meta 区分类型
      {
        path: "news",
        name: "PortalNews",
        component: () => import("../views/portal/NewsList.vue"),
        meta: { title: "时政要闻", articleType: 1 }, // 类型1
      },
      {
        path: "learning",
        name: "PortalLearning",
        component: () => import("../views/portal/NewsList.vue"),
        meta: { title: "学习园地", articleType: 5 }, // 类型5
      },
      {
        path: "showcase",
        name: "PortalShowcase",
        component: () => import("../views/portal/NewsList.vue"),
        meta: { title: "党员风采", articleType: 3 }, // 类型3
      },
      {
        path: "practice",
        name: "PortalPractice",
        component: () => import("../views/portal/NewsList.vue"),
        meta: { title: "实践中心", articleType: 6 }, // 类型6
      },
    ],
  },
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
      {
        path: "learning",
        name: "BranchLearning",
        component: () => import("../views/branch/Learning.vue"),
        meta: { title: "学习中心" },
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
    ],
  },
  // 3. 后台管理系统与学习端 (Admin & Learning) - 需要登录
  {
    path: "/",
    component: Layout, // 使用后台布局组件作为父级
    redirect: "/dashboard",
    children: [
      // === 仪表盘 ===
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("../views/dashboard/index.vue"),
        meta: { title: "首页" },
      },
      // === 组织人事管理 ===
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
      // === 内容管理 ===
      {
        path: "content/news",
        name: "NewsList",
        component: () => import("../views/content/news/index.vue"),
        meta: { title: "新闻发布" },
      },
      // === 云端党校 (学习中心) ===
      {
        path: "learning",
        name: "Learning",
        component: () => import("../views/learning/index.vue"),
        meta: { title: "学习中心" },
      },
      {
        path: "learning/video/:id",
        name: "VideoPlayer",
        component: () => import("../views/learning/VideoPlayer.vue"),
        meta: { title: "视频学习" },
      },
      // === 个人中心 ===
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
      // 👇 新增：云端党校管理
      {
        path: "courses",
        name: "CourseManage",
        component: () => import("../views/learning/CourseManage.vue"), // 注意这里的路径要和你实际存放的相对路径一致
        meta: { title: "云端党校管理", icon: "VideoCamera" },
      },
    ],
  },
  // 在 src/router/index.ts 的外层加上：
  {
    path: "/learning/video/:id",
    name: "VideoPlayer",
    component: () => import("../views/learning/VideoPlayer.vue"),
    meta: { title: "视频学习" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// === 全局路由守卫 ===
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem("token");

  // 1. 去登录页，直接放行
  if (to.path === "/login") {
    next();
    return;
  }

  // 2. 去前台门户 (/portal 开头)，直接放行
  if (to.path.startsWith("/portal")) {
    next();
    return;
  }

  // 3. 去后台或学习端，必须有 Token，否则拦截回登录页
  if (!token) {
    next("/login");
  } else {
    next();
  }
});

export default router;
