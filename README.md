## 简介

[seacoral-portal-vue](https://github.com/spdb-opensource/seacoral-portal-vue) 是开源数据库资源池的前端解决方案，本项目基于 [vue-element-admin](https://panjiachen.github.io/vue-element-admin) 进行了二次开发

- [在线预览](https://panjiachen.github.io/vue-element-admin)

** 若发现问题，欢迎提[issue](https://github.com/spdb-opensource/seacoral-portal-vue/issues/new)。

## 前序准备

您需要在本地安装 [node](http://nodejs.org/)。本项目技术栈基于 [ES2015+](http://es6.ruanyifeng.com/)、[vue](https://cn.vuejs.org/index.html)、[vuex](https://vuex.vuejs.org/zh-cn/)、[vue-router](https://router.vuejs.org/zh-cn/) 、[vue-cli](https://github.com/vuejs/vue-cli) 、[axios](https://github.com/axios/axios) 和 [element-ui](https://github.com/ElemeFE/element)，提前了解和学习这些知识会对二次开发本项目有很大的帮助。

**如有问题或不能满足需求，欢迎 issue 和 pr**

## 功能

本项目主要是开源数据库资源池的配套前端页面，包括了下列功能
```
- 登录 / 注销

- 资源管理
  - 站点管理
  - 网段管理
  - 主机管理
  - 镜像管理
  - ...等

- 申请管理
  - MySQL资源池资源申请
  - 申请审批

- 服务管理
  - MySQL管理

- 系统维护
  - 操作记录
  - 用户管理
  - 角色管理
  - ...等
```

## 开发

```bash
# 克隆项目
git clone https://github.com/spdb-opensource/seacoral-portal-vue

# 进入项目目录
cd seacoral-portal-vue

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务
npm run dev
```

浏览器访问 http://localhost:9527

## 发布

```bash
# 构建测试环境
npm run build:stage

# 构建生产环境
npm run build:prod
```

## 其它

```bash
# 预览发布环境效果
npm run preview

# 预览发布环境效果 + 静态资源分析
npm run preview -- --report

# 代码格式检查
npm run lint

# 代码格式检查并自动修复
npm run lint -- --fix
```


## Changelog

Detailed changes for each release are documented in the [release notes](https://github.com/spdb-opensource/seacoral-portal-vue/releases).

## Browsers support

Modern browsers and Internet Explorer 10+.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt="IE / Edge" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>IE / Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](https://godban.github.io/browsers-support-badges/)</br>Safari |
| --------- | --------- | --------- | --------- |
| IE10, IE11, Edge| last 2 versions| last 2 versions| last 2 versions

## License

[Apache License 2.0](./LICENSE)

Copyright (c) 2020-present Shanghai Pudong Development Bank
