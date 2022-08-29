const dirTypes = require('./data/dir_types.json')

export default [
  {
    url: '/selections/dir_types',
    type: 'get',
    response: config => {
      return dirTypes
    }
  }
]
