
<template>
  <div class="app-container">

    <el-tabs v-model="activeTab" type="card">
      <el-tab-pane name="first">
        <span slot="label">NFS</span>
        <el-button type="primary" icon="el-icon-circle-plus-outline" size="small" round style="margin: 0 0 16px 16px;" @click="displayAddNFS()">增加</el-button>
        <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
        <el-table v-loading="listLoading" :data="nfsFilteredList" border fit highlight-current-row style="width: 100%">
          <el-table-column align="center" label="站点名称" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.siteName }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="名称" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="创建者" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.createdUser }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="IP" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.config.nfs_ip }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="源目录" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.config.nfs_source }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="可选参数" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.config.nfs_opts }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="启用/停用" width="auto">
            <template slot-scope="{row}">
              <el-tag :type="row.enabled | enableDisableFilter">
                <i :class="row.enabled | enableDisableIcon" />
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="管理" align="center" width="auto">
            <template slot-scope="scope">
              <el-dropdown size="mini" type="text" :hide-on-click="false">
                <span class="el-button--text el-button--small el-button--text el-button">
                  更多<i class="el-icon-arrow-down el-icon--right" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <el-button type="text" size="small" :disabled="scope.row.enabled" @click="enableEndpoint(scope.row)">启用</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button type="text" size="small" :disabled="!scope.row.enabled" @click="disableEndpoint(scope.row)">停用</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button type="text" size="small" @click="displayNFS(scope.row)">查看</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button type="text" size="small" :disabled="scope.row.enabled" @click="displayUpdateNFS(scope.row)">编辑</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button type="text" size="small" @click="handleDeleteEndpoint(scope.row)">删除</el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane name="second">
        <span slot="label">S3</span>
        <el-button type="primary" icon="el-icon-circle-plus-outline" size="small" round style="margin: 0 0 16px 16px;" @click="displayAddS3()">增加</el-button>
        <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
        <el-table v-loading="listLoading" :data="s3List" border fit highlight-current-row style="width: 100%">
          <el-table-column align="center" label="站点名称" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.siteName }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="名称" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="创建者" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.createdUser }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="URL" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.config.s3_url }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="Bucket" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.config.s3_bucket }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="Access Key" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.config.s3_access_key }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="Secret Key" width="auto">
            <template slot-scope="scope">
              <span>{{ scope.row.config.s3_secret_key }}</span>
            </template>
          </el-table-column>
          <el-table-column align="center" label="启用/停用" width="auto">
            <template slot-scope="{row}">
              <el-tag :type="row.enabled | enableDisableFilter">
                <i :class="row.enabled | enableDisableIcon" />
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="管理" align="center" width="auto">
            <template slot-scope="scope">
              <el-dropdown size="mini" type="text" :hide-on-click="false">
                <span class="el-button--text el-button--small el-button--text el-button">
                  更多<i class="el-icon-arrow-down el-icon--right" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <el-button type="text" size="small" @click="displayS3(scope.row)">查看</el-button>                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button type="text" size="small" :disabled="scope.row.enabled" @click="displayUpdateS3(scope.row)">编辑</el-button>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <el-button type="text" size="small" @click="handleDeleteEndpoint(scope.row)">删除</el-button>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <Pagination
      v-show="total> 0"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30]"
      :limit="parseInt(pagesize)"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @pagination="handlePagination"
    />

    <el-dialog :visible.sync="NFSFormVisible">
      <el-form ref="NFSForm" :model="dialogTemp" :rules="NFSRules" label-position="left" label-width="100px" style="width: 500px; margin-left:40px;">
        <el-form-item label="所属站点" prop="site_id">
          <el-select v-model="dialogTemp.site_id" placeholder="请选择" :disabled="formStatus > 1">
            <el-option
              v-for="item in sites"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="dialogTemp.name" :disabled="formStatus > 0" />
        </el-form-item>
        <el-form-item label="NFS IP" prop="config.nfs_ip" label-width="100px">
          <el-input v-model="dialogTemp.config.nfs_ip" :disabled="formStatus > 1" />
        </el-form-item>
        <el-form-item label="NFS 源目录" prop="config.nfs_source" label-width="100px">
          <el-input v-model="dialogTemp.config.nfs_source" :disabled="formStatus > 1" />
        </el-form-item>
        <el-form-item label="NFS 可选参数" prop="config.nfs_opts" label-width="100px">
          <el-input v-model="dialogTemp.config.nfs_opts" :disabled="formStatus > 1" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-switch
            v-model="dialogTemp.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :disabled="formStatus > 1"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="NFSFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :disabled="formStatus > 1" @click="handleEditNFS()">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="S3FormVisible">
      <el-form ref="newS3Form" :model="dialogTemp" :rules="S3Rules" label-position="left" label-width="100px" style="width: 500px; margin-left:40px;">
        <el-form-item label="所属站点" prop="site_id">
          <el-select v-model="dialogTemp.site_id" placeholder="请选择" :disabled="formStatus > 1">
            <el-option
              v-for="item in sites"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="dialogTemp.name" :disabled="formStatus > 0" />
        </el-form-item>
        <el-form-item label="S3 URL" prop="config.s3_url" label-width="100px">
          <el-input v-model="dialogTemp.config.s3_url" :disabled="formStatus > 1" />
        </el-form-item>
        <el-form-item label="S3 Bucket" prop="config.s3_bucket" label-width="100px">
          <el-input v-model="dialogTemp.config.s3_bucket" :disabled="formStatus > 1" />
        </el-form-item>
        <el-form-item label="S3 Access Key" prop="config.s3_access_key" label-width="100px">
          <el-input v-model="dialogTemp.config.s3_access_key" :disabled="formStatus > 1" />
        </el-form-item>
        <el-form-item label="S3 Secret Key" prop="config.s3_secret_key" label-width="100px">
          <el-input v-model="dialogTemp.config.s3_secret_key" :disabled="formStatus > 1" />
        </el-form-item>
        <el-form-item label="是否启用" prop="enabled">
          <el-switch
            v-model="dialogTemp.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
            :disabled="formStatus > 1"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="S3FormVisible = false">
          取消
        </el-button>
        <el-button type="primary" :disabled="formStatus > 1" @click="handleEditS3()">
          保存
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchSites } from '@/api/manager/sites'
import { fetchBackupFileEndPoints, addBackupFileEndPoint, updateBackupFileEndPoint, deleteBackupFileEndPoint } from '@/api/manager/backupEndpoints'
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
      const stateMap = {
        true: 'el-icon-circle-check',
        false: 'el-icon-circle-close'
      }
      return stateMap[status]
    }
  },
  data() {
    return {
      activeTab: 'first',
      roles: this.$router.currentRoute.meta.roles,
      list: [],
      nfsList: [],
      s3List: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      dialogIsView: false,
      NFSFormVisible: false,
      S3FormVisible: false,
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      sites: [],
      dialogTemp: {
        name: '',
        site_id: '',
        type: '',
        enabled: false,
        config: {
          nfs_ip: '',
          nfs_source: '',
          nfs_opts: '',
          s3_url: '',
          s3_bucket: '',
          s3_access_key: '',
          s3_secret_key: ''
        }
      },
      newOrUpdate: true,
      formStatus: 0, // 0:add 1:update 2:view
      viewFrom: false,
      NFSRules: {
        'site_id': [{ required: true, message: '站点ID不能为空', trigger: 'blur' }],
        'name': [{ required: true, message: '备份名称不能为空', trigger: 'blur' }],

        'config.nfs_ip': [{ required: true, message: 'NFS IP不能为空', trigger: 'blur' }],
        'config.nfs_source': [{ required: true, message: 'NFS源目录不能为空', trigger: 'blur' }]
      },
      S3Rules: {
        'site_id': [{ required: true, message: '站点ID不能为空', trigger: 'blur' }],
        'name': [{ required: true, message: '备份名称不能为空', trigger: 'blur' }],

        'config.s3_url': [{ required: true, message: 'S3 URL 不能为空', trigger: 'blur' }],
        'config.s3_bucket': [{ required: true, message: 'S3 Bucket 不能为空', trigger: 'blur' }],
        'config.s3_access_key': [{ required: true, message: 'S3 Access key 不能为空', trigger: 'blur' }],
        'config.s3_secret_key': [{ required: true, message: 'S3 Secret Key 不能为空', trigger: 'blur' }]
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
    nfsFilteredList() {
      return this.nfsList.slice((this.currentPage - 1) * this.pagesize, this.currentPage * this.pagesize)
    },
    s3FilteredList() {
      return this.s3List.slice((this.currentPage - 1) * this.pagesize, this.currentPage * this.pagesize)
    }
  },
  created() {
    this.getList()
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler)
  },
  mounted() {
    window.addEventListener('resize', this.resizeHandler)
  },
  methods: {
    refresh() {
      this.getList()
    },
    getList() {
      this.listLoading = true
      this.nfsList = []
      this.s3List = []
      fetchBackupFileEndPoints().then(response => {
        this.list = response.data
        fetchSites().then(response => {
          this.sites = response.data
          for (let i = 0; i < this.list.length; i++) {
            this.list[i].enabled = (this.list[i].enabled === 'true')
            for (let j = 0; j < this.sites.length; j++) {
              if (this.list[i].siteId === this.sites[j].id) {
                this.$set(this.list[i], 'siteName', this.sites[j].name)
                break
              }
            }
            if (this.list[i].type === 'nfs') {
              this.nfsList.push(this.list[i])
            } else if (this.list[i].type === 's3') {
              this.s3List.push(this.list[i])
            }
          }
        })
      })
      this.listLoading = false
    },
    getSitesList() {
      fetchSites().then(response => {
        this.sites = response.data
      })
    },
    cloneForNewNFS(input) {
      const res = JSON.parse(JSON.stringify(input))
      return res
    },
    displayNFS(row) {
      this.dialogTemp = {
        id: row.id,
        name: row.name,
        site_id: row.siteId,
        siteName: row.siteName,
        type: row.type,
        enabled: (row.enabled === 'true'),
        config: {
          nfs_ip: row.config.nfs_ip,
          nfs_source: row.config.nfs_source,
          nfs_opts: row.config.nfs_opts
        }
      }

      this.NFSFormVisible = true
      this.formStatus = 2
    },
    displayAddNFS() {
      this.dialogTemp = {
        name: '',
        site_id: '',
        type: 'NFS',
        enabled: false,
        config: {
          nfs_ip: '',
          nfs_source: '',
          nfs_opts: ''
        }
      }
      this.NFSFormVisible = true
      this.formStatus = 0
    },
    displayUpdateNFS(row) {
      this.dialogTemp = {
        id: row.id,
        name: row.name,
        site_id: row.siteId,
        siteName: row.siteName,
        type: row.type,
        enabled: (row.enabled === 'true'),
        config: {
          nfs_ip: row.config.nfs_ip,
          nfs_source: row.config.nfs_source,
          nfs_opts: row.config.nfs_opts
        }
      }
      this.NFSFormVisible = true
      this.formStatus = 1
    },
    handleEditNFS() {
      this.$refs['NFSForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForNewNFS(this.dialogTemp)
          if (this.formStatus === 0) {
            addBackupFileEndPoint(tempData).then(() => {
              this.getList()
              this.NFSFormVisible = false
              this.$notify({
                title: 'Success',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            updateBackupFileEndPoint(this.dialogTemp.id, tempData).then(() => {
              this.getList()
              this.NFSFormVisible = false
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
    },

    cloneForNewS3(input) {
      const res = JSON.parse(JSON.stringify(input))
      return res
    },
    displayS3(row) {
      this.dialogTemp = {
        id: row.id,
        name: row.name,
        site_id: row.siteId,
        siteName: row.siteName,
        type: row.type,
        enabled: (row.enabled === 'true'),
        config: {
          s3_url: row.config.s3_url,
          s3_bucket: row.config.s3_bucket,
          s3_access_key: row.config.s3_access_key,
          s3_secret_key: row.config.s3_secret_key
        }
      }
      this.S3FormVisible = true
      this.formStatus = 2
    },
    displayAddS3() {
      this.dialogTemp = {
        name: '',
        site_id: '',
        type: 'S3',
        enabled: false,
        config: {
          s3_url: '',
          s3_bucket: '',
          s3_access_key: '',
          s3_secret_key: ''
        }
      }
      this.S3FormVisible = true
      this.formStatus = 0
    },
    displayUpdateS3(row) {
      this.dialogTemp = {
        id: row.id,
        name: row.name,
        site_id: row.siteId,
        siteName: row.siteName,
        type: row.type,
        enabled: (row.enabled === 'true'),
        config: {
          s3_url: row.config.s3_url,
          s3_bucket: row.config.s3_bucket,
          s3_access_key: row.config.s3_access_key,
          s3_secret_key: row.config.s3_secret_key
        }
      }
      this.S3FormVisible = true
      this.formStatus = 1
    },
    handleEditS3() {
      this.$refs['newS3Form'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForNewS3(this.dialogTemp)
          if (this.formStatus === 0) {
            addBackupFileEndPoint(tempData).then(() => {
              this.getList()
              this.S3FormVisible = false
              this.$notify({
                title: 'Success',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            updateBackupFileEndPoint(this.dialogTemp.id, tempData).then(() => {
              this.getList()
              this.S3FormVisible = false
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
    },

    enableEndpoint(row) {
      this.dialogTemp = JSON.parse(JSON.stringify(row))
      this.dialogTemp.enabled = true
      this.dialogTemp.site_id = this.dialogTemp.siteId
      updateBackupFileEndPoint(this.dialogTemp.id, this.dialogTemp).then(() => {
        this.getList()
        this.$notify({
          title: 'Success',
          message: '启用成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    disableEndpoint(row) {
      this.dialogTemp = JSON.parse(JSON.stringify(row))
      this.dialogTemp.enabled = false
      this.dialogTemp.site_id = this.dialogTemp.siteId
      updateBackupFileEndPoint(this.dialogTemp.id, this.dialogTemp).then(() => {
        this.getList()
        this.$notify({
          title: 'Success',
          message: '停止成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    handleDeleteEndpoint(row) {
      this.$confirm('是否确认删除集群 ' + row.name, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteBackupFileEndPoint(row.id).then(_ => {
          this.getList()
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

    resizeHandler() {
      // this.drawer.height = window.innerHeight - 210
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
    }
  }
}
</script>

<style scoped>
  .view-input {
    width: 160px;
  }
</style>
