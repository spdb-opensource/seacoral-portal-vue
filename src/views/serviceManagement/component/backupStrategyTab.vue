<template>
  <div>
    <el-button type="primary" size="small" icon="el-icon-circle-plus-outline" style="margin:8px;" @click="showAddBackupStrategy()">新增</el-button>
    <el-button type="primary" size="small" icon="el-icon-refresh-right" style="margin:8px;" @click="refresh()">刷新</el-button>

    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column
        label="名称"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="策略类型"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ cronToChn(scope.row.schedule) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="备份类型"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.backupType }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="保留天数"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.retention }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="状态"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <i
            v-if="scope.row.enabled === 'true' || scope.row.enabled === true"
            class="el-icon-success"
            style="color:green"
          />
          <i
            v-else
            class="el-icon-error"
            style="color:red"
          />
        </template>
      </el-table-column>

      <el-table-column
        label="创建者"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.created.name }}({{ scope.row.created.username }})</span>
        </template>
      </el-table-column>

      <el-table-column
        label="创建时间"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.created.timestamp }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="描述"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.desc }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="详情"
        width="auto"
        align="center"
      >
        <template slot-scope="{row}">
          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30]"
      :limit="parseInt(pagesize)"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @pagination="handlePagination"
    />

    <el-dialog :title="'增加策略'" :visible.sync="addFormVisible" :before-close="cancelAdd">
      <el-form ref="addForm" :rules="addRules" :model="addConfirmStr" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="备份策略名称" prop="name">
          <el-input v-model="addConfirmStr.name" placeholder="请输入备份策略名称" />
        </el-form-item>
        <el-form-item label="备份作用对象" prop="name">
          <el-cascader
            v-model="backupObject"
            :options="options"
          />
        </el-form-item>
        <el-form-item label="备份类型" prop="type">
          <el-select v-model="addConfirmStr.type" placeholder="">
            <el-option
              v-for="item in typeList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备份周期" prop="retention_type">
          <el-select v-model="addConfirmStr.retention_type">
            <el-option key="按周" label="按周" value="按周" />
            <el-option key="按天" label="按天" value="按天" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="addConfirmStr.retention_type ==='按周'" label="周" prop="week">
          <el-select v-model="addConfirmStr.week">
            <el-option v-for="item in weekList" :key="item.code" :label="item.name" :value="item.code" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间" prop="time">
          <el-time-picker v-model="addConfirmStr.time" />
        </el-form-item>
        <el-form-item label="有效天数" prop="retention">
          <el-input v-model="addConfirmStr.retention" type="number" placeholder="请输入备份文件保留天数" :min="0" />
        </el-form-item>
        <el-form-item label="备份节点" prop="endpointId">
          <el-select v-model="addConfirmStr.endpointId" placeholder="请选择">
            <el-option
              v-for="item in backupEndpointList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-select v-model="addConfirmStr.enabled" placeholder="">
            <el-option
              v-for="item in enabledList"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备份描述" prop="description">
          <el-input v-model="addConfirmStr.description" type="textarea" placeholder="请输入备份策略名称" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAdd()">
          关闭
        </el-button>
        <el-button type="primary" @click="addData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'删除'" :visible.sync="deleteFormVisible" :before-close="cancelDelete">
      <el-form ref="deleteForm" :rules="deleteRules" :model="deleteConfirmStr" label-position="top" label-width="70px" style="width: 400px; margin-left:50px;">
        请输入 {{ dialogTemp.name }} 确认
        <el-form-item label="" prop="input">
          <el-input v-model="deleteConfirmStr.input" placeholder="" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelDelete()">
          关闭
        </el-button>
        <el-button type="danger" @click="deleteData()">
          确认删除
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { fetchBackupStrategy, deleteBackupStrategy, addBackupStrategy } from '@/api/service/mysql/backupStrategy'
import { getBackupTypes, getEnabled } from '@/api/selections'
import { fetchBackupFileEndPoints } from '@/api/manager/backupEndpoints'

import { fetchServiceById } from '@/api/service/mysql/mysql'
import Pagination from '@/components/Pagination'

