<template>
  <el-dialog
    :title="dialogStatus"
    :visible.sync="visible"
    @close="onClose()"
  >
    <el-form
      ref="editForm"
      :rules="editRules"
      :model="dialogTemp"
      :disabled="dialogIsView"
      label-position="left"
      label-width="80px"
      style=""
      :validate-on-rule-change="false"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="站点名称"
            prop="site.id"
          >
            <el-select
              v-if="networkingId === ''"
              v-model="dialogTemp.site.id"
              filterable
              collapse-tags
            >
              <el-option
                v-for="item in sitesOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-input
              v-else
              v-model="dialogTemp.site.name"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="起始ip"
            prop="startIp"
          >
            <el-input
              v-model="dialogTemp.startIp"
              :disabled="networkingId !==''"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="结束ip"
            prop="endIp"
          >
            <el-input
              v-model="dialogTemp.endIp"
              :disabled="networkingId !==''"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="网关"
            prop="gateway"
          >
            <el-input
              v-model="dialogTemp.gateway"
              :disabled="networkingId !==''"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="掩码位数"
            prop="mask"
          >
            <el-input
              v-model="dialogTemp.mask"
              type="number"
              min="0"
              max="32"
              :disabled="networkingId !==''"
              oninput="if(value>32)value=32"
              onkeypress="return( /[\d]/.test(String.fromCharCode(event.keyCode)))"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            v-if="dialogIsView"
            label="ip使用率"
            prop="ipUsage"
          >
            <div class="el-input el-input--default is-disabled">
              <div
                disabled="disabled"
                autocomplete="off"
                class="el-input__inner"
              >
                {{ parseInt(100 * dialogTemp.ip.usedCnt/dialogTemp.ip.total) }}%({{ dialogTemp.ip.usedCnt }}/{{ dialogTemp.ip.total }})
              </div>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="VLAN ID"
            prop="vlanId"
          >
            <el-input
              v-model="dialogTemp.vlanId"
              :disabled="networkingId !==''"
            />
          </el-form-item>
        </el-col>
        <el-col
          v-if="!dialogIsView && networkingId ===''"
          :span="12"
        >
          <el-form-item
            v-if="!dialogIsView && networkingId ===''"
            label="启用/停用"
            prop="enabled"
          >
            <el-switch
              v-model="dialogTemp.enabled"
              active-color="#13ce66"
              inactive-color="#ff4949"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="拓扑"
            prop="topologies"
          >
            <el-select
              v-model="dialogTemp.topologies"
              multiple
              filterable
              collapse-tags
              placeholder="请选择"
            >
              <el-option
                v-for="item in topologiesOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="关联集群"
            prop="cluster.id"
          >
            <el-select
              v-if="!dialogIsView"
              v-model="dialogTemp.cluster.id"
              collapse-tags
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="item in clusterOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-input
              v-else
              v-model="dialogTemp.cluster.name"
            />
          </el-form-item>
        </el-col>
        <el-col
          v-if="dialogIsView"
          :span="12"
        >
          <el-form-item
            label="启用/停用"
          >
            <div>
              <i
                v-if="dialogTemp.enabled"
                class="el-icon-success"
                style="color:green"
              />
              <i
                v-else
                class="el-icon-error"
                style="color:red"
              />
            </div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item
            label="网段描述"
            prop="description"
          >
            <el-input
              v-model="dialogTemp.description"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4}"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="dialogIsView">
        <el-col :span="12">
          <el-form-item
            label="创建者"
            prop="created.username"
          >
            <el-input
              v-model="dialogTemp.created.username"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="创建时间"
            prop="created.timestamp"
          >
            <el-input
              v-model="dialogTemp.created.timestamp"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="dialogIsView">
        <el-col :span="12">
          <el-form-item
            label="更新者"
            prop="modified.username"
          >
            <el-input
              v-model="dialogTemp.modified.username"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="更新时间"
            prop="modified.timestamp"
          >
            <el-input
              v-model="dialogTemp.modified.timestamp"
              disabled
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="visible = false">
        关闭
      </el-button>
      <el-button
        v-if="!dialogIsView"
        type="primary"
        @click="updateData()"
      >
        确认
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { fetchNetworkingById, addNetworking, updateNetworking, getTopologiesTypes, getClustersBysite } from '@/api/manager/networking'
import { fetchSites } from '@/api/manager/sites'

