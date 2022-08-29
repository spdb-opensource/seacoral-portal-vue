<template>
  <div>
    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column
        label="备份名称"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ formatName(scope.row.path) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="所属单元"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.unit.id.split("-")[2] }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="备份类型"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.type==='full'?'全备':'' }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="备份大小"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ (scope.row.size/1024).toFixed(2) }}G</span>
        </template>
      </el-table-column>

      <el-table-column
        label="开始时间"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.gmtStart }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="结束时间"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.gmtEnd==='0001-01-01 00:00:00'?'':scope.row.gmtEnd }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="耗时"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ formatUptime(scope.row) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="过期时间"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.expire }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="状态"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ formatStatus(scope.row.status) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="备份类型"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.remark }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
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

    <el-dialog :title="'删除'" :visible.sync="deleteFormVisible" :before-close="cancelDelete">
      <el-form ref="deleteForm" :rules="deleteRules" :model="deleteConfirmStr" label-position="top" label-width="70px" style="width: 400px; margin-left:50px;">
        请输入 {{ dialogTemp.id }} 确认
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
import { fetchBackupList, deleteBackupList } from '@/api/service/mysql/backupList'
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
    return {
      dialogStatus: '',
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      dialogTemp: {},
      deleteFormVisible: false,
      addConfirmExpect: '',
      addConfirmStr: {
        name: '',
        characterSet: ''
      },
      addFormVisible: false,
      characterSets: [],
      paramFormVisible: false,
      tableData: {},
      list: [],
      tableDataList: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true
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
    getList() {
      this.list = []
      this.listLoading = true
      fetchBackupList(this.transData.id).then(response => {
        this.list = response.data
        this.total = this.list.length
        this.listLoading = false
      })
    },
    formatName(path) {
      console.log(path)
      return path.split('-').slice(1, 6).join('-')
    },
    formatUptime(row) {
      if (row.gmtEnd === null || row.gmtEnd === '') {
        return ''
      }
      var startDate = new Date(row.gmtStart)
      if (row.gmtEnd === '0001-01-01 00:00:00') {
        return ''
      }
      var endDate = new Date(row.gmtEnd)
      var uptime = (endDate - startDate) / 1000
      if (uptime != null) {
        if (uptime < 60) {
          return (uptime + '秒')
        } else if (uptime > 60 && uptime < 3600) {
          return (Math.floor(uptime / 60) + '分' +
										(uptime % 60) + '秒')
        } else {
          return (Math.floor(uptime / 3600) + '小时' +
										Math.floor(uptime % 3600 / 60) + '分' +
										(uptime % 3600 % 60) + '秒')
        }
      }
    },
    formatStatus(status) {
      if (status === '') {
        return ''
      } else {
        if (status === 'Running') {
          return '备份中'
        }
        if (status === 'Complete') {
          return '备份完成'
        }
        if (status === 'Failed') {
          return '备份失败'
        }
        if (status === 'Deleting') {
          return '删除中'
        }
        if (status === 'DeleteFailed') {
          return '删除失败'
        }
      }
    },
    cancelDelete() {
      this.deleteFormVisible = false
      this.dialogStatus = ''
      this.deleteConfirmExpect = ''
      this.deleteConfirmStr = {
        input: ''
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
      this.dialogStatus = 'delete'
      this.deleteFormVisible = true
      this.deleteConfirmExpect = this.dialogTemp.id
    },
    deleteData() {
      this.$refs['deleteForm'].validate((valid) => {
        if (valid) {
          deleteBackupList(this.dialogTemp.id).then(() => {
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
    }
  }
}
</script>

<style>

</style>
