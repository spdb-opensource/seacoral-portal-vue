const charSet = require('./data/character_sets.json')

export default [
  {
    url: '/selections/character_sets',
    type: 'get',
    response: config => {
      return charSet
    }
  }
]
