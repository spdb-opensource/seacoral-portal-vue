<template>
  <div class="app-container">
    <el-form ref="editForm" :model="dialogTemp" label-width="100px" style="width: 1000px; margin-left:50px;">
      <el-divider content-position="left">基础信息</el-divider>
      <el-row>
        <el-col :span="10">
          <el-form-item label="站点" prop="site.name">
            <el-input v-model="dialogTemp.site.name" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="区域" prop="area.display">
            <el-input v-model="dialogTemp.area.display" readonly />
          </el-form-item></el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="用户" prop="creator">
            <el-input v-model="dialogTemp.creator" readonly />
          </el-form-item>
        </el-col>
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="服务名称" prop="name">
            <el-input v-model="dialogTemp.name" readonly />
          </el-form-item>
        </el-col>
      </el-row>

      <div>
        <el-divider content-position="left">MySql</el-divider>
        <el-row>
          <el-col :span="10">
            <el-form-item label="架构" prop="orders[0].arch.name">
              <el-input v-model="dialogTemp.orders[0].arch.name" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="版本" prop="orders[0].version">
              <el-input :value="showVersion(dialogTemp.orders[0].version)" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="端口" prop="orders[0].port">
              <el-input v-model="dialogTemp.orders[0].port" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="数据磁盘大小" prop="orders[0].dataDirSize">
              <el-input :value="`${showGB(dialogTemp.orders[0].dataDirSize)}G`" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="磁盘类型" prop="orders[0].dataDirType.display">
              <el-input v-model="dialogTemp.orders[0].dataDirType.display" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="存储性能等级" prop="orders[0].dataDirPerformance.display">
              <el-input v-model="dialogTemp.orders[0].dataDirPerformance.display" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="日志磁盘大小" prop="orders[0].logDirSize">
              <el-input :value="`${showGB(dialogTemp.orders[0].logDirSize)}G`" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="规模" prop="modified">
              <el-input :value="`${dialogTemp.orders[0].cpuCnt/1000}核${showGB(dialogTemp.orders[0].memSize)}G`" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="高可用" prop="orders[0].clusterHA">
              <el-switch
                v-model="dialogTemp.orders[0].clusterHA"
                active-color="#13ce66"
                inactive-color="#ff4949"
                disabled
              />
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
              <el-input v-model="dialogTemp.orders[0].cmha[0].mode" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="备库数量" prop="orders[0].cmha[0].replicas">
              <el-input-number
                v-model="dialogTemp.orders[0].cmha[0].replicas"
                :min="dialogTemp.orders[0].cmha[0].replicas"
                :max="dialogTemp.orders[0].cmha[0].replicas"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="端口" prop="orders[0].cmha[0].port">
              <el-input v-model="dialogTemp.orders[0].cmha[0].port" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="数据磁盘大小(M)" prop="orders[0].cmha[0].data_capacity">
              <el-input v-model="dialogTemp.orders[0].cmha[0].data_capacity" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="日志磁盘大小(M)" prop="orders[0].cmha[0].log_capacity">
              <el-input v-model="dialogTemp.orders[0].cmha[0].log_capacity" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="存储性能等级" prop="orders[0].cmha[0].performance">
              <el-radio-group v-model="dialogTemp.orders[0].cmha[0].performance">
                <el-radio-button v-if="dialogTemp.orders[0].cmha[0].performance === 'high'" label="high">高性能</el-radio-button>
                <el-radio-button v-if="dialogTemp.orders[0].cmha[0].performance === 'medium'" label="medium">中性能</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="规模" prop="orders[0].cmha[0].scale">
              <el-input :value="`${dialogTemp.orders[0].cmha[0].cpu/1000}核${showGB(dialogTemp.orders[0].cmha[0].memory)}G`" readonly />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <div v-if="dialogTemp.orders[0].proxy.length > 0">
        <!-- <div v-if="dialogTemp.orders[0].proxy != null"> -->
        <el-divider content-position="left">Proxysql</el-divider>
        <el-row>
          <el-col :span="10">
            <el-form-item label="架构" prop="orders[0].proxy[0].mode">
              <el-input v-model="dialogTemp.orders[0].proxy[0].mode" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="备库数量" prop="orders[0].proxy[0].replicas">
              <el-input-number
                v-model="dialogTemp.orders[0].proxy[0].replicas"
                :min="dialogTemp.orders[0].proxy[0].replicas"
                :max="dialogTemp.orders[0].proxy[0].replicas"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="端口" prop="orders[0].proxy[0].port">
              <el-input v-model="dialogTemp.orders[0].proxy[0].port" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="数据磁盘大小(M)" prop="orders[0].proxy[0].data_capacity">
              <el-input v-model="dialogTemp.orders[0].proxy[0].data_capacity" readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="日志磁盘大小(M)" prop="orders[0].proxy[0].log_capacity">
              <el-input v-model="dialogTemp.orders[0].proxy[0].log_capacity" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="4" />
          <el-col :span="10">
            <el-form-item label="存储性能等级" prop="orders[0].proxy[0].performance">
              <el-radio-group v-model="dialogTemp.orders[0].proxy[0].performance">
                <el-radio-button v-if="dialogTemp.orders[0].proxy[0].performance === 'high'" label="high">高性能</el-radio-button>
                <el-radio-button v-if="dialogTemp.orders[0].proxy[0].performance === 'medium'" label="medium">中性能</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="10">
            <el-form-item label="规模" prop="orders[0].proxy[0].scale">
              <el-input :value="`${dialogTemp.orders[0].proxy[0].cpu/1000}核${showGB(dialogTemp.orders[0].proxy[0].memory)}G`" readonly />
            </el-form-item>
          </el-col>
        </el-row>
      </div>

      <el-row>
        <el-col :span="12" />
        <el-col :span="8">
          <el-form-item>
            <el-button type="primary" @click="backTable">返回</el-button>
            <!--            <el-button type="primary" @click="backTable">执行</el-button>-->
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>

  </div>
</template>

<script>
import { fetchViewOrder } from '@/api/system/order'

export default {
  name: 'View',
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
          logDirSize: undefined,
          networkBandwidth: undefined,
          clusterHA: undefined,
          scale: undefined,
          cmha: [],
          proxy: [],
          schemas: [],
          users: []
        }]
      }
    }
  },
  computed: {

  },
  created() {

  },
  mounted() {
    this.getById(this.transData.id)
  },
  methods: {
    getById(id) {
      fetchViewOrder(id).then(response => {
        if (response.data.orders[0].cmha == null) {
          response.data.orders[0].cmha = []
        }
        if (response.data.orders[0].proxy == null) {
          response.data.orders[0].proxy = []
        }
        this.dialogTemp = response.data
      })
    },
    showVersion: function(input) {
      return input.major + '.' + input.minor + '.' + input.patch + '.' + input.build
    },
    showGB(input) {
      var gb = parseInt(input) / 1024
      // console.log(gb.toString())
      return gb.toString()
    },
    backTable() {
      this.$emit('switch')
    }

  }
}
</script>

<style scoped>

</style>
