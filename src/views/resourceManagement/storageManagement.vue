<template>
  <div class="app-container">

    <el-button v-if="roles.includes('新增') || roles.includes('admin')" type="primary" icon="el-icon-circle-plus-outline" size="small" round style="margin: 0 0 16px 16px;" @click="displayAddNewRemote()">增加</el-button>
    <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    <el-table v-loading="listLoading" :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="存储名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="所属站点" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.site.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="品牌型号" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.vendor.display }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="类型" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.type.display }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="使用率" width="auto">
        <template slot-scope="scope">
          <span>{{ (scope.row.usedSize + "/" + scope.row.totalSize) | usageFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="启用/停用" width="auto">
        <template slot-scope="{row}">
          <el-tag :type="row.enabled | enableDisableFilter">
            <i :class="row.enabled | enableDisableIcon" />
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.created.timestamp }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="任务状态" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.task.action.display + scope.row.task.status.display }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="roles.length !== 0" label="管理" width="auto">
        <template slot-scope="{row}">
          <el-dropdown trigger="click" :hide-on-click="false" @command="handleDropdown">
            <el-button type="primary">
              管理<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="roles.includes('资源池') || roles.includes('admin')" :command="'poolManagement/' + row.id + '/' + row.name"><i class="el-icon-setting" />存储池管理</el-dropdown-item>
              <el-dropdown-item v-if="roles.includes('启用') || roles.includes('admin')" :command="'enable/'+ row.id + '/' + row.name" :disabled="row.enabled"><i class="el-icon-open" />启用</el-dropdown-item>
              <el-dropdown-item v-if="roles.includes('停用') || roles.includes('admin')" :command="'disable/' + row.id + '/' + row.name" :disabled="!row.enabled"><i class="el-icon-turn-off" />停用</el-dropdown-item>
              <el-dropdown-item v-if="roles.includes('删除') || roles.includes('admin')" :command="'delete/' + row.id + '/' + row.name"><i class="el-icon-delete" />删除</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :current-page="currentPage" :page-sizes="[10, 20, 30]" :limit="parseInt(pagesize)" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" @pagination="handlePagination" />

    <el-drawer
      :title="drawer.title"
      :visible.sync="drawer.drawerVisible"
      direction="ltr"
      size="85%"
    >
      <el-button type="primary" icon="el-icon-circle-plus-outline" size="small" round style="margin: -30px 0 10px 16px;" @click="displayAddNewPool()">增加</el-button>

      <el-table v-loading="drawer.listLoading" :data="drawer.list.slice((drawer.currentPage-1)*drawer.pagesize,drawer.currentPage*drawer.pagesize)" fit highlight-current-row style="width: 100%;" size="small" :max-height="drawer.height">
        <el-table-column align="center" label="存储池名称" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.code }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="使用率" width="auto">
          <template slot-scope="scope">
            <span>{{ (scope.row.usedSize + "/" + scope.row.totalSize) | usageFilter }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="性能等级" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.performance.display }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="启用/停用" width="auto">
          <template slot-scope="{row}">
            <el-tag :type="row.enabled | enableDisableFilter">
              <i :class="row.enabled | enableDisableIcon" />
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" label="创建时间" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.created.timestamp }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="任务状态" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.task.action.display + scope.row.task.status.display }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="操作" width="auto">
          <template slot-scope="{row}">
            <el-button-group>
              <el-button type="success" icon="el-icon-circle-check" size="small" :disabled="row.enabled" circle @click="handlePoolStart(row)" />
              <el-button type="info" icon="el-icon-circle-close" size="small" :disabled="!row.enabled" circle @click="handlePoolStop(row)" />
              <el-button type="danger" icon="el-icon-remove" size="small" circle @click="handlePoolDelete(row)" />
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :current-page="drawer.currentPage" :page-sizes="[5, 10, 20]" :limit="parseInt(drawer.pagesize)" :total="drawer.total" @size-change="handleDrawerSizeChange" @current-change="handleDrawerCurrentChange" @pagination="handleDrawerPagination" />

    </el-drawer>

    <el-dialog :visible.sync="newRemoteFormVisible">
      <el-form ref="newRemoteForm" :model="dialogTemp" :rules="newRemoteRules" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="存储名称" prop="name">
          <el-input v-model="dialogTemp.name" />
        </el-form-item>
        <el-form-item label="所属站点" prop="siteId">
          <el-select v-model="dialogTemp.siteId" placeholder="请选择">
            <el-option
              v-for="item in sites"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="品牌" prop="vendorCode">
          <el-select v-model="dialogTemp.vendorCode" placeholder="请选择">
            <el-option
              v-for="item in remoteStorageVendors"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="dialogTemp.type" placeholder="请选择">
            <el-option
              v-for="item in remoteStorageTypes"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="IP" prop="ip">
          <el-input v-model="dialogTemp.ip" />
        </el-form-item>
        <el-form-item label="端口" prop="port">
          <el-input v-model="dialogTemp.port" />
        </el-form-item>
        <el-form-item label="用户名" prop="username">
          <el-input v-model="dialogTemp.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model.number="dialogTemp.password" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-switch
            v-model="dialogTemp.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogTemp.description" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newRemoteFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="handleAddNewRemote()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="deleteFormVisible" :before-close="cancelRemoteDelete">
      <el-form ref="deleteForm" :rules="deleteRules" :model="deleteConfirmStr" label-position="top" label-width="70px" style="width: 400px; margin-left:50px;">
        请输入 {{ dialogTemp.name }} 确认
        <el-form-item label="" prop="input">
          <el-input v-model="deleteConfirmStr.input" placeholder="" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelRemoteDelete()">
          关闭
        </el-button>
        <el-button type="danger" @click="handleRemoteDelete(dialogTemp.id)">
          确认删除
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="drawer.formVisible">
      <el-form ref="newRemotePoolForm" :model="drawer.temp" :rules="newRemotePoolRules" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="存储池名称" prop="code">
          <el-input v-model="drawer.temp.code" />
        </el-form-item>
        <el-form-item label="性能等级" prop="performance">
          <el-radio v-model="drawer.temp.performance" label="high">高性能</el-radio>
          <el-radio v-model="drawer.temp.performance" label="medium">中性能</el-radio>
          <el-radio v-model="drawer.temp.performance" label="low">低性能</el-radio>
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-switch
            v-model="drawer.temp.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="drawer.temp.description" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="drawer.formVisible = false">
          关闭
        </el-button>
        <el-button type="primary" @click="handleAddNewPool()">
          确认
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchRemoteStorages, addRemoteStorage, enableRemoteStorage, disableRemoteStorage, deleteRemoteStorage,
  fetchRemoteStoragePools, addRemoteStoragePools, enableRemoteStoragePools, disableRemoteStoragePools, deleteRemoteStoragePools } from '@/api/manager/storages'
