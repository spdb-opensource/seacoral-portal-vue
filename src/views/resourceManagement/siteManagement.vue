<template>
  <div class="app-container">

    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >

      <el-table-column align="center" label="名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column width="80" align="center" label="地域">
        <template slot-scope="scope">
          <span>{{ scope.row.region.display }}</span>
        </template>
      </el-table-column>

      <el-table-column width="220" align="center" label="域名">
        <template slot-scope="scope">
          <span>{{ scope.row.domain }}</span>
        </template>
      </el-table-column>

      <el-table-column width="auto" label="端口">
        <template slot-scope="scope">
          <span>{{ scope.row.port }}</span>
        </template>
      </el-table-column>

      <el-table-column class-name="status-col" label="状态" width="110">
        <template slot-scope="{row}">
          <el-tag :type="row.status | stateFilter">
            {{ row.status }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column min-width="160" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.created.timestamp }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="详情" width="280">
        <template slot-scope="{row}">
          <el-button type="primary" size="small" @click="handleEdit(row, true)">
            查看
          </el-button>
          <el-button
            v-if="roles.includes('编辑') || roles.includes('admin')"
            type="success"
            size="small"
            @click="handleEdit(row, false)"
          >
            编辑
          </el-button>
          <el-button
            v-if="roles.includes('删除') || roles.includes('admin')"
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

    <el-dialog :title="dialogStatus" :visible.sync="editFormVisible">
      <el-form
        ref="editForm"
        :rules="editRules"
        :model="dialogTemp"
        :disabled="dialogIsView"
        label-position="left"
        label-width="70px"
        style="width: 400px; margin-left:30px;"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="名称" prop="name">
              <el-input v-model="dialogTemp.name" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="类型" prop="type.code">
              <el-input v-model="dialogTemp.type.code" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item v-if="dialogIsView" label="地域" prop="region">
              <el-input v-model="dialogTemp.region.display" />
            </el-form-item>
            <el-form-item v-else label="地域" prop="region">
              <el-select v-model="dialogTemp.region.code" placeholder="请选择">
                <el-option
                  v-for="item in regions"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="域名" prop="domain">
              <el-input v-model="dialogTemp.domain" disabled style="width: 280px;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="端口" prop="port">
              <el-input v-model="dialogTemp.port" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="镜像库" prop="image_registry">
              <el-input v-model="dialogTemp.image_registry" disabled style="width: 280px;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="状态" prop="status">
          <el-input v-model="dialogTemp.status" disabled />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogTemp.description" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建者" prop="created.username">
              <el-input v-model="dialogTemp.created.username" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间" prop="created.timestamp">
              <el-input v-model="dialogTemp.created.timestamp" disabled style="width: 280px;" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="更新者" prop="modified">
              <el-input v-model="dialogTemp.modified.username" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间" prop="modified.timestamp">
              <el-input v-model="dialogTemp.modified.timestamp" disabled style="width: 280px;" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="editFormVisible = false">
          关闭
        </el-button>
        <el-button v-if="!dialogIsView" type="primary" @click="updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="dialogStatus" :visible.sync="deleteFormVisible" :before-close="cancelDelete">
      <el-form
        ref="deleteForm"
        :rules="deleteRules"
        :model="deleteConfirmStr"
        label-position="top"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
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
import { mapGetters } from 'vuex'
import { fetchSites, updateSite, deleteSite } from '@/api/manager/sites'
import { fetchRegions } from '@/api/selections'
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
      regions: null,
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
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchSites().then(response => {
        this.list = response.data
        this.total = response.data.length
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
    handleEdit(row, isView) {
      this.dialogTemp = Object.assign({}, row) // copy obj
      if (isView) {
        this.dialogStatus = 'view'
        this.dialogIsView = true
      } else {
        fetchRegions().then(response => {
          this.regions = response.data
        })
        this.dialogStatus = 'edit'
        this.dialogIsView = false
      }
      this.editFormVisible = true
    },
    handleDelete(row) {
      this.dialogTemp = Object.assign({}, row)
      this.dialogStatus = 'delete'
      this.deleteFormVisible = true
      this.deleteConfirmExpect = this.dialogTemp.name
    },
    cloneForUpdate() {
      return {
        id: this.dialogTemp.id,
        name: this.dialogTemp.name,
        domain: this.dialogTemp.domain,
        port: this.dialogTemp.port,
        description: this.dialogTemp.description,
        region: this.dialogTemp.region.code,
        modified_user: this.user_id,
        type: this.dialogTemp.type.code
      }
    },
    updateData() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForUpdate(this.dialogTemp)
          updateSite(tempData.id, tempData).then(() => {
            this.getList()
            this.editFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    cancelDelete() {
      this.editFormVisible = false
      this.deleteFormVisible = false
      this.dialogStatus = ''
      this.deleteConfirmExpect = ''
      this.deleteConfirmStr = {
        input: ''
      }
    },
    deleteData() {
      this.$refs['deleteForm'].validate((valid) => {
        if (valid) {
          deleteSite(this.dialogTemp.id).then(() => {
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

<style scoped>
</style>
