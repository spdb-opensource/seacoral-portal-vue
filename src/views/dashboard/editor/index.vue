<template>
  <div class="dashboard-editor-container">
    <el-row>
      <el-col :span="10">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <span>容器主机比</span>
          </div>
          <div>
            <el-row>
              <el-col :span="8">
                <div>
                  <img src="http://116.63.152.48:8088/spdb/img/hostCnt.png" style="width:50%;" align="left">
                </div>

                <div style="margin-left:-10px;">
                  <img src="http://116.63.152.48:8088/spdb/img/containercnt.png" style="width:60%;" align="left">
                </div>
              </el-col>
              <el-col :span="8">

                <h3> <span>主机数量:</span><span>{{ hostNum }}</span></h3>
                <h3 style="margin-top:60px;"> <span>容器数量:</span><span>{{ containerNum }}</span></h3>
              </el-col>
              <el-col :span="8">
                <el-progress type="circle" :percentage="hostRatio" />
                <span style="padding-left:25px;">容器主机比</span>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </el-col>
      <el-col :span="1"> &nbsp;</el-col>
      <el-col :span="6">
        <el-card class="box-card" style="height:257px;">
          <div slot="header" class="clearfix">
            <span>服务状态</span>
          </div>
          <div>

            <div><span>正常</span><el-progress :text-inside="true" :stroke-width="20" :percentage="normalRatio " /></div>

            <div style="margin-top:15px;"><span>告警</span><el-progress :text-inside="true" :stroke-width="20" :percentage="alarmRatio" status="warning" /></div>

            <div style="margin-top:15px;"><span>异常</span><el-progress :text-inside="true" :stroke-width="20" :percentage="alarmRatio" status="exception" /></div>

          </div>
        </el-card>
      </el-col>
      <el-col :span="1"> &nbsp;</el-col>
      <el-col :span="5">
        <el-card class="box-card" style="height:257px;">
          <div slot="header" class="clearfix">
            <span>告警统计</span>
          </div>
          <div>
            <div><span>当日已经成功发送的告警数量:</span><span>0</span></div>
            <div style="margin-top:30px"><span>当日未发送成功告警数量:</span><span>0</span></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row style="margin-top:30px;">
      <el-col :span="11">
        <el-card class="box-card" style="height:300px;">
          <div slot="header" class="clearfix">
            <span>存储分配率</span>
          </div>
          <div>
            <el-table :data="clusterlist" border fit highlight-current-row style="width: 100%;">

              <el-table-column align="center" label="存储名称" width="auto">
                <template slot-scope="scope">
                  <span>{{ scope.row.name }}</span>
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
            </el-table>
          </div>
        </el-card>
      </el-col>
      <el-col :span="1">&nbsp;</el-col>
      <el-col :span="11">
        <el-card class="box-card" style="height:300px;">
          <div slot="header" class="clearfix">
            <span>网段分配率</span>
          </div>
          <div>
            <el-table :data="networkinglist" border fit highlight-current-row style="width: 100%;">

              <el-table-column align="center" label="起始IP" width="auto">
                <template slot-scope="scope">
                  <span>{{ scope.row.startIp }}</span>
                </template>
              </el-table-column>

              <el-table-column align="center" label="结束IP" width="auto">
                <template slot-scope="scope">
                  <span>{{ scope.row.endIp }}</span>
                </template>
              </el-table-column>

              <el-table-column align="center" label="ip使用率" width="auto">
                <template slot-scope="scope">
                  <span>{{ parseInt(100 * scope.row.ip.usedCnt/scope.row.ip.total) }}%({{ scope.row.ip.usedCnt }}/{{ scope.row.ip.total }})</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row style="margin-top:30px;">
      <el-col :span="23">
        <el-card class="box-card" style="height:300px;">
          <div slot="header" class="clearfix">
            <span>主机分配率</span>
          </div>
          <div>
            <el-table

              :data="hostList"
              border
              fit
              highlight-current-row
              style="width: 100%"
            >

              <el-table-column
                align="center"
                label="所属集群"
                width="120"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.cluster.name }}</span>
                </template>
              </el-table-column>

              <el-table-column
                align="center"
                label="主机IP"
                width="150"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.ip }}</span>
                </template>
              </el-table-column>

              <el-table-column
                align="center"
                label="容器分配率"
                width="100"
              >
                <template slot-scope="scope">
                  <el-progress
                    :text-inside="true"
                    :stroke-width="20"
                    :percentage="scope.row.unitCnt / scope.row.maxUnitCnt | progressFilter"
                    :status="scope.row.unitCnt / scope.row.maxUnitCnt | progressStatusFilter"
                  />
                </template>
              </el-table-column>

              <el-table-column
                align="center"
                label="CPU分配率"
                width="100"
              >
                <template slot-scope="scope">
                  <el-progress
                    :text-inside="true"
                    :stroke-width="20"
                    :percentage="scope.row.cpu.usedCnt / scope.row.cpu.total | progressFilter"
                    :status="scope.row.cpu.usedCnt / scope.row.cpu.total | progressStatusFilter"
                  />
                  <!--          <span>{{ (scope.row.cpu.usedCnt + "/" + scope.row.cpu.total + "/") | usageFilter }}</span>-->
                </template>
              </el-table-column>

              <el-table-column
                align="center"
                label="内存分配率"
                width="100"
              >
                <template slot-scope="scope">
                  <el-progress
                    :text-inside="true"
                    :stroke-width="20"
                    :percentage="scope.row.mem.usedSize / scope.row.mem.totalSize | progressFilter"
                    :status="scope.row.mem.usedSize / scope.row.mem.totalSize | progressStatusFilter"
                  />
                  <!--          <span>{{ (scope.row.mem.usedSize + "/" + scope.row.mem.totalSize + "/1024/G") | usageFilter }}</span>-->
                </template>
              </el-table-column>

              <el-table-column
                align="center"
                label="存储分配率(G)"
                width="120"
              >
                <template
                  v-if="scope.row.storage"
                  slot-scope="scope"
                >
                  <span
                    v-for="(item, i) in scope.row.storage"
                    :key="`I-${i}`"
                    style="font-size: small"
                  >{{ item.performance.display }}:{{ (item.usedSize + "/" + item.totalSize + "/1024") | usageFilter }}<br></span>
                </template>
              </el-table-column>

              <el-table-column
                align="center"
                label="外置存储"
                width="auto"
              >
                <template slot-scope="scope">
                  <span v-if="scope.row.storageRemote">{{ scope.row.storageRemote.name }}</span>
                </template>
              </el-table-column>

              <el-table-column
                align="center"
                label="启用/停用"
                width="auto"
                fixed="right"
              >
                <template slot-scope="{row}">
                  <el-tag :type="row.enabled | enableDisableFilter">
                    <i :class="row.enabled | enableDisableIcon" />
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column
                align="center"
                label="任务状态"
                width="auto"
                fixed="right"
              >
                <template slot-scope="scope">
                  <span>{{ scope.row.task.action.display + scope.row.task.status.display }}</span>
                </template>
              </el-table-column>
            </el-table></div>
        </el-card>
      </el-col>
    </el-row>

  </div>
