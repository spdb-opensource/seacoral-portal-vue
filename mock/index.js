import Mock from 'mockjs'
import { param2Obj } from '../src/utils'

import user from './user'
import role from './role'
import article from './article'
import search from './remote-search'
import sites from './manager/sites'
import clusters from './manager/clusters'
import storages from './manager/storages'
import hosts from './manager/hosts'
import images from './manager/images'
import dict_types from './system/dictionary'
import group from './system/group'
import bussiness_systems from './system/business_systems'
import business_subsystems from './system/business_subsystems'
import operateLogs from './system/oprate_logs'
import scales from './system/scales'
import users from './system/users'
import regions from './selections/regions'
import vendors from './selections/storages'
import areas from './selections/areas'
import image_types from './selections/images'
import ntp_server from './selections/ntp_server'
import char_sets from './selections/character_sets'
import backup_types from './selections/backup_types'
import dirTypes from './selections/dir_types'
import hostsEnabled from './selections/hosts_enabled'
import rebuildStrategys from './selections/rebuild_strategys'
import enabled from './selections/enabled'
import networking from './manager/networking'
import mysqlService from './service/mysql/index'
import privileges from './service/privileges'
import order from './system/order'

const mocks = [
  ...user,
  ...role,
  ...article,
  ...search,
  ...sites,
  ...clusters,
  ...storages,
  ...hosts,
  ...images,
  ...dict_types,
  ...group,
  ...bussiness_systems,
  ...business_subsystems,
  ...operateLogs,
  ...scales,
  ...users,
  ...regions,
  ...areas,
  ...image_types,
  ...ntp_server,
  ...vendors,
  ...networking,
  ...mysqlService,
  ...char_sets,
  ...privileges,
  ...backup_types,
  ...enabled,
  ...dirTypes,
  ...hostsEnabled,
  ...rebuildStrategys,
  ...order
]

// for front mock
// please use it cautiously, it will redefine XMLHttpRequest,
// which will cause many of your third-party libraries to be invalidated(like progress event).
export function mockXHR() {
  // mock patch
  // https://github.com/nuysoft/Mock/issues/300
  Mock.XHR.prototype.proxy_send = Mock.XHR.prototype.send
  Mock.XHR.prototype.send = function() {
    if (this.custom.xhr) {
      this.custom.xhr.withCredentials = this.withCredentials || false

      if (this.responseType) {
        this.custom.xhr.responseType = this.responseType
      }
    }
    this.proxy_send(...arguments)
  }

  function XHR2ExpressReqWrap(respond) {
    return function(options) {
      let result = null
      if (respond instanceof Function) {
        const { body, type, url } = options
        // https://expressjs.com/en/4x/api.html#req
        result = respond({
          method: type,
          body: JSON.parse(body),
          query: param2Obj(url)
        })
      } else {
        result = respond
      }
      return Mock.mock(result)
    }
  }

  for (const i of mocks) {
    Mock.mock(new RegExp(i.url), i.type || 'get', XHR2ExpressReqWrap(i.response))
  }
}

// for mock server
const responseFake = (url, type, respond) => {
  return {
    url: new RegExp(`/mock${url}`),
    type: type || 'get',
    response(req, res) {
      res.json(Mock.mock(respond instanceof Function ? respond(req, res) : respond))
    }
  }
}

export default mocks.map(route => {
  return responseFake(route.url, route.type, route.response)
})
