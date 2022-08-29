const hostEnabled = require('./data/hosts_enabled.json')

export default [
  {
    url: '/selections/hosts/[a-zA-Z0-9\-]*/enabled$',
    type: 'get',
    response: config => {
      return hostEnabled
    }
  }
]
