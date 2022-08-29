<template>
  <div class="app-container">
    <el-row>
      <el-col :span="22">
        <el-form ref="editForm" :model="appModel" :rules="appRules">
          <el-tabs v-model="activeTab" type="card">
            <el-tab-pane name="first">
              <span slot="label">基本配置
                <i v-if="paneCommonValid" class="el-icon-check" style="color: #008000;" />
                <i v-else class="el-icon-warning" style="color: red;" />
              </span>
              <el-form-item label="是否使用Cmha">
                <el-switch
                  v-model="useCmha"
                  active-text="使用Cmha"
                  inactive-text="不使用Cmha"
                />
              </el-form-item>

              <el-form-item label="所属系统">
                <el-select v-model="appModel.businessSystemName" placeholder="请选择">
                  <el-option
                    v-for="item in systemList"
                    :key="item.id"
                    :label="item.name"
                    :value="item.name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="所属子系统">
                <el-radio-group v-model="appModel.businessSubsystemName">
                  <el-radio-button v-for="i in subSystemList" :key="i.value" :label="i.name" />
                </el-radio-group>
              </el-form-item>

              <el-form-item label="站点">
                <el-radio-group v-model="appModel.site.id">
                  <el-radio-button v-for="i in sitesList" :key="i.id" :label="i.id" :value="i.name">{{ i.name }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="服务名称">
                <el-input v-model="appModel.name" style="width: 200px;" />
                <el-button type="primary" @click="generateName()">随机</el-button>
              </el-form-item>

              <el-form-item label="区域">
                <el-radio-group v-model="appModel.area.code">
                  <el-radio-button v-for="i in areaList" :key="i.code" :label="i.code" :value="i.name">{{ i.name }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane name="second">
              <span slot="label">MySQL配置
                <i v-if="paneMysqlValid" class="el-icon-check" style="color: green;" />
                <i v-else class="el-icon-warning" style="color: red;" />
              </span>
              <el-form-item label="版本">
                <el-radio-group v-model="mysqlImageId">
                  <el-radio-button v-for="i in imageList['mysql']" :key="i.id" :label="i.id">{{ showVersion(i.version) }}
                  </el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="端口">
                <el-input-number v-model="appModel.mysqlModel.port" :min="1" :max="65535" />
              </el-form-item>

              <el-form-item label="架构">
                <el-radio-group v-model="appModel.mysqlModel.arch.mode" @change="change_mysql_replic_num()">
                  <el-radio-button v-for="i in mysqlArchList" :key="i.id" :label="i.code">{{ i.name }}</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="备库数量">
                <el-input-number v-model="appModel.mysqlModel.arch.replicas" :min="mysql_replic_num_min" :max="mysql_replic_num_max" />
              </el-form-item>

              <el-form-item label="规模">
                <el-select v-model="appModel.mysqlModel.scale" placeholder="请选择">
                  <el-option
                    v-for="scale in scaleList"
                    :key="scale.name"
                    :label="scale.name"
                    :value="scale.name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="存储类型">
                <el-radio-group v-model="appModel.mysqlModel.dataDirType.code">
                  <el-radio-button label="remote">外置存储</el-radio-button>
                  <el-radio-button label="host">本地存储</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="存储性能等级">
                <el-radio-group v-model="appModel.mysqlModel.dataDirPerformance.code">
                  <el-radio-button label="high">高性能</el-radio-button>
                  <el-radio-button label="medium">中性能</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="表空间(GB)">
                <el-slider
                  v-model="appModel.mysqlModel.dataDirSize"
                  :min="10"
                  :max="20480"
                  :step="10"
                  show-input
                  style="margin-left: 120px; width: 80%;"
                />
              </el-form-item>

              <el-form-item label="日志空间(GB)">
                <el-slider
                  v-model="appModel.mysqlModel.logDirSize"
                  :min="10"
                  :max="20480"
                  :step="10"
                  show-input
                  style="margin-left: 120px; width: 80%;"
                />
              </el-form-item>

              <el-form-item label="高可用开关">
                <el-switch
                  v-model="appModel.mysqlModel.highAvailability"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </el-form-item>
            </el-tab-pane>

            <el-tab-pane v-if="useCmha" name="third">
              <span slot="label">Cmha配置
                <i v-if="paneCmhalValid" class="el-icon-check" style="color: green;" />
                <i v-else class="el-icon-warning" style="color: red;" />
              </span>
              <!--              <el-form-item label="版本">-->
              <!--                <el-radio-group v-model="cmhaImageId">-->
              <!--                  <el-radio-button v-for="i in imageList['cmha']" :key="i.id" :label="i.id">{{ showVersion(i.version) }}-->
              <!--                  </el-radio-button>-->
              <!--                </el-radio-group>-->
              <!--              </el-form-item>-->

              <el-form-item label="端口">
                <el-input-number v-model="appModel.cmhaModel.port" :min="1" :max="65535" />
              </el-form-item>

              <el-form-item label="架构">
                <el-radio-group v-model="appModel.cmhaModel.arch.mode" @change="change_cmha_replic_num()">
                  <el-radio-button v-for="i in cmhaArchList" :key="i.id" :label="i.code">{{ i.name }}</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="数量">
                <el-input-number v-model="appModel.cmhaModel.arch.replicas" :min="cmha_replic_num_min" :max="cmha_replic_num_max" :step="cmha_num_step" />
              </el-form-item>

              <el-form-item label="规模">
                <el-select v-model="appModel.cmhaModel.scale" placeholder="请选择">
                  <el-option
                    v-for="scale in scaleList"
                    :key="scale.name"
                    :label="scale.name"
                    app-model-cmha-model-arch-replicas
                    :value="scale.name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="存储类型">
                <el-radio-group v-model="appModel.cmhaModel.dataDirType.code">
                  <el-radio-button label="remote">外置存储</el-radio-button>
                  <el-radio-button label="host">本地存储</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="存储性能等级">
                <el-radio-group v-model="appModel.cmhaModel.dataDirPerformance.code">
                  <el-radio-button label="high">高性能</el-radio-button>
                  <el-radio-button label="medium">中性能</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="表空间(GB)">
                <el-slider
                  v-model="appModel.cmhaModel.dataDirSize"
                  :min="1"
                  :max="1024"
                  :step="1"
                  show-input
                  style="margin-left: 120px; width: 80%;"
                />
              </el-form-item>

              <el-form-item label="日志空间(GB)">
                <el-slider
                  v-model="appModel.cmhaModel.logDirSize"
                  :min="1"
                  :max="1024"
                  :step="1"
                  show-input
                  style="margin-left: 120px; width: 80%;"
                />
              </el-form-item>

              <!-- <el-form-item label="高可用开关">
                {{appModel.cmhaModel.highAvailability}}
                <el-switch
                  v-model="appModel.cmhaModel.highAvailability"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </el-form-item> -->

            </el-tab-pane>

            <el-tab-pane v-if="useCmha" label="Proxysql配置" name="fourth">
              <span slot="label">Proxysql配置
                <i v-if="paneProxysqlValid" class="el-icon-check" style="color: green;" />
                <i v-else class="el-icon-warning" style="color: red;" />
              </span>
              <!--              <el-form-item label="版本">-->
              <!--                <el-radio-group v-model="proxysqlImageId">-->
              <!--                  <el-radio-button v-for="i in imageList['proxysql']" :key="i.id" :label="i.id">{{ showVersion(i.version) }}-->
              <!--                  </el-radio-button>-->
              <!--                </el-radio-group>-->
              <!--              </el-form-item>-->

              <el-form-item label="端口">
                <el-input-number v-model="appModel.proxysqlModel.port" :min="1" :max="65535" />
              </el-form-item>

              <el-form-item label="架构">
                <el-radio-group v-model="appModel.proxysqlModel.arch.mode" @change="change_proxysql_replic_num()">
                  <el-radio-button v-for="i in proxyArchList" :key="i.id" :label="i.code">{{ i.name }}</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="数量">
                <el-input-number v-model="appModel.proxysqlModel.arch.replicas" :min="proxysql_replic_num_min" :max="proxysql_replic_num_max" :step="proxysql_num_step" />
              </el-form-item>

              <el-form-item label="规模">
                <el-select v-model="appModel.proxysqlModel.scale" placeholder="请选择">
                  <el-option
                    v-for="scale in scaleList"
                    :key="scale.name"
                    :label="scale.name"
                    :value="scale.name"
                  />
                </el-select>
              </el-form-item>

              <el-form-item label="存储类型">
                <el-radio-group v-model="appModel.proxysqlModel.dataDirType.code">
                  <el-radio-button label="remote">外置存储</el-radio-button>
                  <el-radio-button label="host">本地存储</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="存储性能等级">
                <el-radio-group v-model="appModel.proxysqlModel.dataDirPerformance.code">
                  <el-radio-button label="high">高性能</el-radio-button>
                  <el-radio-button label="medium">中性能</el-radio-button>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="表空间(GB)">
                <el-slider
                  v-model="appModel.proxysqlModel.dataDirSize"
                  :min="1"
                  :max="1024"
                  :step="1"
                  show-input
                  style="margin-left: 120px; width: 80%;"
                />
              </el-form-item>

              <el-form-item label="日志空间(GB)">
                <el-slider
                  v-model="appModel.proxysqlModel.logDirSize"
                  :min="1"
                  :max="1024"
                  :step="1"
                  show-input
                  style="margin-left: 120px; width: 80%;"
                />
              </el-form-item>

              <!-- <el-form-item label="高可用开关">
                {{appModel.proxysqlModel.highAvailability}}
                <el-switch
                  v-model="appModel.proxysqlModel.highAvailability"
                  active-color="#13ce66"
                  inactive-color="#ff4949"
                />
              </el-form-item> -->
            </el-tab-pane>

            <el-tab-pane name="fifth">
              <span slot="label">数据库配置
                <i v-if="paneDBConfigValid" class="el-icon-check" style="color: green;" />
                <i v-else class="el-icon-warning" style="color: red;" />
              </span>

              <el-form-item label="备份时间">
                <VueCronEditorBuefy
                  v-model="appModel.schedule"
                  :visible-tabs="['daily', 'weekly', 'advanced']"
                  locale="cn"
                  :custom-locales="cronLocale"
                />
              </el-form-item>

              <el-form-item label="用户名" prop="dbuser">
                <el-input v-model="appModel.user.dbuser" style="width: 200px;" />
              </el-form-item>

              <el-form-item label="用户密码" prop="dbpwd">
                <el-input v-model="appModel.user.dbpwd" style="width: 200px;" />
              </el-form-item>

              <el-form-item label="数据库名" prop="dbname">
                <el-input v-model="appModel.schema.dbname" style="width: 200px;" />
              </el-form-item>

              <el-form-item label="数据库字符集">
                <el-select v-model="appModel.schema.characterSet" placeholder="请选择">
                  <el-option
                    v-for="item in dbCharsets"
                    :key="item.charset"
                    :label="item.charset"
                    :value="item.charset"
                  />
                </el-select>

              </el-form-item>

            </el-tab-pane>

            <el-tab-pane label="MySQL参数配置" name="sixth">
              <el-button type="primary" icon="el-icon-circle-plus-outline" @click="addTableItem()">增加</el-button>
              <el-table
                :data="cfgTableData"
                style="width: 100%"
                size="mini"
              >
                <el-table-column prop="name" label="参数名" width="240">
                  <template slot-scope="{row}">
                    <el-select
                      v-model="row.name"
                      filterable
                      allow-create
                      placeholder="请选择"
                      size="mini"
                      @change="setCfgValue(row)"
                    >
                      <el-option
                        v-for="item in imageConfigList"
                        :key="item.key"
                        :label="item.key"
                        :value="item.key"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column prop="value" label="参数值" width="180">
                  <template slot-scope="{row}">
                    <el-input v-model="row.value" placeholder="请输入内容" size="mini" />
                  </template>
                </el-table-column>
                <el-table-column prop="value" label="范围" width="180">
                  <template slot-scope="{row}">
                    <span>{{ row.range }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="value" label="删除">
                  <template slot-scope="{row}">
                    <el-button type="primary" icon="el-icon-delete" size="mini" @click="deleteTableItem(row)">删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>

            <el-tab-pane name="finish">
              <span slot="label">核对
                <i v-if="paneFinalValid" class="el-icon-check" style="color: green;" />
                <i v-else class="el-icon-warning" style="color: red;" />
              </span>
              <el-row class="summary_head">
                <el-col :span="24">基本配置</el-col>
              </el-row>
              <el-row class="summary_item">
                <el-col :span="8">Failover控制</el-col>
                <el-col :span="16">{{ useCmha | useCmhaFilter }}</el-col>
              </el-row>
              <el-row class="summary_item">
                <el-col :span="8">系统</el-col>
                <el-col :span="16">{{ appModel.businessSystemName }}</el-col>
              </el-row>
              <el-row class="summary_item">
                <el-col :span="8">子系统</el-col>
                <el-col :span="16">{{ appModel.businessSubsystemName }}</el-col>
              </el-row>
              <el-row class="summary_item">
                <el-col :span="8">站点</el-col>
                <el-col :span="16">{{ siteName }}</el-col>
              </el-row>
              <el-row class="summary_item">
                <el-col :span="8">服务名称</el-col>
                <el-col :span="16">{{ appModel.name }}</el-col>
              </el-row>
              <el-row class="summary_item">
                <el-col :span="8">区域</el-col>
                <el-col :span="16">{{ areaDisplay }}</el-col>
              </el-row>

              <el-row class="summary_head">
                <el-col :span="24">服务配置</el-col>
              </el-row>

              <el-table
                :data="summaryTableData"
                stripe
                style="width: 95%"
              >
                <el-table-column
                  prop="prop"
                  label="属性"
                  width="170px"
                />
                <el-table-column
                  prop="mysql"
                  label="Mysql"
                  width="170px"
                />
                <el-table-column
                  prop="cmha"
                  label="Cmha"
                  width="170px"
                />
                <el-table-column
                  prop="proxysql"
                  label="ProxySql"
                  width="170px"
                />
              </el-table>

              <el-row>
                <el-col :offset="10" :span="14">
                  <el-button type="warning" :disabled="!paneFinalValid" @click="applyMysqlOrder">申请</el-button>
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import VueCronEditorBuefy from 'vue-cron-editor-buefy'
import { fetchSites } from '@/api/manager/sites'
import { fetchBusinessSubSystems } from '@/api/system/business_subsystems'
import { fetchAreas } from '@/api/selections'
import { fetchImages, fetchImageConfig } from '@/api/manager/images'
import { fetchDicts } from '@/api/system/dictionary'
import { fetchScales } from '@/api/system/scales'
import { addOrder } from '@/api/system/order'

export default {
  name: 'ApplyForMysql',
  components: {
    VueCronEditorBuefy
  },
  filters: {
    haFilter(highAvailability) {
      if (highAvailability) {
        return '高可用打开'
      } else {
        return '高可用关闭'
      }
    },
    useCmhaFilter(input) {
      if (input) {
        return 'Cmha+Proxysql'
      } else {
        return 'Mysql'
      }
    }
  },
  data() {
    const validatorDbUser = (rule, value, callback) => {
      this.appModel.user.dbuser = this.appModel.user.dbuser.trim()
      const pattern = new RegExp('^[a-zA-Z][a-zA-Z0-9_-]{2,31}$')
      if (!pattern.test(this.appModel.user.dbuser)) {
        this.dbuserIsValid = false
        callback(new Error('输入不符合规则 3-32个字符，首字符必须是字母，只允许字母、数字、下划线、减号'))
      } else {
        this.dbuserIsValid = true
        callback()
      }
    }
    const validatorDbPwd = (rule, value, callback) => {
      const pattern = new RegExp('^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@_$!%*#?&])[A-Za-z\\d@_$!%*#?&]{8,}$')
      if (!pattern.test(this.appModel.user.dbpwd)) {
        this.dbpwdIsValid = false
        callback(new Error('输入不符合规则 8-32个字符，必须包含数字、字母及符号'))
      } else {
        this.dbpwdIsValid = true
        callback()
      }
    }
    const validatorDbName = (rule, value, callback) => {
      this.appModel.schema.dbname = this.appModel.schema.dbname.trim()
      const pattern = new RegExp('^[a-zA-Z][a-zA-Z0-9_]{2,31}$')
      if (!pattern.test(this.appModel.schema.dbname)) {
        this.dbnameIsValid = false
        callback(new Error('输入不符合规则 3-32个字符，首字符必须是字母，只允许字母、数字、下划线'))
      } else {
        this.dbnameIsValid = true
        callback()
      }
    }
    return {
      useCmha: false,
      appModel: {
        id: undefined,
        businessSystemName: '',
        businessSubsystemName: '',
        type: 'MYSQL',
        site: {
          id: undefined,
          name: undefined
        },
        area: {
          code: undefined,
          display: undefined
        },
        name: undefined,
        cnt: undefined,
        clusterHA: false,
        highAvailability: false,
        mysqlModel: {
          highAvailability: false,
          version: '',
          osArch: '',
          arch: {
            mode: undefined,
            replicas: 0,
            name: ''
          },
          scale: '',
          cpuCnt: undefined,
          memSize: undefined,
          port: 3306,
          dataDirSize: undefined,
          dataDirType: {
            code: undefined,
            display: undefined
          },
          dataDirPerformance: {
            code: undefined,
            display: undefined
          },
          logDirSize: undefined,
          networkBandwidth: undefined
        },
        cmhaModel: {
          version: '',
          arch: {
            mode: undefined,
            replicas: 3,
            name: ''
          },
          scale: '',
          cpuCnt: undefined,
          memSize: undefined,
          port: 3306,
          dataDirSize: undefined,
          dataDirType: {
            code: undefined,
            display: undefined
          },
          dataDirPerformance: {
            code: undefined,
            display: undefined
          },
          logDirSize: undefined,
          networkBandwidth: undefined
        },
        proxysqlModel: {
          version: '',
          arch: {
            mode: undefined,
            replicas: 1,
            name: ''
          },
          scale: '',
          cpuCnt: undefined,
          memSize: undefined,
          port: 3306,
          dataDirSize: undefined,
          dataDirType: {
            code: undefined,
            display: undefined
          },
          dataDirPerformance: {
            code: undefined,
            display: undefined
          },
          logDirSize: undefined,
          networkBandwidth: undefined
        },
        user: {
          dbuser: '',
          dbpwd: ''
        },
        schema: {
          dbname: '',
          characterSet: 'utf8mb4'
        },
        schedule: '12 3 */1 * *'
      },
      dbuserIsValid: false,
      dbpwdIsValid: false,
      dbnameIsValid: false,

      activeTab: 'first',
      system: '',
      mysqlImageId: '',
      // cmhaImageId: '',
      // proxysqlImageId: '',
      systemList: [],
      allSubsystemsMap: new Map(),
      areaList: [],
      sitesList: [],
      imageList: {},
      imageConfigList: [],
      imageConfigMap: new Map(),
      archList: [],
      mysqlArchList: [],
      cmhaArchList: [],
      proxyArchList: [],
      scaleList: [],
      cfgTableData: [],
      cronLocale: {
        cn: {
          every: '每隔',
          mminutes: '分钟',
          hoursOnMinute: '（天）几点的第几分钟',
          daysAt: '天几点几分',
          at: '的几点几分',
          onThe: '在',
          dayOfEvery: '日',
          monthsAt: '每个月',
          everyDay: '',
          mon: '周一',
          tue: '周二',
          wed: '周三',
          thu: '周四',
          fri: '周五',
          sat: '周六',
          sun: '周日',
          hasToBeBetween: 'Has to be between',
          and: 'and',
          minutes: 'MINUTES',
          hourly: 'HOURLY',
          daily: '每天',
          weekly: '每周',
          monthly: '每月',
          advanced: '自定义',
          cronExpression: 'Cron表达式:'
        }
      },

      appRules: {
        dbuser: [
          { required: true, validator: validatorDbUser, trigger: 'change' }],
        dbpwd: [
          { required: true, validator: validatorDbPwd, trigger: 'change' }],
        dbname: [
          { required: true, validator: validatorDbName, trigger: 'change' }]
      },

      dbCharsets: [
        { 'charset': 'armscii8' },
        { 'charset': 'ascii' },
        { 'charset': 'big5' },
        { 'charset': 'binary' },
        { 'charset': 'cp1250' },
        { 'charset': 'cp1251' },
        { 'charset': 'cp1256' },
        { 'charset': 'cp1257' },
        { 'charset': 'cp850' },
        { 'charset': 'cp852' },
        { 'charset': 'cp866' },
        { 'charset': 'cp932' },
        { 'charset': 'dec8' },
        { 'charset': 'eucjpms' },
        { 'charset': 'euckr' },
        { 'charset': 'gb18030' },
        { 'charset': 'gb2312' },
        { 'charset': 'gbk' },
        { 'charset': 'geostd8' },
        { 'charset': 'greek' },
        { 'charset': 'hebrew' },
        { 'charset': 'hp8' },
        { 'charset': 'keybcs2' },
        { 'charset': 'koi8r' },
        { 'charset': 'koi8u' },
        { 'charset': 'latin1' },
        { 'charset': 'latin2' },
        { 'charset': 'latin5' },
        { 'charset': 'latin7' },
        { 'charset': 'macce' },
        { 'charset': 'macroman' },
        { 'charset': 'sjis' },
        { 'charset': 'swe7' },
        { 'charset': 'tis620' },
        { 'charset': 'ucs2' },
        { 'charset': 'ujis' },
        { 'charset': 'utf16' },
        { 'charset': 'utf16le' },
        { 'charset': 'utf32' },
        { 'charset': 'utf8' },
        { 'charset': 'utf8mb4' }
      ]
    }
  },
  computed: {
    ...mapGetters([
      'user_id'
    ]),
    paneCommonValid: function() {
      return this.appModel.businessSystemName !== '' &&
        this.appModel.businessSubsystemName !== '' &&
        this.appModel.site.id !== undefined &&
        this.appModel.area.code !== undefined &&
        this.appModel.name !== ''
    },
    paneMysqlValid: function() {
      return this.appModel.mysqlModel.version !== '' &&
        this.appModel.mysqlModel.scale !== '' &&
        this.appModel.mysqlModel.arch.mode !== undefined &&
        this.appModel.mysqlModel.dataDirType.code !== undefined &&
        this.appModel.mysqlModel.dataDirPerformance.code !== undefined
    },
    paneCmhalValid: function() {
      return this.appModel.cmhaModel.scale !== '' &&
        this.appModel.cmhaModel.arch.mode !== undefined &&
        this.appModel.cmhaModel.dataDirType.code !== undefined &&
        this.appModel.cmhaModel.dataDirPerformance.code !== undefined
    },
    paneProxysqlValid: function() {
      return this.appModel.proxysqlModel.scale !== '' &&
        this.appModel.proxysqlModel.arch.mode !== undefined &&
        this.appModel.proxysqlModel.dataDirType.code !== undefined &&
        this.appModel.proxysqlModel.dataDirPerformance.code !== undefined
    },
    paneDBConfigValid: function() {
      return this.appModel.user.dbuser !== '' &&
        this.appModel.user.dbpwd !== '' &&
        this.dbuserIsValid &&
        this.dbpwdIsValid &&
        this.dbnameIsValid
    },
    paneFinalValid: function() {
      const mysqlValid = this.paneMysqlValid
      const cmhaValid = this.paneCmhalValid
      const proxysqlValid = this.paneProxysqlValid

      if (!this.useCmha) {
        return mysqlValid && this.paneDBConfigValid
      } else {
        return mysqlValid && cmhaValid && proxysqlValid
      }
    },
    summaryTableData: function() {
      return [{
        prop: '版本',
        mysql: this.appModel.mysqlModel.version,
        cmha: this.appModel.cmhaModel.version,
        proxysql: this.appModel.proxysqlModel.version
      }, {
        prop: '端口',
        mysql: this.appModel.mysqlModel.port,
        cmha: this.appModel.cmhaModel.port,
        proxysql: this.appModel.proxysqlModel.port
      }, {
        prop: '架构',
        mysql: this.appModel.mysqlModel.arch.mode,
        cmha: this.appModel.cmhaModel.arch.mode,
        proxysql: this.appModel.proxysqlModel.arch.mode
      }, {
        prop: 'Replic数量',
        mysql: this.appModel.mysqlModel.arch.replicas,
        cmha: this.appModel.cmhaModel.arch.replicas,
        proxysql: this.appModel.proxysqlModel.arch.replicas
      }, {
        prop: '规模',
        mysql: this.appModel.mysqlModel.scale,
        cmha: this.appModel.cmhaModel.scale,
        proxysql: this.appModel.proxysqlModel.scale
      }, {
        prop: '数据空间(G)',
        mysql: this.appModel.mysqlModel.dataDirSize,
        cmha: this.appModel.cmhaModel.dataDirSize,
        proxysql: this.appModel.proxysqlModel.dataDirSize
      }, {
        prop: '日志空间(G)',
        mysql: this.appModel.mysqlModel.logDirSize,
        cmha: this.appModel.cmhaModel.logDirSize,
        proxysql: this.appModel.proxysqlModel.logDirSize
      }
      ]
    },
    subSystemList: function() {
      return this.allSubsystemsMap.get(this.appModel.businessSystemName)
    },
    mysql_replic_num_min: function() {
      if (this.appModel.mysqlModel.arch.mode === 'single' || this.appModel.mysqlModel.arch.mode === '') {
        return 0
      } else {
        return 1
      }
    },
    mysql_replic_num_max: function() {
      if (this.appModel.mysqlModel.arch.mode === 'single' || this.appModel.mysqlModel.arch.mode === '') {
        return 0
      } else {
        return 4
      }
    },

    cmha_replic_num_min: function() {
      if (this.appModel.cmhaModel.arch.mode === 'single' || this.appModel.cmhaModel.arch.mode === '') {
        return 1
      } else {
        return 3
      }
    },
    cmha_replic_num_max: function() {
      if (this.appModel.cmhaModel.arch.mode === 'single' || this.appModel.cmhaModel.arch.mode === '') {
        return 1
      } else {
        return 9
      }
    },
    cmha_num_step: function() {
      return 2
    },

    proxysql_replic_num_min: function() {
      if (this.appModel.proxysqlModel.arch.mode === 'single' || this.appModel.proxysqlModel.arch.mode === '') {
        return 1
      } else {
        return 2
      }
    },
    proxysql_replic_num_max: function() {
      if (this.appModel.proxysqlModel.arch.mode === 'single' || this.appModel.proxysqlModel.arch.mode === '') {
        return 1
      } else {
        return 9
      }
    },
    proxysql_num_step: function() {
      return 1
    },
    siteName: function() {
      let tmp = ''
      for (const v of this.sitesList) {
        if (v.id === this.appModel.site.id) {
          tmp = v.name
          break
        }
      }
      return tmp
    },
    areaDisplay: function() {
      let tmp = ''
      for (const v of this.areaList) {
        if (v.code === this.appModel.area.code) {
          tmp = v.name
          break
        }
      }
      return tmp
    }
  },
  watch: {
    useCmha: function(newVal, _) {
      if (!newVal) {
        this.appModel.cmhaModel.version = ''
        this.appModel.cmhaModel.arch.mode = undefined
        this.appModel.cmhaModel.arch.name = ''
        this.appModel.proxysqlModel.version = ''
        this.appModel.proxysqlModel.arch.mode = undefined
        this.appModel.proxysqlModel.arch.name = ''
      }
    },
    system: function(newVal, _) {
      this.appModel.system = newVal
      this.appModel.subSystem = ''
    },
    mysqlImageId: function(newVal, _) {
      for (const v of this.imageList['mysql']) {
        if (v.id === newVal) {
          this.appModel.mysqlModel.version = this.showVersion(v.version)
          this.appModel.mysqlModel.osArch = v.architecture
          this.fetchImageConfig(newVal)
          break
        }
      }
    }
    // cmhaImageId: function(newVal, _) {
    //   for (const v of this.imageList['cmha']) {
    //     if (v.id === newVal) {
    //       this.appModel.cmhaModel.version = this.showVersion(v.version)
    //       // this.fetchImageConfig(newVal)
    //       break
    //     }
    //   }
    // },
    // proxysqlImageId: function(newVal, _) {
    //   for (const v of this.imageList['proxysql']) {
    //     if (v.id === newVal) {
    //       this.appModel.proxysqlModel.version = this.showVersion(v.version)
    //       // this.fetchImageConfig(newVal)
    //       break
    //     }
    //   }
    // }
  },
  created() {
    this.fetchSubSystems()
    this.fetchAreas()
    this.fetchSites()
    this.fetchImages()
    this.generateName()
    this.fetchArchs()
    this.fetchScales()
  },
  methods: {
    change_mysql_replic_num: function() {
      if (this.appModel.mysqlModel.arch.mode === 'single') {
        this.appModel.mysqlModel.arch.replicas = 0
      } else if (this.appModel.mysqlModel.arch.replicas < 1) {
        this.appModel.mysqlModel.arch.replicas = 1
      }
    },

    change_cmha_replic_num: function() {
      if (this.appModel.cmhaModel.arch.mode === 'single' || this.appModel.cmhaModel.arch.mode === '') {
        this.appModel.cmhaModel.arch.replicas = 1
      } else {
        this.appModel.cmhaModel.arch.replicas = 3
      }
    },
    change_proxysql_replic_num: function() {
      if (this.appModel.proxysqlModel.arch.mode === 'single' || this.appModel.proxysqlModel.arch.mode === '') {
        this.appModel.proxysqlModel.arch.replicas = 1
      } else {
        this.appModel.proxysqlModel.arch.replicas = 3
      }
    },

    showVersion: function(input) {
      return input.major + '.' + input.minor + '.' + input.patch + '.' + input.build
    },
    fetchSubSystems: function() {
      fetchBusinessSubSystems().then(response => {
        for (const x of response.data) {
          if (!this.allSubsystemsMap.has(x.businessSystemName)) {
            this.allSubsystemsMap.set(x.businessSystemName, [])
          }
          const tmpList = this.allSubsystemsMap.get(x.businessSystemName)
          tmpList.push(x)
          this.allSubsystemsMap.set(x.businessSystemName, tmpList)
        }

        for (const [k, v] of this.allSubsystemsMap.entries()) {
          this.systemList.push({
            id: v.businessSystemId,
            name: k
          })
        }
      })
    },
    fetchAreas: function() {
      fetchAreas().then(response => {
        this.areaList = response.data
      })
    },
    fetchSites() {
      fetchSites().then(response => {
        this.sitesList = response.data
      })
    },
    fetchImages: function() {
      fetchImages().then(response => {
        for (const image of response.data) {
          if (this.imageList[image.type] === undefined) {
            this.imageList[image.type] = []
          }
          if (image.unschedulable) {
            continue
          }
          this.imageList[image.type].push(image)
        }
      })
    },
    fetchImageConfig: function(imageId) {
      fetchImageConfig(imageId).then(response => {
        this.imageConfigList = response.data.keysets
        this.imageConfigMap = new Map()
        for (const p of this.imageConfigList) {
          this.imageConfigMap.set(p.key, p)
        }
      })
    },
    generateName: function() {
      this.appModel.name = Math.random().toString(36).substring(6)
      while (!isNaN(this.appModel.name[0])) {
        this.appModel.name = Math.random().toString(36).substring(6)
      }
    },
    fetchArchs: function() {
      fetchDicts({ dict_type_code: 'arch_type' }).then(response => {
        this.archList = response.data
        for (const a of this.archList) {
          if (a.code.includes('replication')) {
            this.mysqlArchList.push(a)
          } else if (a.code.includes('clone')) {
            this.proxyArchList.push(a)
            this.cmhaArchList.push(a)
          } else {
            this.mysqlArchList.push(a)
            this.proxyArchList.push(a)
          }
        }
      })
    },
    fetchScales: function() {
      fetchScales({ type: 'mysql', enabled: true }).then(response => {
        this.scaleList = response.data
      })
    },
    addTableItem: function() {
      if (this.cfgTableData.length >= 1 && this.cfgTableData[this.cfgTableData.length - 1].name === '') {
        return
      }
      this.cfgTableData.push({
        name: '',
        value: '',
        range: ''
      })
    },
    deleteTableItem: function(row) {
      let i = 0
      for (const v of this.cfgTableData) {
        if (v.name === row.name) {
          this.cfgTableData.splice(i, 1)
          break
        }
        i += 1
      }
    },
    setCfgValue: function(row) {
      row.value = this.imageConfigMap.get(row.name)['value']
      row.range = this.imageConfigMap.get(row.name)['range']
    },
    getScaleValues: function(input) {
      for (const s of this.scaleList) {
        if (s.name === input) {
          return [s.cpuCnt, s.memSize]
        }
      }
      return [0, 0]
    },
    cloneForNewRemote(input) {
      const res = {}
      res.type = 'MYSQL'
      res.businessSystemName = input.businessSystemName
      res.businessSubsystemName = input.businessSubsystemName
      res.siteId = input.site.id
      res.areaCode = input.area.code
      res.name = input.name
      res.orders = []

      const versionArr = input.mysqlModel.version.split('.')
      const mysqlScales = this.getScaleValues(input.mysqlModel.scale)

      const tmp = {}
      tmp.type = 'MYSQL'
      tmp.version = {
        major: versionArr[0],
        minor: versionArr[1],
        patch: versionArr[2],
        build: versionArr[3]
      }
      tmp.arch = {
        mode: input.mysqlModel.arch.mode,
        replicas: input.mysqlModel.arch.replicas + 1
      }
      tmp.cpuCnt = mysqlScales[0]
      tmp.memSize = mysqlScales[1]
      tmp.port = input.mysqlModel.port
      tmp.dataDirPerformance = input.mysqlModel.dataDirPerformance.code
      tmp.logDirPerformance = input.mysqlModel.dataDirPerformance.code
      tmp.data_dir_performance = input.mysqlModel.dataDirPerformance.code
      tmp.dataDirType = input.mysqlModel.dataDirType.code
      tmp.logDirType = input.mysqlModel.dataDirType.code
      tmp.dataDirSize = parseInt(input.mysqlModel.dataDirSize) * 1024
      tmp.logDirSize = parseInt(input.mysqlModel.logDirSize) * 1024
      tmp.networkBandwidth = 0
      tmp.clusterHA = this.appModel.mysqlModel.highAvailability
      tmp.hostHA = input.highAvailability
      tmp.networkHA = input.highAvailability
      tmp.storageHA = input.highAvailability
      tmp.hamode = this.useCmha
      tmp.hacontainer = false
      tmp.cnt = 1
      tmp.cfgs = this.formatterCfgs(this.cfgTableData)
      tmp.architecture = input.mysqlModel.osArch

      if (this.useCmha) {
        const cmhaScales = this.getScaleValues(input.mysqlModel.scale)
        tmp.cmha = [
          {
            mode: 'clone',
            replicas: 3,
            port: input.cmhaModel.port,
            cpu: cmhaScales[0],
            memory: cmhaScales[1],
            performance: input.cmhaModel.dataDirPerformance.code,
            log_capacity: parseInt(input.cmhaModel.logDirSize) * 1024,
            data_capacity: parseInt(input.cmhaModel.dataDirSize) * 1024
          }
        ]

        const proxyScales = this.getScaleValues(input.mysqlModel.scale)
        tmp.proxy = [
          {
            mode: 'single',
            replicas: 1,
            port: input.proxysqlModel.port,
            cpu: proxyScales[0],
            memory: proxyScales[1],
            performance: input.proxysqlModel.dataDirPerformance.code,
            log_capacity: parseInt(input.proxysqlModel.logDirSize) * 1024,
            data_capacity: parseInt(input.proxysqlModel.dataDirSize) * 1024
          }
        ]
      }

      tmp.users = [
        {
          dbuser: input.user.dbuser,
          dbpwd: input.user.dbpwd
        }
      ]
      tmp.schemas = [
        {
          dbname: input.schema.dbname,
          characterSet: input.schema.characterSet
        }
      ]
      tmp.schedule = input.schedule

      res.orders = [tmp]
      return res
    },
    formatterCfgs(arr) {
      const obj = {
        character_set_server: 'utf8mb4'
      }
      for (let i = 0; i < arr.length; i++) {
        obj[arr[i].name] = arr[i].value
      }
      return obj
    },
    applyMysqlOrder() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForNewRemote(this.appModel)
          addOrder(tempData).then(() => {
            this.$notify({
              title: 'Success',
              message: '添加成功',
              type: 'success',
              duration: 2000
            })
            this.$router.push({
              path: '/applicationManagement/applyForApproval'
            })
          })
        }
      })
    }
  }
}
</script>

<style scoped>
  .summary_head {
    background-color: #409EFF;
    color: whitesmoke;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    font-size: medium;
    padding: 5px;
  }

  .summary_item {
    background-color: #EBEEF5;
    font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
    font-size: smaller;
    padding: 5px 0 5px 10px;
  }
</style>
