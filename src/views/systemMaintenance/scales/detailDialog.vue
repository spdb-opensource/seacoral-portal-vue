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
      label-width="100px"
      style=""
      :validate-on-rule-change="false"
    >
      <el-row>
        <el-col
          :span="12"
        >
          <el-form-item
            v-if="scalesId === '-1'"
            label="类型"
            prop="type"
          >
            <el-select
              v-model="dialogTemp.type.code"
              filterable
              collapse-tags
            >
              <el-option
                v-for="item in imageTypeOptions"
                :key="item.code"
                :label="item.display"
                :value="item.code"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="scalesId !== '-1' && dialogIsView"
            label="类型"
            prop="type"
          >
            <el-input
              v-model="dialogTemp.type.display"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="(scalesId !== '-1' && !dialogIsView)?24:12">
          <el-form-item
            label="规模名称"
            prop="name"
          >
            <el-input
              v-model="dialogTemp.name"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            v-if="dialogIsView || scalesId === '-1'"
            label="CPU数量"
            prop="cpuCnt"
          >
            <el-input
              v-model="dialogTemp.cpuCnt"
              :disabled="scalesId !== '-1'"
            />
          </el-form-item>
        </el-col>
        <el-col
          :span="12"
        >
          <el-form-item
            v-if="dialogIsView || scalesId === '-1'"
            label="内存容量(M)"
            prop="memSize"
          >
            <el-input
              v-model="dialogTemp.memSize"
              :disabled="scalesId !== '-1'"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="(scalesId !== '-1' && !dialogIsView)?24:12">
          <el-form-item
            label="显示顺序"
            prop="sequence"
          >
            <el-input
              v-model="dialogTemp.sequence"
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
            label="规模描述"
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
            prop="created.user"
          >
            <el-input
              v-model="dialogTemp.created.user"
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
            prop="modified.user"
          >
            <el-input
              v-model="dialogTemp.modified.user"
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
import { fetchScalesById, addScales, updateScales } from '@/api/system/scales'
import { fetchImageTypes } from '@/api/manager/images'

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
    scalesId: {
      type: String,
      default: '-1'
    }
  },
  data() {
    return {
      cpCnty: undefined,
      topologiesOptions: [],
      imageTypeOptions: [],
      clusterOptions: [],
      visible: false,
      dialogTemp: {
        id: undefined,
        type: {
          code: undefined,
          display: undefined
        },
        name: undefined,
        cpuCnt: undefined,
        memSize: undefined,
        enabled: undefined,
        sequence: undefined,
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
  },
  watch: {
    editFormVisible() {
      this.visible = this.editFormVisible
      if (this.visible) {
        if (this.scalesId !== '-1') {
          this.getDataById(this.scalesId)
        } else {
          this.editRules = {
            'type': [{ required: true, trigger: 'change' }],
            'name': [{ required: true, trigger: 'change' }],
            'cpuCnt': [{ required: true, trigger: 'change' }],
            'memSize': [{ required: true, trigger: 'change' }],
            'mask': [{ required: true, trigger: 'change' }],
            'sequence': [{ required: true, trigger: 'change' }]
          }
        }
        fetchImageTypes().then(response => {
          this.imageTypeOptions = response.data
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
      fetchScalesById(id).then(response => {
        this.dialogTemp = response.data
        this.cpCnty = this.dialogTemp.cpuCnt / 1000
      })
    },
    cloneForAdd() {
      return {
        type: this.dialogTemp.type.code,
        name: this.dialogTemp.name,
        cpuCnt: this.dialogTemp.cpuCnt,
        memSize: this.dialogTemp.memSize,
        sequence: this.dialogTemp.sequence,
        description: this.dialogTemp.description
      }
    },
    cloneForUpdate() {
      return {
        name: this.dialogTemp.name,
        sequence: this.dialogTemp.sequence,
        description: this.dialogTemp.description
      }
    },
    updateData() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          if (this.scalesId !== '-1') { // UPDATE
            const tempData = this.cloneForUpdate()
            updateScales(this.dialogTemp.id, tempData).then(() => {
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
            this.visible = false
            this.$emit('refresh-list', true)
            addScales(tempData).then(() => {
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
