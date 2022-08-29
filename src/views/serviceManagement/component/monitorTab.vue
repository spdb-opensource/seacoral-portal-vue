<template>
  <div class="el-dialog--center">
    <el-row type="flex" align="middle">
      <el-col :span="4">
        <h2>日视图</h2>
      </el-col>
      <el-col :span="6">
        <el-select v-model="selection" @change="initChart()">
          <el-option
            v-for="(item,index) in MetricSelectionsData"
            :key="index"
            :label="item.description"
            :value="index"
          />
        </el-select>
      </el-col>
      <el-col :span="12">
        <el-date-picker
          v-model="daterange"
          type="daterange"
          align="right"
          unlink-panels
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="pickerOptions"
          @change="initChart()"
        /></el-col>
    </el-row>
    <div
      :id="id"
      :class="className"
      :style="{height:height,width:width}"
    />
  </div>
</template>

<script>
import echarts from 'echarts'
import $ from 'jquery'
import { fetchMonitorData } from '@/api/service/mysql/monitor'

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
      default: '100%'
    },
    height: {
      type: String,
      default: '500px'
    },
    transData: {
      type: Object,
      default: function() {
        return {}
      },
      deep: true
    },
    visible1: {
      type: Boolean
    }
  },
  data() {
    const end = new Date()
    const start = new Date()
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 1)
    start.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return {
      selection: 0,
      daterange: [start, end],
      chart: null,
      data: [],
      MetricSelectionsData: [
        {
          type: 'container',
          code: 'cpu_avg_usage',
          relateCode: 'container.docker.cpu.avg_usage',
          description: 'CPU使用率'
        },
        {
          type: 'container',
          code: 'datadir_usage',
          relateCode: 'container.docker.fs.datadir_usage',
          description: '表空间使用率'
        },
        {
          type: 'container',
          code: 'logdir_usage',
          relateCode: 'container.docker.fs.logdir_usage',
          description: '日志空间使用率'
        },
        {
          type: 'container',
          code: 'mem_usage',
          relateCode: 'container.docker.mem.usage',
          description: '内存使用率'
        },
        {
          type: 'container',
          code: 'network_receive&transmit',
          relateCode:
            'container.docker.network.receive_bytes_per_sec;container.docker.network.transmit_bytes_per_sec',
          description: '网络吞吐量'
        },
        {
          type: 'mysql',
          code: 'tps',
          relateCode:
            'instance.mysql.pressure.com_insert;instance.mysql.pressure.com_select;instance.mysql.pressure.com_update;instance.mysql.pressure.com_delete',
          description: '负载(TPS)'
        },

        {
          type: 'mysql',
          code: 'buffer_pool_dirty_page',
          relateCode: 'instance.mysql.buffer_pool.dirty_page',
          description: 'BUFFERPOOL脏页数'
        },
        {
          type: 'mysql',
          code: 'buffer_pool_hit',
          relateCode: 'instance.mysql.buffer_pool.hit',
          description: 'BUFFERPOOL命中率'
        },
        {
          type: 'mysql',
          code: 'buffer_pool_usage',
          relateCode: 'instance.mysql.buffer_pool.usage',
          description: 'BUFFERPOOL使用率'
        },
        {
          type: 'mysql',
          code: 'connection&max&exec_thread',
          relateCode:
            'instance.mysql.connection.max;instance.mysql.connection.exec_thread',
          description: '连接数'
        },

        {
          type: 'mysql',
          code: 'innodb_open_table',
          relateCode: 'instance.mysql.pressure.innodb_open_table',
          description: '打开表数量'
        },
        {
          type: 'mysql',
          code: 'behind_master',
          relateCode: 'instance.mysql.replication.behind_master',
          description: '复制延迟监控'
        },
        {
          type: 'mysql',
          code: 'running_status',
          relateCode: 'instance.mysql.running.status',
          description: '运行状态'
        },
        {
          type: 'mysql',
          code: 'process',
          relateCode: 'instance.mysql.process.status',
          description: '进程状态'
        },
        {
          type: 'mysql',
          code: 'running_status',
          relateCode: 'instance.mysql.running.status',
          description: '运行状态'
        },
        {
          type: 'mysql',
          code: 'slave_io',
          relateCode: 'instance.mysql.replication.slave_io',
          description: '复制IO线程状态'
        },
        {
          type: 'mysql',
          code: 'slave_sql',
          relateCode: 'instance.mysql.replication.slave_sql',
          description: '复制SQL线程状态'
        }
      ],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now() - 8.64e6
        },
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            start.setHours(0, 0, 0, 0)
            end.setHours(23, 59, 59, 999)
            picker.$emit('pick', [start, end])
          }
        }]
      }
    }
  },
  watch: {
    visible1: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.chart = echarts.init(document.getElementById(this.id))
            this.initChart()
          })
        } else {
          if (!this.chart) {
            return
          }
          this.chart.dispose()
          this.chart = null
        }
      }
    }
  },
  beforeDestroy() {
    if (!this.chart) {
      return
    }
    this.chart.dispose()
    this.chart = null
  },
  methods: {
    async initChart() {
      var chartDayOption = {
        legend: {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 120,
          bottom: 20,
          data: []
        },
        toolbox: {
          left: 'center',
          feature: {
            dataZoom: {
              yAxisIndex: 'none'
            },
            restore: {},
            saveAsImage: {}
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: chartToolTipFormatter,
          axisPointer: {
            animation: false
          }
        },
        xAxis: {
          type: 'time',
          splitLine: {
            show: false
          }
        },
        yAxis: {
          type: 'value',
          min: 0,
          max: 'dataMax',
          axisLabel: {
            formatter: yAxisFormatterDay
          },
          splitLine: {
            show: false
          },
          minInterval: 1
        },
        dataZoom: genDataZoom(),
        visualMap: {},
        series: []
      }
      var dayData = []
      var legendDayData = []
      const _this = this
      var features = {}
      var async1 = false
      features.async = async1

      var metricSelectDay

      var yAxisDayGap = 0
      var dayInterval = 0

      var monitorUnitId = this.transData.id

      var monitorMarkLineArray = []

      function chartToolTipFormatter(params) {
        var tooltip = ''
        var date = ''
        $.each(params, function(k, v) {
          date = new Date(Number(v.value[0]))
          tooltip += v.seriesName + ':  ' + v.value[1]
          tooltip += '</br>'
        })
        tooltip = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' ' + (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + '</br>' + tooltip

        return tooltip
      }
      function yAxisFormatterDay(value, index) {
        switch (metricSelectDay.getValue().split('.')[0]) {
          case 'cpu_avg_usage':
          case 'mem_usage':
          case 'dir_usage':
          case 'logdir_usage':
            return value + '%'
          case 'running_status':
          case 'process':
          case 'slave_io':
          case 'slave_sql':
            switch (value) {
              case 0:
                return '正常'
              case 1:
                return '告警'
              case 2:
                return '异常'
              case 3:
                return '未知'
              default:
                return value
            }
          case 'network_receive&transmit':
          case 'error_file_size':
            return value + 'MB'
          default:
            return value
        }
      }
      function genDataZoom() {
        return [
          {
            type: 'slider',
            show: true,
            start: 0,
            end: 100,
            handleSize: 30
          },
          {
            type: 'inside',
            start: 0,
            end: 100
          },
          {
            type: 'slider',
            show: false
          }
        ]
      }
      function getMarkLine(metricType) {
        var normal = 0
        var warning = 0
        var critical = 0
        $.each(monitorMarkLineArray, function(index, metricConfig) {
          if (metricConfig.metric === metricType && metricConfig.event_level === 'warning' && metricConfig.event_enable === true && !isNaN(metricConfig.start) && !isNaN(metricConfig.end)) {
            normal = Number(metricConfig.start)
            warning = Number(metricConfig.end) + 1
          } else if (metricConfig.metric === metricType && metricConfig.event_level === 'critical' && metricConfig.event_enable === true && !isNaN(metricConfig.start) && !isNaN(metricConfig.end)) {
            critical = Number(metricConfig.end)
          }
        })
        if (normal === 0 || warning === 0 || critical === 0) {
          return {
            silent: true,
            data: []
          }
        }
        return {
          silent: true,
          symbolSize: 0,
          data: [{
            yAxis: normal
          }, {
            yAxis: warning,
            lineStyle: {
              color: '#ff9933'
            }
          }, {
            yAxis: critical,
            lineStyle: {
              color: 'red'
            }
          }]
        }
      }
      function getVisualMap(metricType) {
        var normal = 0
        var warning = 0
        var crital = 0
        $.each(monitorMarkLineArray, function(index, metricConfig) {
          if (metricConfig.metric === metricType && metricConfig.event_level === 'warning' && metricConfig.event_enable === true && !isNaN(metricConfig.start) && !isNaN(metricConfig.end)) {
            normal = Number(metricConfig.start)
            warning = Number(metricConfig.end) + 1
          } else if (metricConfig.metric === metricType && metricConfig.event_level === 'critical' && metricConfig.event_enable === true && !isNaN(metricConfig.start) && !isNaN(metricConfig.end)) {
            crital = Number(metricConfig.end)
          }
        })
        if (normal === 0 || warning === 0 || crital === 0) {
          return 0
        }
        return {
          top: 10,
          right: 10,
          pieces: [{
            gt: 0,
            lte: normal,
            color: 'green'
          }, {
            gt: normal,
            lte: warning,
            color: '#ff9933'
          }, {
            gt: warning,
            lte: crital,
            color: 'red'
          }],
          outOfRange: {
            color: '#999'
          },
          show: true
        }
      }

      var metricSelectDayType = this.MetricSelectionsData[this.selection].code
      var objType = this.MetricSelectionsData[this.selection].type
      var relateCode = this.MetricSelectionsData[this.selection].relateCode
      var description = this.MetricSelectionsData[this.selection].description
      const chartDay = this.chart

      chartDayOption.series = dayData
      var v = getVisualMap(metricSelectDayType)
      if (v === 0) {
        delete (chartDayOption.visualMap)
      } else {
        chartDayOption.visualMap = getVisualMap(metricSelectDayType)
      }
      if (metricSelectDayType === 'network_receive&transmit' ||
          metricSelectDayType === 'tps' ||
          metricSelectDayType === 'dir_usage' ||
          metricSelectDayType === 'connection&max&exec_thread') {
        chartDayOption.legend = {
          type: 'scroll',
          orient: 'vertical',
          right: 10,
          top: 120,
          bottom: 20,
          data: legendDayData
        }
      } else {
        delete (chartDayOption.legend)
      }
      chartDay.clear()
      chartDay.setOption(chartDayOption)
      chartDay.showLoading()

      if (metricSelectDayType !== '') {
        let params = ''
        let chartData = {}
        var jsonData = {
          'relateCode': relateCode,
          'description': description
        }
        if (relateCode === 'instance.mysql.replication.slave_io' || relateCode === 'instance.mysql.replication.slave_sql' || relateCode === 'instance.mysql.running.status' || relateCode === 'instance.mysql.process.status') {
          params = '/serv_grps/mysql/instancesString/'
          // sendPut('/' + getProjectName() + '/serv_grps/mysql/instancesString/' + monitorUnitId + '/metrics/' + Math.round(dateStart / 1000) + '/' + Math.round((dateEnd + 86399000) / 1000), initDayChart, ListAlert, JSON.stringify(jsonData), features)
        } else {
          if (objType === 'mysql') {
            params = '/serv_grps/mysql/instances/'
            // sendPut('/' + getProjectName() + '/serv_grps/mysql/instances/' + monitorUnitId + '/metrics/' + Math.round(dateStart / 1000) + '/' + Math.round((dateEnd + 86399000) / 1000), initDayChart, ListAlert, JSON.stringify(jsonData), features)
          } else if (objType === 'container') {
            params = '/serv_grps/mysql/containers/'
            // sendPut('/' + getProjectName() + '/serv_grps/mysql/containers/' + monitorUnitId + '/metrics/' + Math.round(dateStart / 1000) + '/' + Math.round((dateEnd + 86399000) / 1000), initDayChart, ListAlert, JSON.stringify(jsonData), features)
          }
        }
        params += monitorUnitId + '/metrics/' + Math.round(this.daterange[0] / 1000) + '/' + Math.round(this.daterange[1] / 1000)
        chartData = await fetchMonitorData(params, jsonData)
        initDayChart(chartData)
      }

      function initDayChart(data) {
        var dayData = []
        var legendDayData = []
        if (dayInterval !== 0) {
          clearInterval(dayInterval)
        }
        var metricSelectDayType = metricSelectDay.getValue().split('.')[0]
        switch (metricSelectDayType) {
          case 'cpu_avg_usage':
          case 'mem_usage':
          case 'running_status':
          case 'process':
          case 'thread_cache_usage':
          case 'innodb_open_table':
          case 'error_file_size':
          case 'slave_io':
          case 'slave_sql':
          case 'buffer_pool_hit':
          case 'buffer_pool_usage':
          case 'buffer_pool_dirty_page':
          case 'connection':
          case 'logdir_usage':
          case 'datadir_usage':
          case 'behind_master':
            if (data.data[0] === null || data.data[0].datas === null) {
              this.$message.error('日视图：未查询到监控数据')
              chartDay.clear()
              chartDay.setOption(chartDayOption)
              chartDay.hideLoading()
              return
            }
            var d = []

            legendDayData.push(metricSelectDay.options[metricSelectDay.getValue()].text)
            $.each(data.data[0].datas, function(i, v) {
              if (metricSelectDayType === 'running_status' || metricSelectDayType === 'process') {
                d.push({
                  name: metricSelectDayType,
                  value: [
                    v.timestamp * 1000,
                    v.value === 'passing' ? 0 : (v.value === 'connecting' ? 1 : (v.value === 'critical' ? 2 : 3))
                  ]
                })
                yAxisDayGap = 2
              } else if (metricSelectDayType === 'error_file_size') {
                d.push({
                  name: metricSelectDayType,
                  value: [
                    v.timestamp * 1000,
                    Math.round(v.value / 1024 / 1024) + 1
                  ]
                })
                yAxisDayGap < (Math.round(v.value * 100) / 100) ? (yAxisDayGap = Math.round(v.value * 100) / 100) : yAxisDayGap
              } else if (metricSelectDayType === 'slave_io' || metricSelectDayType === 'slave_sql') {
                d.push({
                  name: metricSelectDayType,
                  value: [
                    v.timestamp * 1000,
                    v.value === 'Yes' ? 0 : (v.value === 'Connecting' ? 1 : (v.value === 'No' ? 2 : 3))
                  ]
                })
                yAxisDayGap = 2
              } else {
                d.push({
                  name: metricSelectDayType,
                  value: [
                    v.timestamp * 1000,
                    Math.round(v.value * 100) / 100
                  ]
                })
                yAxisDayGap < (Math.round(v.value * 100) / 100) ? (yAxisDayGap = Math.round(v.value * 100) / 100) : yAxisDayGap
              }
            })
            dayData.push({
              name: metricSelectDay.options[metricSelectDay.getValue()].text,
              type: 'line',
              showSymbol: false,
              hoverAnimation: false,
              data: d,
              markLine: getMarkLine(metricSelectDayType)
            })
            break
          case 'tps':
          case 'network_receive&transmit':
          case 'dir_usage':
          case 'connection&max&exec_thread':
            if (data.data === null || data.data.length === 0) {
              this.$message.error('日视图：未查询到监控数据')
              chartDay.clear()
              //                 console.log(chartDayOption);
              chartDay.setOption(chartDayOption)
              chartDay.hideLoading()
              return
            }
            var flag = true
            $.each(data.data, function(key, value) {
              var d = []
              legendDayData.push(value.description)
              if (!flag) {
                chartDay.clear()
                //                 console.log(chartDayOption);
                chartDay.setOption(chartDayOption)
                chartDay.hideLoading()
                return
              }
              if (value.datas === null || value.datas.length === 0) {
                this.$message.error('日视图：未查询到监控数据')
                flag = false
                chartDay.clear()
                //               console.log(chartDayOption);
                chartDay.setOption(chartDayOption)
                chartDay.hideLoading()
                return
              }
              $.each(value.datas, function(k, v) {
                if (metricSelectDayType === 'network_receive&transmit') {
                  d.push({
                    name: k,
                    value: [
                      v.timestamp * 1000,
                      Math.round(v.value / 1024 / 1024)
                    ]
                  })
                  yAxisDayGap < (Math.round(v.value * 100) / 100) ? (yAxisDayGap = Math.round(v.value * 100) / 100) : yAxisDayGap
                } else {
                  d.push({
                    name: k,
                    value: [
                      v.timestamp * 1000,
                      Math.round(v.value * 100) / 100
                    ]
                  })
                  yAxisDayGap < (Math.round(v.value * 100) / 100) ? (yAxisDayGap = Math.round(v.value * 100) / 100) : yAxisDayGap
                }
              })
              dayData.push({
                name: value.description,
                type: 'line',
                showSymbol: false,
                hoverAnimation: false,
                data: d,
                markLine: getMarkLine(metricSelectDayType)
              })
            })
            break
          default:
        }

        chartDayOption.series = dayData
        v = getVisualMap(metricSelectDayType)
        if (v === 0) {
          delete (chartDayOption.visualMap)
        } else {
          chartDayOption.visualMap = v
        }
        if (metricSelectDayType === 'network_receive&transmit' ||
      metricSelectDayType === 'tps' ||
      metricSelectDayType === 'dir_usage' ||
      metricSelectDayType === 'connection&max&exec_thread') {
          chartDayOption.legend = {
            type: 'scroll',
            orient: 'vertical',
            right: 10,
            top: 120,
            bottom: 20,
            data: legendDayData
          }
        } else {
          delete (chartDayOption.legend)
        }
        chartDay.clear()
        //     console.log(chartDayOption);
        chartDay.setOption(chartDayOption)
        chartDay.hideLoading()

        /* if (Math.round($('#timepickerEnd').datepicker('getDate').getTime() / day) * day + day === nowLimit && data.data.length != 0) {
      dayInterval = setInterval(function () {
        if($("#chartDay")[0] === undefined){
          clearInterval(dayInterval);
          return;
        }
        sendGetWithoutLayer("/" + getProjectName() + "/v1.0/monitor/unit/"+monitorUnitId+"/"+metricSelectDayType,function(data){
          if(data.data === undefined){
            clearInterval(dayInterval);
            this.$message.error("/" + getProjectName() + "/v1.0/monitor/unit/"+monitorUnitId+"/"+metricSelectDayType+' get data error');
          }
            if(metricSelectDayType === "running_status" || metricSelectDayType === "process"){
              dayData[0].data.shift();
              dayData[0].data.push({
                  name: metricSelectDayType,
                  showSymbol: false,
                  hoverAnimation: false,
                  value: [
                          data.data.timestamp*1000,
                          v.value === "passing" ? 0 : (v.value === "connecting" ? 1 : (v.value === "critical" ? 2 : 3))
                        ]
                });
            } else if(metricSelectDayType === "slave_io" || metricSelectDayType === "slave_sql"){
              dayData[0].data.shift();
              dayData[0].data.push({
                  name: metricSelectDayType,
                  showSymbol: false,
                  hoverAnimation: false,
                  value: [
                          data.data.timestamp*1000,
                          v.value === "Yes" ? 0 : (v.value === "Connecting" ? 1 : (v.value === "No" ? 2 : 3))
                        ]
                });
            } else if(metricSelectDayType === "cpu_avg_usage" ||
                metricSelectDayType === "mem_usage" ||
                metricSelectDayType === "thread_cache_usage" ||
                metricSelectDayType === "innodb_open_table" ||
                metricSelectDayType === "error_file_size" ||
                metricSelectDayType === "buffer_pool_hit" ||
                metricSelectDayType === "buffer_pool_usage" ||
                metricSelectDayType === "buffer_pool_dirty_page" ||
                metricSelectDayType === "logdir_usage" ||
                metricSelectDayType === "behind_master"
                ){
              dayData[0].data.shift();
              dayData[0].data.push({
                  name: metricSelectDayType,
                  showSymbol: false,
                  hoverAnimation: false,
                  value: [
                          data.data.timestamp*1000,
                          Math.round(data.data.value * 100) / 100
                        ]
                });
            } else if(metricSelectDayType === "network_receive&transmit" ||
                metricSelectDayType === "tps" ||
                metricSelectDayType === "dir_usage" ||
                metricSelectDayType === "connection&max&exec_thread"
                ){
              for(var i = 0; i < dayData.length; i++){
                dayData[i].data.shift();
              }
              $.each(data.data, function(key, value){
                for(var i = 0; i < dayData.length; i++){
                  if(dayData[i].name === key){
                    if(metricSelectDayType === "network_receive&transmit"){
                      dayData[i].data.push({
                            name: metricSelectDayType,
                            showSymbol: false,
                            hoverAnimation: false,
                            value: [
                              value.timestamp*1000,
                                    Math.round(value.value / 1024 / 1024)
                                  ]
                          });
                    } else {
                      dayData[i].data.push({
                            name: metricSelectDayType,
                            showSymbol: false,
                            hoverAnimation: false,
                            value: [
                              value.timestamp*1000,
                                    Math.round(value.value * 100) / 100
                                ]
                          });
                    }
                    break;
                  }
                }
              });
            } else {
              clearInterval(dayInterval);
              this.$message.error("metric not exist");
            }

              chartDay.setOption({
                    series: dayData
                });
          },function(msg) {
            clearInterval(dayInterval);
            alert(msg);
          },null);
        }, 60 * 1000);
    } */
      }

      Window.onresize = function() {
        _this.chart.resize()
      }
    }
  }
}
</script>
