<template>
  <div class="app-container">

    <el-button
      v-if="roles.includes('新增') || roles.includes('admin')"
      type="primary"
      icon="el-icon-circle-plus-outline"
      size="small"
      round
      style="margin: 0 0 16px 16px;"
      @click="addNewUsers()"
    >增加</el-button>
    <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >

      <el-table-column
        label="登录用户名"
        width="auto"
        min-width="90px"
        align="center"
        fixed
      >
        <template slot-scope="scope">
          <span>{{ scope.row.username }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="90px"
        align="center"
        label="用户姓名"
        fixed
      >
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="120px"
        align="center"
        label="所属单位"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.company }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="120px"
        align="center"
        label="联系电话"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.telephone }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="150px"
        align="center"
        label="邮箱"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.email }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="120px"
        align="center"
        label="认证方式"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.authType }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="状态"
        width="50px"
        align="center"
      >
        <template slot-scope="scope">
          <i
            v-if="scope.row.enabled"
            class="el-icon-success"
            style="color:green"
          />
          <i
            v-else
            class="el-icon-error"
            style="color:red"
          />
        </template>
      </el-table-column>

      <el-table-column
        min-width="100px"
        align="center"
        label="角色"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.role.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="120px"
        align="center"
        label="组别"
      >
        <template slot-scope="scope">
          <span>
            <p
              v-for="item in scope.row.groupNames"
              :key="item"
            >{{ item }}</p>
          </span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="160px"
        label="创建时间"
        align="center"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.created.timestamp }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="详情"
        width="113px"
        fixed="right"
      >
        <template slot-scope="{row}">

          <el-button
            plain
            size="small"
            icon="el-icon-more"
            @click="handleEdit(row, true)"
          />
          <el-dropdown
            trigger="click"
            :hide-on-click="false"
            @command="handleDropdown($event,row)"
          >
            <el-button
              v-if="roles.length !== 0"
              plain
              size="small"
              icon="el-icon-arrow-down"
            />
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-if="roles.includes('编辑') || roles.includes('admin')" command="edit"><i class="el-icon-edit-outline" />编辑</el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('启用') || roles.includes('admin')"
                command="enable"
                :disabled="row.enabled"
              ><i class="el-icon-video-play" />启用</el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('停用') || roles.includes('admin')"
                command="disable"
                :disabled="!row.enabled"
              ><i class="el-icon-video-pause" />停用</el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('删除') || roles.includes('admin')"
                command="delete"
                :disabled="row.enabled"
              ><i class="el-icon-delete" />删除</el-dropdown-item>
              <el-dropdown-item v-if="roles.includes('修改密码') || roles.includes('admin')" command="changePassword"><i class="el-icon-edit-outline" />修改密码</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
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
      :visible.sync="deleteFormVisible"
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

    <el-dialog
      title="修改密码"
      :visible.sync="modifyPasswordVisible"
      :before-close="cancelPasswordModify"
    >
      <el-form
        ref="modifyPasswordForm"
        :rules="modifyPasswordRules"
        :model="modifyPasswordConfirmStr"
        label-position="left"
        label-width="90px"
        style="width: 400px; margin-left:50px;"
      >
        <el-form-item
          label="原密码"
          prop="originalPwd"
        >
          <el-input
            v-model="modifyPasswordConfirmStr.originalPwd"
            placeholder=""
            show-password
          />
        </el-form-item>
        <el-form-item
          label="新密码"
          prop="newPwd"
        >
          <el-input
            v-model="modifyPasswordConfirmStr.newPwd"
            placeholder=""
            show-password
          />
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="newPwdRepeat"
        >
          <el-input
            v-model="modifyPasswordConfirmStr.newPwdRepeat"
            placeholder=""
            show-password
          />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelPasswordModify()">
          关闭
        </el-button>
        <el-button
          type="danger"
          @click="modifyPassword()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>
    <detailDialog
      :users-name="usersName"
      :dialog-status="dialogStatus"
      :dialog-is-view="dialogIsView"
      :edit-form-visible.sync="editFormVisible"
      @refresh-list="getList()"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchUsers, enableUsers, disableUsers, deleteUsers, modifyPassword } from '@/api/system/users'
import Pagination from '@/components/Pagination'
import detailDialog from './detailDialog'

