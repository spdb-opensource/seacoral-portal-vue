import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// import componentsRouter from './modules/components'
// import chartsRouter from './modules/charts'
// import tableRouter from './modules/table'
// import nestedRouter from './modules/nested'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },

  {
    path: '/shell',
    name: 'Shell',
    component: () => import('@/views/serviceManagement/shell'),
    hidden: false
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/index'),
        name: 'Dashboard',
        meta: { title: '首页', icon: 'dashboard', affix: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/resourceManagement',
    component: Layout,
    redirect: '/resourceManagement/page',
    alwaysShow: true, // will always show the root menu
    name: 'ResourceManagement',
    meta: {
      title: '资源管理',
      icon: 'list',
      roles: ['admin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'siteManagement',
        component: () => import('@/views/resourceManagement/siteManagement'),
        name: 'SiteManagement',
        meta: {
          title: '站点管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'backupStore',
        component: () => import('@/views/resourceManagement/backupStore'),
        name: 'ClusterManagement',
        meta: {
          title: '备份存储',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'clusterManagement',
        component: () => import('@/views/resourceManagement/clusterManagement'),
        name: 'ClusterManagement',
        meta: {
          title: '集群管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'networkingManagement',
        component: () => import('@/views/resourceManagement/networking/'),
        name: 'NetworkingManagement',
        meta: {
          title: '网段管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'storageManagement',
        component: () => import('@/views/resourceManagement/storageManagement'),
        name: 'StorageManagement',
        meta: {
          title: '存储管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'hostManagement',
        component: () => import('@/views/resourceManagement/hostManagement'),
        name: 'HostManagement',
        meta: {
          title: '主机管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: '/monitor',
        component: () => import('@/views/resourceManagement/monitor'),
        hidden: true
      },
      {
        path: 'imageManagement',
        component: () => import('@/views/resourceManagement/imageManagement'),
        name: 'ImageManagement',
        meta: {
          title: '镜像管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },

  {
    path: '/applicationManagement',
    component: Layout,
    redirect: '/applicationManagement/page',
    alwaysShow: true, // will always show the root menu
    name: 'ApplicationManagement',
    meta: {
      title: '申请管理',
      icon: 'guide'
    },
    children: [
      {
        path: 'applyForMysql',
        component: () => import('@/views/applicationManagement/applyForMysql'),
        name: 'ApplyForMysql',
        meta: {
          title: 'MySQL',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'applyForApproval',
        component: () => import('@/views/applicationManagement/index'),
        name: 'ApplyForApproval',
        meta: {
          title: '申请单审批',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: '/editOrder',
        component: () => import('@/views/applicationManagement/edit'),
        hidden: true
      },
      {
        path: '/executeOrder',
        component: () => import('@/views/applicationManagement/execute'),
        hidden: true
      },
      {
        path: '/approveOrder',
        component: () => import('@/views/applicationManagement/approve'),
        hidden: true
      }
    ]
  },
  {
    path: '/serviceManagement',
    component: Layout,
    redirect: '/serviceManagement/page',
    alwaysShow: true, // will always show the root menu
    name: 'ServiceManagement',
    meta: {
      title: '服务管理',
      icon: 'skill',
      roles: ['admin'] // or you can only set roles in sub nav
    },
    children: [
      {
        path: 'MySQLManagement',
        component: () => import('@/views/serviceManagement/index'),
        name: 'MySQLManagement',
        meta: {
          title: 'MySQL管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },
  {
    path: '/systemMaintenance',
    component: Layout,
    redirect: '/systemMaintenance/page',
    alwaysShow: true, // will always show the root menu
    name: 'SystemMaintenance',
    meta: {
      title: '系统维护',
      icon: 'tree',
      roles: ['admin'] // you can set roles in root nav
    },
    children: [
      {
        path: 'operateLogs',
        component: () => import('@/views/systemMaintenance/operateLogs'),
        name: 'operateLogs',
        meta: {
          title: '操作记录',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'scales',
        component: () => import('@/views/systemMaintenance/scales/'),
        name: 'scales',
        meta: {
          title: '规模管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'roles',
        component: () => import('@/views/systemMaintenance/roles/'),
        name: 'roles',
        meta: {
          title: '角色管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'dictionaryManagement',
        component: () => import('@/views/systemMaintenance/dictionaryManagement'),
        name: 'DictionaryManagement',
        meta: {
          title: '字典管理',
          roles: ['admin']
        }
      },
      {
        path: 'groupManagement',
        component: () => import('@/views/systemMaintenance/groupManagement'),
        name: 'GroupManagement',
        meta: {
          title: '组别管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'uesrs',
        component: () => import('@/views/systemMaintenance/users/'),
        name: 'users',
        meta: {
          title: '用户管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'systemNamingManagement',
        component: () => import('@/views/systemMaintenance/systemNamingManagement'),
        name: 'SystemNamingManagement',
        meta: {
          title: '系统名称管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'subsystemNamingManagement',
        component: () => import('@/views/systemMaintenance/subsystemNamingManagement'),
        name: 'SubsystemNamingManagement',
        meta: {
          title: '子系统名称管理',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
