import Mock from 'mockjs'
import characterSets from '../../selections/data/character_sets'
export const databasesList = []
const count = 10

for (let i = 0; i < count; i++) {
  databasesList.push(Mock.mock({
    name: Mock.Random.string('lower', 6, 12),
    characterSet: characterSets[Mock.Random.integer(0, characterSets.length - 1)].code,
    size: Mock.Random.integer(0, 10000000)
  }))
}

export default [
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/databases$',
    type: 'get',
    response: config => {
      return {
        'code': 200,
        'data': databasesList
      }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/databases/[a-zA-Z0-9\-]*$',
    type: 'get',
    response: config => {
      const path = config.originalUrl.split('/')
      const database_name = path[path.length - 1]
      let temp
      for (let i = 0; i < databasesList.length; i++) {
        if (databasesList[i].name === database_name) {
          temp = databasesList[i]
          break
        }
      }
      return {
        'code': 200,
        'data': { 'name': temp.name, 'characterSet': temp.characterSet }
      }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/databases$',
    type: 'post',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/databases/[a-zA-Z0-9\-]*$',
    type: 'delete',
    response: config => {
      return {
        'code': 200
      }
    }
  }

]
