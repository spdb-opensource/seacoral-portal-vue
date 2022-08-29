<template>
  <div class="app-container">

    <el-button
      v-if="roles.includes('新增') || roles.includes('admin')"
      type="primary"
      icon="el-icon-circle-plus-outline"
      size="small"
      round
      style="margin: 0 0 16px 16px;"
      @click="displayAddNewImage()"
    >增加
    </el-button>
    <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >

      <el-table-column align="center" label="类型" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.type }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="版本" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.version.major }}.{{ scope.row.version.minor }}.{{ scope.row.version.patch }}.{{ scope.row.version.build }}-{{ scope.row.architecture }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="站点名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.site.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="启用/停用" width="auto">
        <template slot-scope="{row}">
          <el-tag :type="row.unschedulable | enableDisableFilter">
            <i :class="row.unschedulable | enableDisableIcon" />
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.created.timestamp }}</span>
        </template>
      </el-table-column>
      <!--
      <el-table-column align="center" label="任务状态" width="auto">
        <template slot-scope="scope">
          <span v-if="scope.row.task.id !== ''">{{ scope.row.task.action.display + scope.row.task.status.display }}</span>
          <span v-else>无任务</span>
        </template>
      </el-table-column> -->

      <el-table-column label="管理" width="auto">
        <template slot-scope="{row}">
          <el-dropdown trigger="click" :hide-on-click="false" @command="handleDropdown">
            <el-button type="primary">
              管理<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="'viewCfg/' + row.id + '/' + row.type + '/' + formatVersion(row.version)"><i
                class="el-icon-setting"
              />配置
              </el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('启用') || roles.includes('admin')"
                :command="'enable/'+ row.id + '/' + row.type + '/' + formatVersion(row.version)"
                :disabled="!row.unschedulable"
              ><i class="el-icon-open" />启用
              </el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('停用') || roles.includes('admin')"
                :command="'disable/' + row.id + '/' + row.type + '/' + formatVersion(row.version)"
                :disabled="row.unschedulable"
              ><i class="el-icon-turn-off" />停用
              </el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('删除') || roles.includes('admin')"
                :command="'delete/' + row.id + '/' + row.type + '/' + formatVersion(row.version)"
                :disabled="!row.unschedulable"
              ><i
                class="el-icon-delete"
              />删除
              </el-dropdown-item>
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

    <el-drawer
      :title="drawer.title"
      :visible.sync="drawer.drawerVisible"
      direction="ltr"
      size="85%"
    >

      <div class="filter-container" style="margin: -20px 0 0 10px;">
        <el-input v-model="listQuery.key" placeholder="参数" style="width: 200px;" @keyup.enter.native="handleFilter" />
        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          搜索
        </el-button>
      </div>
      <el-table
        v-loading="drawer.listLoading"
        :data="drawer.list.slice((drawer.currentPage-1)*drawer.pagesize,drawer.currentPage*drawer.pagesize)"
        fit
        highlight-current-row
        style="width: 100%;"
        size="mini"
        :max-height="drawer.height"
      >
        <el-table-column align="center" label="参数" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.key }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="当前值" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.value }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="默认值" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.defaultValue }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="范围" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.range }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="运行编辑" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.canset }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="重启生效" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.mustRestart }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total>0"
        :current-page="drawer.currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :limit="parseInt(drawer.pagesize)"
        :total="drawer.total"
        @size-change="handleDrawerSizeChange"
        @current-change="handleDrawerCurrentChange"
        @pagination="handleDrawerPagination"
      />

    </el-drawer>

    <el-dialog :visible.sync="newImageFormVisible">
      <el-form
        ref="newImageForm"
        :model="dialogTemp"
        :rules="newImageRules"
        label-position="left"
        label-width="90px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item label="类型" prop="type">
          <el-select v-model="dialogTemp.type" placeholder="请选择">
            <el-option
              v-for="item in imageTypes"
              :key="item.id"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="所属站点" prop="site_id">
          <el-select v-model="dialogTemp.site_id" placeholder="请选择">
            <el-option
              v-for="item in sites"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="版本" prop="version">
          <el-input v-model="dialogTemp.version.major" type="number" size="mini" style="width: 60px" />
          <el-input v-model="dialogTemp.version.minor" type="number" size="mini" style="width: 60px" />
          <el-input v-model="dialogTemp.version.patch" type="number" size="mini" style="width: 60px" />
          <el-input v-model="dialogTemp.version.build" type="number" size="mini" style="width: 60px" />
        </el-form-item>

        <el-form-item label="是否启用" prop="enabled">
          <el-switch
            v-model="dialogTemp.enabled"
            active-color="#13ce66"
            inactive-color="#ff4949"
          />
        </el-form-item>

        <el-form-item label="架构">
          <el-radio-group v-model="dialogTemp.architecture">
            <el-radio-button v-for="i in archOptions" :key="i.arch" :label="i.arch" :value="i.arch">{{ i.arch }}</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogTemp.description" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newImageFormVisible = false">
          关闭
        </el-button>
        <el-button type="primary" :loading="addNewImageLoading" @click="handleAddNewImage()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="deleteFormVisible" :before-close="cancelImageDelete">
      <el-form
        ref="deleteForm"
        :rules="deleteRules"
        :model="deleteConfirmStr"
        label-position="top"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        请输入 {{ deleteConfirmExpect }} 确认
        <el-form-item label="" prop="input">
          <el-input v-model="deleteConfirmStr.input" placeholder="" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelImageDelete()">
          关闭
        </el-button>
        <el-button type="danger" @click="handleImageDelete(dialogTemp.id)">
          确认删除
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  fetchImages,
  addImage,
  enableImage,
  disableImage,
  deleteImage,
  fetchImageConfig,
  fetchImageTypes
} from '@/api/manager/images'
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves' // waves directive
import { fetchSites } from '@/api/manager/sites'

