<template>
  <div class="app-container">

    <el-table v-loading="listLoading" :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)" border fit highlight-current-row style="width: 100%">

      <el-table-column align="center" label="类型代码" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.code }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="类型名称" width="auto">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="类型配置" width="auto">
        <template slot-scope="scope">
          <el-button type="primary" @click="openPoolDrawer(scope.row)">
            管理<i class=" el-icon--right" />
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :current-page="currentPage" :page-sizes="[10, 20, 30]" :limit="parseInt(pagesize)" :total="total" @size-change="handleSizeChange" @current-change="handleCurrentChange" @pagination="handlePagination" />

    <el-drawer
      :visible.sync="drawer.drawerVisible"
      :fullscreen="fullscreen"
    >
      <el-button type="primary" icon="el-icon-circle-plus-outline" size="small" round style="margin: -30px 0 10px 16px;" @click="displayAddNewPool()">增加</el-button>

      <el-table v-loading="drawer.listLoading" :data="drawer.list.slice((drawer.currentPage-1)*drawer.pagesize,drawer.currentPage*drawer.pagesize)" fit highlight-current-row style="width: 100%;" size="small">
        <el-table-column align="center" label="类型项代码" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.code }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="类型项名称" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>

        <el-table-column align="center" label="显示顺序" width="auto">
          <template slot-scope="scope">
            <span>{{ scope.row.sequence }}</span>
          </template>
        </el-table-column>
        <el-table-column v-if="roles.includes('编辑') || roles.includes('admin')" align="center" label="操作" width="auto">
          <template slot-scope="scope">
            <el-button type="primary" @click="handleEdit(scope.row)">
              编辑<i class=" el-icon--right" />
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <Pagination v-show="total>0" :current-page="drawer.currentPage" :page-sizes="[5, 10, 20]" :limit="parseInt(drawer.pagesize)" :total="drawer.total" style="margin-top:-5px;" @size-change="handleDrawerSizeChange" @current-change="handleDrawerCurrentChange" @pagination="handleDrawerPagination" />

    </el-drawer>

    <el-dialog :visible.sync="newRemoteFormVisible">
      <el-form ref="newRemoteForm" :model="dialogTemp" :rules="newRemotePoolRules" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="类型代码" prop="dictTypeCode">
          <el-input v-model="dialogTemp.dictTypeCode" disabled />
        </el-form-item>
        <el-form-item label="显示顺序" prop="sequence">
          <el-input v-model="dialogTemp.sequence" />
        </el-form-item>
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="dialogTemp.name" />
        </el-form-item>
        <el-form-item label="类型项代码" prop="code">
          <el-input v-model="dialogTemp.code" :disabled="isEdit" />
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
import { fetchDictTypes, fetchDictTypesPools, addDictTypesPools, modifyDictTypesPools } from '@/api/system/dictionary'
import Pagination from '@/components/Pagination'

export default {
  name: 'DictionaryManagement',
  components: { Pagination },
  data() {
    return {
      roles: this.$router.currentRoute.meta.roles,
      list: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      dictTypeCodeGlobal: '',
      drawer: {
        list: [],
        total: 0,
        currentPage: 1,
        pagesize: 10,
        listLoading: true,

        drawerVisible: false,
        formVisible: false,
        remoteId: 1,
        temp: {
          name: '',
          code: '',
          sequence: undefined,
          id: ''
        }
      },
      newRemotePoolRules: {
        code: [{ required: true, message: 'code is required', trigger: 'change' }],
        name: [{ required: true, message: 'name is required', trigger: 'change' }]
      },
      fullscreen: true,
      newRemoteFormVisible: false,
      isEdit: false,
      dialogTemp: {
        id: '',
        name: '',
        sequence: undefined,
        code: '',
        dictTypeCode: ''
      }
    }
  },
  computed: {
  },
  created() {
    this.getRemoteList()
  },
  methods: {
    resizeHandler() {
      this.drawer.height = window.innerHeight - 210
    },
    getPoolList(remote_id) {
      this.drawer.listLoading = true
      fetchDictTypesPools(remote_id).then(response => {
        this.drawer.list = response.data
        this.drawer.total = response.data.length
        this.drawer.listLoading = false
      })
    },
    getRemoteList() {
      this.listLoading = true
      fetchDictTypes().then(response => {
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

    openPoolDrawer(row) {
      this.drawer.drawerVisible = true
      this.getPoolList(row.code)
      this.dictTypeCodeGlobal = row.code
      // console.log(this.dictTypeCodeGlobal)
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
          if (!this.isEdit) {
            addDictTypesPools(this.dictTypeCodeGlobal, tempData).then(() => {
              this.getRemoteList()
              this.getPoolList(this.dictTypeCodeGlobal)
              this.newRemoteFormVisible = false
              this.$notify({
                title: 'Success',
                message: '添加成功',
                type: 'success',
                duration: 2000
              })
            })
          } else {
            modifyDictTypesPools(this.dictTypeCodeGlobal, tempData, tempData.id).then(() => {
              this.getRemoteList()
              this.getPoolList(this.dictTypeCodeGlobal)
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
    },
    displayAddNewPool() {
      this.newRemoteFormVisible = true
      this.isEdit = false
      this.dialogTemp.dictTypeCode = this.dictTypeCodeGlobal
      this.dialogTemp.sequence = ''
      this.dialogTemp.code = ''
      this.dialogTemp.name = ''
    },
    handleEdit(row) {
      this.newRemoteFormVisible = true
      this.isEdit = true
      this.dialogTemp.id = row.id
      this.dialogTemp.dictTypeCode = this.dictTypeCodeGlobal
      this.dialogTemp.sequence = row.sequence
      this.dialogTemp.code = row.code
      this.dialogTemp.name = row.name
    }
  }
}
</script>

<style scoped>
</style>
