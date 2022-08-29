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
      label-width="120px"
      style=""
      :validate-on-rule-change="false"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="用户名"
            prop="username"
          >
            <el-input
              v-model="dialogTemp.username"
              :disabled="usersName !== ''"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-if="!dialogIsView && usersName === ''">
        <el-col :span="12">
          <el-form-item
            label="密码"
            prop="password"
          >
            <el-input v-model="dialogTemp.password" show-password />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="确认密码"
            prop="passwordRepeat"
          >
            <el-input v-model="dialogTemp.passwordRepeat" show-password />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item
            label="姓名"
            prop="name"
          >
            <el-input v-model="dialogTemp.name" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="手机号码"
            prop="telephone"
          >
            <el-input v-model="dialogTemp.telephone" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="邮箱"
            prop="email"
          >
            <el-input v-model="dialogTemp.email" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="所属单位"
            prop="company"
          >
            <el-input v-model="dialogTemp.company" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="紧急联系人"
            prop="emerContact"
          >
            <el-input v-model="dialogTemp.emerContact" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="紧急联系人电话"
            prop="emerTel"
          >
            <el-input v-model="dialogTemp.emerTel" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="角色"
            prop="role"
          >
            <el-select
              v-if="!dialogIsView"
              v-model="dialogTemp.role.id"
              collapse-tags
              filterable
              placeholder="请选择"
            >
              <el-option
                v-for="item in roleOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-input
              v-else
              v-model="dialogTemp.role.name"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item
            label="组别"
            prop="group"
          >
            <el-select
              v-if="!dialogIsView"
              v-model="dialogTemp.groupIds"
              multiple
              filterable
              collapse-tags
              placeholder="请选择"
            >
              <el-option
                v-for="item in groupOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
            <el-select
              v-else
              v-model="dialogTemp.groupNames"
              disabled
              multiple
              filterable
              collapse-tags
              placeholder="请选择"
            >
              <el-option
                v-for="item in dialogTemp.groupNames"
                :key="item"
                :label="item"
                :value="item"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col
          v-if="dialogIsView"
          :span="12"
        >
          <el-form-item label="状态">
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
import { fetchUsersById, addUsers, updateUsers } from '@/api/system/users'
import { getRoles } from '@/api/role'
import { fetchGroup } from '@/api/system/group'
import { includes } from 'lodash'

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
    usersName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      groupOptions: [],
      roleOptions: [],
      visible: false,
      dialogTemp: {
        username: undefined,
        name: undefined,
        telephone: undefined,
        email: undefined,
        company: undefined,
        emerContact: undefined,
        emerTel: undefined,
        password: undefined,
        authType: undefined,
        enabled: undefined,
        groupNames: [],
        groupIds: [],
        role: {
          id: undefined,
          name: undefined
        },
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
        if (this.usersName !== '') {
          this.getDataById(this.usersName)
        } else {
          var validatePassword = (rule, value, callback) => {
            if (!value) {
              callback(new Error('password is required'))
            }
            if (rule.field === 'password') {
              if (value === '') {
                callback(new Error('password is required'))
              } else if (value.length < 6) {
                callback(new Error('密码位数至少为6位！'))
              } else if (this.dialogTemp.passwordRepeat && this.dialogTemp.passwordRepeat !== value) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            } else {
              if (value === '') {
                callback(new Error('请再次输入密码'))
              } else if (value !== this.dialogTemp.password) {
                callback(new Error('两次输入密码不一致!'))
              } else {
                callback()
              }
            }
          }
          this.editRules = {
            'username': [{ required: true, trigger: 'change' }],
            'name': [{ required: true, trigger: 'change' }],
            'password': [{ required: true, validator: validatePassword, trigger: 'change' }],
            'passwordRepeat': [{ required: true, validator: validatePassword, trigger: ['change', 'blur'] }],
            'telephone': [{ required: true, trigger: 'change' }],
            'email': [{ required: true, trigger: 'change' }],
            'emerTel': [{ required: true, trigger: 'change' }],
            'emerContact': [{ required: true, trigger: 'change' }],
            'company': [{ required: true, trigger: 'change' }]
          }
          this.getGroups()
        }
        if (!this.dialogIsView) {
          getRoles().then(response => {
            this.roleOptions = response.data
          })
        }
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
    getGroups() {
      fetchGroup().then(response => {
        this.groupOptions = response.data
        this.groupOptions.forEach(element => {
          if (includes(this.dialogTemp.groupNames, element.name)) {
            this.dialogTemp.groupIds.push(element.id)
          }
        })
      })
      // for test only
      // this.groupOptions = [
      //   {
      //     id: '1',
      //     name: '管理组'
      //   }
      // ]
      // this.groupOptions.forEach(element => {
      //   if (includes(this.dialogTemp.groupNames, element.name)) {
      //     this.dialogTemp.groupIds.push(element.id)
      //   }
      // })
    },
    getDataById(username) {
      fetchUsersById(username).then(response => {
        this.dialogTemp = Object.assign(this.dialogTemp, response.data)
        if (!this.dialogIsView) {
          this.getGroups()
        }
      })
    },
    cloneForAdd() {
      return {
        username: this.dialogTemp.username,
        password: this.dialogTemp.password,
        name: this.dialogTemp.name,
        telephone: this.dialogTemp.telephone,
        email: this.dialogTemp.email,
        company: this.dialogTemp.company,
        emerContact: this.dialogTemp.emerContact,
        emerTel: this.dialogTemp.emerTel,
        roleId: this.dialogTemp.role.id,
        groupIds: this.dialogTemp.groupIds
      }
    },
    cloneForUpdate() {
      return {
        name: this.dialogTemp.name,
        telephone: this.dialogTemp.telephone,
        email: this.dialogTemp.email,
        company: this.dialogTemp.company,
        emerContact: this.dialogTemp.emerContact,
        emerTel: this.dialogTemp.emerTel,
        roleId: this.dialogTemp.role.id,
        groupIds: this.dialogTemp.groupIds
      }
    },
    updateData() {
      this.$refs['editForm'].validate((valid) => {
        if (valid) {
          if (this.usersName !== '') { // UPDATE
            const tempData = this.cloneForUpdate()
            updateUsers(this.dialogTemp.username, tempData).then(() => {
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
            addUsers(tempData).then(() => {
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
