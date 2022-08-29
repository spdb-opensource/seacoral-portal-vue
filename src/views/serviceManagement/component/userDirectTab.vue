<template>
  <div>
    <el-button type="primary" size="small" icon="el-icon-circle-plus-outline" style="margin:8px;" @click="handleAdd()">新增</el-button>
    <el-button type="primary" size="small" icon="el-icon-refresh-right" style="margin:8px;" @click="refresh()">刷新</el-button>
    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      default-expand-all
      highlight-current-row
      style="width: 100%"
    >
      <el-table-column
        label="用户名"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="白名单"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.whiteIps }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="认证方式"
        width="auto"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.auth_type }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="数据库名/数据库权限"
        width="auto"
        align="center"
        min-width="300px"
      >
        <template slot-scope="scope">
          <span
            v-for="(i,index) in scope.row.privileges"
            :key="i.dbName"
          >
            <el-row>
              <el-col :span="4"> {{ i.dbName }}</el-col>
              <el-col :span="20"> {{ i.privileges.toString() }}</el-col>
            </el-row>
            <div v-if="index !== scope.row.privileges.length -1" class="el-divider" style="height:1px" />
          </span></template>
      </el-table-column>

      <el-table-column
        label="管理"
        width="252px"
        align="center"
      >
        <template slot-scope="{row}">

          <el-button
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >
            编辑
          </el-button>

          <el-button
            type="danger"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>

          <el-button
            type="warning"
            size="small"
            @click="handleResetPassword(row)"
          >
            重置密码
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination
      v-show="total>0"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30]"
      :limit="parseInt(pagesize)"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @pagination="handlePagination"
    />

    <el-dialog
      :title="dialogStatus"
      :visible.sync="userDirectFormVisible"
      :before-close="cancelUserDirectEdit"
    >
      <el-form
        ref="userDirectForm"
        :model="userDirectStr"
        :rules="userDirectRules"
        label-position="left"
        label-width="100px"
      >
        <el-form-item
          v-if="!userDirectDialogIsEdit"
          label="用户名"
          prop="username"
        >
          <el-input
            v-model="userDirectStr.username"
            placeholder="请输入用户名"
          />
        </el-form-item>
        <el-form-item
          v-if="!userDirectDialogIsEdit"
          label="密码"
          prop="password"
        >
          <el-input
            v-model="userDirectStr.password"
            placeholder="请输入密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item
          v-if="!userDirectDialogIsEdit"
          label="确认密码"
          prop="passwordRepeat"
          placeholder="请输入密码"
        >
          <el-input
            v-model="userDirectStr.passwordRepeat"
            placeholder="请输入密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item
          v-if="!userDirectDialogIsEdit"
          label="白名单"
          prop="whiteIps"
        >
          <el-input
            v-model="userDirectStr.whiteIps"
            type="textarea"
            placeholder="多个地址使用逗号隔开，允许使用通配符，通配符为%，通配符只能在最后一位"
          />
        </el-form-item>
        <el-form-item
          label="全局权限"
          prop="globalPrivilege"
        >
          <el-checkbox v-model="checkAllGlobalPrivileges" :indeterminate="isIndeterminate1" @change="handleCheckedAllGlobalPrivilegesChange">全选</el-checkbox>
          <div style="margin: 15px 0;" />
          <el-checkbox-group v-model="userDirectStr.globalPrivilege" @change="handleCheckedGlobalPrivilegesChange">
            <el-checkbox v-for="i in privilegesGlobalList" :key="i" :label="i">{{ i }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item
          label="数据库权限"
          prop="databasePrivilege"
        >
          <el-button type="success" size="small" @click="handleAddDatabasePrivilege()">新增</el-button>
          <el-table
            :data="userDirectStr.databasePrivilege"
            border
            fit
            highlight-current-row
            style="width: 100%"
          >
            <el-table-column
              label="数据库名"
              width="auto"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.dbName }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="权限"
              width="auto"
              align="center"
            >
              <template slot-scope="scope">
                <span>{{ scope.row.privileges.toString() }}</span>
              </template>
            </el-table-column>

            <el-table-column
              label="详情"
              width="auto"
              align="center"
            >
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="small"
                  @click="handleDatabasePrivilegeEdit(scope.$index,scope.row)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click="userDirectStr.databasePrivilege.splice(scope.$index, 1)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table></el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelUserDirectEdit()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="userDirect()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog title="新增数据库权限" :visible.sync="dialogFormVisible" :before-close="cancelAddDatabasePrivilege">
      <el-form ref="databasePrivilegeForm" :rules="databasePrivilegeFormRules" :model="databasePrivilegeFormData" label-width="100px">
        <el-form-item label="数据库名称" prop="dbName">
          <el-select v-model="databasePrivilegeFormData.dbName" :disabled="dialogFormIsEdit">
            <el-option
              v-for="item in databasesOptions"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据库权限" prop="databasePrivilege">
          <el-checkbox v-model="checkAllDatabasePrivileges" :indeterminate="isIndeterminate2" @change="handleCheckedAllDatabasePrivilegesChange">全选</el-checkbox>
          <div style="margin: 15px 0;" />
          <el-checkbox-group v-model="databasePrivilegeFormData.privileges" @change="handleCheckedDatabasePrivilegesChange">
            <el-checkbox v-for="i in privilegesLocalList" :key="i" :label="i">{{ i }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelAddDatabasePrivilege()">取 消</el-button>
        <el-button type="primary" @click="addDatabasePrivilege()">确 定</el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'删除'" :visible.sync="deleteFormVisible" :before-close="cancelDelete">
      <el-form ref="deleteForm" :rules="deleteRules" :model="deleteConfirmStr" label-position="top" label-width="70px" style="width: 400px; margin-left:50px;">
        请输入 {{ dialogTemp.username }} 确认
        <el-form-item label="" prop="input">
          <el-input v-model="deleteConfirmStr.input" placeholder="" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelDelete()">
          关闭
        </el-button>
        <el-button type="danger" @click="deleteData()">
          确认删除
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="'重置密码'" :visible.sync="resetPasswordFormVisible" :before-close="cancelResetPassword">
      <el-form ref="resetPasswordForm" :rules="resetPasswordRules" :model="resetPasswordData" label-position="left" label-width="100px">
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="resetPasswordData.password"
            placeholder="请输入密码"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码" prop="passwordRepeat">
          <el-input
            v-model="resetPasswordData.passwordRepeat"
            placeholder="请输入密码"
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
      重置密码有风险，可能需要重启应用重新连接，请谨慎评估！！！
      <div slot="footer" class="dialog-footer">
        <el-button @click="cancelResetPassword()">
          关闭
        </el-button>
        <el-button type="danger" @click="resetPassword()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { fetchDatabasesById } from '@/api/service/mysql/databases'
import { fetchUsers, addUserDirect, deleteUser, updateUserDirect, updateUserPassword } from '@/api/service/mysql/users'
import { fetchPrivilegesEnabledAndGlobal, fetchPrivilegesEnabledAndLocal } from '@/api/service/privileges'
import Pagination from '@/components/Pagination'

export default {
  components: {
    Pagination
  },
  props: {
    transData: {
      type: Object,
      default: function() {
        return {}
      }
    }
  },
  data() {
    return {
      resetPasswordFormVisible: false,
      resetPasswordData: {
        password: '',
        passwordRepeat: ''
      },
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      dialogTemp: {},
      deleteFormVisible: false,
      userDirectDialogIsEdit: false,
      dialogFormIsEdit: false,
      dialogFormEditIndex: -1,
      checkAllDatabasePrivileges: false,
      dialogFormVisible: false,
      checkAllGlobalPrivileges: false,
      isIndeterminate1: true,
      isIndeterminate2: true,
      dialogStatus: '',
      userDirectFormVisible: false,
      privilegesGlobalList: [],
      privilegesLocalList: [],
      databasesList: [],
      databasesOptions: [],
      userDirectStr: {
        authType: 'password',
        username: '',
        password: '',
        passwordRepeat: '',
        whiteIps: '',
        globalPrivilege: [],
        databasePrivilege: []
      },
      databasePrivilegeFormData: { dbName: '', privileges: [] },
      scaleOptions: [],
      list: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,

      databasePrivilegeFormRules: {
        dbName: [{ required: true, message: 'dbName is required', trigger: 'change' }]
      }
    }
  },
  computed: {
    resetPasswordRules() {
      const passwordRepeatReg = new RegExp('^' + this.resetPasswordData.password + '$')
      return {
        password: [{ required: true, message: '密码至少8位，且必须包含字母和数字', pattern: new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])(.{8,})$/) }],
        passwordRepeat: [{ required: true, message: '需与输入密码保持一致', pattern: passwordRepeatReg }, { required: true, message: '密码至少8位，且必须包含字母和数字', pattern: new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])(.{8,})$/) }]
      }
    },
    deleteRules() {
      const pattern = new RegExp('^' + this.deleteConfirmExpect + '$')
      return {
        input: [{ required: true, message: '输入与 ' + this.deleteConfirmExpect + ' 不一致', pattern: pattern }]
      }
    },
    userDirectRules() {
      const passwordRepeatReg = new RegExp('^' + this.userDirectStr.password + '$')
      function checkIp(value) {
        var ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
        return (ip.test(value) && (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256))
      }
      function checkLastIp(value) {
        var ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}$/
        return (ip.test(value) && (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256))
      }
      var validateWhiteIPs = (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请输入白名单'))
        } else {
          var whiteIPs = value.split(',')
          for (var i = 0; i < whiteIPs.length; i++) {
            // 判断是否是%
            if (whiteIPs[i] === '%') {
              callback()
            } else {
              if (!checkIp(whiteIPs[i])) {
                // 判断前三位是否符合ip
                if (!checkLastIp(whiteIPs[i])) {
                  // 判断某一位是不是%
                  var last = whiteIPs[i].split('.')
                  if (whiteIPs[i].split('.').length !== 4) {
                    callback(new Error('白名单不符合规则'))
                    break
                  }
                  for (var j = 0; j < last.length; j++) {
                    if (last[j] === '%') {
                      callback()
                      break
                    }
                  }
                } else {
                  callback(new Error('白名单不符合规则'))
                  break
                }
              }
            }
            // 判断是否是ip
          }
          callback()
        }
      }
      return {
        username: [{ required: true, message: '请输入用户名', trigger: 'change' }],
        password: [{ required: true, message: '密码至少8位，且必须包含字母和数字', pattern: new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])(.{8,})$/) }],
        passwordRepeat: [{ required: true, message: '需与输入密码保持一致', pattern: passwordRepeatReg }, { required: true, message: '密码至少8位，且必须包含字母和数字', pattern: new RegExp(/^(?=.*[0-9])(?=.*[a-zA-Z])(.{8,})$/) }],
        whiteIps: [{ validator: validateWhiteIPs, trigger: 'blur' }, { required: true, message: '请输入白名单规则', trigger: 'change' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    refresh() {
      this.getList()
    },
    handleResetPassword(row) {
      this.dialogTemp = Object.assign({}, row)
      this.resetPasswordFormVisible = true
      this.$nextTick(() => {
        this.$refs['resetPasswordForm'].clearValidate()
      })
    },
    cancelResetPassword() {
      this.resetPasswordFormVisible = false
      this.resetPasswordData = {
        password: '',
        passwordRepeat: ''
      }
    },
    resetPassword() {
      this.$refs['resetPasswordForm'].validate((valid) => {
        if (valid) {
          var temp = {}
          temp.ip = '%'
          temp.pwd = this.resetPasswordData.password
          temp.auth_type = 'mysql_native_password'
          updateUserPassword(this.transData.id, this.dialogTemp.username, temp).then(() => {
            this.getList()
            this.cancelResetPassword()
            this.$notify({
              title: 'Success',
              message: '更新密码成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    cancelDelete() {
      this.deleteFormVisible = false
      this.deleteConfirmExpect = ''
      this.deleteConfirmStr = {
        input: ''
      }
    },
    handleDelete(row) {
      this.dialogTemp = Object.assign({}, row)
      this.deleteFormVisible = true
      this.deleteConfirmExpect = this.dialogTemp.username
      this.$nextTick(() => {
        this.$refs['deleteForm'].clearValidate()
      })
    },
    deleteData() {
      this.$refs['deleteForm'].validate((valid) => {
        if (valid) {
          deleteUser(this.transData.id, this.dialogTemp.username).then(() => {
            this.getList()
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
    },
    cancelAddDatabasePrivilege() {
      this.databasePrivilegeFormData = { dbName: '', privileges: [] }
      this.dialogFormVisible = false
    },
    addDatabasePrivilege() {
      this.$refs['databasePrivilegeForm'].validate((valid) => {
        if (valid) {
          if (this.dialogFormIsEdit) {
            this.userDirectStr.databasePrivilege[this.dialogFormEditIndex] = this.databasePrivilegeFormData
          } else {
            this.userDirectStr.databasePrivilege.push(this.databasePrivilegeFormData)
          }
          this.cancelAddDatabasePrivilege()
        }
      })
    },
    handleDatabasePrivilegeEdit(index, row) {
      this.databasePrivilegeFormData = row
      this.dialogFormIsEdit = true
      this.databasesOptions = this.databasesList
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['databasePrivilegeForm'].clearValidate()
      })
    },
    handleAddDatabasePrivilege() {
      this.databasesOptions = []
      if (this.databasesList.length <= this.userDirectStr.databasePrivilege.length) {
        this.$message({
          showClose: true,
          message: '没有可新增的数据库',
          type: 'error'
        })
        return
      } else {
        const temp = [].concat(this.databasesList)
        for (let i = 0; i < this.userDirectStr.databasePrivilege.length; i++) {
          for (let j = 0; j < temp.length; j++) {
            if (this.userDirectStr.databasePrivilege[i].dbName === temp[j]) {
              temp.splice(j, 1)
              break
            }
          }
        }
        this.databasesOptions = temp
        this.dialogFormIsEdit = false
        this.dialogFormVisible = true
      }
    },
    getList() {
      this.list = []
      this.listLoading = true
      fetchUsers(this.transData.id).then(response => {
        this.list = response.data
        this.total = this.list.length
        this.listLoading = false
      })
    },
    handleCheckedAllDatabasePrivilegesChange(val) {
      this.databasePrivilegeFormData.privileges = val ? this.privilegesLocalList : []
      this.isIndeterminate2 = false
    },
    handleCheckedDatabasePrivilegesChange(value) {
      const checkedCount = value.length
      this.checkAllDatabasePrivileges = checkedCount === this.privilegesLocalList.length
      this.isIndeterminate2 = checkedCount > 0 && checkedCount < this.databasePrivilegeFormData.privileges
    },
    handleCheckedAllGlobalPrivilegesChange(val) {
      this.userDirectStr.globalPrivilege = val ? this.privilegesGlobalList : []
      this.isIndeterminate1 = false
    },
    handleCheckedGlobalPrivilegesChange(value) {
      const checkedCount = value.length
      this.checkAllGlobalPrivileges = checkedCount === this.privilegesGlobalList.length
      this.isIndeterminate1 = checkedCount > 0 && checkedCount < this.userDirectStr.globalPrivilege.length
    },
    handleSizeChange(val) {
      this.pagesize = val
    },
    handleCurrentChange(val) {
      this.currentPage = val
    },
    handlePagination(val) {
      this.currentPage = val.page
      this.pagesize = val.limit
    },
    getDialogData() {
      fetchDatabasesById(this.transData.id).then(response => {
        const temp = []
        response.data.forEach(element => {
          temp.push(element.name)
        })
        this.databasesList = temp
      })
      fetchPrivilegesEnabledAndGlobal().then(response => {
        const temp = []
        response.data.forEach(element => {
          temp.push(element.code)
        })
        this.privilegesGlobalList = temp
      })
      fetchPrivilegesEnabledAndLocal().then(response => {
        const temp = []
        response.data.forEach(element => {
          temp.push(element.code)
        })
        this.privilegesLocalList = temp
      })
    },
    handleAdd() {
      this.dialogStatus = '新增'
      this.privilegesGlobalList = []
      this.getDialogData()
      this.userDirectDialogIsEdit = false
      this.userDirectFormVisible = true
      this.$nextTick(() => {
        this.$refs['userDirectForm'].clearValidate()
      })
    },
    handleEdit(row) {
      const temp = Object.assign({}, row)
      for (const key in temp) {
        if (typeof temp[key] === 'boolean') {
          temp[key] = temp[key].toString()
        }
      }
      this.getDialogData()
      this.userDirectStr.username = temp.username
      this.userDirectStr.whiteIps = temp.whiteIps
      temp.privileges.forEach(element => {
        if (element.dbName === '*') {
          this.userDirectStr.globalPrivilege = element.privileges
        } else {
          this.userDirectStr.databasePrivilege.push(element)
        }
      })
      this.dialogStatus = '编辑'
      this.userDirectDialogIsEdit = true
      this.userDirectFormVisible = true
      this.$nextTick(() => {
        this.$refs['userDirectForm'].clearValidate()
      })
    },
    userDirect() {
      const temp = {}
      temp.username = this.userDirectStr.username
      temp.whiteIps = this.userDirectStr.whiteIps
      temp.db_privileges = []
      temp.db_privileges.push({
        'dbName': '*',
        'privileges': this.userDirectStr.globalPrivilege
      })
      temp.db_privileges = temp.db_privileges.concat(this.userDirectStr.databasePrivilege)
      if (!this.userDirectDialogIsEdit) {
        // POST
        temp.authType = this.userDirectStr.authType
        temp.password = this.userDirectStr.password
        this.$refs['userDirectForm'].validate((valid) => {
          if (valid) {
            addUserDirect(this.transData.id, temp).then(response => {
              this.getList()
              this.cancelUserDirectEdit()
              this.$notify({
                title: 'Success',
                message: '新增成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      } else {
        // PUT
        temp.ip = '%'
        this.$refs['userDirectForm'].validate((valid) => {
          if (valid) {
            updateUserDirect(this.transData.id, temp.username, temp).then(response => {
              this.getList()
              this.cancelUserDirectEdit()
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
    },
    cancelUserDirectEdit() {
      this.userDirectFormVisible = false
      this.dialogStatus = ''
      this.userDirectStr = {
        authType: 'password',
        username: '',
        password: '',
        passwordRepeat: '',
        whiteIps: '',
        globalPrivilege: [],
        databasePrivilege: []
      }
    }
  }
}
</script>

<style>

</style>
