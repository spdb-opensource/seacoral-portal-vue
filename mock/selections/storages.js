import Mock from 'mockjs'

export const VendorList = []
const VendorCount = 5
export const TypeList = [
  {
    id: 10,
    code: 'fc',
    name: 'fc',
    sequence: 1,
    gmtCreated: '2019-01-01 00:00:00',
    creator: 'admin'
  },
  {
    id: 11,
    code: 'iscsi',
    name: 'iscsi',
    sequence: 2,
    gmtCreated: '2019-01-01 00:00:00',
    creator: 'admin'
  }
]
export const PerformanceList = [
  {
    code: 'high',
    display: '高性能'
  },
  {
    code: 'medium',
    display: '中性能'
  },
  {
    code: 'low',
    display: '低性能'
  }
]

for (let i = 0; i < VendorCount; i++) {
  VendorList.push(Mock.mock({
    id: '@increment',
    'name|1': ['华为(OceanStorV3)', '华为(FusionStorV10)', '华为(FusionStorV7)', '华为(FusionStorV6)', '华为(FusionStorV5)'],
    code: Mock.Random.string('lower', 6, 12),
    version: Mock.Random.string('lower', 6, 12)
  }))
}

export default [
  {
    url: '/selections/san_vendors',
    type: 'get',
    response: () => {
      return VendorList
    }
  },
  {
    url: '/selections/san_types',
    type: 'get',
    response: () => {
      return TypeList
    }
  }
]

