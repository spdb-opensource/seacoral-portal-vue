<template>
  <div class="app-container">
    <el-input
      v-model="search"
      size="mini"
      placeholder="搜索服务名称"
      style="margin-bottom: 5px; width: 200px;"
    />
    <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    <el-button
      type="success"
      icon="el-icon-check"
      size="small"
      round
      style="margin: 0 0 16px 16px;"
      :disabled="serviceSelections.length === 0 || batchStartDisabled"
      @click="batchStart()"
    >批量启动</el-button>
    <el-button
      type="danger"
      icon="el-icon-close"
      size="small"
      round
      style="margin: 0 0 16px 16px;"
      :disabled="serviceSelections.length === 0 || batchStopDisabled"
      @click="batchStop()"
    >批量停止</el-button>

    <el-table
      id="serviceTable"
      ref="serviceTable"
      v-loading="listLoading"
      :data="serviceTableDataList"
      border
      fit
      highlight-current-row
      style="width: 100%"
      size="mini"
      @selection-change="handleServiceSelectionChange"
    >
      <el-table-column
        type="selection"
        width="40px"
      />

      <el-table-column
        label="所属用户"
        width="auto"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.owner">{{ scope.row.owner.name }}({{ scope.row.owner.username }})</span>
        </template>
      </el-table-column>

      <el-table-column
        width="auto"
        min-width="50px"
        align="center"
        label="服务名称"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="80px"
        align="center"
        label="服务链接"
        width="130px"
      >
        <template slot-scope="scope">
          <!-- v-if中不可以嵌套循环 -->
          <!-- <span v-if="scope.row.status.cmha.services === null"> -->
          <span>
            <p v-for="i in scope.row.status.database.services[0].units" :key="i.id">
              {{ i.ip }}:{{ scope.row.status.database.services[0].ports[0].port }} </p>
          </span>
          <!-- <span v-else>
            <p v-for="i in scope.row.status.cmha.services[0].units" :key="i.id">
              {{ i.ip }}:{{ scope.row.status.cmha.services[0].ports[0].port }}</p>
          </span> -->
        </template>
      </el-table-column>

      <!--      <el-table-column-->
      <!--        width="auto"-->
      <!--        align="center"-->
      <!--        label="部署架构"-->
      <!--      >-->
      <!--        <template slot-scope="scope">-->
      <!--          <span v-if="scope.row.servs">{{ scope.row.servs[0].archTypeName }}</span>-->
      <!--        </template>-->
      <!--      </el-table-column>-->

      <el-table-column
        min-width="80px"
        width="auto"
        align="left"
        label="软件版本"
        :filters="softwareVersionList"
        :filter-method="softwareVersionFilterHandler"
      >
        <template slot-scope="scope">
          <span>
            <img class="icon" :src="iconMysql" title="mysql"> {{ scope.row.status.database.services[0].units | versionFormat }}
          </span>
          <span v-if="scope.row.status.cmha.services !== null">
            <el-divider class="iconDivider" />
            <img class="icon" :src="iconCmha" title="cmha"> {{ scope.row.status.cmha.services[0].units | versionFormat }}
            <el-divider class="iconDivider" />
            <img class="icon" :src="iconProxysql" title="proxysql"> {{ scope.row.status.proxy.services[0].units | versionFormat }}
          </span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="80px"
        width="auto"
        align="left"
        label="性能套餐"
      >
        <template slot-scope="scope">
          <span>
            <img class="icon" :src="iconMysql" title="mysql"> {{ scope.row.status.database.services[0].units | performanceFormat }}
          </span>
          <span v-if="scope.row.status.cmha.services !== null">
            <el-divider class="iconDivider" />
            <img class="icon" :src="iconCmha" title="cmha"> {{ scope.row.status.cmha.services[0].units | performanceFormat }}
            <el-divider class="iconDivider" />
            <img class="icon" :src="iconProxysql" title="proxysql"> {{ scope.row.status.proxy.services[0].units | performanceFormat }}
          </span>

        </template>
      </el-table-column>

      <el-table-column
        min-width="50px"
        align="center"
        label="存储类型"
      >
        <template slot-scope="scope">
          <span>
            <img
              :src="iconDisk[scope.row.spec.database.services.units.resources.requests.storage.type][scope.row.spec.database.services.units.resources.requests.storage.performance]"
              style="width: 60px; height: 50px; vertical-align: middle;"
            >
          </span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="50px"
        align="center"
        label="任务状态"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.task.action.display }} - {{ scope.row.task.status.display }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="状态"
        align="center"
        width="50px"
      >
        <template slot-scope="scope">
          <i
            v-if="scope.row.state === 'passing'"
            class="el-icon-success"
            style="color:green"
          />
          <i
            v-else-if="scope.row.state === 'warning'"
            class="el-icon-warning"
            style="color:gold"
          />
          <i
            v-else-if="scope.row.state === 'critical'"
            class="el-icon-error"
            style="color:red"
          />
          <i
            v-else
            class="el-icon-question"
            style="color:grey"
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
            v-if="roles.includes('管理') || roles.includes('admin')"
            plain
            size="small"
            icon="el-icon-setting"
            command="disable"
            :disabled="row.state === 'critical'"
            @click="handleConfig(row)"
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
              <el-dropdown-item
                v-if="roles.includes('启动') || roles.includes('admin')"
                command="enable"
                :disabled="row.state === 'passing'"
              ><i class="el-icon-video-play" />启动
              </el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('停止') || roles.includes('admin')"
                command="disable"
                :disabled="row.state === 'critical'"
              ><i class="el-icon-video-pause" />停止
              </el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('删除') || roles.includes('admin')"
                command="delete"
                :disabled="row.state === 'passing'"
              ><i class="el-icon-delete" />删除
              </el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('扩容') || roles.includes('admin')"
                command="expansion"
              ><i class="el-icon-plus" />扩容
              </el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('升级') || roles.includes('admin')"
                command="upgrade"
              ><i class="el-icon-arrow-up" />升级
              </el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('备份') || roles.includes('admin')"
                command="backup"
              ><i class="el-icon-takeaway-box" />备份
              </el-dropdown-item>
              <!-- <el-dropdown-item
                v-if="roles.includes('还原') || roles.includes('admin')"
                command="restore"
              ><i class="el-icon-refresh-left" />还原
              </el-dropdown-item> -->
              <!-- <el-dropdown-item
                v-if="roles.includes('设置为从') || roles.includes('admin')"
                command="roleChangeSlave"
              ><i class="el-icon-s-operation" />设置为从
              </el-dropdown-item> -->
              <el-dropdown-item
                v-if="roles.includes('监控展示') || roles.includes('admin')"
                command="monitor"
              ><i class="el-icon-monitor" />监控展示
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
      :total="list.filter(data => !search || data.name.toLowerCase().includes(search.toLowerCase())).length"
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
        请输入 {{ deleteConfirmExpect }} 确认
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

    <el-dialog
      :title="dialogStatus"
      :visible.sync="expansionFormVisible"
      :before-close="cancelExpansion"
    >
      <el-form
        ref="expansionForm"
        :model="expansionStr"
        label-position="left"
        label-width="140px"
      >
        <el-form-item
          label="性能规模"
          prop="select"
        >
          <el-select
            v-model="expansionStr.select"
            collapse-tags
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in scaleOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="表空间大小(GB)"
          prop="dataDirSize"
        >
          <el-slider v-model="expansionStr.dataDirSize" :min="10" :max="1000" show-input />

        </el-form-item>
        <el-form-item
          label="日志空间大小(GB)"
          prop="logDirSize"
        >
          <el-slider v-model="expansionStr.logDirSize" :min="10" :max="1000" show-input />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelExpansion()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="expansion()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogStatus"
      :visible.sync="upgradeFormVisible"
      :before-close="cancelUpgrade"
    >
      <el-form
        ref="upgradeForm"
        :model="upgradeStr"
        label-position="left"
        label-width="100px"
      >
        <p style="color:red">升级时会重启机器</p>
        <el-form-item
          label="版本选择"
          prop="select"
        >
          <el-select
            v-model="upgradeStr.select"
            collapse-tags
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in imageOptions"
              :key="item.id"
              :label="item.version.major +'.'+item.version.minor+'.'+item.version.patch+'.'+item.version.build"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelUpgrade()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="upgrade()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogStatus"
      :visible.sync="backupFormVisible"
      :before-close="cancelBackup"
    >
      <el-form
        ref="backupForm"
        :model="backupStr"
        :rules="backupRules"
        label-position="left"
        label-width="140px"
      >
        <el-form-item label="存储节点" prop="endpointId">
          <el-cascader
            :key="cascaderKey"
            :options="BackupEndpointOptions"
            @change="handleBackupEndpointChange"
          />
        </el-form-item>
        <el-form-item label="备份类型" prop="type">
          <el-select v-model="backupStr.type" placeholder="请选择">
            <el-option
              v-for="item in backupTypeOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备份文件保留天数" prop="retention">
          <el-input v-model="backupStr.retention" type="number" />
        </el-form-item>

      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelBackup()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="backup()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogStatus"
      :visible.sync="roleChangeSlaveFormVisible"
      :before-close="cancelRoleChangeSlave"
    >
      <el-table
        id="serviceTable"
        ref="serviceTable"
        v-loading="listLoading"
        :data="roleChangeSlaveMasterFilteredList"
        border
        fit
        highlight-current-row
        style="width: 100%"
        size="mini"
        @current-change="handleRoleChangeSlaveMasterSelectChange"
      >
        <el-table-column
          label="所属用户"
          width="auto"
          min-width="50px"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.owner">{{ scope.row.owner.name }}({{ scope.row.owner.username }})</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          min-width="50px"
          align="center"
          label="服务名称"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="80px"
          align="center"
          label="服务链接"
          width="130px"
        >
          <template slot-scope="scope">
            <!-- v-if中不可以嵌套循环 -->
            <!-- <span v-if="scope.row.status.cmha.services === null"> -->
            <span>
              <p v-for="i in scope.row.status.database.services[0].units" :key="i.id">
                {{ i.ip }}:{{ scope.row.status.database.services[0].ports[0].port }} </p>
            </span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="80px"
          width="auto"
          align="left"
          label="软件版本"
          :filters="softwareVersionList"
          :filter-method="softwareVersionFilterHandler"
        >
          <template slot-scope="scope">
            <span>
              <img class="icon" :src="iconMysql" title="mysql"> {{ scope.row.status.database.services[0].units | versionFormat }}
            </span>
            <span v-if="scope.row.status.cmha.services !== null">
              <el-divider class="iconDivider" />
              <img class="icon" :src="iconCmha" title="cmha"> {{ scope.row.status.cmha.services[0].units | versionFormat }}
              <el-divider class="iconDivider" />
              <img class="icon" :src="iconProxysql" title="proxysql"> {{ scope.row.status.proxy.services[0].units | versionFormat }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="80px"
          width="auto"
          align="left"
          label="性能套餐"
        >
          <template slot-scope="scope">
            <span>
              <img class="icon" :src="iconMysql" title="mysql"> {{ scope.row.status.database.services[0].units | performanceFormat }}
            </span>
            <span v-if="scope.row.status.cmha.services !== null">
              <el-divider class="iconDivider" />
              <img class="icon" :src="iconCmha" title="cmha"> {{ scope.row.status.cmha.services[0].units | performanceFormat }}
              <el-divider class="iconDivider" />
              <img class="icon" :src="iconProxysql" title="proxysql"> {{ scope.row.status.proxy.services[0].units | performanceFormat }}
            </span>

          </template>
        </el-table-column>

        <el-table-column
          min-width="50px"
          align="center"
          label="存储类型"
        >
          <template slot-scope="scope">
            <span>
              <img
                :src="iconDisk[scope.row.spec.database.services.units.resources.requests.storage.type][scope.row.spec.database.services.units.resources.requests.storage.performance]"
                style="width: 60px; height: 50px; vertical-align: middle;"
              >
            </span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="50px"
          align="center"
          label="任务状态"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.task.action.display }} - {{ scope.row.task.status.display }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="状态"
          align="center"
          width="50px"
        >
          <template slot-scope="scope">
            <i
              v-if="scope.row.state === 'passing'"
              class="el-icon-success"
              style="color:green"
            />
            <i
              v-else-if="scope.row.state === 'warning'"
              class="el-icon-warning"
              style="color:gold"
            />
            <i
              v-else-if="scope.row.state === 'critical'"
              class="el-icon-error"
              style="color:red"
            />
            <i
              v-else
              class="el-icon-question"
              style="color:grey"
            />
          </template>
        </el-table-column>

      </el-table>

      <pagination
        v-show="total>0"
        :current-page="roleChangeSlaveMasterListCurrentPage"
        :page-sizes="[10, 20, 30]"
        :limit="parseInt(roleChangeSlaveMasterListPagesize)"
        :total="roleChangeSlaveMasterList.length"
        @size-change="handleRoleChangeSlaveMasterListSizeChange"
        @current-change="handleRoleChangeSlaveMasterListCurrentChange"
        @pagination="handleRoleChangeSlaveMasterListPagination"
      />

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelRoleChangeSlave()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="roleChangeSlave()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
// import { fetchServices, startServiceGroup, stopServiceGroup, deleteServiceGroup, fetchMySQLScales, updateExpansion, getMySQLVersionEnabled, updateImage, getMySQLInstanceInfo, updateMySQLInstance } from '@/api/service/mysql/mysql' // fetchServiceById,
import { fetchServices, fetchServiceById, startServiceGroup, stopServiceGroup, deleteServiceGroup, fetchMySQLScales, updateExpansion, updateBackup, getMySQLVersionEnabled, updateImage } from '@/api/service/mysql/mysql' // fetchServiceById,
import { getBackupTypes, getDirTypes } from '@/api/selections'
// import { fetchBackupFiles, restoreBackupFiles } from '@/api/service/mysql/backupList'
import { fetchBackupFileEndPoints } from '@/api/manager/backupEndpoints'
import { roleChangeSlaveAction } from '@/api/service/mysql/roleChange'
import { fetchImages } from '@/api/manager/images'
import Pagination from '@/components/Pagination'
import IconSet from '@/assets/img/iconSet'

export default {
  name: 'ServiceManagementTable',
  components: { Pagination },
  filters: {
    stateFilter(status) {
      const stateMap = {
        passing: 'success',
        critical: 'danger'
      }
      return stateMap[status]
    },
    versionFormat(input) {
      if (input === null) {
        return 'not-found'
      }
      const ret = new Set()
      for (const unit of input) {
        ret.add(`${unit.image.major}.${unit.image.minor}.${unit.image.patch}-${unit.image.build}`)
      }
      return Array.from(ret).join('/')
    },
    performanceFormat(input) {
      if (input === null) {
        return 'not-found'
      }
      const ret = new Set()
      for (const unit of input) {
        const cpu = unit.resources.cpu / 1000
        const mem = unit.resources.memory / 1024
        ret.add(`${cpu.toFixed(1)}C ${mem.toFixed(1)}G`)
      }
      return Array.from(ret).join('/')
    }
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
      cascaderKey: 0,

      batchStartDisabled: false,
      batchStopDisabled: false,
      serviceSelections: [],

      roles: this.$router.currentRoute.meta.roles,
      list: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,

      backupListTotal: 0,
      backupListCurrentPage: 1,
      backupListPagesize: 10,

      currentSelection: {},

      listLoading: true,
      dialogIsView: false,
      editFormVisible: false,
      deleteFormVisible: false,
      dialogStatus: '',
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      search: '',
      expansionFormVisible: false,
      expansionStr: {
        select: '0',
        dataDirSize: 10,
        logDirSize: 10
      },
      upgradeFormVisible: false,
      upgradeStr: {
        select: ''
      },

      backupFormVisible: false,
      backupStr: {
        storageType: '',
        endpointId: '',
        type: '',
        retention: 1,
        role: 'master'
      },
      backupFileList: [],
      backupTypeList: [],
      backupEndpointList: [],
      backupTypeOptions: [],
      BackupEndpointOptions: [],
      restoreFormVisible: false,
      backupFileListLoading: false,
      restoreStr: {

      },

      rebuildFormVisible: false,
      rebuildStr: {
        rebuildStrategy: '',
        hostId: ''
      },
      rebuildStrategyList: [],
      rebuildHostList: [],

      roleChangeSlaveFormVisible: false,
      roleChangeSlaveMasterList: [],
      roleChangeSlaveMasterListCurrentPage: 1,
      roleChangeSlaveMasterListPagesize: 10,

      scaleOptions: [],
      imageOptions: [],
      softwareVersionList: [],
      dialogTemp: {},
      editRules: {
        name: [
          { required: true, message: 'name is required', trigger: 'change' }
        ]
      },
      backupRules: {
        // storageType: [{ required: true, message: '存储类型不能为空', trigger: 'change' }],
        endpointId: [{ required: true, message: '存储节点不能为空', trigger: 'change' }],
        type: [{ required: true, message: '备份类型不能为空', trigger: 'change' }],
        retention: [{ required: true, message: '有效天数不能为空', trigger: 'change' }]
      },
      iconMysql: IconSet.iconMysql,
      iconCmha: IconSet.iconCmha,
      iconProxysql: IconSet.iconProxysql,
      iconDisk: {
        'host': {
          'medium': IconSet.iconLocalMedium,
          'high': IconSet.iconLocalHigh
        },
        'remote': {
          'medium': IconSet.iconRemoteMedium,
          'high': IconSet.iconRemoteHigh
        }
      }
    }
  },
  computed: {
    ...mapGetters(['user_id']),
    serviceTableDataList() {
      return this.list.filter(
        data => !this.search || data.name.toLowerCase().includes(this.search.toLowerCase())
      ).slice(
        (this.currentPage - 1) * this.pagesize, this.currentPage * this.pagesize
      )
    },
    deleteRules() {
      const pattern = new RegExp('^' + this.deleteConfirmExpect + '$')
      return {
        input: [
          {
            required: true,
            message: '输入与 ' + this.deleteConfirmExpect + ' 不一致',
            pattern: pattern
          }
        ]
      }
    },
    roleChangeSlaveMasterFilteredList() {
      return this.roleChangeSlaveMasterList.slice(
        (this.roleChangeSlaveMasterListCurrentPage - 1) * this.roleChangeSlaveMasterListPagesize,
        this.roleChangeSlaveMasterListCurrentPage * this.roleChangeSlaveMasterListPagesize
      )
    }
  },
  created() {
    this.getList()
    this.getSoftwareVersionList()
  },
  methods: {
    refresh() {
      this.getList()
      this.getSoftwareVersionList()
    },

    sortChange(v) {
      if (v.column.order === 'ascending') {
        // 通过属性showWeights进行排序
        if (v.column.property === 'showWeights') {
          this.selectInfo.sort(this.sortList('showWeights'))
        }
      }
    },
    getList() {
      this.listLoading = true
      fetchServices().then(response => {
        this.list = response.data
        this.list.sort((a, b) => {
          let aTimeStr = a.gmtCreate
          let bTimeStr = b.gmtCreate
          aTimeStr = aTimeStr.replace(/-/g, '/')
          bTimeStr = bTimeStr.replace(/-/g, '/')
          const aTime = new Date(aTimeStr).getTime()
          const bTime = new Date(bTimeStr).getTime()
          return bTime - aTime
        })
        this.total = response.data.length
        this.listLoading = false
      })
    },
    getSoftwareVersionList() {
      fetchImages().then(ressponse => {
        for (const image of ressponse.data) {
          this.softwareVersionList.push({
            text: `${image.type}:${image.version.major}.${image.version.minor}.${image.version.patch}-${image.version.build}`,
            value: `${image.type}:${image.version.major}.${image.version.minor}.${image.version.patch}-${image.version.build}`
          })
        }
        this.softwareVersionList.sort((a, b) => (a.text > b.text) ? 1 : -1)
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

    handleBackupTableSizeChange(val) {
      this.backupListPagesize = val
    },
    handleBackupTableCurrentChange(val) {
      this.backupListCurrentPage = val
    },
    handleBackupTablePagination(val) {
      this.backupListCurrentPage = val.page
      this.backupListPagesize = val.limit
    },

    handleConfig(row) {
      this.$emit('switch', row)
    },

    batchStart() {
      let rowNameList = ''
      this.serviceSelections.forEach(row => {
        rowNameList += row.name + ' '
      })
      this.$confirm(
        '是否确认批量启动：' + rowNameList,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.serviceSelections.forEach(row => {
            startServiceGroup(row.id).then(response => {
              this.getList()
              this.$message.success('启动中：' + row.name)
            })
          })
          this.$message.success('操作成功')
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    batchStop() {
      let rowNameList = ''
      this.serviceSelections.forEach(row => {
        rowNameList += row.name + ' '
      })
      this.$confirm(
        '是否确认批量停止：' + rowNameList,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.serviceSelections.forEach(row => {
            stopServiceGroup(row.id).then(response => {
              this.getList()
              this.$message.success('停止中：' + row.name)
            })
          })
          this.$message.success('操作成功')
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleServiceSelectionChange(rows) {
      this.batchStartDisabled = false
      this.batchStopDisabled = false
      this.serviceSelections = rows
      this.serviceSelections.forEach(row => {
        if (row.state === 'passing') {
          this.batchStartDisabled = true
        } else if (row.state === 'critical') {
          this.batchStopDisabled = true
        } else {
          this.batchStartDisabled = true
          this.batchStopDisabled = true
        }
      })
    },
    handleServiceStart(row) {
      this.$confirm(
        '是否确认启动 ' + row.name,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          startServiceGroup(row.id).then(response => {
            this.getList()
            this.$message.success('操作成功')
          })
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleServiceStop(row) {
      this.$confirm(
        '是否确认停用 ' + row.name,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          stopServiceGroup(row.id)
            .then(response => {
              this.getList()
              this.$message.success('操作成功')
            })
            .catch(error => {
              this.$message.info(error)
            })
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },

    handleDelete(row) {
      this.dialogTemp = Object.assign({}, row)
      this.dialogStatus = '删除'
      this.deleteFormVisible = true
      this.deleteConfirmExpect = this.dialogTemp.name
    },

    handleExpansion(row) {
      this.dialogTemp = row
      // TODO:这个接口特别容易超时，所以就靠row先做调试
      fetchServiceById(row.id).then(response => {
        this.dialogTemp = response.data
      })
      fetchMySQLScales().then(response => {
        this.scaleOptions = response.data
        const resource = this.dialogTemp.spec.database.services.units.resources.requests
        for (let index = 0; index < this.scaleOptions.length; index++) {
          const element = this.scaleOptions[index]
          // const resource = this.dialogTemp.mysqlScales
          // if ((element.cpuCnt === this.dialogTemp.mysqlScales.cpu) && (this.dialogTemp.mysqlScales.memSize === element.memSize)) {
          // console.log(element, resource)
          if ((element.cpuCnt === resource.cpu) && (element.memSize === resource.memory)) {
            this.expansionStr.select = element.id
            break
          }
        }
        this.expansionStr.dataDirSize = resource.storage.volumes[0].capacity / 1024
        this.expansionStr.logDirSize = resource.storage.volumes[1].capacity / 1024
        this.dialogStatus = '扩容'
        this.expansionFormVisible = true
      })
    },
    expansion() {
      const temp = {}
      let flag = false
      for (let index = 0; index < this.scaleOptions.length; index++) {
        if (this.scaleOptions[index].id === this.expansionStr.select) {
          flag = true
          temp.cnpCnt = this.scaleOptions[index].cpuCnt
          temp.memSize = this.scaleOptions[index].memSize
          break
        }
      }
      if (!flag) {
        this.$message.error('无法获取该规模信息')
        return
      }
      temp.dataDirSize = this.expansionStr.dataDirSize * 1024
      temp.logDirSize = this.expansionStr.logDirSize * 1024
      temp.type = 'mysql'
      temp.name = this.dialogTemp.name
      for (let index = 0; index < this.scaleOptions.length; index++) {
        const element = this.scaleOptions[index]
        if (element.name === this.expansionStr.select) {
          temp.cnpCnt = element.cpuCnt // TODO:这里富麦确实写成了cnpCnt.......
          temp.memSize = element.memSize
          break
        }
      }
      temp.networkBandwidth = 0 // 先留0，之后测试时候应该要改
      updateExpansion(this.dialogTemp.id, this.dialogTemp.orderGroupId, temp).then(response => {
        this.$message.success('操作成功')
        this.getList()
        this.cancelExpansion()
        this.$router.push({
          path: '/applicationManagement/applyForApproval'
        })
      })
    },
    cancelExpansion() {
      this.expansionFormVisible = false
      this.dialogStatus = ''
      this.dialogTemp = {}
      this.expansionStr = {
        select: '0',
        dataDirSize: 10,
        logDirSize: 10
      }
    },

    handleUpgrade(row) {
      // this.dialogTemp = row
      // TODO:这个接口特别容易超时，所以就靠row先做调试
      fetchServiceById(row.id).then(response => {
        this.dialogTemp = response.data
      })
      getMySQLVersionEnabled().then(response => {
        this.imageOptions = response.data
        this.upgradeStr.select = this.dialogTemp.mysqlVersions.id
      })
      this.dialogStatus = '升级'
      this.upgradeFormVisible = true
    },
    upgrade() {
      const temp = {}
      temp.type = 'mysql'
      temp.name = this.dialogTemp.name
      temp.imageId = this.upgradeStr.select
      for (let index = 0; index < this.imageOptions.length; index++) {
        const element = this.imageOptions[index]
        if (element.id === this.upgradeStr.select) {
          const { major, minor, patch, build } = element.version
          temp.majorVersion = major
          temp.minVersion = minor
          temp.patchVersion = patch
          temp.buildVersion = build
          break
        }
      }
      temp.networkBandwidth = 0 // 先留0，之后测试时候应该要改
      updateImage(this.dialogTemp.id, temp).then(response => {
        this.$message.success('操作成功')
        this.getList()
        this.cancelUpgrade()
        this.$router.push({
          path: '/applicationManagement/applyForApproval'
        })
      })
    },
    cancelUpgrade() {
      this.upgradeFormVisible = false
      this.dialogStatus = ''
      this.dialogTemp = {}
      this.upgradeStr = {
        select: ''
      }
    },

    handleBackupEndpointChange(val) {
      this.backupStr.storageType = val[0]
      this.backupStr.endpointId = val[1]
    },
    handleBackup(row) {
      getBackupTypes().then(response => {
        this.backupTypeOptions = response.data
      })

      getDirTypes().then(response => {
        this.storageTypeOptions = response.data
        fetchBackupFileEndPoints().then(response => {
          this.backupEndpointList = response.data
          for (const storageType of this.storageTypeOptions) {
            const children = []
            for (const backupEndpoint of this.backupEndpointList) {
            // console.log(storageType.code.toLowerCase(), backupEndpoint.type.toLowerCase())
              if (storageType.code.toLowerCase() === backupEndpoint.type.toLowerCase()) {
                children.push({
                  value: backupEndpoint.id,
                  label: backupEndpoint.name
                })
              }
            }
            this.BackupEndpointOptions.push({
              value: storageType.code,
              label: storageType.name,
              children: children
            })
          }
        })
      })
      this.dialogTemp.id = row.id
      this.dialogStatus = '备份'
      this.backupFormVisible = true
    },
    cancelBackup() {
      ++this.cascaderKey
      this.dialogStatus = ''
      this.backupFormVisible = false
      this.BackupEndpointOptions = []
      this.dialogTemp = {}
      this.backupStr = {
        storageType: '',
        endpointId: '',
        type: '',
        retention: 1,
        role: 'master'
      }
    },
    backup() {
      const temp = JSON.parse(JSON.stringify(this.backupStr))
      // temp.storage = temp.endpointId
      updateBackup(this.dialogTemp.id, temp).then(response => {
        this.$message.success('操作成功')
        this.cancelBackup()
      })
    },

    // handleRestoreSelectChange(val) {
    //   this.currentSelection = val
    //   // console.log(this.currentSelection)
    // },
    // handleRestore(row) {
    //   this.backupFileListLoading = true
    //   this.backupFileList = []
    //   fetchBackupFiles().then(response => { // 这个接口表面上传了Complete，实际上全返回了，要靠前端筛选
    //     // console.log('fetchBackupFiles', response.data)
    //     response.data.forEach(backupFile => {
    //       if (backupFile.status === 'Complete') {
    //         this.backupFileList.push(backupFile)
    //       }
    //     })
    //     this.backupFileListLoading = false
    //   })
    //   this.restoreFormVisible = true
    //   this.dialogTemp = JSON.parse(JSON.stringify(row))
    //   this.currentSelection = {}
    //   this.dialogStatus = '还原'
    // },
    // cancelRestore() {
    //   this.restoreFormVisible = false
    //   this.currentSelection = {}
    //   this.dialogTemp = {}
    //   this.restoreStr = {
    //     endpointId: '',
    //     type: '',
    //     retention: 1
    //   }
    // },
    // restore() {
    //   if (!this.currentSelection.id) {
    //     this.$message.error('请选择一行数据')
    //     return
    //   }
    //   const restoreText = '确认还原<br/>' +
    //     "服务组: <span style='color:green'>" + this.currentSelection.servGroup.id + '</span><br/>' +
    //     "单元: <span style='color:green'>" + this.currentSelection.unit.id + '</span><br/>' +
    //     "到<span style='color:red'>" + this.currentSelection.path + '</span>'
    //   this.$confirm(
    //     restoreText,
    //     '提示',
    //     {
    //       confirmButtonText: '确定',
    //       cancelButtonText: '取消',
    //       type: 'warning',
    //       dangerouslyUseHTMLString: true
    //     }
    //   ).then(() => {
    //     const temp = {}
    //     temp.appId = this.currentSelection.servGroup.id
    //     temp.unitId = this.currentSelection.unit.id
    //     temp.backupFileId = this.currentSelection.id
    //     restoreBackupFiles(temp).then(() => {
    //       this.getList()
    //       this.cancelRestore()
    //       this.$message.success('操作成功')
    //     })
    //       .catch(error => {
    //         this.$message.info(error)
    //       })
    //   })
    //     .catch(() => {
    //       this.$message.info('取消操作！')
    //     })
    // },

    handleRoleChangeSlaveMasterListSizeChange(val) {
      this.roleChangeSlaveMasterListPagesize = val
    },
    handleRoleChangeSlaveMasterListCurrentChange(val) {
      this.roleChangeSlaveMasterListCurrentPage = val
    },
    handleRoleChangeSlaveMasterListPagination(val) {
      this.roleChangeSlaveMasterListCurrentPage = val.page
      this.roleChangeSlaveMasterListPagesize = val.limit
    },
    handleRoleChangeSlaveMasterSelectChange(val) {
      this.currentSelection = val
      // console.log(this.currentSelection)
    },
    handleRoleChangeSlave(row) {
      this.roleChangeSlaveMasterList = [...this.list]
      for (let i = 0; i < this.roleChangeSlaveMasterList.length; i++) {
        if (this.roleChangeSlaveMasterList[i].id === row.id) {
          this.roleChangeSlaveMasterList.splice(i, 1)
        }
      }
      // console.log('this.roleChangeSlaveMasterList', this.roleChangeSlaveMasterList)
      this.dialogTemp = JSON.parse(JSON.stringify(row))
      this.currentSelection = {}
      this.dialogStatus = '设置为从'
      this.roleChangeSlaveFormVisible = true
    },
    cancelRoleChangeSlave() {
      this.roleChangeSlaveFormVisible = false
      this.currentSelection = {}
      this.dialogTemp = {}
    },
    roleChangeSlave() {
      if (!this.currentSelection.id) {
        this.$message.error('请选择一行数据')
        return
      }
      let changeText = ''
      // console.log(this.roleChangeSlaveMasterList)
      // '<span style="color:red">主：</span>
      changeText = "将<span style='color:green'>主机：" + this.dialogTemp.name + '</span>设置为'
      changeText += "<span style='color:red'>主机：" + this.currentSelection.name + ' </span>的从机'

      this.$confirm(
        changeText,
        '确认变更为以下情况？',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        const temp = {}
        const units = this.currentSelection.status.database.services[0].units
        if (units.length < 1) {
          this.cancelRoleChangeSlave()
          this.$message.info('该服务组中无适用单元')
        } else if (units.length === 1) {
          temp.unit_id = units[0].id
        } else {
          for (let i = 0; i < units.length; i++) {
            if (units[i].replication.role === 'master') {
              temp.unit_id = units[i].id
            }
          }
        }
        roleChangeSlaveAction(this.dialogTemp.id, temp).then(response => {
          this.getList()
          this.cancelRoleChangeSlave()
          this.$message.success('操作成功')
        }).catch(error => {
          this.$message.info(error)
        })
          .catch(() => {
            this.$message.info('取消操作！')
          })
      })
    },

    handleMonitor(row) {
      const unit = row.status.database.services[0].units[0]
      const serviceName = [row.name, unit.image.type, 'exporter-svc'].join('-')
      const podName = unit.id

      const mysqlMonitorUrl =
        process.env.VUE_APP_PROMETHEUS_PATH +
        '/d/mysql/mysql-overview' +
        '?refresh=1m&var-interval=1m' +
        '&var-service=' + serviceName +
        '&var-pod=' + podName
      window.open(mysqlMonitorUrl)

      // this.$confirm(
      //   '确认为' + row.name + '注册监控么 ',
      //   '提示',
      //   {
      //     confirmButtonText: '确定',
      //     cancelButtonText: ' 取消',
      //     type: 'warning'
      //   }
      // )
      //   .then(() => {
      //     // 这里第一遍写出来都是500，之后可能还要改
      //     const data = row
      //     const temp = {}
      //     temp.name = data.servs[0].units[0].id
      //     temp.category = 'mysql'
      //     temp.tag = data.id
      //     const container = {}
      //     container.name = 'k8s_mysql_' + data.servs[0].units[0].id
      //     container.hostName = data.servs[0].units[0].id
      //     container.category = 'docker'
      //     container.tag = ''
      //     temp.container = container
      //     getMySQLInstanceInfo(data.servs[0].units[0].id)
      //     updateMySQLInstance(temp).then(response => {
      //       this.getList()
      //       this.$message.success('操作成功')
      //     })
      //     // 还是会有那个超时的问题
      //     // fetchServiceById(row.id)
      //     //   .then(response => {

      //     //   })
      //     //   .catch(error => {
      //     //     this.$message.info(error)
      //     //   })
      //   })
      //   .catch(() => {
      //     this.$message.info('取消操作！')
      //   })
    },
    handleDropdown(command, row) {
      if (command === 'edit') {
        this.handleConfig(row)
      } else if (command === 'enable') {
        this.handleServiceStart(row)
      } else if (command === 'disable') {
        this.handleServiceStop(row)
      } else if (command === 'delete') {
        this.handleDelete(row)
      } else if (command === 'expansion') {
        this.handleExpansion(row)
      } else if (command === 'upgrade') {
        this.handleUpgrade(row)
      } else if (command === 'backup') {
        this.handleBackup(row)
      } else if (command === 'restore') {
        this.handleRestore(row)
      } else if (command === 'roleChangeSlave') {
        this.handleRoleChangeSlave(row)
      } else if (command === 'monitor') {
        this.handleMonitor(row)
      }
    },
    addNewScales() {
      this.dialogStatus = ''
      this.dialogIsView = false
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
      this.$refs['deleteForm'].validate(valid => {
        if (valid) {
          deleteServiceGroup(this.dialogTemp.id, this.dialogTemp.name).then(() => {
            this.getList()
            this.cancelDelete()
            this.$notify({
              title: 'Success',
              message: '删除成功',
              type: 'success',
              duration: 2000
            })
            this.$router.push({
              path: '/applicationManagement/applyForApproval'
            })
          })
        }
      })
    },
    softwareVersionFilterHandler(value, row, column) {
      const [imageType, imageVersion] = value.split(':')
      if (imageType === 'mysql') {
        return row.mysqlVersions.id === imageVersion
      } else if (imageType === 'cmha') {
        if (row.cmha === null) {
          return false
        } else {
          return true
        }
      } else {
        return true
      }
    }
  }
}
</script>

<style>
#serviceTable {
  font-size: 12px;
}

.el-table .cell{
  padding: 0;
  margin: 0;
  line-height: 15px;
}
</style>
<style scoped>
  .icon {
    width: 40px;
    height: 20px;
    vertical-align: middle;
  }
  .iconDivider {
    margin: 2px 0 2px 0;
  }
</style>
