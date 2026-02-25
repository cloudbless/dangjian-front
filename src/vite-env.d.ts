/// <reference types="vite/client" />

// 1. 解决 .vue 文件导入报错
// 告诉 TS：所有以 .vue 结尾的文件都是 Vue 组件
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 2. 解决 WangEditor 编辑器报错
// 告诉 TS：这个模块虽然没有官方类型声明，但它是存在的，不要报错
declare module '@wangeditor/editor-for-vue' {
  import { DefineComponent } from 'vue'
  
  // 定义 Editor 和 Toolbar 组件为任意类型的 Vue 组件
  const Editor: DefineComponent<{}, {}, any>
  const Toolbar: DefineComponent<{}, {}, any>
  
  export { Editor, Toolbar }
}