export default {
  props: {
    dialogStatus: {
      type: String,
      default: 'view'
    },
    dialogIsView: {
      type: Boolean,
      default: true
    },
    editFormVisible: {
      type: Boolean,
      default: false
    },
    networkingId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      topologiesOptions: [],
      sitesOptions: [],
      clusterOptions: [],
      visible: false,
      dialogTemp: {
        id: undefined,
        site: {
          id: null,
          name: undefined
        },
        startIp: undefined,
        endIp: undefined,
        gateway: undefined,
        mask: undefined,
        ip: {
          total: undefined,
          usedCnt: undefined
        },
        vlanId: undefined,
        topologies: undefined,
        cluster: {
          id: undefined,
          name: undefined
        },
        enabled: false,
        description: undefined,
        created: {
          user: undefined,
          timestamp: undefined
        },
        modified: {
          user: undefined,
          timestamp: undefined
        }
      },
      editRules: {
      }
    }
  },
  computed: {
    siteId() {
      return this.dialogTemp.site.id
    }
  },
  watch: {
    siteId(newVal) {
      if (!this.dialogIsView && this.visible) {
        getClustersBysite(newVal).then(response => {
          this.clusterOptions = response.data
        })
      }
    },
    editFormVisible() {
      this.visible = this.editFormVisible
      if (this.visible) {
        if (this.networkingId !== '') {
          this.getDataById(this.networkingId)
        } else {
          this.editRules = {
            'startIp': [{ required: true, trigger: 'change' }],
            'site.id': [{ required: true, trigger: 'change' }],
            'endIp': [{ required: true, trigger: 'change' }],
            'gateway': [{ required: true, trigger: 'change' }],
            'mask': [{ required: true, trigger: 'change' }],
            'ipUsage': [{ required: true, trigger: 'change' }],
            'vlanId': [{ required: true, trigger: 'change' }],
            'cluster.id': [{ required: true, trigger: 'change' }],
            'created.user': [{ required: true, trigger: 'change' }],
            'created.timestamp': [{ required: true, trigger: 'change' }],
            'modified.user': [{ required: true, trigger: 'change' }],
            'modified.timestamp': [{ required: true, trigger: 'change' }]
          }
        }
        getTopologiesTypes().then(response => {
          this.topologiesOptions = response.data
        })
        fetchSites().then(response => {
          this.sitesOptions = response.data
        })
      } else {
        this.$nextTick(() => {
          Object.assign(this.$data, this.$options.data())
        })
        this.$refs['editForm'].clearValidate()
      }
    }
  },
  mounted() {
  },
  methods: {
    onClose() {
      this.$emit('update:editFormVisible', false)
    },
    getDataById(id) {
      fetchNetworkingById(id).then(response => {
        this.dialogTemp = response.data
      })
    },
    cloneForAdd() {
      return {
        siteId: this.dialogTemp.site.id,
        startIp: this.dialogTemp.startIp,
        endIp: this.dialogTemp.endIp,
        gateway: this.dialogTemp.gateway,
        mask: this.dialogTemp.mask,
        vlanId: this.dialogTemp.vlanId,
        topologies: this.dialogTemp.topologies,
        clusterId: this.dialogTemp.cluster.id,
        enabled: this.dialogTemp.enabled,
        description: this.dialogTemp.description
      }
    },
    cloneForUpdate() {
      return {
        topologies: this.dialogTemp.topologies,
        clusterId: this.dialogTemp.cluster.id,
        description: this.dialogTemp.description
      }
    },
    updateData() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          if (this.networkingId !== '') { // UPDATE
            const tempData = this.cloneForUpdate()
            updateNetworking(this.dialogTemp.id, tempData).then(() => {
              this.visible = false
              this.$emit('refresh-list', true)
              this.$notify({
                title: 'Success',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            const tempData = this.cloneForAdd()
            addNetworking(tempData).then(() => {
              this.visible = false
              this.$emit('refresh-list', true)
              this.$notify({
                title: 'Success',
                message: '新建成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        } else return
      })
    }
  }
}
</script>
