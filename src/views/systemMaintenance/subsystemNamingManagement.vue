<template>
  <div class="app-container">

    <el-button v-if="roles.includes('新增') || roles.includes('admin')" type="primary" icon="el-icon-circle-plus-outline" size="small" round style="margin: 0 0 16px 16px;" @click="handleAdd">增加</el-button>
    <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    <el-table v-loading="listLoading" :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="业务系统名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.businessSystemName }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="子系统名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="创建时间" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.gmtCreate }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="所属者" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.ownerName }}</span>
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
        </template>
      </el-table-column>
    </el-table>

    <Pagination v-show="total>0" :current-page="currentPage" :page-sizes="[10, 20, 30]" :limit="parseInt(pagesize)" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" @pagination="handlePagination" />

    <el-dialog :visible.sync="newRemoteFormVisible">
      <el-form ref="newRemoteForm" :model="dialogTemp" :rules="newRemoteRules" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="业务系统" prop="businessSystemId">
          <el-select v-model="dialogTemp.businessSystemId" placeholder="请选择" :disabled="!newOrEdit">
            <el-option
              v-for="item in systemList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="子系统名称" prop="name">
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
  </div>
</template>

<script>
import { fetchBusinessSubSystems, addBusinessSubSystem, modifyBusinessSubSystem, deleteBusinessSubSystem } from '@/api/system/business_subsystems'
import { fetchBusinessSystems } from '@/api/system/business_systems'
import Pagination from '@/components/Pagination'

export default {
  name: 'SubsystemNamingManagement',
  components: { Pagination },
  filters: { },
  data() {
    return {
      roles: this.$router.currentRoute.meta.roles,
      list: [],
      systemList: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      newRemoteFormVisible: false,
      dialogTemp: {
        id: '',
        name: '',
        businessSystemId: '',
        description: ''
      },
      newRemoteRules: {
        name: [{ required: true, message: 'name is required', trigger: 'change' }],
        businessSystemId: [{ required: true, message: 'businessSystemName is required', trigger: 'change' }]
      },
      newOrEdit: true
    }
  },
  computed: {
  },
  created() {
    this.getSubSystemList()
    this.getSystemList()
  },
  methods: {
    refresh() {
      this.getSubSystemList()
      this.getSystemList()
    },
    getSubSystemList() {
      this.listLoading = true
      fetchBusinessSubSystems().then(response => {
        this.list = response.data
        this.total = response.data.length
        this.listLoading = false
      })
    },
    getSystemList() {
      fetchBusinessSystems().then(response => {
        this.systemList = response.data
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
        deleteBusinessSubSystem(row.id).then(_ => {
          this.getSubSystemList()
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
      this.dialogTemp.businessSystemId = row.businessSystemId
      this.dialogTemp.name = row.name
      this.dialogTemp.description = row.description
    },
    handleAdd() {
      this.newOrEdit = true
      this.dialogTemp = {
        name: '',
        businessSystemId: '',
        description: ''
      }
      this.newRemoteFormVisible = true
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
            addBusinessSubSystem(tempData).then(() => {
              this.getSubSystemList()
              this.newRemoteFormVisible = false
              this.$notify({
                title: 'Success',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            modifyBusinessSubSystem(tempData.id, tempData).then(() => {
              this.getSubSystemList()
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