import { fetchRemoteStorageVendors, fetchRemoteStorageTypes } from '@/api/selections'
import { fetchSites } from '@/api/manager/sites'
import Pagination from '@/components/Pagination'

export default {
  name: 'SiteManagementList',
  components: { Pagination },
  filters: {
    enableDisableFilter(status) {
      const stateMap = {
        true: 'success',
        false: 'danger'
      }
      return stateMap[status]
    },
    enableDisableIcon(status) {
      if (status) {
        return 'el-icon-circle-check'
      }
      return 'el-icon-circle-close'
    },
    usageFilter(input) {
      const inputs = input.split('/')
      const used_inG = inputs[0] / 1024.0
      const total_inG = inputs[1] / 1024.0
      const usage_pct = used_inG / total_inG * 100.0
      return usage_pct.toFixed(2) + '%(' + used_inG.toFixed(0) + 'G/' + total_inG.toFixed(0) + 'G)'
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
      drawer: {
        title: '',
        list: [],
        total: 0,
        currentPage: 1,
        pagesize: 10,
        listLoading: true,
        height: window.innerHeight - 210,
        drawerVisible: false,
        formVisible: false,
        remoteId: 1,
        temp: {
          name: '',
          performance: undefined,
          enabled: undefined,
          description: ''
        }
      },
      dialogIsView: false,
      newRemoteFormVisible: false,
      deleteFormVisible: false,
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      regions: null,
      dialogTemp: {
        name: '',
        siteId: '',
        vendorCode: '',
        type: '',
        ip: '',
        port: undefined,
        username: '',
        password: '',
        enabled: true,
        description: ''
      },
      sites: [],
      remoteStorageVendors: [],
      remoteStorageTypes: [],
      newRemoteRules: {
        name: [{ required: true, message: 'name is required', trigger: 'change' }],
        siteId: [{ required: true, message: 'siteId is required', trigger: 'change' }],
        vendorCode: [{ required: true, message: 'vendor is required', trigger: 'change' }],
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        ip: [{ required: true, message: 'ip is required', trigger: 'change', pattern: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/ }],
        port: [{ required: true, message: 'port range is (0,65535]', trigger: 'change', pattern: /\b([1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])\b/ }],
        username: [{ required: true, message: 'username is required', trigger: 'change' }],
        password: [{ required: true, message: 'password is required', trigger: 'change' }],
        enabled: [{ required: true, message: 'enabled is required', trigger: 'change' }]
      },
      newRemotePoolRules: {
        code: [{ required: true, message: 'name is required', trigger: 'change' }],
        performance: [{ required: true, message: 'siteId is required', trigger: 'change' }]
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
    this.getRemoteList()
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler)
  },
  mounted() {
    window.addEventListener('resize', this.resizeHandler)
  },
  methods: {
    refresh() {
      this.getRemoteList()
    },
    resizeHandler() {
      this.drawer.height = window.innerHeight - 210
    },
    getRemoteList() {
      this.listLoading = true
      fetchRemoteStorages().then(response => {
        this.list = response.data
        this.total = response.data.length
        this.listLoading = false
      })
    },
    getPoolList(remote_id) {
      this.drawer.listLoading = true
      this.drawer.title = '存储管理 ' + remote_id
      this.drawer.remoteId = remote_id
      fetchRemoteStoragePools(remote_id).then(response => {
        this.drawer.list = response.data
        this.drawer.total = response.data.length
        this.drawer.listLoading = false
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
    handleDrawerSizeChange(val) {
      this.drawer.pagesize = val
    },
    handleDrawerCurrentChange(val) {
      this.drawer.currentPage = val
    },
    handleDrawerPagination(val) {
      this.drawer.currentPage = val.page
      this.drawer.pagesize = val.limit
    },
    handleDropdown(command) {
      const strs = command.split('/')
      const remote_id = strs[1]
      const remote_name = strs[2]
      if (strs[0] === 'poolManagement') {
        this.openPoolDrawer(remote_id)
      } else if (strs[0] === 'enable') {
        this.handleRemoteStart(remote_id, remote_name)
      } else if (strs[0] === 'disable') {
        this.handleRemoteStop(remote_id, remote_name)
      } else {
        this.dialogTemp.id = remote_id
        this.dialogTemp.name = remote_name
        this.deleteFormVisible = true
        this.deleteConfirmExpect = remote_name
      }
    },
    openPoolDrawer(remote_id) {
      this.drawer.drawerVisible = true
      this.drawer.remoteId = remote_id
      this.getPoolList(remote_id)
    },
    cloneForNewPool(input) {
      if (input.enabled === undefined) {
        input.enabled = false
      }
      return {
        code: input.code,
        performance: input.performance,
        enabled: input.enabled,
        description: input.description,
        created_user: this.user_id
      }
    },
    cloneForNewRemote(input) {
      const res = input
      res.created_user = this.user_id
      return res
    },
    cancelRemoteDelete() {
      this.newRemoteFormVisible = false
      this.deleteFormVisible = false
      this.deleteConfirmExpect = ''
      this.deleteConfirmStr = {
        input: ''
      }
    },
    handleRemoteStart(remote_id, remote_name) {
      this.$confirm('是否确认启动 ' + remote_name, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        enableRemoteStorage(remote_id).then(_ => {
          this.getRemoteList()
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleRemoteStop(remote_id, remote_name) {
      this.$confirm('是否确认停用 ' + remote_name, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        disableRemoteStorage(remote_id).then(_ => {
          this.getRemoteList()
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleRemoteDelete() {
      this.$refs['deleteForm'].validate((valid) => {
        if (valid) {
          deleteRemoteStorage(this.dialogTemp.id).then(() => {
            this.getRemoteList()
            this.cancelRemoteDelete()
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
    displayAddNewRemote() {
      this.newRemoteFormVisible = true
      this.deleteFormVisible = false
      this.drawer.formVisible = false

      fetchSites().then(response => {
        this.sites = response.data
      })
      fetchRemoteStorageVendors().then(response => {
        this.remoteStorageVendors = response.data
      })
      fetchRemoteStorageTypes().then(response => {
        this.remoteStorageTypes = response.data
      })
    },
    handleAddNewRemote() {
      this.$refs['newRemoteForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForNewRemote(this.dialogTemp)
          addRemoteStorage(tempData).then(() => {
            this.getRemoteList()
            this.newRemoteFormVisible = false
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
    displayAddNewPool() {
      this.drawer.formVisible = true
    },
    handleAddNewPool() {
      this.$refs['newRemotePoolForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForNewPool(this.drawer.temp)
          addRemoteStoragePools(this.drawer.remoteId, tempData).then(_ => {
            this.getPoolList(this.drawer.remoteId)
            this.drawer.formVisible = false
          })
        }
      })
    },
    handlePoolStart(row) {
      this.$confirm('是否确认启动 ' + row.code, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        enableRemoteStoragePools(this.drawer.remoteId, row.id).then(_ => {
          this.getPoolList(this.drawer.remoteId)
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handlePoolStop(row) {
      this.$confirm('是否确认停用 ' + row.code, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        disableRemoteStoragePools(this.drawer.remoteId, row.id).then(_ => {
          this.getPoolList(this.drawer.remoteId)
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handlePoolDelete(row) {
      this.$confirm('是否确认删除 ' + row.code, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteRemoteStoragePools(this.drawer.remoteId, row.id).then(_ => {
          this.getPoolList(this.drawer.remoteId)
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    }
  }
}
</script>

<style scoped>
</style>
