<template>
  <div>
    <el-row>

      <el-button
        v-if="roles.includes('新增') || roles.includes('admin')"
        type="primary"
        icon="el-icon-circle-plus-outline"
        size="small"
        round
        style="margin: 8px 0 8px 16px;"
        @click="addNewRole()"
      >增加</el-button>
      <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    </el-row>
    <UnifiedTable
      :table-items="tableItems"
      :item-list="itemList"
      :list-loading="listLoading"
      :table-dropdown-buttons="tableDropdownButtons"
      :table-buttons="tableButtons"
      :show-filter="false"
      :roles="['配置'].concat(roles)"
      @edit="onChildEdit"
      @delete="onChildDelete"
      @config="onChildConfig"
    />
    <el-dialog
      :title="dialogTitle"
      :visible.sync="editVisible"
      :before-close="cancelAddRole"
    >
      <el-form
        ref="editForm"
        :rules="editRules"
        :model="dialogTemp"
        label-position="left"
        label-width="90px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item
          label="角色名称"
          prop="name"
        >
          <el-input
            v-model="dialogTemp.name"
            placeholder=""
          />
        </el-form-item>
        <el-form-item
          label="显示顺序"
          prop="sequence"
        >
          <el-input
            v-model="dialogTemp.sequence"
            placeholder=""
          />
        </el-form-item>
        <el-form-item
          label="角色描述"
          prop="description"
        >
          <el-input
            v-model="dialogTemp.description"
            type="textarea"
            :autosize="{ minRows: 2, maxRows: 4}"
            placeholder=""
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelAddRole()">
          关闭
        </el-button>
        <el-button
          type="danger"
          @click="handleAddNewRole()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>
    <el-dialog
      :visible.sync="deleteFormVisible"
      :title="dialogStatus"
      :before-close="cancelDelete"
    >
      <el-form
        ref="deleteForm"
        :rules="deleteRules"
        :model="deleteConfirmStr"
        label-position="top"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        请输入 {{ deleteConfirmExpect }} 确认
        <el-form-item
          label=""
          prop="input"
        >
          <el-input
            v-model="deleteConfirmStr.input"
            placeholder=""
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelDelete()">
          关闭
        </el-button>
        <el-button
          type="danger"
          @click="deleteData()"
        >
          确认删除
        </el-button>
      </div>
    </el-dialog>
    <configDialog
      :detail-form-visible.sync="detailFormVisible"
      :roles-id="id"
    />
  </div>
</template>

<script>
import UnifiedTable from '../template/UnifiedTable'
import configDialog from './configDialog'
import { getRoles, deleteRole, updateRole, addRole, getRoleById } from '@/api/role'

export default {
  name: 'RoleManagement',
  components: { UnifiedTable, configDialog },
  filters: { },
  data() {
    return {
      roles: this.$router.currentRoute.meta.roles,
      tableItems: {
        'name': '角色名称',
        'sequence': '显示顺序',
        'created.username': '创建者姓名',
        'created.timestamp': '操作时间',
        'description': '描述'
      },
      dialogTitle: '',
      editVisible: false,
      itemList: [],
      listLoading: true,
      tableButtons: {
        'config': {
          displayName: '配置',
          icon: 'el-icon-edit-outline'
        }
      },
      id: '',
      detailFormVisible: false,
      deleteFormVisible: false,
      dialogStatus: '',
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      editRules: {
        'name': [{ required: true, trigger: 'change' }],
        'sequence': [{ required: true, trigger: 'change' }],
        'description': [{ required: false }]
      },
      dialogTemp: {
        id: '',
        name: '',
        sequence: '',
        description: '',
        created: {
          username: undefined,
          timestamp: undefined
        },
        modified: {
          username: undefined,
          timestamp: undefined
        }
      },
      tableDropdownButtons: {
        'edit': {
          displayName: '编辑',
          icon: 'el-icon-setting'
        },
        'delete': {
          displayName: '删除',
          icon: 'el-icon-delete'
        }
      }
    }
  },
  computed: {
    deleteRules() {
      const pattern = new RegExp('^' + this.deleteConfirmExpect + '$')
      return {
        input: [{ required: true, message: '输入与 ' + this.deleteConfirmExpect + ' 不一致', pattern: pattern }]
      }
    }
  },
  watch: {
    detailFormVisible(newValue, oldValue) {
      if (newValue === false) {
        this.id = ''
        this.getRolesList()
      }
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    refresh() {
      this.getRolesList()
    },
    cancelDelete() {
      this.deleteFormVisible = false
      this.dialogStatus = ''
      this.deleteConfirmExpect = ''
      this.deleteConfirmStr = {
        input: ''
      }
      this.id = ''
      this.$refs['deleteForm'].clearValidate()
    },
    cancelAddRole() {
      this.editVisible = false
      this.id = ''
      this.dialogTemp = {
        id: '',
        name: '',
        sequence: '',
        description: '',
        created: {
          username: undefined,
          timestamp: undefined
        },
        modified: {
          username: undefined,
          timestamp: undefined
        }
      }
      this.$refs['editForm'].clearValidate()
    },
    addNewRole() {
      this.editVisible = true
    },
    getRolesList() {
      this.listLoading = true
      getRoles().then(response => {
        this.itemList = response.data
        this.listLoading = false
      })
    },
    cloneForNewRole(input) {
      const res = {}
      res.name = input.name
      res.sequence = input.sequence
      res.description = input.description
      return res
    },
    handleAddNewRole() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForNewRole(this.dialogTemp)
          if (this.id === '') {
            addRole(tempData).then(() => {
              this.getRolesList()
              this.cancelAddRole()
              this.$refs['editForm'].clearValidate()
              this.$notify({
                title: 'Success',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            updateRole(this.dialogTemp.id, tempData).then(() => {
              this.getRolesList()
              this.cancelAddRole()
              this.$notify({
                title: 'Success',
                message: '更新成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        }
      })
    },
    handleDelete(row) {
      this.id = row.id
      this.dialogStatus = 'delete'
      this.deleteFormVisible = true
      this.deleteConfirmExpect = row.name
    },
    onChildEdit(parameters) {
      getRoleById(parameters.id).then(response => {
        this.dialogTemp = response.data
        this.editVisible = true
        this.id = parameters.id
      })
    },
    onChildDelete(parameters) {
      this.handleDelete(parameters)
    },
    onChildConfig(parameters) {
      this.detailFormVisible = true
      this.id = parameters.id
    },
    deleteData() {
      this.$refs['deleteForm'].validate((valid) => {
        if (valid) {
          deleteRole(this.id).then(() => {
            this.getRolesList()
            this.cancelDelete()
            this.$notify({
              title: 'Success',
              message: '删除成功',
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
