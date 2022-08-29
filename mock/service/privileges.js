import privilegeGlobal from './data/privileges_global'
import privilegeLocal from './data/privileges_local'

export default [
  {
    url: '/privileges',
    type: 'get',
    response: config => {
      if (config.query.global === 'true' || config.query.global === true) {
        return privilegeGlobal
      }
      return privilegeLocal
    }
  }
]
