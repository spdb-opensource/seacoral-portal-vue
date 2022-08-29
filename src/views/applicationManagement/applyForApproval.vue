<template>
  <div class="app-container">
    <el-input
      v-model="search"
      size="mini"
      placeholder="搜索服务名称"
      style="margin-bottom: 5px; width: 200px;"
    />
    <el-table
      v-loading="listLoading"
      :data="approvalTableDataList"
      border
      fit
      highlight-current-row
      style="width: 100%"
      @sort-change="sortChange"
    >

      <el-table-column
        prop="site"
        align="center"
        label="站点"
        width="auto"
        sortable="custom"
        :filters="siteList"
        :filter-method="siteFilterHandler"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.site.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        prop="area"
        width="auto"
        align="center"
        label="区域"
        sortable="custom"
        :filters="areaList"
        :filter-method="areaFilterHandler"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.area.display }}</span>
        </template>
      </el-table-column>

      <el-table-column width="auto" align="center" label="用户">
        <template slot-scope="scope">
          <span>{{ scope.row.creator }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" width="auto" label="服务名称">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" width="auto" label="服务类型">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" width="auto" label="工单类型">
        <template slot-scope="scope">
          <span>{{ scope.row.actionType.display }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="gmtCreate" align="center" width="auto" label="创建时间" sortable="custom">
        <template slot-scope="scope">
          <span>{{ scope.row.gmtCreate }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" width="auto" label="状态">
        <template slot-scope="scope">
          <span>{{ scope.row.status.display }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="详情" width="300">
        <template slot-scope="{row}">
          <el-button v-if="roles.includes('详情') || roles.includes('admin')" type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button v-if="(roles.includes('编辑') || roles.includes('admin')) && row.status.display !== '执行成功'" type="success" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button v-if="row.status.display === '未审批' && (roles.includes('审批') || roles.includes('admin'))" type="danger" size="small" @click="handleApprove(row)">
            审批
          </el-button>
          <el-button v-if="row.status.display === '审批通过' || row.status.display === '执行失败' && (roles.includes('执行') || roles.includes('admin'))" type="danger" size="small" @click="handleExecute(row)">
            执行
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30]"
      :limit="parseInt(pagesize)"
      :total="list.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase())).length"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @pagination="handlePagination"
    />

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchOrder } from '@/api/system/order'
import { fetchDicts } from '@/api/system/dictionary'
import { fetchSites } from '@/api/manager/sites'
import { fetchAreas } from '@/api/selections'
import Pagination from '@/components/Pagination'

export default {
  name: 'SiteManagementList',
  components: { Pagination },
  filters: {
    stateFilter(status) {
      const stateMap = {
        passing: 'success',
        critical: 'danger'
      }
      return stateMap[status]
    }
  },
  data() {
    return {
      roles: this.$router.currentRoute.meta.roles,
      archList: [],
      approveStatus: false,
      list: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      dialogIsView: false,
      editFormVisible: false,
      deleteFormVisible: false,
      dialogStatus: '',
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      siteList: [],
      areaList: [],
      regions: null,
      search: '',
      dialogTemp: {
        id: undefined,
        name: undefined,
        type: {
          code: undefined,
          display: undefined
        },
        version: undefined,
        domain: undefined,
        port: undefined,
        status: undefined,
        description: undefined,
        region: {
          code: undefined,
          display: undefined
        },
        created: {
          username: undefined,
          timestamp: undefined
        },
        modified: {
          username: undefined,
          timestamp: undefined
        }
      },
      editRules: {
        name: [{ required: true, message: 'name is required', trigger: 'change' }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user_id'
    ]),
    deleteRules() {
      const pattern = new RegExp('^' + this.deleteConfirmExpect + '$')
      return {
        input: [{ required: true, message: '输入与 ' + this.deleteConfirmExpect + ' 不一致', pattern: pattern }]
      }
    },
    approvalTableDataList() {
      return this.list.filter(
        data => !this.search || data.name.toLowerCase().includes(this.search.toLowerCase())
      ).slice(
        (this.currentPage - 1) * this.pagesize, this.currentPage * this.pagesize
      )
    }
  },
  created() {
    this.getList()
    this.getSiteList()
    this.getAreaList()
    this.fetchArchs()
  },
  methods: {
    fetchArchs() {
      fetchDicts({ dict_type_code: 'arch_type' }).then(response => {
        this.archList = response.data
      })
    },
    getList() {
      this.listLoading = true
      fetchOrder().then(response => {
        this.list = response.data
        this.list.sort(this.sortListByDateDesc)
        this.total = response.data.length
        this.listLoading = false
      })
    },
    getSiteList() {
      fetchSites().then(response => {
        for (const site of response.data) {
          this.siteList.push({ text: site.name, value: site.name })
        }
      })
    },
    getAreaList() {
      fetchAreas().then(response => {
        for (const area of response.data) {
          this.areaList.push({ text: area.name, value: area.name })
        }
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
    handleView(row) {
      const id = row.id
      this.$emit('switch', { id: id })
    },
    handleEdit(row) {
      const id = row.id // copy obj
      this.$router.push({
        path: '/editOrder',
        query: {
          id: id
        }
      })
    },
    handleExecute(row) {
      var id = row.id // copy obj
      this.$router.push({
        path: '/executeOrder',
        query: {
          id: id
        }
      })
    },
    handleApprove(row) {
      var id = row.id // copy obj
      this.$router.push({
        path: '/approveOrder',
        query: {
          id: id
        }
      })
    },
    handleDelete(row) {
      this.dialogTemp = Object.assign({}, row)
      this.dialogStatus = 'delete'
      this.deleteFormVisible = true
      this.deleteConfirmExpect = this.dialogTemp.name
    },
    siteFilterHandler(value, row, column) {
      return row.site.name === value
    },
    areaFilterHandler(value, row, column) {
      return row.area.name === value
    },
    cloneForUpdate() {
      return {
        id: this.dialogTemp.id,
        name: this.dialogTemp.name,
        domain: this.dialogTemp.domain,
        port: this.dialogTemp.port,
        description: this.dialogTemp.description,
        region: this.dialogTemp.region.code,
        modified_user: this.user_id
      }
    },
    sortListByDateAsc(a, b) {
      return Date.parse(a.gmtCreate) - Date.parse(b.gmtCreate)
    },
    sortListByDateDesc(a, b) {
      return Date.parse(b.gmtCreate) - Date.parse(a.gmtCreate)
    },

    sortChange(v) {
      if (v.column.property === 'site') {
        if (v.column.order === 'descending') {
          this.list.sort((a, b) => b.site.name.localeCompare(a.site.name))
        } else {
          this.list.sort((a, b) => a.site.name.localeCompare(b.site.name))
        }
      } else if (v.column.property === 'area') {
        if (v.column.order === 'descending') {
          this.list.sort((a, b) => b.area.display.localeCompare(a.area.display))
        } else {
          this.list.sort((a, b) => a.area.display.localeCompare(b.area.display))
        }
      } else if (v.column.property === 'gmtCreate') {
        if (v.column.order === 'descending') {
          this.list.sort(this.sortListByDateDesc)
        } else {
          this.list.sort(this.sortListByDateAsc)
        }
      } else {
        console.log('Unsupported type!')
      }
    }

  }
}
</script>

<style scoped>
</style>
