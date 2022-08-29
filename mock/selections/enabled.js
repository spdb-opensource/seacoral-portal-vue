const enabled = require('./data/enabled.json')

export default [
  {
    url: '/selections/enabled',
    type: 'get',
    response: config => {
      return enabled
    }
  }
]
