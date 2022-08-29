<template>
  <div :id="id" :class="className" :style="{height:height,width:width}" />

</template>

<script>
import echarts from 'echarts'
import { fetchServiceById } from '@/api/service/mysql/mysql'
import $ from 'jquery'

export default {
  mixins: [],
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    id: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '600px'
    },
    height: {
      type: String,
      default: '600px'
    },
    transData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      chart: null,
      data: []
    }
  },
  mounted() {
    fetchServiceById(this.transData.id).then(response => {
      this.data = response.data
      this.initChart()
    })
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    initChart() {
      this.chart = echarts.init(document.getElementById(this.id))
      const dbMasterPassing = require('@/assets/img/master_passing.png')
      const dbMasterCritcal = require('@/assets/img/master_critcal.png')
      const dbMasterOther = require('@/assets/img/master_other.png')
      const dbSlavePassing = require('@/assets/img/slave_passing.png')
      const dbSlaveCritcal = require('@/assets/img/slave_critcal.png')
      const dbSlaveOther = require('@/assets/img/slave_other.png')
      const dbUnKnow = require('@/assets/img/mysql_other.png')
      const _this = this
      var drawUpsqlData = []
      var drawUpsqlLinks = []
      var redLine = '#F15249'
      var greenLine = '#32BA7C'
      var yellowLine = '#EDC92C'
      var greyLine = '#6D6D6D'
      function slavePosition(slaveNumber) {
        if (slaveNumber === 0) {
          slaveNumber = 1
        }
        var splitSlaveX = parseInt((_this.chart.getHeight() / slaveNumber).toFixed(2))
        var slaveY1 = parseInt((splitSlaveX / 2).toFixed(2))
        var slavePosition = {
          splitSlaveX: splitSlaveX,
          slaveY1: slaveY1
        }
        return slavePosition
      }
      function NodeMasterImg(status) {
        var ret = ''
        if (status === 'passing') {
          ret = ret + dbMasterPassing
        } else if (status === 'critical') {
          ret = ret + dbMasterCritcal
        } else {
          ret = ret + dbMasterOther
        }
        return ret
      }
      function NodeUndefinedImg(status) {
        var ret = ''
        if (status === 'passing') {
          ret = dbUnKnow
        } else if (status === 'critical') {
          ret = dbUnKnow
        } else {
          ret = dbUnKnow
        }
        return ret
      }
      function NodeSlaveImg(status) {
        var ret = ''
        if (status === 'passing') {
          ret = dbSlavePassing
        } else if (status === 'critical') {
          ret = dbSlaveCritcal
        } else if (status === 'noReplication') {
          ret = dbUnKnow
        } else {
          ret = dbSlaveOther
        }
        return ret
      }
      function lineColor(status) {
        var ret = ''
        if (status === 'passing') {
          ret = greenLine
        } else if (status === 'critical') {
          ret = redLine
        } else if (status === 'unknown') {
          ret = greyLine
        } else if (status === 'warning') {
          ret = yellowLine
        }
        return ret
      }
      // this.chart.showLoading();
      //   sendGetWithoutLayer('/' + getProjectName() + '/serv_grps/mysql/' + getSession('mysqlId'), function(data) {
      //     drawUpsqlGraph1(data)
      //     calcCount()
      //   }, ListAlert, null)
      //   graphInterval = window.setInterval(function() {
      //     sendGetWithoutLayer('/' + getProjectName() + '/serv_grps/mysql/' + getSession('mysqlId'), function(data) {
      //       drawUpsqlGraph1(data)
      //     }, ListAlert, null)
      //   }, 3000)
      function drawUpsqlGraph1() {
        $.each(_this.data.servs, function(k, v) {
          var mastery = _this.chart.getHeight() / 2
          var masterx = _this.chart.getWidth() / 4
          var slaveNumber = 0
          var slaveOrder = 0
          if (v.units != null) {
            slaveNumber = v.units.length - 1
          }
          var slavePositionObj = slavePosition(slaveNumber)
          var linkFrom
          var linkEnd
          var linksEndObj = []
          var dataLinks = {}
          if (v.units != null) {
            if (v.units.length === 1) {
              var roleName = v.units[0].name.split('-')[2]
              // linkFrom=roleName;
              var masterImg = 'image://' + NodeMasterImg(v.units[0].status)
              var dataobj = {
                name: roleName,
                value: ['', '', '', v.units[0].status, '', ''],
                color: 'blue',
                fixed: true,
                itemStyle: {
                  normal: { color: 'blue' }
                },
                /* label:{
                    normal:{
                    show:true,
                    position:'bottom'
                    }

                    }, */
                symbol: masterImg,
                symbolSize: [150, 150],
                x: masterx,
                y: mastery
              }
              drawUpsqlData.push(dataobj)
            } else {
              $.each(v.units, function(key, value) {
                var dataObj = {}
                if (value.hasOwnProperty('replication') && value.status !== '' && value.replication.role !== '') {
                  if (value.replication.role === 'master') {
                    var roleName = value.name.split('-')[2]
                    linkFrom = roleName
                    var masterImg = 'image://' + NodeMasterImg(value.status)
                    dataObj = {
                      name: roleName,
                      value: [value.replication.roleName, value.replication.selfIp, value.replication.selfPort, value.status, value.containerStatus, value.replication.role],
                      color: 'blue',
                      fixed: true,
                      itemStyle: {
                        normal: { color: 'blue' }
                      },
                      /* label:{
                    normal:{
                    show:true,
                    position:'bottom'
                    }

                    }, */
                      symbol: masterImg,
                      symbolSize: [150, 150],
                      x: masterx,
                      y: mastery
                    }
                  } else if (value.replication.role === 'slave') {
                    roleName = value.name.split('-')[2]
                    linkEnd = roleName
                    var linkStatus = {
                      linkEnd: linkEnd,
                      status: value.replication.slaveRunning
                    }
                    linksEndObj.push(linkStatus)
                    var slaveImg = 'image://' + NodeSlaveImg(value.status)
                    // var ddd=slavePositionObj.slaveY1+slavePositionObj.splitSlaveX*slaveOrder;
                    dataObj = {
                      name: roleName,
                      value: [value.replication.roleName, value.replication.selfIp, value.replication.selfPort, value.status, value.containerStatus, value.replication.role, value.replication.slaveIoRunning, value.replication.slaveSqlRunning, value.replication.secondsBehindMaster],

                      itemStyle: {
                        normal: { color: 'red' }
                      },
                      /* label:{//节点标签显示
                    normal:{
                    show:true,
                    position:'bottom'
                    }
                    }, */
                      fixed: true,
                      symbol: slaveImg,
                      symbolSize: [120, 120],
                      y: slavePositionObj.slaveY1 + slavePositionObj.splitSlaveX * slaveOrder,
                      x: mastery
                    }
                  } else {
                    roleName = value.name.split('-')[2]
                    linkFrom = roleName
                    masterImg = 'image://' + NodeUndefinedImg(value.status)
                    dataObj = {
                      name: roleName,
                      value: [value.replication.roleName, value.replication.selfIp, value.replication.selfPort, value.status, value.containerStatus, value.replication.role],
                      color: 'yellow',
                      fixed: true,
                      itemStyle: {
                        normal: { color: 'yellow' }
                      },
                      /* label:{
                    normal:{
                    show:true,
                    position:'bottom'
                    }

                    }, */
                      symbol: masterImg,
                      symbolSize: [150, 150],
                      x: masterx,
                      y: mastery
                    }
                  }
                } else {
                  roleName = value.name.split('-')[2]
                  linkEnd = roleName
                  /* var linkStatus={
linkEnd:linkEnd,
status:value.replication.slaveRunning
} */
                  // linksEndObj.push(linkStatus);
                  slaveImg = 'image://' + NodeSlaveImg('noReplication')
                  // var ddd=slavePositionObj.slaveY1+slavePositionObj.splitSlaveX*slaveOrder;
                  dataObj = {
                    name: roleName,
                    value: ['', '', '', value.status, value.containerStatus, '', '', '', ''],

                    itemStyle: {
                      normal: { color: 'red' }
                    },
                    /* label:{//节点标签显示
                    normal:{
                    show:true,
                    position:'bottom'
                    }
                    }, */
                    fixed: true,
                    symbol: slaveImg,
                    symbolSize: [120, 120],
                    y: slavePositionObj.slaveY1 + slavePositionObj.splitSlaveX * slaveOrder,
                    x: mastery
                  }
                }

                slaveOrder = slaveOrder + 1
                drawUpsqlData.push(dataObj)
              })
            }
          }

          $.each(linksEndObj, function(ke, val) {
            var linecolor = lineColor(val.status)
            dataLinks = {
              source: linkFrom,
              target: val.linkEnd,
              lineStyle: {
                normal: {
                  opacity: 0.9,
                  width: 2,
                  curveness: 0,
                  color: linecolor
                }
              }
            }
            drawUpsqlLinks.push(dataLinks)
          })
        })
      }
      drawUpsqlGraph1()
      this.chart.hideLoading()
      this.chart.setOption({
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        formatter: function(params) {
          //                     console.log("params:"+JSON.stringify(params));
          var res = params.name.split('\n')[0]
          if (params.dataType === 'node') {
            if (params.data.value[5] === 'master') {
              res += '<style>td{padding:5px;}</style>'
              res += '</br>服务角色:' + params.data.value[0] + '</br>服务IP:' + params.data.value[1] + '</br>'
              res += '服务端口:' + params.data.value[2] + '</br>服务状态:' + params.data.value[3] + '</br>'
              res += '容器状态:' + params.data.value[4]
            }
            if (params.data.value[5] === 'slave') {
              res += '<style>td{padding:5px;}</style>'
              res += '</br>服务角色:' + params.data.value[0] + '</br>服务IP:' + params.data.value[1] + '</br>'
              res += '服务端口:' + params.data.value[2] + '</br>服务状态:' + params.data.value[3] + '</br>'
              res += '容器状态:' + params.data.value[4] + '</br>复制io状态:' + params.data.value[6] + '</br>'
              res += '复制sql状态:' + params.data.value[7] + '</br>复制延迟:' + params.data.value[8] + '</br>'
            }
          }
          return res
        },
        /* title: {
                text: '部署架构示意图'
            }, */
        animationDurationUpdate: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
          {
            type: 'graph',
            layout: 'none',
            symbolSize: 100,
            roam: false,
            /*  label : {//节点标签显示
                        emphasis : {
                            position : 'bottom',
                            show : true
                        },
                show:true
                    } */
            /* label: {
                        normal: {
                            show: true
                        }
                    } */
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 20],
            edgeLabel: {
              normal: {
                textStyle: {
                  fontSize: 20
                }
              }
            },
            data: drawUpsqlData,
            links: drawUpsqlLinks,
            labelLine: {
              normal: {
                length: 5
              }
            },
            lineStyle: {
              normal: {
                opacity: 0.9,
                width: 2,
                curveness: 0,
                color: 'red'
              }
            }
          }
        ]
      })
      Window.onresize = function() {
        _this.chart.resize()
      }
    }
  }
}
</script>
