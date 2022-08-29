import databases from './databases'
import mysql from './mysql'
import users from './users'
import backupStrategy from './backupStrategy'
import backupList from './backupList'
import units from './units'

export default [
  ...databases,
  ...mysql,
  ...users,
  ...backupStrategy,
  ...backupList,
  ...units
]