</template>

<script>
import { fetchHosts } from '@/api/manager/hosts'
import { fetchRemoteStorages } from '@/api/manager/storages'
import { fetchNetworking } from '@/api/manager/networking'

export default {
  name: 'DashboardEditor',
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
    progressFilter(input) {
      return parseFloat((input * 100.0).toFixed(1))
    },
    progressStatusFilter(input) {
      if (input <= 0.5) {
        return 'success'
      } else if (input <= 0.75) {
        return 'warning'
      } else {
        return 'exception'
      }
    },
    usageFilter(input) {
      const inputs = input.split('/')
      let scale = 1
      // let unit = ''
      if (inputs.length >= 4) {
        scale = parseInt(inputs[2])
        // unit = inputs[3]
      }
      const used = parseInt(inputs[0]) / scale
      const total = parseInt(inputs[1]) / scale
      const usage_pct = (used / total) * 100.0
      // return usage_pct.toFixed(1) + '%(' + used.toFixed(0) + unit + '/' + total.toFixed(0) + unit + ')'
      return usage_pct.toFixed(1) + '%'
    },
    toInt(input) {
      return input.toFixed(0)
    }
  },

  data() {
    return {
      hostNum: 0,
      containerNum: 4,
      normalHostNum: 0,
      clusterlist: [],
      networkinglist: [],
      hostList: []

    }
  },
  computed: {
    hostRatio() {
      return this.containerNum / this.hostNum * 100
    },
    alarmRatio() {
      return 0
    },
    normalRatio() {
      return this.normalHostNum / this.hostNum * 100
    }
  },
  created() {
    this.getHostList()
    this.getRemoteList()
    this.getNetworkingList()
  },
  methods: {
    getHostList() {
      fetchHosts().then(response => {
        this.hostList = response.data
        this.hostNum = response.data.length
        var tmp = response.data
        for (let i = 0; i < tmp.length; i++) {
          if (tmp[i].enabled === true) {
            this.normalHostNum++
          }
        }
      })
    },
    getRemoteList() {
      this.listLoading = true
      fetchRemoteStorages().then(response => {
        this.clusterlist = response.data
      })
    },
    getNetworkingList() {
      fetchNetworking().then(response => {
        this.networkinglist = response.data
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card{
  background-color: #e3e3e3;
}

  .dashboard-editor-container {
   // background-color: #e3e3e3;
    min-height: 100vh;
    padding: 50px 60px 0px;
    .pan-info-roles {
      font-size: 12px;
      font-weight: 700;
      color: #333;
      display: block;
    }
    .info-container {
      position: relative;
      margin-left: 190px;
      height: 150px;
      line-height: 200px;
      .display_name {
        font-size: 48px;
        line-height: 48px;
        color: #212121;
        position: absolute;
        top: 25px;
      }
    }
  }
</style>
