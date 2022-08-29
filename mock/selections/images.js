import Mock from 'mockjs'

export const ImageTypeList = []

for (let i = 0; i < 3; i++) {
  const name = ['mysql', 'cmha', 'proxysql']

  ImageTypeList.push(Mock.mock({
    id: '@increment',
    code: Mock.Random.string('lower', 6, 12),
    name: name[i],
    sequence: '@increment',
    gmtCreated: '2019-01-01 00:00:00',
    creator: 'admin'
  }))
}

export default [
  {
    url: '/selections/image_types',
    type: 'get',
    response: () => {
      return ImageTypeList
    }
  }
]

