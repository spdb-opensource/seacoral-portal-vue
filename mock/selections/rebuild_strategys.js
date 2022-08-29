const rebuildStrategys = require('./data/rebuild_strategys.json')

export default [
  {
    url: '/selections/rebuild_strategys',
    type: 'get',
    response: config => {
      return rebuildStrategys
    }
  }
]
