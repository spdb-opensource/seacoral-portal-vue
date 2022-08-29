<template>
  <div class="app-container">
    <el-form ref="editForm" :model="dialogTemp" label-width="120px" style="width: 1200px; margin-left:50px;">
      <el-divider content-position="left">基础信息</el-divider>
      <el-row>
        <el-col :span="10">
          <el-form-item label="站点" prop="site.name">
            <el-select v-model="dialogTemp.site.name" placeholder="请选择">
              <el-option
                v-for="item in sitesList"
                :key="item.id"
                :label="item.name"
                :value="item.name"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="区域" prop="area.display">
            <el-select v-model="dialogTemp.area.display" placeholder="请选择">
              <el-option
                v-for="item in clusterList"
                :key="item.id"
                :label="item.area.display"
                :value="item.area.code"
              />
            </el-select>

          </el-form-item></el-col>
      </el-row>

      <el-row>
        <el-col :span="10">
          <el-form-item label="用户" prop="creator">
            <el-input v-model="dialogTemp.creator" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="服务名称" prop="name">
            <el-input v-model="dialogTemp.name" />
          </el-form-item>
        </el-col>
      </el-row>

      <div>
        <el-divider content-position="left">MySql</el-divider>
        <el-row>
          <el-col :span="10">
            <el-form-item label="架构" prop="orders[0].arch.name">
              <el-radio-group v-model="dialogTemp.orders[0].arch.mode" :onclick="change_mysql_replic_num()">
                <el-radio-button v-for="i in mysqlArchList" :key="i.id" :label="i.code">{{ i.name }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="备库数量" prop="orders[0].arch.replicas">
              <el-input-number v-model="dialogTemp.orders[0].arch.replicas" :min="mysql_replic_num_min" :max="mysql_replic_num_max" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="版本" prop="orders[0].version">
              <!-- <el-input :value="showVersion(dialogTemp.orders[0].version)" /> -->
              <el-radio-group v-model="dialogTemp.orders[0].version">
                <el-radio-button v-for="i in imageList" :key="i.id" :label="i.version">{{ showVersion(i.version) }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="端口" prop="orders[0].port">
              <el-input v-model="dialogTemp.orders[0].port" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="数据磁盘大小(M)" prop="orders[0].dataDirSize">
              <!-- <el-input :value="`${showGB(dialogTemp.orders[0].dataDirSize)}`" @input="setDataDirSize($event)" /> -->
              <el-input v-model="dialogTemp.orders[0].dataDirSize" />

            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="磁盘类型" prop="orders[0].dataDirType.display">
              <el-radio-group v-model="dialogTemp.orders[0].dataDirType.code">
                <el-radio-button label="remote">外置存储</el-radio-button>
                <el-radio-button label="host">本地存储</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="日志磁盘大小(M)" prop="orders[0].logDirSize">
              <!-- <el-input :value="`${showGB(dialogTemp.orders[0].logDirSize)}`" @input="setLogDirSize" /> -->
              <el-input v-model="dialogTemp.orders[0].logDirSize" />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="存储性能等级" prop="orders[0].dataDirPerformance.display">
              <el-radio-group v-model="dialogTemp.orders[0].dataDirPerformance.code">
                <el-radio-button label="high">高性能</el-radio-button>
                <el-radio-button label="medium">中性能</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="规模" prop="orders[0].scale">
              <el-select
                :value="`${dialogTemp.orders[0].cpuCnt/1000}核${showGB(dialogTemp.orders[0].memSize)}G`"
                placeholder="请选择"
                @input="setMysqlScaleValue"
              >
                <el-option
                  v-for="scale in scaleList"
                  :key="scale.id"
                  :label="scale.name"
                  :value="scale.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="高可用" prop="orders[0].clusterHA">
              <el-switch
                v-model="dialogTemp.orders[0].clusterHA"
                active-color="#13ce66"
                inactive-color="#ff4949"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="20">
            <el-form-item label="带宽" prop="orders[0].networkBandwidth">
              <el-input v-model="dialogTemp.orders[0].networkBandwidth" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div v-if="dialogTemp.orders[0].cmha.length > 0">
        <!-- <div v-if="dialogTemp.orders[0].cmha != null"> -->
        <el-divider content-position="left">Cmha</el-divider>
        <el-row>
          <el-col :span="10">
            <el-form-item label="架构" prop="orders[0].cmha[0].mode">
              <el-radio-group v-model="dialogTemp.orders[0].cmha[0].mode" :onclick="change_cmha_replic_num()">
                <el-radio-button v-for="i in cmhaArchList" :key="i.id" :label="i.code">{{ i.name }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="备库数量" prop="orders[0].cmha[0].replicas">
              <el-input-number v-model="dialogTemp.orders[0].cmha[0].replicas" :min="cmha_replic_num_min" :max="cmha_replic_num_max" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="端口" prop="orders[0].cmha[0].port">
              <el-input v-model="dialogTemp.orders[0].cmha[0].port" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="数据磁盘大小(M)" prop="orders[0].cmha[0].data_capacity">
              <el-input v-model="dialogTemp.orders[0].cmha[0].data_capacity" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="日志磁盘大小(M)" prop="orders[0].cmha[0].log_capacity">
              <el-input v-model="dialogTemp.orders[0].cmha[0].log_capacity" />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="存储性能等级" prop="orders[0].cmha[0].performance">
              <el-radio-group v-model="dialogTemp.orders[0].cmha[0].performance">
                <el-radio-button label="high">高性能</el-radio-button>
                <el-radio-button label="medium">中性能</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="规模" prop="orders[0].cmha[0].scale">
              <el-select
                :value="`${dialogTemp.orders[0].cmha[0].cpu/1000}核${showGB(dialogTemp.orders[0].cmha[0].memory)}G`"
                placeholder="请选择"
                @input="setCmhaScaleValue"
              >
                <el-option
                  v-for="scale in scaleList"
                  :key="scale.name"
                  :label="scale.name"
                  :value="scale.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div v-if="dialogTemp.orders[0].proxy.length > 0">
        <!-- <div v-if="dialogTemp.orders[0].proxy != null"> -->
        <el-divider content-position="left">Proxysql</el-divider>
        <el-row>
          <el-col :span="10">
            <el-form-item label="架构" prop="orders[0].arch.name">
              <el-radio-group v-model="dialogTemp.orders[0].proxy[0].mode" :onclick="change_proxysql_replic_num()">
                <el-radio-button v-for="i in proxyArchList" :key="i.id" :label="i.code">{{ i.name }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="备库数量" prop="orders[0].proxy[0].replicas">
              <el-input-number v-model="dialogTemp.orders[0].proxy[0].replicas" :min="proxysql_replic_num_min" :max="proxysql_replic_num_max" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="端口" prop="orders[0].proxy[0].port">
              <el-input v-model="dialogTemp.orders[0].proxy[0].port" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="数据磁盘大小(M)" prop="orders[0].proxy[0].data_capacity">
              <el-input v-model="dialogTemp.orders[0].proxy[0].data_capacity" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="日志磁盘大小(M)" prop="orders[0].proxy[0].log_capacity">
              <el-input v-model="dialogTemp.orders[0].proxy[0].log_capacity" />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="存储性能等级" prop="orders[0].proxy[0].performance">
              <el-radio-group v-model="dialogTemp.orders[0].proxy[0].performance">
                <el-radio-button label="high">高性能</el-radio-button>
                <el-radio-button label="medium">中性能</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="规模" prop="orders[0].proxy[0].scale`">
              <el-select
                :value="`${dialogTemp.orders[0].proxy[0].cpu/1000}核${showGB(dialogTemp.orders[0].proxy[0].memory)}G`"
                placeholder="请选择"
                @input="setProxyScaleValue"
              >
                <el-option
                  v-for="scale in scaleList"
                  :key="scale.name"
                  :label="scale.name"
                  :value="scale.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div>
        <el-divider content-position="left">其他信息</el-divider>
        <el-row>
          <el-col :span="10">
            <el-form-item label="库名" prop="orders[0].schemas[0].dbname">
              <el-input v-model="dialogTemp.orders[0].schemas[0].dbname" />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="字符集" prop="orders[0].cfgs.character_set_server">
              <el-input v-model="dialogTemp.orders[0].cfgs.character_set_server" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="10">
            <el-form-item label="用户名" prop="orders[0].users[0].dbuser">
              <el-input v-model="dialogTemp.orders[0].users[0].dbuser" />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="密码" prop="orders[0].users[0].dbpwd">
              <el-input v-model="dialogTemp.orders[0].users[0].dbpwd" />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <el-row>
        <el-col :span="12" />
        <el-col :span="8">
          <el-form-item>
            <el-button type="primary" @click="backTable">返回</el-button>
            <el-button type="primary" @click="updateOrder">保存</el-button>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>

  </div>
</template>

<script>
import { fetchSites } from '@/api/manager/sites'
import { fetchClusters } from '@/api/manager/clusters'
import { fetchAreas } from '@/api/selections'
import { fetchImages } from '@/api/manager/images'
import { fetchDicts } from '@/api/system/dictionary'
import { fetchScales } from '@/api/system/scales'
import { fetchViewOrder, modifyOrder } from '@/api/system/order'

export default {
  name: 'Edit',

  data() {
    return {
      dialogTemp: {
        id: undefined,
        type: undefined,
        site: {
          id: undefined,
          name: undefined
        },
        area: {
          code: undefined,
          display: undefined
        },
        name: undefined,
        actionType: {
          code: undefined,
          display: undefined
        },
        status: {
          code: undefined,
          display: undefined
        },
        owner: undefined,
        gmtCreate: '',
        creator: undefined,
        taskId: '',
        orders: [{
          id: undefined,
          type: undefined,
          cnt: undefined,
          version: {
            major: undefined,
            minor: undefined,
            patch: undefined,
            build: undefined
          },
          arch: {
            mode: undefined,
            replicas: undefined,
            name: ''
          },
          cpuCnt: undefined,
          memSize: undefined,
          port: undefined,
          dataDirSize: undefined,
          dataDirType: {
            code: undefined,
            display: undefined
          },
          dataDirPerformance: {
            code: undefined,
            display: undefined
          },
          cfgs: '',
          networkBandwidth: undefined,
          clusterHA: undefined,
          scale: undefined,
          cmha: [],
          proxy: [],
          schemas: [{
            dbname: ''
          }],
          users: [{
            dbuser: '',
            dbpwd: ''
          }]
        }]
      },
      sitesList: [],
      areaList: [],
      imageList: [],
      mysqlArchList: [],
      cmhaArchList: [],
      proxyArchList: [],
      scaleList: [],
      clusterList: []

    }
  },
  computed: {
    mysql_replic_num_min: function() {
      if (this.dialogTemp.orders[0].arch.mode === 'single') {
        return 0
      } else {
        return 1
      }
    },
    mysql_replic_num_max: function() {
      if (this.dialogTemp.orders[0].arch.mode === 'single') {
        return 0
      } else {
        return 4
      }
    },

    cmha_replic_num_min: function() {
      if (this.dialogTemp.orders[0].cmha[0].mode === 'single') {
        return 1
      } else {
        return 3
      }
    },
    cmha_replic_num_max: function() {
      if (this.dialogTemp.orders[0].cmha[0].mode === 'single') {
        return 1
      } else {
        return 9
      }
    },

    proxysql_replic_num_min: function() {
      if (this.dialogTemp.orders[0].proxy[0].mode === 'single') {
        return 1
      } else {
        return 3
      }
    },
    proxysql_replic_num_max: function() {
      if (this.dialogTemp.orders[0].proxy[0].mode === 'single') {
        return 1
      } else {
        return 9
      }
    }
  },
  watch: {

  },
  created() {
    this.getById()
    this.fetchSites()
    this.fetchAreas()
    this.fetchImages()
    this.fetchArchs()
    this.fetchScales()
    this.fetchClusters()
  },
  methods: {
    getById() {
      const id = this.$route.query.id
      fetchViewOrder(id).then(response => {
        if (response.data.orders[0].cmha == null) {
          response.data.orders[0].cmha = []
        }
        if (response.data.orders[0].proxy == null) {
          response.data.orders[0].proxy = []
        }
        this.dialogTemp = response.data
        this.$set(this.dialogTemp.orders[0], 'hamode', this.dialogTemp.orders[0].haMode)
        this.dialogTemp.orders[0].arch.replicas = this.dialogTemp.orders[0].arch.replicas - 1
      })
    },

    showVersion: function(input) {
      return input.major + '.' + input.minor + '.' + input.patch + '.' + input.build
    },
    fetchClusters() {
      fetchClusters().then(response => {
        this.clusterList = response.data
      })
    },
    fetchSites() {
      fetchSites().then(response => {
        this.sitesList = response.data
      })
    },
    fetchAreas: function() {
      fetchAreas().then(response => {
        this.areaList = response.data
      })
    },
    fetchImages: function() {
      fetchImages().then(response => {
        for (const image of response.data) {
          if (image.unschedulable) {
            continue
          }
          if (image.type === 'mysql') {
            this.imageList.push(image)
          }
        }
      })
    },
    fetchArchs: function() {
      fetchDicts({ dict_type_code: 'arch_type' }).then(response => {
        for (const a of response.data) {
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

    showGB(input) {
      const gb = parseInt(input) / 1024
      return gb.toString()
    },
    showReplicas(input) {
      return input - 1
    },
    backTable() {
      this.$router.go(-1)
    },
    updateOrder() {
    //   var id = dialogTemp.id
    //   modifyOrder(id, dialogTemp).then
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          const id = this.dialogTemp.id
          this.dialogTemp.orders[0].arch.replicas = this.dialogTemp.orders[0].arch.replicas + 1
          if (this.dialogTemp.orders[0].arch.mode === 'single') {
            this.dialogTemp.orders[0].arch.replicas = 1
          }
          const tempData = this.cloneForNewRemote(this.dialogTemp)
          modifyOrder(id, tempData).then(() => {
            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
            this.$router.push({
              path: '/applicationManagement/applyForApproval',
              replace: true
            })
          })
        }
      })
    },
    cloneForNewRemote(input) {
      const req = {}
      req.siteId = input.site.id
      req.areaCode = input.area.code
      req.name = input.name

      req.orders = input.orders
      req.orders[0].dataDirType = req.orders[0].dataDirType.code
      req.orders[0].dataDirPerformance = req.orders[0].dataDirPerformance.code
      req.orders[0].logDirType = req.orders[0].logDirType.code
      req.orders[0].logDirPerformance = req.orders[0].logDirPerformance.code

      return req
    },
    change_mysql_replic_num: function() {
      if (this.dialogTemp.orders[0].arch.mode === 'single') {
        this.dialogTemp.orders[0].arch.replicas = 0
      } else if (this.dialogTemp.orders[0].arch.replicas < 1) {
        this.dialogTemp.orders[0].arch.replicas = 1
      }
    },
    change_cmha_replic_num: function() {

    },
    change_proxysql_replic_num: function() {
      if (this.dialogTemp.orders[0].proxy[0].mode === 'single') {
        this.dialogTemp.orders[0].proxy[0].replicas = 1
      } else {
        this.dialogTemp.orders[0].proxy[0].replicas = 3
      }
    },
    getScaleValues: function(input) {
      for (const s of this.scaleList) {
        if (s.name === input) {
          return [s.cpuCnt, s.memSize]
        }
      }
      return [0, 0]
    },
    setMysqlScaleValue(e) {
      const scaleValues = this.getScaleValues(e)

      this.dialogTemp.orders[0].cpuCnt = scaleValues[0]
      this.dialogTemp.orders[0].memSize = scaleValues[1]
    },
    setCmhaScaleValue(e) {
      const scaleValues = this.getScaleValues(e)

      this.dialogTemp.orders[0].cmha[0].cpu = scaleValues[0]
      this.dialogTemp.orders[0].cmha[0].memory = scaleValues[1]
    },
    setProxyScaleValue(e) {
      const scaleValues = this.getScaleValues(e)

      this.dialogTemp.orders[0].proxy[0].cpu = scaleValues[0]
      this.dialogTemp.orders[0].proxy[0].memory = scaleValues[1]
    }

  }
}
</script>

<style scoped>

</style>
