<template>
  <div class="app-container">
    <el-form ref="editForm" :model="dialogTemp" :rules="rules" label-width="100px" style="width: 1000px; margin-left:50px;">
      <el-row>
        <el-col :span="10">
          <el-form-item label="SSH端口号" prop="sshPort">
            <el-input v-model="dialogTemp.sshPort" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="用户名" prop="osUser">
            <el-input v-model="dialogTemp.osUser" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="10">
          <el-form-item label="密码" prop="osPwd">
            <el-input v-model="dialogTemp.osPwd" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12" />
        <el-col :span="8">
          <el-form-item>
            <el-button type="primary" @click="backTable">返回</el-button>
            <el-button type="primary" @click="monitorHost">监控注册</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

  </div>
</template>

<script>
import { monitorHost } from '@/api/manager/hosts'

export default {
  name: 'Monitor',

  data() {
    return {

      dialogTemp: {
        name: this.$route.query.id,
        sshPort: 22,
        osUser: '',
        osPwd: '',
        ipAddr: this.$route.query.ip,
        checkType: 'health'
      },
      rules: {
        sshPort: [
          { required: true, message: '请填写端口号', trigger: 'blur' }
        ],
        osUser: [
          { required: true, message: '请填写用户名', trigger: 'blur' }
        ],
        osPwd: [
          { required: true, message: '请填写密码', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {

  },
  created() {

  },
  mounted() {
  },
  methods: {

    backTable() {
      this.$router.push({
        path: '/resourceManagement/hostManagement'
      })
    },
    monitorHost() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.dialogTemp)
          // console.log(tempData)
          monitorHost(tempData).then(() => {
            this.$router.push({
              path: '/resourceManagement/hostManagement'
            })

            this.$notify({
              title: 'Success',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    }

  }
}
</script>

<style scoped>

</style>
