import { asyncRoutes, constantRoutes } from '@/router'
import { state as user_state } from './user'
import { getAppsConfig } from '@/api/selections'
import { getAppsConfigById } from '@/api/role'
/**
 * Use meta.role to determine if the current user has permission
 * @param roles
 * @param route
 */
function hasPermission(roles, route) {
  if (route.meta && route.meta.roles) {
    return roles.some(role => route.meta.roles.includes(role))
  } else {
    return true
  }
}

function get_app_from_role(appList, appCurrentList) {
  const res = []
  appList.forEach(element => {
    const tmp = { ...element }
    if (appCurrentList.includes(element.id)) {
      if (tmp.subApps) {
        tmp.subApps = get_app_from_role(tmp.subApps, appCurrentList)
      }
      res.push(tmp)
    }
  })
  return res
}

function compare_menu(menuList, routes) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    for (let index = 0; index < menuList.length; index++) {
      if (tmp.meta) {
        if (tmp.meta.title === menuList[index].name) {
          if (tmp.children && menuList[index].subApps) {
            tmp.children = compare_menu(menuList[index].subApps, tmp.children)
          }
          if (menuList[index].subApps && !route.children) {
            const roles = []
            const subApps = []
            menuList[index].subApps.forEach(element => {
              roles.push(element.name)
              if (element.subApps.length > 0) {
                const name = element.name
                const obj = {}
                obj[name] = findSubApps(element.name, element.subApps)
                subApps.push(obj)
              }
            })
            tmp.meta.roles = roles
            tmp.meta.subApps = subApps
          }
          res.push(tmp)
        }
      } else { // 如果meta不存在，直接push(例如404页面)
        res.push(tmp)
        break
      }
    }
  })
  return res
}

function findSubApps(name, subApps) {
  let key = name
  const res = []
  subApps.forEach(subApp => {
    const tmp = { ...subApp }
    key = tmp.name
    if (tmp.subApps.length > 0) {
      tmp.subApps = findSubApps(tmp.name, tmp.subApps)
      const obj = {}
      obj[key] = tmp.subApps
      res.push(obj)
    } else {
      res.push(tmp.name)
    }
  })
  return res
}

function filterRoutes(routes, roles) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(roles, tmp)) {
      if (tmp.children) {
        tmp.children = filterRoutes(tmp.children, roles)
      }
      res.push(tmp)
    }
  })
  return res
}

/**
 * Filter asynchronous routing tables by recursion
 * @param routes asyncRoutes
 * @param roles
 */
export async function filterAsyncRoutes(routes, roles) {
  let res = []
  const role_id = user_state.role_id
  if (!user_state.role_id) {
    res = filterRoutes(routes, roles)
  } else {
    const appsConfig = await getAppsConfig()
    const appsConfigCurrentId = await getAppsConfigById(role_id)
    const appList = appsConfig.data
    const appCurrentList = []
    appsConfigCurrentId.data.apps.forEach(element => {
      appCurrentList.push(element.id)
    })
    var app = get_app_from_role(appList, appCurrentList)
    var menu = compare_menu(app, routes)
    res = menu
  }
  return res
}

const state = {
  routes: [],
  addRoutes: []
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  }
}

const actions = {
  async generateRoutes({ commit }, roles) {
    let accessedRoutes
    if (roles.includes('admin') || roles.includes('超级管理员')) {
      accessedRoutes = asyncRoutes || []
    } else {
      accessedRoutes = await filterAsyncRoutes(asyncRoutes, roles)
    }
    commit('SET_ROUTES', accessedRoutes)
    return accessedRoutes
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
