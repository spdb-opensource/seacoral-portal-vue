import usersList from './data/users'

export default [
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/users$',
    type: 'get',
    response: config => {
      return usersList
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/users/[a-zA-Z0-9\-]*$',
    type: 'get',
    response: config => {
      const path = config.originalUrl.split('/')
      const database_name = path[path.length - 1]
      let temp
      for (let i = 0; i < usersList.length; i++) {
        if (usersList[i].name === database_name) {
          temp = usersList[i]
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
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/users$',
    type: 'post',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/users/[a-zA-Z0-9\-]*$',
    type: 'delete',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/saveUpdateUser/[a-zA-Z0-9\-]*$',
    type: 'put',
    response: config => {
      return {
        'code': 200
      }
    }
  },
  {
    url: '/serv_grps/mysql/[a-zA-Z0-9\-]*/changeUserPwd/[a-zA-Z0-9\-]*$',
    type: 'put',
    response: config => {
      return {
        'code': 200
      }
    }
  }

]
