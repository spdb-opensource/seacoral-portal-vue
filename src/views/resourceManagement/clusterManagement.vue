
<template>
  <div class="app-container">

    <el-button type="primary" icon="el-icon-circle-plus-outline" size="small" round style="margin: 0 0 16px 16px;" @click="displayAddNewRemote()">增加</el-button>
    <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    <el-table v-loading="listLoading" :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="站点名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.site.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="区域名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.area.display }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="集群名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="包含软件类型" width="auto">
        <template slot-scope="scope">
          <span v-for="v in scope.row.imageTypes" :key="v">{{ v }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="高可用标签" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.haTag }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="关联网段" width="auto">
        <template slot-scope="scope">
          <span v-for="item in scope.row.networkings" :key="item.name">
            {{ item.name }}
          </span>
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

      <el-table-column
        fixed="right"
        label="管理"
        align="center"
        width="auto"
      >
        <template slot-scope="scope">
          <el-button v-if="roles.includes('编辑') || roles.includes('admin')" type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="text" size="small" @click="handleView(scope.row)">查看</el-button>
          <el-dropdown size="mini" type="text" :hide-on-click="false">
            <span class="el-button--text el-button--small el-button--text el-button">
              更多<i class="el-icon-arrow-down el-icon--right" />
            </span>
            <el-dropdown-menu v-if="roles.length !== 0" slot="dropdown">
              <el-dropdown-item v-if="roles.includes('启用') || roles.includes('admin')"><el-button type="text" size="small" :disabled="scope.row.enabled" @click="handleRemoteStart(scope.row.id, scope.row.name)">启用</el-button></el-dropdown-item>
              <el-dropdown-item v-if="roles.includes('停用') || roles.includes('admin')"><el-button type="text" size="small" :disabled="!scope.row.enabled" @click="handleRemoteStop(scope.row.id, scope.row.name)">停用</el-button></el-dropdown-item>
              <el-dropdown-item v-if="roles.includes('删除') || roles.includes('admin')"><el-button type="text" size="small" @click="handleDelete(scope.row)">删除</el-button></el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total>0" :current-page="currentPage" :page-sizes="[10, 20, 30]" :limit="parseInt(pagesize)" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" @pagination="handlePagination" />

    <el-dialog :visible.sync="newRemoteFormVisible">
      <el-form ref="newRemoteForm" :model="dialogTemp" :rules="newRemoteRules" label-position="left" label-width="100px" style="width: 500px; margin-left:40px;">
        <el-form-item label="所属站点" prop="siteId">
          <el-select v-model="dialogTemp.siteId" placeholder="请选择" :disabled="!newOrUpdate">
            <el-option
              v-for="item in sites"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属区域" prop="areaCode">
          <el-select v-model="dialogTemp.areaCode" placeholder="请选择">
            <el-option
              v-for="item in areas"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="集群名称" prop="name">
          <el-input v-model="dialogTemp.name" />
        </el-form-item>
        <el-form-item label="包含软件" prop="imageTypes">
          <el-select v-model="dialogTemp.imageTypes" multiple placeholder="请选择">
            <el-option
              v-for="item in imageTypesList"
              :key="item.id"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="高可用标签" prop="haTag">
          <el-input v-model="dialogTemp.haTag" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-switch
            v-model="dialogTemp.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :disabled="!newOrUpdate"
          />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogTemp.description" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newRemoteFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleAddNewRemote()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="viewFrom">
      <el-form
        ref="viewRemoteForm"
        :model="dialogTempView"
        label-position="left"
        label-width="90px"
        style="width: 520px; margin-left:30px;"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属站点" prop="site.id">
              <el-select v-model="dialogTempView.site.id" placeholder="请选择" disabled>
                <el-option
                  v-for="item in sites"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="所属区域" prop="area.code">
              <el-select v-model="dialogTempView.area.code" placeholder="请选择" disabled>
                <el-option
                  v-for="item in areas"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="集群名称" prop="name">
              <el-input v-model="dialogTempView.name" class="view-input" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="包含软件" prop="imageTypes">
              <el-select v-model="dialogTempView.imageTypes" multiple placeholder="请选择" disabled>
                <el-option
                  v-for="item in imageTypesList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="高可用标签" prop="haTag">
              <el-input v-model="dialogTempView.haTag" class="view-input" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否启用" prop="enabled">
              <el-switch
                v-model="dialogTempView.enabled"
                disabled
                active-color="#13ce66"
                inactive-color="#ff4949"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="NFS IP" prop="nfs_ip">
              <el-input v-model="dialogTempView.nfs_ip" class="view-input" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="NFS源目录" prop="nfs_source">
              <el-input v-model="dialogTempView.nfs_source" class="view-input" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="NFS挂载参数" prop="nfs_opts" label-width="100px">
              <el-input v-model="dialogTempView.nfs_opts" class="view-input" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-form-item label="描述" prop="description">
            <el-input v-model="dialogTempView.description" type="textarea" disabled />
          </el-form-item>
        </el-row> -->

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="创建者" prop="created.username">
              <el-input v-model="dialogTempView.created.user" class="view-input" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="创建时间" prop="created.timestamp">
              <el-input v-model="dialogTempView.created.timestamp" class="view-input" disabled />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="更新者" prop="modified.username">
              <el-input v-model="dialogTempView.modified.username" class="view-input" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="更新时间" prop="modified.timestamp">
              <el-input v-model="dialogTempView.modified.timestamp" class="view-input" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer">
        <el-button @click="viewFrom = false">
          取消
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
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchClusters, deleteClusters, enableRemoteCluster, disableRemoteCluster, addRemoteCluster, updateClusters } from '@/api/manager/clusters'
import { fetchAreas } from '@/api/selections'
import { fetchSites } from '@/api/manager/sites'
import { fetchImageTypes } from '@/api/manager/images'
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
      newRemoteFormVisible: false,
      deleteFormVisible: false,
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      regions: [],
      dialogTemp: {
        name: '',
        siteId: '',
        areaCode: '',
        imageTypes: [],
        haTag: '',
        enabled: true,
        description: ''
      },
      dialogTempView: {
        id: '',
        name: '',
        site: {
          id: '',
          name: ''
        },
        area: {
          code: '',
          display: ''
        },
        imageTypes: [],
        haTag: '',
        networkings: {
          id: '',
          name: ''
        },
        enabled: true,
        description: '',
        created: {
          username: '',
          timestamp: ''
        },
        modified: {
          username: '',
          timestamp: ''
        }

      },
      sites: [],
      areas: [],
      newOrUpdate: true,
      clustersId: '',
      imageTypesList: [],
      viewFrom: false,
      newRemoteRules: {
        name: [{ required: true, message: 'name is required', trigger: 'change' }],
        siteId: [{ required: true, message: 'siteId is required', trigger: 'change' }],
        areaCode: [{ required: true, message: 'areaCode is required', trigger: 'change' }],
        imageTypes: [{ required: true, message: 'imageTypes is required', trigger: 'change' }],
        haTag: [{ required: true, message: 'haTag is required', trigger: 'change' }],
        enabled: [{ required: true, message: 'enabled is required', trigger: 'change' }]
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
    this.getSitesList()
    this.getAreaList()
    this.getImgTypesList()
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
      this.getSitesList()
      this.getAreaList()
      this.getImgTypesList()
    },
    resizeHandler() {
      this.drawer.height = window.innerHeight - 210
    },
    getRemoteList() {
      this.listLoading = true
      fetchClusters().then(response => {
        this.list = response.data
        this.total = response.data.length
        this.listLoading = false
      })
    },
    getSitesList() {
      fetchSites().then(response => {
        this.sites = response.data
      })
    },
    getAreaList() {
      fetchAreas().then(response => {
        this.areas = response.data
      })
    },
    getImgTypesList() {
      fetchImageTypes().then(response => {
        this.imageTypesList = response.data
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
    handleDelete(row) {
      this.$confirm('是否确认删除集群 ' + row.name, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteClusters(row.id).then(_ => {
          this.getRemoteList()
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleEdit(row) {
      this.newRemoteFormVisible = true
      this.dialogTemp.name = row.name
      this.dialogTemp.siteId = row.site.name
      this.dialogTemp.areaCode = row.area.code
      this.dialogTemp.imageTypes = row.imageTypes
      this.dialogTemp.haTag = row.haTag
      this.dialogTemp.description = row.description
      this.dialogTemp.enabled = row.enabled
      this.clustersId = row.id
      this.newOrUpdate = false
    },
    handleView(row) {
      this.viewFrom = true
      this.dialogTempView = Object.assign({}, row)
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
        enableRemoteCluster(remote_id).then(_ => {
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
        disableRemoteCluster(remote_id).then(_ => {
          this.getRemoteList()
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleRemoteDelete() {
      this.$refs['deleteForm'].validate((valid) => {
        if (valid) {
          deleteClusters(this.dialogTemp.id).then(() => {
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
      this.dialogTemp = {
        name: '',
        siteId: '',
        areaCode: '',
        imageTypes: [],
        haTag: '',
        enabled: true,
        description: ''
      }
      this.newRemoteFormVisible = true
      this.deleteFormVisible = false
      this.newOrUpdate = true
    },
    handleAddNewRemote() {
      this.$refs['newRemoteForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForNewRemote(this.dialogTemp)
          if (this.newOrUpdate) {
            addRemoteCluster(tempData).then(() => {
              this.getRemoteList()
              this.newRemoteFormVisible = false
              this.$notify({
                title: 'Success',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            updateClusters(this.clustersId, tempData).then(() => {
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
        }
      })
    }
  }
}
</script>

<style scoped>
  .view-input {
    width: 160px;
  }
</style>
