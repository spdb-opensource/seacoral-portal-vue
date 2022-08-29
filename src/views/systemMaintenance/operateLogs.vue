<template>
  <div>

    <el-row>
      <el-col :span="6">
        <el-input
          v-model="objType"
          clearable
          placeholder="请输入对象类型"
        >对象类型</el-input>
      </el-col>
      <el-col
        :span="8"
        :offset="1"
      >
        <el-date-picker
          v-model="operRateDateInterval"
          type="daterange"
          align="right"
          unlink-panels
          :clearable="false"
          :default-value="operRateDateInterval"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="['00:00:00','23:59:59']"
          value-format="timestamp"
          :picker-options="pickerOptions"
        />
      </el-col>
      <el-col :span="6">
        <el-button
          type="primary"
          icon="el-icon-search"
          @click="getOperateLogsList()"
        />
      </el-col>
    </el-row>
    <UnifiedTable
      :table-items="tableItems"
      :item-list="itemList"
      :list-loading="listLoading"
      :show-filter="false"
    />
  </div>
</template>

<script>
import UnifiedTable from './template/UnifiedTable'
import { fetchOperateLogs } from '@/api/system/operate_logs'

export default {
  name: 'SystemNamingManagement',
  components: { UnifiedTable },
  filters: { },
  data() {
    return {
      tableItems: {
        'objType': '对象类型',
        'action': '登录',
        'objName': '操作对象',
        'gmtCreate': '操作时间',
        'creator': '操作者',
        'success': '操作结果',
        'uptime': '耗时(ms)',
        'description': '描述'
      },
      itemList: [],
      listLoading: true,
      objType: '',
      operRateDateInterval: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now()
        },
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  computed: {
  },
  created() {
    this.operRateDateInterval.push(new Date().setHours(0, 0, 0, 0) - 3600 * 1000 * 24 * 3)
    this.operRateDateInterval.push(new Date().getTime())
    this.getOperateLogsList()
  },
  methods: {
    getOperateLogsList() {
      if (this.operRateDateInterval !== null) {
        this.listLoading = true
        fetchOperateLogs(this.objType, this.operRateDateInterval[0], this.operRateDateInterval[1]).then(response => {
          this.itemList = response.data
          this.listLoading = false
        })
      } else {
        this.$message.error('请选择时间！')
      }
    }
  }
}
</script>

<style scoped>
</style>
