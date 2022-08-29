<template>
  <div>
    <el-button type="primary" size="small" icon="el-icon-circle-plus-outline" style="margin:8px;" @click="addDatabase()">新增</el-button>
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
        label="库名"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="字符集"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.characterSet }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="库大小"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ (scope.row.size/1024/1024).toFixed(1) }}M</span>
        </template>
      </el-table-column>

      <el-table-column
        label="详情"
        width="auto"
        align="center"
      >
        <template slot-scope="{row}">
          <el-button
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >
            查看
          </el-button>
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

    <el-dialog :title="'增加库'" :visible.sync="addFormVisible" :before-close="cancelAdd">
      <el-form ref="addForm" :rules="addRules" :model="addConfirmStr" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item label="库名" prop="name">
          <el-input v-model="addConfirmStr.name" placeholder="请输入库名" />
        </el-form-item>
        <el-form-item label="字符集" prop="characterSet">
          <el-select v-model="addConfirmStr.characterSet" placeholder="">
            <el-option
              v-for="item in characterSets"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
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

    <el-dialog
      :title="dialogStatus"
      :visible.sync="paramFormVisible"
      :before-close="cancelParamEdit"
    >
      <el-row>
        <el-col :span="12">库名:{{ tableData.name }}</el-col>
        <el-col :span="12">字符集:{{ tableData.characterSet }}</el-col>
      </el-row>
      <el-table :data="tableDataList">
        <el-table-column label="表名">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="表大小">
          <template slot-scope="scope">
            <span>{{ (scope.row.size/1024/1024).toFixed(1) }}M</span>
          </template>
        </el-table-column>
      </el-table>
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
import { fetchDatabasesById, deleteDatabases, fetchDatabaseByName, addDatabase } from '@/api/service/mysql/databases'
import { getCharacterSets } from '@/api/selections'
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
      scaleOptions: [],
      list: [],
      tableDataList: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      addRules: {
        name: [{ required: true, message: '库名以英文小写字母开头，不能有大写字母', trigger: 'change', pattern: new RegExp(/^[a-z][a-z0-9_:~@#,$><{}|;?".%()\-\[\]*&^!=+]*[a-z]*$/) }]
      },
      paramRules: {
        value: [{ required: true, message: 'value is required', trigger: 'change' }]
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
    getList() {
      this.list = []
      const temp = []
      this.listLoading = true
      fetchDatabasesById(this.transData.id).then(response => {
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
      this.editFormVisible = false
      this.deleteFormVisible = false
      this.dialogStatus = ''
      this.deleteConfirmExpect = ''
      this.deleteConfirmStr = {
        input: ''
      }
    },
    cancelAdd() {
      this.addFormVisible = false
      this.editFormVisible = false
      this.deleteFormVisible = false
      this.dialogStatus = ''
      this.addConfirmExpect = ''
      this.addConfirmStr = {
        name: '',
        characterSet: ''
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
      this.deleteConfirmExpect = this.dialogTemp.name
    },
    addData() {
      this.$refs['addForm'].validate((valid) => {
        if (valid) {
          addDatabase(this.transData.id, this.addConfirmStr).then(() => {
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
          deleteDatabases(this.transData.id, this.dialogTemp.name).then(() => {
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
    addDatabase() {
      this.addFormVisible = true
      getCharacterSets().then(response => {
        this.characterSets = response.data
      })
    },
    handleEdit(row) {
      this.paramFormVisible = true
      this.tableData = {}
      this.tableDataList = []
      fetchDatabaseByName(this.transData.id, row.name).then(response => {
        this.tableData = response.data
        if (response.data.tables) {
          this.tableDataList = response.data.tables
        }
      })
    },
    cancelParamEdit() {
      this.paramFormVisible = false
      this.dialogStatus = ''
      this.tableData = {}
    }
  }
}
</script>

<style>

</style>
