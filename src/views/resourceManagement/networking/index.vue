<template>
  <div class="app-container">

    <el-button
      v-if="roles.includes('新增') || roles.includes('admin')"
      type="primary"
      icon="el-icon-circle-plus-outline"
      size="small"
      round
      style="margin: 0 0 16px 16px;"
      @click="addNewNetworking()"
    >增加</el-button>
    <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >

      <el-table-column
        label="站点名称"
        width="auto"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.site.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="120px"
        align="center"
        label="起始IP"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.startIp }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="120px"
        align="center"
        label="结束IP"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.endIp }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="120px"
        label="ip使用率"
      >
        <template slot-scope="scope">
          <span>{{ parseInt(100 * scope.row.ip.usedCnt/scope.row.ip.total) }}%({{ scope.row.ip.usedCnt }}/{{ scope.row.ip.total }})</span>
        </template>
      </el-table-column>

      <el-table-column
        label="vlanId"
        width="110"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.vlanId }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="关联集群"
        width="110"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.cluster.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="启用/停用"
        width="auto"
      >
        <template slot-scope="scope">
          <i
            v-if="scope.row.enabled"
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
        min-width="160"
        label="创建时间"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.created.timestamp }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="详情"
        width="113px"
      >
        <template slot-scope="{row}">

          <el-button
            plain
            size="small"
            icon="el-icon-more"
            @click="handleEdit(row, true)"
          />
          <el-dropdown
            trigger="click"
            :hide-on-click="false"
            @command="handleDropdown($event,row)"
          >
            <el-button
              plain
              size="small"
              icon="el-icon-arrow-down"
            />
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="edit"><i class="el-icon-edit-outline" />编辑</el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('启用')|| roles.includes('admin')"
                command="enable"
                :disabled="row.enabled"
              ><i class="el-icon-video-play" />启用</el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('停用')|| roles.includes('admin')"
                command="disable"
                :disabled="!row.enabled"
              ><i class="el-icon-video-pause" />停用</el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('注销')|| roles.includes('admin')"
                command="delete"
                :disabled="row.enabled"
              ><i class="el-icon-delete" />删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
      :title="dialogStatus"
      :visible.sync="deleteFormVisible"
      :before-close="cancelDelete"
    >
      <el-form
        ref="deleteForm"
        :rules="deleteRules"
        :model="deleteConfirmStr"
        label-position="top"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        请输入 {{ dialogTemp.site.name }} 确认
        <el-form-item
          label=""
          prop="input"
        >
          <el-input
            v-model="deleteConfirmStr.input"
            placeholder=""
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelDelete()">
          关闭
        </el-button>
        <el-button
          type="danger"
          @click="deleteData()"
        >
          确认删除
        </el-button>
      </div>
    </el-dialog>
    <detailDialog
      :networking-id="networkingId"
      :dialog-status="dialogStatus"
      :dialog-is-view="dialogIsView"
      :edit-form-visible.sync="editFormVisible"
      @refresh-list="getList()"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchNetworking, updateNetworking, deleteNetworking, enableNetworking, disableNetworking } from '@/api/manager/networking'
import Pagination from '@/components/Pagination'
import detailDialog from './detailDialog'

export default {
  name: 'SiteManagementList',
  components: { Pagination, detailDialog },
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
      networkingId: '',
      regions: null,
      dialogTemp: {
        id: undefined,
        site: {
          id: undefined,
          name: undefined
        },
        startIp: undefined,
        endIp: undefined,
        gateway: undefined,
        mask: undefined,
        ip: {
          total: undefined,
          usedCnt: undefined
        },
        vlanId: undefined,
        topologies: undefined,
        cluster: {
          id: undefined,
          name: undefined
        },
        enabled: undefined,
        description: undefined,
        created: {
          user: undefined,
          timestamp: undefined
        },
        modified: {
          user: undefined,
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
  watch: {
    editFormVisible(newValue, oldValue) {
      if (newValue === false) {
        this.networkingId = ''
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
      this.listLoading = true
      fetchNetworking().then(response => {
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
        this.networkingId = row.id
      } else {
        this.dialogStatus = 'edit'
        this.dialogIsView = false
        this.networkingId = row.id
      }
      this.editFormVisible = true
    },
    handleRemoteStart(row) {
      this.$confirm('是否确认启动 ' + row.site.name + '下的网段', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        enableNetworking(row.id).then(response => {
          this.getList()
          this.$message.success('启用成功')
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleRemoteStop(row) {
      this.$confirm('是否确认停用 ' + row.site.name + '下的网段', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        disableNetworking(row.id).then(response => {
          this.getList()
          this.$message.success('停用成功')
        }).catch(error => {
          this.$message.info(error)
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleDelete(row) {
      this.dialogTemp = Object.assign({}, row)
      this.dialogStatus = 'delete'
      this.deleteFormVisible = true
      this.deleteConfirmExpect = this.dialogTemp.site.name
    },
    handleDropdown(command, row) {
      if (command === 'edit') {
        this.handleEdit(row, false)
      } else if (command === 'enable') {
        this.handleRemoteStart(row)
      } else if (command === 'disable') {
        this.handleRemoteStop(row)
      } else {
        this.handleDelete(row)
      }
    },
    cloneForUpdate() {
      return {
        id: this.dialogTemp.id,
        name: this.dialogTemp.name,
        domain: this.dialogTemp.domain,
        port: this.dialogTemp.port,
        desc: this.dialogTemp.desc,
        region: this.dialogTemp.region.code,
        modified_user: this.user_id
      }
    },
    updateData() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForUpdate(this.dialogTemp)
          updateNetworking(tempData.id, tempData).then(() => {
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
    addNewNetworking() {
      this.dialogIsView = false
      this.networkingId = ''
      this.editFormVisible = true
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
          deleteNetworking(this.dialogTemp.id).then(() => {
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
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
