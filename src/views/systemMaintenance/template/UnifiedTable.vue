<template>
  <div>
    <el-row v-if="showFilter">
      <el-col :span="8">
        <el-input
          v-model="searchValue"
          size="small"
          clearable
          placeholder="输入内容搜索"
          suffix-icon="el-icon-search"
        />
      </el-col>
    </el-row>

    <el-table
      v-loading="listLoading"
      :data="shownList.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      highlight-current-row
      style="width: 100%"
    >

      <el-table-column
        v-for="(labelName, keyName) in tableItems"
        :key="keyName"
        align="center"
        :label="labelName"
        width="auto"
      >
        <template slot-scope="scope">
          <span>{{ parseColumnData(keyName,scope.row) }}</span>
        </template>
      </el-table-column>

      <el-table-column
        v-if="showTableButtonsColumn"
        label="管理"
        width="auto"
        :min-width="showDropdownButtons? Object.keys(tableButtons).length*40+40:Object.keys(tableButtons).length*40"
      >
        <template slot-scope="{row}">
          <div style="display: flex;">
            <div v-if="showTableButtons">
              <div v-for="(buttonContent, buttonKey) in tableButtons" :key="buttonKey">
                <el-button
                  v-if="roles.includes(buttonContent.displayName) || roles.includes('admin')"
                  @click="onTableButtonClick(buttonKey,row)"
                >{{ buttonContent.displayName }}</el-button>
              </div>
            </div>
            <el-dropdown
              v-if="showDropdownButtons"
              trigger="click"
              :hide-on-click="false"
              :style="showTableButtons ? 'margin-left:8px': ''"
              @command="handleDropdown($event,row)"
            >
              <el-button type="primary">
                管理<i class="el-icon-arrow-down el-icon--right" />
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <div
                  v-for="(buttonContent, buttonKey) in tableDropdownButtons"
                  :key="buttonKey"
                >
                  <el-dropdown-item
                    v-if="roles.includes(buttonContent.displayName) || roles.includes('admin')"
                    :command="buttonKey"
                  ><i :class="buttonContent.icon" />{{ buttonContent.displayName }}</el-dropdown-item>
                </div></el-dropdown-menu>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      :v-show="total>0"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30]"
      :limit="parseInt(pagesize)"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @pagination="handlePagination"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import { isEmpty, includes } from 'lodash'

export default {
  components: { Pagination },
  filters: { },
  props: {
    tableItems: {
      type: Object,
      required: true
    },
    tableButtons: {
      type: Object,
      required: false,
      default: function() {
        return {}
      }
    },
    roles: {
      type: Array,
      required: false,
      default: function() {
        return []
      }
    },
    tableDropdownButtons: {
      type: Object,
      required: false,
      default: function() {
        return {}
      }
    },
    itemList: {
      type: Array,
      required: true
    },
    listLoading: {
      type: Boolean,
      required: true
    },
    showFilter: {
      type: Boolean,
      required: false,
      default: function() {
        return true
      }
    },
    filterKeysList: {
      type: Array,
      required: false,
      default: function() {
        return []
      }
    }
  },
  data() {
    return {
      currentPage: 1,
      pagesize: 10,
      searchValue: ''
    }
  },
  computed: {
    shownList: function() {
      return this.filterData()
    },
    showTableButtonsColumn: function() {
      if (!this.showTableButtons && !this.showDropdownButtons) {
        return false
      }
      return true
    },
    showTableButtons: function() {
      if (isEmpty(this.tableButtons)) {
        return false
      }
      return true
    },
    showDropdownButtons: function() {
      if (isEmpty(this.tableDropdownButtons)) {
        return false
      }
      return true
    },
    total: function() {
      return this.shownList.length
    }
  },
  created() { },
  methods: {
    parseColumnData(key, row) {
      let tempData = row
      const tempList = key.split('.')
      tempList.forEach(element => {
        tempData = tempData[element]
      })
      return tempData
    },
    filterData() {
      this.handleCurrentChange(1)
      const _this = this
      if (this.searchValue === '') { return this.itemList }
      const data = this.itemList
      const value = this.searchValue
      const searchValue = value.toLowerCase()
      return data.filter(function(data) {
        return Object.keys(data).some(function(key) {
          if (_this.filterKeysList.length > 0) {
            if (!includes(key, _this.filterKeysList)) {
              return ''
            }
          }
          return (String(data[key])
            .toLowerCase().indexOf(searchValue) > -1)
        })
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
    handleDropdown(command, row) {
      this.$emit(command, row)
    },
    onTableButtonClick(event, row) {
      this.$emit(event, row)
    }
  }
}
</script>

<style scoped>
</style>
