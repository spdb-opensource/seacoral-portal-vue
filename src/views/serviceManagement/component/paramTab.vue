<template>
  <div>
    <el-input
      v-model="paramSearch"
      style="display: inline-block"
      placeholder="请输入搜索参数名"
    />
    <br>
    <el-table
      v-loading="listLoading"
      :data="paramFilter.slice((currentPage - 1) * pagesize, currentPage * pagesize)"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >

      <el-table-column
        label="key"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.key }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="当前值"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.value }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="默认值"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.defaultValue }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="范围"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.range }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="重启生效"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <i
            v-if="scope.row.mustRestart === true"
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
        label="管理"
        width="113px"
        align="center"
      >
        <template slot-scope="{row}">

          <el-button
            v-if="row.canset"
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >
            编辑
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

    <el-dialog
      :title="'编辑'"
      :visible.sync="paramFormVisible"
      :before-close="cancelParamEdit"
    >
      <el-form
        ref="paramForm"
        :model="paramStr"
        :rules="paramRules"
        label-position="left"
        label-width="100px"
      >
        <el-form-item
          label="参数名称"
          prop="key"
        >
          <el-input
            v-model="paramStr.key"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="当前值"
          prop="value"
        >
          <el-input
            v-model="paramStr.value"
          />(范围：{{ paramStr.range }})
        </el-form-item>
        <el-form-item
          label="重启生效"
          prop="mustRestart"
        >
          <el-input
            v-model="paramStr.mustRestart"
            disabled
          />
        </el-form-item>
        <el-form-item
          label="说明"
          prop="description"
        >
          <el-input
            v-model="paramStr.description"
            disabled
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelParamEdit()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="param()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { fetchMySQLcfgsById, updateParam } from '@/api/service/mysql/mysql'
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
      paramFormVisible: false,
      paramStr: {},
      scaleOptions: [],
      list: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      paramRules: {
        value: [{ required: true, message: 'value is required', trigger: 'change' }]
      },
      paramSearch: ''
    }
  },
  computed: {
    paramFilter: function() {
      const search = this.paramSearch
      if (search !== '') {
        return this.list.filter(data => {
          return String(data.key).toLowerCase().indexOf(search) > -1
        })
      }
      return this.list
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.list = []
      const temp = []
      this.listLoading = true
      fetchMySQLcfgsById(this.transData.id).then(response => {
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
    handleEdit(row) {
      const temp = row
      this.paramFormVisible = true
      for (const key in temp) {
        if (typeof temp[key] === 'boolean') {
          temp[key] = temp[key].toString()
        }
      }
      this.paramStr = temp
    },
    param() {
      const temp = {}
      temp.key = this.paramStr.key
      temp.value = this.paramStr.value
      updateParam(this.transData.id, temp).then(response => {
        this.$notify({
          title: 'Success',
          message: '新增成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
        this.cancelParamEdit()
      })
    },
    cancelParamEdit() {
      this.paramFormVisible = false
      this.dialogStatus = ''
      this.paramStr = {}
    }
  }
}
</script>

<style>

</style>
