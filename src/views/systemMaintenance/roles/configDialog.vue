<template>
  <el-dialog
    title="信息"
    :visible.sync="visible"
    @close="onClose()"
  >
    <el-row>
      <el-col :span="6">角色名称:{{ rolesData.name }}</el-col>
      <el-col :span="6">系统资源:false</el-col>
      <el-col :span="12">描述:{{ rolesData.description }}</el-col>
    </el-row>
    <el-tabs
      v-model="activeName"
      @tab-click="handleClick"
    >
      <el-tab-pane
        label="功能配置"
        name="first"
      >
        <el-tree
          ref="tree"
          :data="firstTabSelection"
          show-checkbox
          node-key="id"
          :props="defaultProps"
        />
      </el-tab-pane>
      <el-tab-pane
        label="数据范围配置"
        name="second"
      >
        <el-row>
          <el-col :span="6">
            工单组可见范围
          </el-col>
          <el-col :span="12">
            <el-select v-model="secondTabData.ogScope.code">
              <el-option
                v-for="item in secondTabSelection"
                :key="item.id"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            服务组可见范围
          </el-col>
          <el-col :span="12">
            <el-select v-model="secondTabData.sgScope.code">
              <el-option
                v-for="item in secondTabSelection"
                :key="item.id"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="6">
            操作记录可见范围
          </el-col>
          <el-col :span="12">
            <el-select v-model="secondTabData.operateLogScope.code">
              <el-option
                v-for="item in secondTabSelection"
                :key="item.id"
                :label="item.name"
                :value="item.code"
              />
            </el-select>
          </el-col>
        </el-row>
      </el-tab-pane>
      <el-tab-pane
        label="其他配置"
        name="third"
      >
        <el-row>
          <el-col :span="12">
            工单组自动审批
            <el-switch
              v-model="thirdTabData.ogAutoAudit"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            工单组自动执行
            <el-switch
              v-model="thirdTabData.ogAutoExecute"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
    <el-button
      type="primary"
      @click="save()"
    >保存</el-button>
  </el-dialog>
</template>

<script>
import { getRoleById, getAppsConfigById, getDataScopesById, getOthersById, updateApps, updateDataScopes, updateOthers } from '@/api/role'
import { getAppsConfig, getDataScopesConfig } from '@/api/selections'

export default {
  props: {
    detailFormVisible: {
      type: Boolean,
      default: false
    },
    rolesId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      defaultProps: {
        children: 'subApps',
        label: 'name'
      },
      activeName: 'first',
      visible: false,
      rolesData: {},
      firstTabSelection: [],
      secondTabData: {
        'role': {
          'id': '',
          'name': ''
        },
        'ogScope': {
          'code': '',
          'display': ''
        },
        'sgScope': {
          'code': '',
          'display': ''
        },
        'operateLogScope': {
          'code': '',
          'display': ''
        }},
      secondTabSelection: [],
      thirdTabData: {
        'role': {
          'id': '',
          'name': ''
        },
        'ogAutoAudit': false,
        'ogAutoExecute': false
      }
    }
  },
  computed: {
  },
  watch: {
    detailFormVisible() {
      this.visible = this.detailFormVisible
      if (this.visible) {
        getRoleById(this.rolesId).then(response => {
          this.rolesData = response.data
        })
        this.getTabsData(this.activeName)
      } else {
        this.$nextTick(() => {
          Object.assign(this.$data, this.$options.data())
        })
      }
    }
  },
  mounted() {
  },
  methods: {
    save() {
      if (this.activeName === 'first') {
        this.saveFirstTabData()
      } else if (this.activeName === 'second') {
        this.saveSecondTabData()
      } else {
        this.saveThirdTabData()
      }
    },
    saveFirstTabData() {
      const data = {
        appIds: [].concat(this.$refs.tree.getHalfCheckedKeys(), this.$refs.tree.getCheckedKeys())
      }
      updateApps(this.rolesId, data).then(response => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    saveSecondTabData() {
      const data = {
        ogScopeCode: this.secondTabData.ogScope.code,
        operateLogScope: this.secondTabData.sgScope.code, // TODO:看network接口里是这样的参数，不排除有问题，所以标记一下
        sgScopeCode: this.secondTabData.operateLogScope.code
      }
      updateDataScopes(this.rolesId, data).then(response => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    saveThirdTabData() {
      const data = {
        ogAutoAudit: this.thirdTabData.ogAutoAudit,
        ogAutoExecute: this.thirdTabData.ogAutoExecute
      }
      updateOthers(this.rolesId, data).then(response => {
        this.$notify({
          title: 'Success',
          message: '更新成功',
          type: 'success',
          duration: 2000
        })
      })
    },
    getTabsData(activeName) {
      if (activeName === 'first') {
        getAppsConfig().then(response => {
          this.firstTabSelection = response.data
          console.log(this.firstTabSelection)
          getAppsConfigById(this.rolesId).then(res => {
            const checkedKeys = []
            res.data.apps.forEach(element => {
              checkedKeys.push(element.id)
            })
            this.$refs.tree.setCheckedKeys(checkedKeys)
          })
        })
      } else if (activeName === 'second') {
        getDataScopesConfig().then(response => {
          this.secondTabSelection = response.data
          getDataScopesById(this.rolesId).then(res => {
            this.secondTabData = res.data
          })
        })
      } else {
        getOthersById(this.rolesId).then(res => {
          this.thirdTabData = res.data
        })
      }
    },
    handleClick(tab, event) {
      this.getTabsData(tab.name)
    },
    onClose() {
      this.$emit('update:detailFormVisible', false)
    }
  }
}
</script>
