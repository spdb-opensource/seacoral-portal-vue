<template>
  <div class="app-container">

    <el-button v-if="roles.includes('新增') || roles.includes('admin')" type="primary" icon="el-icon-circle-plus-outline" size="small" round style="margin: 0 0 16px 16px;" @click="handleAdd">增加</el-button>
    <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    <el-table v-loading="listLoading" :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="组别名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建者姓名" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.created.username }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.created.timestamp }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="描述" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.description }}</span>
        </template>
      </el-table-column>

      <el-table-column
        fixed="right"
        label="管理"
        align="center"
        width="auto"
      >
        <template slot-scope="scope">
          <el-button v-if="roles.includes('编辑') || roles.includes('admin')" type="text" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-if="roles.includes('删除') || roles.includes('admin')" type="text" size="small" @click="handleDelete(scope.row)">删除</el-button>
          <el-button type="text" size="small" @click="handleDview(scope.row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total>0" :current-page="currentPage" :page-sizes="[10, 20, 30]" :limit="parseInt(pagesize)" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" @pagination="handlePagination" />

    <el-dialog :visible.sync="newRemoteFormVisible">
      <el-form ref="newRemoteForm" :model="dialogTemp" :rules="newRemoteRules" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="组别名称" prop="name">
          <el-input v-model="dialogTemp.name" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="dialogTemp.description" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="newRemoteFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleAddNewRemote">
          保存
        </el-button>
      </div>
    </el-dialog>

    <el-drawer
      :visible.sync="drawer.drawerVisible"
      :fullscreen="fullscreen"
    >
      <el-table v-loading="drawer.listLoading" :data="drawer.list.slice((drawer.currentPage-1)*drawer.pagesize,drawer.currentPage*drawer.pagesize)" fit highlight-current-row style="width: 100%;" size="small">
        <el-table-column align="center" label="登陆用户名" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.username }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="用户姓名" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="所属单位" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.company }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态" width="auto" :formatter="transTF" />
      </el-table>

      <Pagination v-show="total>0" :current-page="drawer.currentPage" :page-sizes="[5, 10, 20]" :limit="parseInt(drawer.pagesize)" :total="drawer.total" style="margin-top:-5px;" @size-change="handleDrawerSizeChange" @current-change="handleDrawerCurrentChange" @pagination="handleDrawerPagination" />

    </el-drawer>
  </div>
</template>

<script>
import { fetchGroup, addGroup, modifyGroup, deleteGroup } from '@/api/system/group'
import { fetchUsers } from '@/api/system/users'
import Pagination from '@/components/Pagination'

export default {
  name: 'GroupManagement',
  components: { Pagination },
  filters: { },
  data() {
    return {
      roles: this.$router.currentRoute.meta.roles,
      list: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      fullscreen: true,
      newRemoteFormVisible: false,
      dialogTemp: {
        id: '',
        name: '',
        description: ''
      },
      newRemoteRules: {
        name: [{ required: true, message: 'name is required', trigger: 'change' }]
      },
      newOrEdit: true,
      drawer: {
        list: [],
        total: 0,
        currentPage: 1,
        pagesize: 10,
        listLoading: true,
        drawerVisible: false,
        formVisible: false
      }
    }
  },
  computed: {
  },
  created() {
    this.getGroupList()
    this.getUserList()
  },
  methods: {
    refresh() {
      this.getGroupList()
      this.getUserList()
    },
    transTF(row, column) {
      return row.enabled === true ? '启用' : '禁用'
    },
    getGroupList() {
      this.listLoading = true
      fetchGroup().then(response => {
        this.list = response.data
        this.total = response.data.length
        this.listLoading = false
      })
    },
    getUserList() {
      this.drawer.listLoading = true
      fetchUsers().then(response => {
        this.drawer.list = response.data
        this.drawer.total = response.data.length
        this.drawer.listLoading = false
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
    handleDelete(row) {
      this.$confirm('是否确认删除 ' + row.name, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteGroup(row.id).then(_ => {
          this.getGroupList()
          this.$notify({
            title: 'Success',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
        })
      }).catch(() => {
        this.$message.info('取消操作！')
      })
    },
    handleEdit(row) {
      this.newOrEdit = false
      this.newRemoteFormVisible = true
      this.dialogTemp.id = row.id
      this.dialogTemp.name = row.name
      this.dialogTemp.description = row.description
    },
    handleAdd() {
      this.newOrEdit = true
      this.dialogTemp = {
        name: '',
        description: ''
      }
      this.newRemoteFormVisible = true
    },
    handleDview() {
      this.drawer.drawerVisible = true
    },
    handleDrawerSizeChange(val) {
      this.drawer.pagesize = val
    },
    handleDrawerCurrentChange(val) {
      this.drawer.currentPage = val
    },
    handleDrawerPagination(val) {
      this.drawer.currentPage = val.page
      this.drawer.pagesize = val.limit
    },
    cloneForNewRemote(input) {
      const res = input
      res.created_user = this.user_id
      return res
    },
    handleAddNewRemote() {
      this.$refs['newRemoteForm'].validate((valid) => {
        if (valid) {
          const tempData = this.cloneForNewRemote(this.dialogTemp)
          console.log(tempData)
          if (this.newOrEdit) {
            addGroup(tempData).then(() => {
              this.getGroupList()
              this.newRemoteFormVisible = false
              this.$notify({
                title: 'Success',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            modifyGroup(tempData.id, tempData).then(() => {
              this.getGroupList()
              this.newRemoteFormVisible = false
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
    }
  }
}
</script>

<style scoped>
</style>
