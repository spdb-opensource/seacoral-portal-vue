<template>
  <div class="app-container">
    <el-form ref="editForm" :model="dialogTemp" label-width="100px" style="width: 1000px; margin-left:50px;">
      <el-row>
        <el-col :span="10">
          <el-form-item label="站点" prop="site.name">
            <el-input v-model="dialogTemp.site.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="区域" prop="area.display">
            <el-input v-model="dialogTemp.area.display" disabled />
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
            <el-input v-model="dialogTemp.name" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="架构" prop="orders[0].arch.name">
            <el-input v-model="dialogTemp.orders[0].arch.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="版本" prop="orders[0].version">
            <el-input :value="showVersion(dialogTemp.orders[0].version)" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="端口" prop="orders[0].port">
            <el-input v-model="dialogTemp.orders[0].port" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="数据磁盘大小" prop="orders[0].dataDirSize">
            <el-input :value="`${showGB(dialogTemp.orders[0].dataDirSize)}G`" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="磁盘类型" prop="orders[0].dataDirType.display">
            <el-input v-model="dialogTemp.orders[0].dataDirType.display" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="存储性能等级" prop="orders[0].dataDirPerformance.display">
            <el-input v-model="dialogTemp.orders[0].dataDirPerformance.display" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="日志磁盘大小" prop="orders[0].logDirSize">
            <el-input :value="`${showGB(dialogTemp.orders[0].logDirSize)}G`" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="规模" prop="modified">
            <el-input :value="`${dialogTemp.orders[0].cpuCnt/1000}核${showGB(dialogTemp.orders[0].memSize)}G`" disabled />
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
        <el-col :span="4" />
        <el-col :span="10">
          <el-form-item label="带宽" prop="orders[0].networkBandwidth">
            <el-input v-model="dialogTemp.orders[0].networkBandwidth" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="2">
          <el-tag>审批理由</el-tag>
        </el-col>
        <el-col :span="18">
          <el-input
            v-model="textarea"
            type="textarea"
            :rows="2"
            placeholder="请输入审批理由"
          />
        </el-col>
      </el-row>
      &nbsp;
      <el-row>
        <el-col :span="20">
          <el-form-item>
            <el-button type="primary" :loading="adoptOrderLoading" @click="backTable">返回</el-button>
            <el-button type="danger" :loading="adoptOrderLoading" @click="refuseOrder">拒绝</el-button>
            <el-button type="success" :loading="adoptOrderLoading" @click="adoptOrder">通过</el-button>
          </el-form-item>
        </el-col>
      </el-row>

    </el-form>

  </div>
</template>

<script>
import { fetchViewOrder, auditOrder } from '@/api/system/order'

export default {
  name: 'Execute',
  adoptOrderLoading: false,

  data() {
    return {
      textarea: '',

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
          clusterHA: undefined
        }]
      }
    }
  },
  computed: {

  },
  created() {

  },
  mounted() {
    this.getById()
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
      this.$router.go(-1)
    },
    refuseOrder() {
      if (this.textarea === '') {
        this.$message({
          message: '请填写拒绝理由',
          type: 'warning'
        })
        return
      } else {
        var id = this.dialogTemp.id
        var data = {}
        data.status = 'unapprove'
        data.msg = this.textarea
        auditOrder(id, data).then(() => {
          this.$notify({
            title: 'Success',
            message: '审批成功',
            type: 'success',
            duration: 2000
          })
          this.$router.push({
            path: '/applicationManagement/applyForApproval',
            replace: true
          })
        })
      }
    },
    adoptOrder() {
      if (this.textarea === '') {
        this.$message({
          message: '请填写通过理由',
          type: 'warning'
        })
        return
      } else {
        this.adoptOrderLoading = true
        var id = this.dialogTemp.id
        var data = {}
        data.status = 'approved'
        data.msg = this.textarea
        auditOrder(id, data).then(() => {
          this.$notify({
            title: 'Success',
            message: '审批成功',
            type: 'success',
            duration: 2000
          })
          this.$router.push({
            path: '/applicationManagement/applyForApproval',
            replace: true
          })
        })
      }
      this.adoptOrderLoading = false
    }

  }
}
</script>

<style scoped>

</style>