export default {
  name: 'ImageManagementList',
  components: { Pagination },
  directives: { waves },
  filters: {
    enableDisableFilter(status) {
      const stateMap = {
        true: 'danger',
        false: 'success'
      }
      return stateMap[status]
    },
    enableDisableIcon(status) {
      if (status) {
        return 'el-icon-circle-close'
      }
      return 'el-icon-circle-check'
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
      addNewImageLoading: false,
      archOptions: [
        {
          arch: 'amd64'
        },
        {
          arch: 'arm'
        }
      ],
      drawer: {
        title: '',
        list: [],
        total: 0,
        currentPage: 1,
        pagesize: 10,
        listLoading: true,
        height: window.innerHeight - 210,
        drawerVisible: false,
        imageId: 1
      },
      listQuery: {
        key: '',
        list: []
      },
      dialogIsView: false,
      newImageFormVisible: false,
      deleteFormVisible: false,
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      dialogTemp: {
        id: '',
        type: '',
        site_id: '',
        version: {
          major: undefined,
          minor: undefined,
          patch: undefined,
          build: undefined
        },
        enabled: true,
        unschedulable: false,
        description: '',
        created: {
          user: undefined,
          timestamp: undefined
        },
        modified: {
          user: undefined,
          timestamp: undefined
        }
      },
      imageTypes: [],
      sites: [],
      newImageRules: {
        type: [{ required: true, message: 'name is required', trigger: 'change' }],
        site_id: [{ required: true, message: 'site_id is required', trigger: 'change' }],
        version: {
          type: 'object',
          required: true,
          fields: {
            major: [{
              required: true,
              message: 'major range is [0-999]',
              trigger: 'change',
              pattern: /^([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9])$/
            }],
            minor: [{
              required: true,
              message: 'minor range is [0-999]',
              trigger: 'change',
              pattern: /^([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9])$/
            }],
            patch: [{
              required: true,
              message: 'patch range is [0-999]',
              trigger: 'change',
              pattern: /^([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9])$/
            }],
            build: [{
              required: true,
              message: 'build range is [0-999]',
              trigger: 'change',
              pattern: /^([0-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9])$/
            }]
          }
        },
        unschedulable: [{ required: true, message: 'unschedulable is required', trigger: 'change' }],
        architecture: [{ required: true, message: 'unschedulable is required', trigger: 'change' }]
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
    this.getImageList()
    this.getSitesList()
  },
  destroyed() {
    window.removeEventListener('resize', this.resizeHandler)
  },
  mounted() {
    window.addEventListener('resize', this.resizeHandler)
  },
  methods: {
    refresh() {
      this.getImageList()
      this.getSitesList()
    },
    handleFilter() {
      const resultList = []
      const pattern = new RegExp(this.listQuery.key)
      for (const k of this.listQuery.list) {
        if (k.key.match(pattern)) {
          resultList.push(k)
        } else if (this.listQuery.key === '') {
          resultList.push(k)
        }
      }
      this.drawer.list = resultList
      this.drawer.total = resultList.length
      this.drawer.currentPage = 1
    },
    resizeHandler() {
      this.drawer.height = window.innerHeight - 210
    },
    getImageList() {
      this.listLoading = true
      fetchImages().then(response => {
        this.list = response.data
        this.total = response.data.length
        this.listLoading = false
      })
    },
    getImageCfg(image_id) {
      this.drawer.listLoading = true
      this.drawer.title = '镜像管理 ' + image_id
      fetchImageConfig(image_id).then(response => {
        this.drawer.list = response.data.keysets
        this.drawer.total = response.data.keysets.length
        this.listQuery.list = response.data.keysets
        this.drawer.listLoading = false
      })
    },
    getSitesList() {
      fetchSites().then(response => {
        this.sites = response.data
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
    resetTemp() {
      this.dialogTemp = {
        id: '',
        type: '',
        version: {
          major: undefined,
          minor: undefined,
          patch: undefined,
          build: undefined
        },
        architecture: '',
        enabled: true,
        unschedulable: false,
        description: '',
        created: {
          user: undefined,
          timestamp: undefined
        },
        modified: {
          user: undefined,
          timestamp: undefined
        }
      }
    },
    handleDropdown(command) {
      const strs = command.split('/')
      const image_id = strs[1]
      const image_type = strs[2]
      const image_version = strs[3]
      if (strs[0] === 'viewCfg') {
        this.openPoolDrawer(image_id)
      } else if (strs[0] === 'enable') {
        this.handleImageEnable(image_id, image_type, image_version)
      } else if (strs[0] === 'disable') {
        this.handleImageDisable(image_id, image_type, image_version)
      } else {
        this.dialogTemp.id = image_id
        this.deleteFormVisible = true
        this.deleteConfirmExpect = image_type + '/' + image_version
      }
    },
    openPoolDrawer(image_id) {
      this.drawer.drawerVisible = true
      this.drawer.imageId = image_id
      this.getImageCfg(image_id)
    },
    cloneForNewImage(input) {
      const res = {}
      res.type = input.type
      res.version = input.version
      res.site_id = input.site_id
      Object.keys(res.version).forEach(elememnt => {
        res.version[elememnt] = parseInt(res.version[elememnt])
      })
      res.architecture = input.architecture
      res.unschedulable = !input.enabled
      res.description = input.description
      res.created_user = this.user_id
      return res
    },
    cancelImageDelete() {
      this.newImageFormVisible = false
      this.deleteFormVisible = false
      this.deleteConfirmExpect = ''
      this.deleteConfirmStr = {
        input: ''
      }
    },
    formatVersion(image_version) {
      return image_version.major + '.' + image_version.minor + '.' + image_version.patch + '.' + image_version.build
    },
    handleImageEnable(image_id, image_type, image_version) {
      this.$confirm('是否确认启用 ' + image_type + ' ' + image_version + '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        enableImage(image_id).then(_ => {
          this.getImageList()
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleImageDisable(image_id, image_type, image_version) {
      this.$confirm('是否确认停用 ' + image_type + ' ' + image_version + '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        disableImage(image_id).then(_ => {
          this.getImageList()
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleImageDelete() {
      this.$refs['deleteForm'].validate((valid) => {
        if (valid) {
          deleteImage(this.dialogTemp.id).then(() => {
            this.getImageList()
            this.cancelImageDelete()
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
    displayAddNewImage() {
      this.resetTemp()
      this.newImageFormVisible = true
      this.deleteFormVisible = false
      this.drawer.formVisible = false

      fetchImageTypes().then(response => {
        this.imageTypes = response.data
      })
    },
    handleAddNewImage() {
      this.addNewImageLoading = true
      this.$refs['newImageForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForNewImage(this.dialogTemp)
          addImage(tempData).then(() => {
            this.getImageList()
            this.newImageFormVisible = false
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.addNewImageLoading = false
          })
        }
      })
    },
    displayAddNewPool() {
      this.drawer.formVisible = true
    }
  }
}
</script>

<style scoped>
</style>