export default {
  components: {
    Pagination
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
    var validateRetention = (rule, value, callback) => {
      if (!value) {
        callback(new Error('retention is required'))
      } else {
        if (value < 0) {
          callback(new Error('输入不符合规则'))
        } else if (this.addConfirmStr.retention_type === '按周' && value < 7) {
          callback(new Error('按周备份有效天数需大于7'))
        } else {
          callback()
        }
      }
    }
    return {
      backupObject: [],
      options: [],
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      dialogTemp: {},
      deleteFormVisible: false,
      addConfirmExpect: '',
      addConfirmStr: {
        name: '',
        type: '',
        retention_type: '按天',
        endpointId: '',
        week: new Date().getDay(),
        time: new Date(),
        retention: NaN,
        enabled: '',
        description: ''
      },
      addFormVisible: false,
      typeList: [],
      enabledList: [],
      backupEndpointList: [],
      weekList: [
        { code: 0, name: '星期日' },
        { code: 1, name: '星期一' },
        { code: 2, name: '星期二' },
        { code: 3, name: '星期三' },
        { code: 4, name: '星期四' },
        { code: 5, name: '星期五' },
        { code: 6, name: '星期六' }],
      list: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      addRules: {
        name: [{ required: true, message: '备份策略名称不能为空', trigger: 'blur' }],
        type: [{ required: true, message: '备份类型不能为空', trigger: 'blur' }],
        endpointId: [{ required: true, message: '备份节点不能为空', trigger: 'blur' }],
        retention_type: [{ required: true, message: '备份周期不能为空', trigger: 'blur' }],
        retention: [{ required: true, message: '有效天数不能为空', trigger: 'blur' },
          { required: true, validator: validateRetention, trigger: 'blur' }],
        enabled: [{ required: true, message: '是否启用不能为空', trigger: 'blur' }]
      },
      paramRules: {
        value: [{ required: true, message: 'value is required', trigger: 'blur' }]
      }
    }
  },
  computed: {
    deleteRules() {
      const pattern = new RegExp('^' + this.deleteConfirmExpect + '$')
      return {
        input: [{ required: true, message: '输入与 ' + this.deleteConfirmExpect + ' 不一致', pattern: pattern }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    refresh() {
      this.getList()
    },
    cronToChn(schedule) {
      var crons = schedule.split(' ')
      var cronText = ''
      if (crons[3] !== '*') {
        cronText += '每月 '
        cronText += crons[3] + '日 '
      } else if (crons[4] !== '*') {
        cronText += '每周 '
        cronText += '周'
        if (crons[4] === '0') {
          cronText += '日'
        }
        if (crons[4] === '1') {
          cronText += '一'
        }
        if (crons[4] === '2') {
          cronText += '二'
        }
        if (crons[4] === '3') {
          cronText += '三'
        }
        if (crons[4] === '4') {
          cronText += '四'
        }
        if (crons[4] === '5') {
          cronText += '五'
        }
        if (crons[4] === '6') {
          cronText += '六'
        }
        cronText += ' '
      } else {
        cronText += '每日 '
      }
      if (parseInt(crons[0]) < 10) {
        cronText += crons[1] + ':0' + crons[0] + ':' + '00'
      } else {
        cronText += crons[1] + ':' + crons[0] + ':' + '00'
      }
      return cronText
    },
    getList() {
      this.list = []
      const temp = []
      this.listLoading = true
      fetchBackupStrategy(this.transData.id).then(response => {
        // 这里原来的前端判断了canset=true的情况下才显示
        response.data.forEach(element => {
          if (element.canset === true) {
            this.list.push(element)
          } else {
            temp.push(element)
          }
        })
        this.list = this.list.concat(temp)
        this.total = this.list.length
        this.listLoading = false
      })
    },
    cancelDelete() {
      this.addFormVisible = false
      this.deleteFormVisible = false
      this.deleteConfirmExpect = ''
      this.deleteConfirmStr = {
        input: ''
      }
    },
    cancelAdd() {
      this.$refs['addForm'].clearValidate()
      this.addFormVisible = false
      this.deleteFormVisible = false
      this.addConfirmExpect = ''
      this.addConfirmStr = {
        name: '',
        type: '',
        retention_type: '按天',
        week: new Date().getDay(),
        time: new Date(),
        retention: NaN,
        enabled: '',
        description: ''
      }
    },
    handleSizeChange(val) {
      this.pagesize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handlePagination(val) {
      this.currentPage = val.page
      this.pagesize = val.limit
    },
    handleDelete(row) {
      this.dialogTemp = Object.assign({}, row)
      this.deleteFormVisible = true
      this.deleteConfirmExpect = this.dialogTemp.name
    },
    addData() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          const temp = {}
          temp.name = this.addConfirmStr.name
          temp.type = this.addConfirmStr.type
          temp.retention = parseInt(this.addConfirmStr.retention)
          temp.endpointId = this.addConfirmStr.endpointId
          temp.enabled = this.addConfirmStr.enabled
          temp.description = this.addConfirmStr.description
          temp.once = false

          if (this.backupObject[0] === 'role') {
            temp.role = this.backupObject[1]
          }
          if (this.backupObject[0] === 'unit_id') {
            temp.unit_id = this.backupObject[1]
          }

          const time = this.addConfirmStr.time
          if (this.addConfirmStr.retention_type === '按天') {
            temp.cronExpression = `${time.getMinutes()} ${time.getHours()} * * *`
          } else {
            temp.cronExpression = `${time.getMinutes()} ${time.getHours()} * * ${this.addConfirmStr.week}`
          }
          addBackupStrategy(this.transData.id, temp).then(() => {
            this.getList()
            this.cancelAdd()
            this.$notify({
              title: 'Success',
              message: '新增成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    deleteData() {
      this.$refs['deleteForm'].validate((valid) => {
        if (valid) {
          deleteBackupStrategy(this.dialogTemp.id).then(() => {
            this.getList()
            this.cancelDelete()
            this.$notify({
              title: 'Success',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    showAddBackupStrategy() {
      this.addFormVisible = true
      getBackupTypes().then(response => {
        this.typeList = response.data
        this.addConfirmStr.type = this.typeList[0].code
      })
      fetchBackupFileEndPoints().then(response => {
        this.backupEndpointList = response.data
        this.addConfirmStr.endpointId = this.backupEndpointList[0].id
      })
      getEnabled().then(response => {
        this.enabledList = response.data
        this.addConfirmStr.enabled = this.enabledList[0].code
      })
      this.options = [{
        value: 'role', label: 'role',
        children: [{ value: 'master', label: 'master' }, { value: 'slave', label: 'slave' }]
      }, {
        value: 'unit_id', label: 'unit_id',
        children: []
      }]
      fetchServiceById(this.transData.id).then(response => {
        const units = response.data.status.database.services[0].units
        for (let i = 0; i < units.length; i++) {
          this.options[1].children.push({ value: units[i].id, label: units[i].id })
        }
      })
    }
  }
}
</script>

<style>

</style>
