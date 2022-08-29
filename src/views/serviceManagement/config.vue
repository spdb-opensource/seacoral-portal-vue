<template>
  <div>
    <el-row type="flex" align="middle" style="margin-top:12px">
      <el-col :span="14" :offset="1">  服务名称:{{ formData.name }}</el-col>
      <el-col :span="6">
        <el-button type="primary" size="small" @click="backTable()">返回</el-button>
      </el-col>
    </el-row>
    <el-divider />
    <el-row>
      <el-col v-if="formData.area" :span="5" :offset="1">所属区域:{{ formData.area.code }}({{ formData.area.name }})</el-col>
      <el-col v-else :span="5" :offset="1">所属区域:</el-col>
      <el-col v-if="formData.owner" :span="5" :offset="1">所属用户:{{ formData.owner.username }}({{ formData.owner.name }})</el-col>
      <el-col v-else :span="5" :offset="1">所属用户:</el-col>
      <el-col :span="5" :offset="1">创建时间:{{ formData.gmtCreate }}</el-col>
    </el-row>
    <el-divider />
    <el-row>
      <el-col :span="5" :offset="1">数据库版本:{{ formData.spec.database.image.id }}</el-col>
      <el-col :span="5" :offset="1">性能套餐:{{ formData.spec.database.services.units.resources.requests.cpu / 1000 }}C {{ formData.spec.database.services.units.resources.requests.memory }}M</el-col>
      <!--      <el-col :span="5" :offset="1">部署架构:{{ formData.servs[0].archTypeName }}</el-col>-->
      <el-col :span="5" :offset="1">存储类型:{{ formData.spec.database.services.units.resources.requests.storage.typeDisplay }}({{ formData.spec.database.services.units.resources.requests.storage.display }})</el-col>
    </el-row>
    <el-divider />
    <el-row>
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="部署架构" name="first">
          <graph-tab v-if="activeName === 'first'" :trans-data="transData" />
        </el-tab-pane>
        <el-tab-pane label="数据库" name="second">
          <mysql-tab v-if="activeName === 'second'" :trans-data="transData" />
        </el-tab-pane>
        <el-tab-pane label="参数管理" name="third">
          <param-tab v-if="activeName === 'third'" :trans-data="transData" />
        </el-tab-pane>
        <el-tab-pane label="库管理" name="fourth">
          <database-tab v-if="activeName === 'fourth'" :trans-data="transData" />
        </el-tab-pane>
        <el-tab-pane label="用户管理" name="fifth">
          <user-direct-tab v-if="activeName === 'fifth'" :trans-data="transData" />
        </el-tab-pane>
        <el-tab-pane label="备份策略" name="sixth">
          <backup-strategy-tab v-if="activeName === 'sixth'" :trans-data="transData" />
        </el-tab-pane>
        <el-tab-pane label="备份列表" name="seventh">
          <backup-list-tab v-if="activeName === 'seventh'" :trans-data="transData" />
        </el-tab-pane>
      </el-tabs>
    </el-row>
  </div>
</template>
<script>
// import fetchServiceById from '@/api/service/mysql/mysql'
import graphTab from './component/graphTab'
import mysqlTab from './component/mysqlTab'
import paramTab from './component/paramTab'
import databaseTab from './component/databaseTab'
import userDirectTab from './component/userDirectTab'
import backupStrategyTab from './component/backupStrategyTab'
import backupListTab from './component/backupListTab'
export default {
  components: {
    graphTab,
    mysqlTab,
    paramTab,
    databaseTab,
    userDirectTab,
    backupStrategyTab,
    backupListTab
  },
  props: {
    transData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      formData: {},
      activeName: 'second'
    }
  },
  created() {
    this.formData = Object.assign({}, this.transData)
  },
  mounted() {
    // console.log(this.transData)
    // console.log(this.$router.currentRoute.meta.hasOwnProperty('roles'))
  },
  methods: {
    backTable() {
      this.$emit('switch')
    },
    handleClick() {

    }
  }
}
</script>

<style>

</style>