export default {
  name: 'UsersManageMentList',
  components: { Pagination, detailDialog },
  filters: {
    stateFilter(status) {
      const stateMap = {
        passing: 'success',
        critical: 'danger'
      }
      return stateMap[status]
    }
  },
  data() {
    var validatePassword = (rule, value, callback) => {
      if (!value) {
        callback(new Error('password is required'))
      }
      if (rule.field === 'newPwd') {
        if (value === '') {
          callback(new Error('password is required'))
        } else if (this.modifyPasswordConfirmStr.newPwdRepeat && this.modifyPasswordConfirmStr.newPwdRepeat !== value) {
          callback(new Error('两次输入密码不一致!'))
        } else if (value.length < 6) {
          callback(new Error('密码位数至少为6位！'))
        } else {
          callback()
        }
      } else {
        if (value === '') {
          callback(new Error('请再次输入密码'))
        } else if (value !== this.modifyPasswordConfirmStr.newPwd) {
          callback(new Error('两次输入密码不一致!'))
        } else if (value.length < 6) {
          callback(new Error('密码位数至少为6位！'))
        } else {
          callback()
        }
      }
    }
    return {
      roles: this.$router.currentRoute.meta.roles,
      list: [],
      modifyPasswordVisible: false,
      modifyPasswordConfirmStr: {
        originalPwd: '',
        newPwd: '',
        newPwdRepeat: ''
      },
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      dialogIsView: false,
      editFormVisible: false,
      deleteFormVisible: false,
      dialogStatus: '',
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        input: ''
      },
      usersName: '',
      regions: null,
      dialogTemp: {
        username: undefined,
        name: undefined,
        telephone: undefined,
        email: undefined,
        company: undefined,
        emerContact: undefined,
        emerTel: undefined,
        authType: undefined,
        enabled: undefined,
        groupNames: [],
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
        name: [{ required: true, message: 'name is required', trigger: 'change' }]
      },
      modifyPasswordRules: {
        originalPwd: [{ required: true, message: 'originalPwd is required', trigger: 'change' }],
        newPwd: [{ required: true, validator: validatePassword, trigger: 'change' }],
        newPwdRepeat: [{ required: true, validator: validatePassword, trigger: ['blur', 'change'] }]
      }
    }
  },
  computed: {
    ...mapGetters([
      'user_id'
    ]),
    deleteRules() {
      const pattern = new RegExp('^' + this.deleteConfirmExpect + '$')
      return {
        input: [{ required: true, message: '输入与 ' + this.deleteConfirmExpect + ' 不一致', pattern: pattern }]
      }
    }
  },
  watch: {
    editFormVisible(newValue, oldValue) {
      if (newValue === false) {
        this.usersName = ''
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
    getList() {
      this.listLoading = true
      fetchUsers().then(response => {
        this.list = response.data
        this.total = response.data.length
        this.listLoading = false
      })
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
    handleEdit(row, isView) {
      this.dialogTemp = Object.assign({}, row) // copy obj
      if (isView) {
        this.dialogStatus = 'view'
        this.dialogIsView = true
        this.usersName = row.username
      } else {
        this.dialogStatus = 'edit'
        this.dialogIsView = false
        this.usersName = row.username
      }
      this.editFormVisible = true
    },
    handleRemoteStart(row) {
      this.$confirm('是否确认启用用户 ' + row.username, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        enableUsers(row.username).then(response => {
          this.getList()
          this.$message.success('启用成功')
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleRemoteStop(row) {
      this.$confirm('是否确认停用用户 ' + row.username, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        disableUsers(row.username).then(response => {
          this.getList()
          this.$message.success('停用成功')
        }).catch(error => {
          this.$message.info(error)
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleDelete(row) {
      this.dialogTemp = Object.assign({}, row)
      this.dialogStatus = 'delete'
      this.deleteFormVisible = true
      this.deleteConfirmExpect = this.dialogTemp.username
    },
    handleModifyPassword(row) {
      this.dialogTemp = Object.assign({}, row)
      this.modifyPasswordVisible = true
    },
    handleDropdown(command, row) {
      if (command === 'edit') {
        this.handleEdit(row, false)
      } else if (command === 'enable') {
        this.handleRemoteStart(row)
      } else if (command === 'disable') {
        this.handleRemoteStop(row)
      } else if (command === 'changePassword') {
        this.handleModifyPassword(row)
      } else {
        this.handleDelete(row)
      }
    },
    addNewUsers() {
      this.dialogStatus = ''
      this.dialogIsView = false
      this.usersName = ''
      this.editFormVisible = true
    },
    cancelDelete() {
      this.editFormVisible = false
      this.deleteFormVisible = false
      this.dialogStatus = ''
      this.deleteConfirmExpect = ''
      this.deleteConfirmStr = {
        input: ''
      }
    },
    cancelPasswordModify() {
      this.modifyPasswordVisible = false
      this.$refs['modifyPasswordForm'].clearValidate()
      this.modifyPasswordConfirmStr = {
        originalPwd: '',
        newPwd: '',
        newPwdRepeat: ''
      }
    },
    modifyPassword() {
      this.$refs['modifyPasswordForm'].validate((valid) => {
        if (valid) {
          const param = {
            originalPwd: this.modifyPasswordConfirmStr.originalPwd,
            newPwd: this.modifyPasswordConfirmStr.newPwd
          }
          modifyPassword(this.dialogTemp.username, param).then(() => {
            this.getList()
            this.cancelPasswordModify()
            this.$notify({
              title: 'Success',
              message: '修改密码成功',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    deleteData() {
      this.$refs['deleteForm'].validate((valid) => {
        if (valid) {
          deleteUsers(this.dialogTemp.username).then(() => {
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
    }
  }
}
</script>

<style scoped>
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
