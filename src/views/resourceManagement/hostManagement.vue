<template>
  <div class="app-container">

    <el-button
      v-if="roles.includes('入库') || roles.includes('admin')"
      type="primary"
      icon="el-icon-circle-plus-outline"
      size="small"
      round
      style="margin: 0 0 16px 16px;"
      @click="displayAddNewHost()"
    >入库</el-button>
    <el-button type="primary" icon="el-icon-refresh-right" size="small" round style="margin: 0 0 16px 16px;" @click="refresh()">刷新</el-button>
    <el-table
      v-loading="listLoading"
      :data="hostList.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :cell-style="{
        'padding': '0'
      }"
      :row-style="{
        'padding': '0'
      }"
    >

      <el-table-column
        align="center"
        label="ID"
        width="80"
        fixed="left"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="所属集群"
        width="120"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.cluster.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="主机IP"
        width="150"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="架构"
        width="46"
      >
        <template slot-scope="scope">
          <img :src=" scope.row.arch | archFilter " style="width: 30px; height: 30px; padding: 0; margin: 0;">
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="角色"
        width="46"
        style="padding: 0; margin: 0;"
      >
        <template slot-scope="scope">
          <img :src=" scope.row.role | roleFilter " style="width: 30px; height: 30px; padding: 0; margin: 0;">
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="容器分配率"
        width="90"
      >
        <template slot-scope="scope">
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="scope.row.unitCnt / scope.row.maxUnitCnt | progressFilter"
            :status="scope.row.unitCnt / scope.row.maxUnitCnt | progressStatusFilter"
          />
          <!--          <span>{{ (scope.row.unitCnt + "/" + scope.row.maxUnitCnt + "/") | usageFilter }}</span>-->
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="CPU分配率"
        width="90"
      >
        <template slot-scope="scope">
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="scope.row.cpu.usedCnt / scope.row.cpu.total | progressFilter"
            :status="scope.row.cpu.usedCnt / scope.row.cpu.total | progressStatusFilter"
          />
          <!--          <span>{{ (scope.row.cpu.usedCnt + "/" + scope.row.cpu.total + "/") | usageFilter }}</span>-->
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="内存分配率"
        width="90"
      >
        <template slot-scope="scope">
          <el-progress
            :text-inside="true"
            :stroke-width="20"
            :percentage="scope.row.mem.usedSize / scope.row.mem.totalSize | progressFilter"
            :status="scope.row.mem.usedSize / scope.row.mem.totalSize | progressStatusFilter"
          />
          <!--          <span>{{ (scope.row.mem.usedSize + "/" + scope.row.mem.totalSize + "/1024/G") | usageFilter }}</span>-->
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="存储分配率(G)"
        width="120"
      >
        <template
          v-if="scope.row.storage"
          slot-scope="scope"
        >
          <span
            v-for="(item, i) in scope.row.storage"
            :key="`I-${i}`"
            style="font-size: small"
          >{{ item.performance.display }}:{{ (item.usedSize + "/" + item.totalSize + "/1024") | usageFilter }}<br></span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="外置存储"
        width="auto"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.storageRemote">{{ scope.row.storageRemote.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="启用/停用"
        width="auto"
        fixed="right"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.enabled | enableDisableFilter">
            <i :class="row.enabled | enableDisableIcon" />
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="任务状态"
        width="auto"
        fixed="right"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.task.id !== ''">{{ scope.row.task.action.display + scope.row.task.status.display }}</span>
          <span v-else>无任务</span>
        </template>
      </el-table-column>

      <el-table-column
        align="center"
        label="管理"
        width="auto"
        fixed="right"
      >
        <template slot-scope="{row}">
          <el-dropdown
            trigger="click"
            :hide-on-click="false"
            @command="handleDropdown"
          >
            <el-button type="primary">
              管理<i class="el-icon-arrow-down el-icon--right" />
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item :command="'view/' + row.id + '/' + row.name"><i class="el-icon-zoom-in" />查看</el-dropdown-item>
              <el-dropdown-item v-if="roles.includes('编辑') || roles.includes('admin')" :command="'modify/' + row.id + '/' + row.name" :disabled="row.enabled"><i class="el-icon-edit" />编辑</el-dropdown-item>
              <el-dropdown-item v-if="roles.includes('监控注册') || roles.includes('监控注销') || roles.includes('admin')" :command="'monitor/' + row.id + '/' + row.ip"><i class="el-icon-monitor" />监控</el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('启用') || roles.includes('admin')"
                :command="'enable/'+ row.id + '/' + row.name"
                :disabled="row.enabled"
              ><i class="el-icon-open" />启用</el-dropdown-item>
              <el-dropdown-item
                v-if="roles.includes('停用') || roles.includes('admin')"
                :command="'disable/' + row.id + '/' + row.name"
                :disabled="!row.enabled"
              ><i class="el-icon-turn-off" />停用</el-dropdown-item>
              <el-dropdown-item v-if="roles.includes('出库') || roles.includes('admin')" :command="'delete/' + row.id + '/' + row.name" :disabled="row.enabled"><i class="el-icon-delete" />出库</el-dropdown-item>
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
      :visible.sync="newHostFormVisible"
      :before-close="handleFormClose"
    >
      <el-form
        ref="newHostForm"
        :model="dialogTemp"
        :rules="newHostRules"
        label-position="left"
        label-width="auto"
        style="width: 500px; margin-left:30px; font-size: smaller"
      >
        <el-form-item
          label="所属站点"
          prop="clusterId"
        >
          <el-cascader
            v-show="dialogStatus === 'add'"
            v-model="dialogTemp.clusterId"
            :options="clusterOptions"
          />
          <el-input
            v-show="dialogStatus !== 'add'"
            v-model="dialogTemp.siteCluster"
            disabled
          />
        </el-form-item>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item
              label="主机IP"
              prop="ip"
            >
              <el-input
                v-model="dialogTemp.ip"
                :disabled="dialogStatus !== 'add'"
              />
            </el-form-item>
          </el-col>

          <el-col v-if="dialogStatus === 'add'" :span="12">
            <el-form-item
              label="SSH端口"
              prop="sshPort"
            >
              <el-input-number
                v-model="dialogTemp.sshPort"
                :min="1"
                :max="65535"
                size="mini"
              />
            </el-form-item>
          </el-col>

          <el-col v-if="dialogStatus === 'view'" :span="12">
            <el-form-item
              label="角色"
              prop="room"
            >
              <el-input
                v-model="dialogTemp.role"
                :disabled="dialogStatus === 'view'"
                style="width: 160px;"
              />
            </el-form-item>
          </el-col>

          <el-col v-if="dialogStatus === 'modify'" :span="12">
            <el-form-item label="角色：" :disabled="dialogStatus !== 'add'">
              <el-radio-group v-model="dialogTemp.role">
                <el-radio-button v-for="i in roleOptions" :key="i.role" :label="i.role" :value="i.role">{{ i.role }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item
              v-if="dialogStatus === 'add'"
              label="SSH用户名"
              prop="sshUsername"
            >
              <el-input v-model="dialogTemp.sshUsername" />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              v-if="dialogStatus === 'add'"
              label="SSH密码"
              prop="sshPassword"
            >
              <el-input v-model="dialogTemp.sshPassword" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item
              label="机房"
              prop="room"
            >
              <el-input
                v-model="dialogTemp.room"
                :disabled="dialogStatus === 'view'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="机位"
              prop="seat"
            >
              <el-input
                v-model="dialogTemp.seat"
                :disabled="dialogStatus === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item
              label="普通本地存储"
              prop="storage.mediumPath"
            >
              <el-input
                v-model="dialogTemp.storage.mediumPath"
                :disabled="dialogStatus !== 'add'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="高性能本地存储"
              prop="storage.highPath"
            >
              <el-input
                v-model="dialogTemp.storage.highPath"
                :disabled="dialogStatus !== 'add'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item
              label="外置存储"
              prop="storageRemoteId"
              hidden
            >
              <el-select
                v-model="dialogTemp.storageRemoteId"
                placeholder="请选择"
                :disabled="dialogStatus !== 'add'"
              >
                <el-option
                  v-for="item in remoteStorages"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="最大容器数量"
              prop="maxUnitCnt"
            >
              <el-input-number
                v-model="dialogTemp.maxUnitCnt"
                :min="1"
                :max="100"
                size="mini"
                :disabled="dialogStatus !== 'add'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item
              label="CPU最大使用率"
              prop="maxUsage.cpu"
            >
              <el-input-number
                v-model="dialogTemp.maxUsage.cpu"
                :min="1"
                :max="100"
                size="mini"
                :disabled="dialogStatus === 'view'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="内存最大使用率"
              prop="maxUsage.mem"
            >
              <el-input-number
                v-model="dialogTemp.maxUsage.mem"
                :min="1"
                :max="100"
                size="mini"
                :disabled="dialogStatus === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="12">
            <el-form-item
              label="带宽最大使用率"
              prop="maxUsage.bandwidth"
            >
              <el-input-number
                v-model="dialogTemp.maxUsage.bandwidth"
                :min="1"
                :max="100"
                size="mini"
                :disabled="dialogStatus === 'view'"
              />
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              label="存储最大使用率"
              prop="maxUsage.storage"
            >
              <el-input-number
                v-model="dialogTemp.maxUsage.storage"
                :min="1"
                :max="100"
                size="mini"
                :disabled="dialogStatus === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row
          v-if="dialogStatus === 'view'"
          :gutter="40"
          style="margin-bottom: 5px"
        >
          <el-col>
            容器（{{ dialogTemp.view.unitCnt }}/{{ dialogTemp.maxUnitCnt }}）：
            <el-progress
              :text-inside="true"
              :stroke-width="20"
              :percentage="dialogTemp.view.unitCnt / dialogTemp.maxUnitCnt | progressFilter"
              :status="dialogTemp.view.unitCnt / dialogTemp.maxUnitCnt | progressStatusFilter"
            />
          </el-col>
        </el-row>

        <el-row
          v-if="dialogStatus === 'view'"
          :gutter="40"
          style="margin-bottom: 5px"
        >
          <el-col>
            CPU（{{ dialogTemp.view.cpu.usedCnt }}/{{ dialogTemp.view.cpu.total }}）：
            <el-progress
              :text-inside="true"
              :stroke-width="20"
              :percentage="dialogTemp.view.cpu.usedCnt / dialogTemp.view.cpu.total | progressFilter"
              :status="dialogTemp.view.cpu.usedCnt / dialogTemp.view.cpu.total | progressStatusFilter"
            />
          </el-col>
        </el-row>

        <el-row
          v-if="dialogStatus === 'view'"
          :gutter="40"
          style="margin-bottom: 5px"
        >
          <el-col>
            内存（{{ dialogTemp.view.mem.usedSize / 1024 | toInt }}G/{{ dialogTemp.view.mem.totalSize / 1024 | toInt }}G）：
            <el-progress
              :text-inside="true"
              :stroke-width="20"
              :percentage="dialogTemp.view.mem.usedSize / dialogTemp.view.mem.totalSize | progressFilter"
              :status="dialogTemp.view.mem.usedSize / dialogTemp.view.mem.totalSize | progressStatusFilter"
            />
          </el-col>
        </el-row>

        <el-row
          v-if="dialogStatus === 'view'"
          :gutter="40"
          style="margin-bottom: 5px"
        >
          <el-col>
            普通本地存储（{{ dialogTemp.view.storage.medium.usedSize / 1024 | toInt }} G/{{ dialogTemp.view.storage.medium.totalSize / 1024 | toInt }} G）：
            <el-progress
              v-if="dialogTemp.view.storage.medium.totalSize"
              :text-inside="true"
              :stroke-width="20"
              :percentage="dialogTemp.view.storage.medium.usedSize / dialogTemp.view.storage.medium.totalSize | progressFilter"
              :status="dialogTemp.view.storage.medium.usedSize / dialogTemp.view.storage.medium.totalSize | progressStatusFilter"
            />
            <el-progress
              v-else
              :text-inside="true"
              :stroke-width="20"
              :percentage="0"
            />
          </el-col>
        </el-row>

        <el-row
          v-if="dialogStatus === 'view'"
          :gutter="40"
          style="margin-bottom: 5px"
        >
          <el-col>
            高性能本地存储（{{ dialogTemp.view.storage.high.usedSize / 1024 | toInt }} G/{{ dialogTemp.view.storage.high.totalSize / 1024 | toInt }} G）：
            <el-progress
              v-if="dialogTemp.view.storage.high.totalSize"
              :text-inside="true"
              :stroke-width="20"
              :percentage="dialogTemp.view.storage.high.usedSize / dialogTemp.view.storage.high.totalSize | progressFilter"
              :status="dialogTemp.view.storage.high.usedSize / dialogTemp.view.storage.high.totalSize | progressStatusFilter"
            />
            <el-progress
              v-else
              :text-inside="true"
              :stroke-width="20"
              :percentage="0"
            />
          </el-col>
        </el-row>

        <el-row
          v-if="dialogStatus === 'view'"
          :gutter="40"
          style="margin-bottom: 5px"
        >
          <el-col>
            带宽（{{ dialogTemp.view.bandwidth.usedSize }} Mbps/{{ dialogTemp.view.bandwidth.totalSize }} Mbps）：
            <el-progress
              :text-inside="true"
              :stroke-width="20"
              :percentage="dialogTemp.view.bandwidth.usedSize / dialogTemp.view.bandwidth.totalSize | progressFilter"
              :status="dialogTemp.view.bandwidth.usedSize / dialogTemp.view.bandwidth.totalSize | progressStatusFilter"
            />
          </el-col>
        </el-row>

        <el-row
          v-if="dialogStatus === 'add'"
          :gutter="40"
        >
          <el-col :span="12">
            <el-form-item
              label="NTP服务器地址"
              prop="ntpServer"
            >
              <el-select
                v-model="dialogTemp.ntpServer"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in ntpSeverList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item
              v-if="dialogStatus === 'add'"
              label="是否启用"
              prop="enabled"
            >
              <el-switch
                v-model="dialogTemp.enabled"
                active-color="#13ce66"
                inactive-color="#ff4949"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row
          v-if="dialogStatus === 'add'"
          :gutter="40"
        >
          <el-col :span="24">
            <el-form-item
              label="角色："
              prop="enabled"
              :disabled="dialogStatus !== 'add'"
            >
              <el-radio-group v-model="dialogTemp.role">
                <el-radio-button v-for="i in roleOptions" :key="i.role" :label="i.role" :value="i.role">{{ i.role }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="40">
          <el-col :span="24">
            <el-form-item
              label="描述"
              prop="description"
            >
              <el-input
                v-model="dialogTemp.description"
                type="textarea"
                :disabled="dialogStatus === 'view'"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row
          :gutter="40"
          justify="end"
        >
          <el-col
            :span="12"
            :offset="16"
          >
            <el-button @click="newHostFormVisible = false">
              关闭
            </el-button>
            <el-button
              v-if="dialogStatus === 'add'"
              type="primary"
              @click="handleAddNewHost()"
            >
              确认
            </el-button>
            <el-button
              v-if="dialogStatus === 'modify'"
              type="primary"
              @click="handleModifyHost()"
            >
              确认
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-dialog>

    <el-dialog
      :visible.sync="deleteFormVisible"
      :before-close="handleFormClose"
    >
      <el-form
        ref="deleteForm"
        :rules="deleteRules"
        :model="deleteConfirmStr"
        label-position="top"
        label-width="70px"
        style="width: 400px; margin-left:50px;"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item
              label="用户名"
              prop="username"
            >
              <el-input
                v-model="deleteConfirmStr.username"
                placeholder=""
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="密码" prop="pwd">
              <el-input
                v-model="deleteConfirmStr.pwd"
                placeholder=""
              />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="端口" prop="port">
              <el-input
                v-model="deleteConfirmStr.port"
                placeholder=""
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="handleFormClose()">
          关闭
        </el-button>
        <el-button
          type="danger"
          @click="handleHostDelete(dialogTemp.id)"
        >
          确认删除
        </el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  fetchHosts,
  addHost,
  modifyHost,
  deleteHost,
  enableHost,
  disableHost
} from '@/api/manager/hosts'
import { fetchClusters } from '@/api/manager/clusters'
import { fetchRemoteStorages } from '@/api/manager/storages'
import Pagination from '@/components/Pagination'
import { getNtpSever } from '@/api/selections'

export default {
  name: 'HostManagementList',
  components: { Pagination },
  filters: {
    enableDisableFilter(status) {
      const stateMap = {
        true: 'success',
        false: 'danger'
      }
      return stateMap[status]
    },
    enableDisableIcon(status) {
      if (status) {
        return 'el-icon-circle-check'
      }
      return 'el-icon-circle-close'
    },
    archFilter(input) {
      if (input === 'amd64') {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKEAAAChCAYAAACvUd+2AAAHnXRFWHRteGZpbGUAJTNDbXhmaWxlJTIwaG9zdCUzRCUyMkVsZWN0cm9uJTIyJTIwbW9kaWZpZWQlM0QlMjIyMDIwLTA4LTI0VDA0JTNBNTklM0E0MC4wMDlaJTIyJTIwYWdlbnQlM0QlMjI1LjAlMjAoV2luZG93cyUyME5UJTIwMTAuMCUzQiUyMFdpbjY0JTNCJTIweDY0KSUyMEFwcGxlV2ViS2l0JTJGNTM3LjM2JTIwKEtIVE1MJTJDJTIwbGlrZSUyMEdlY2tvKSUyMGRyYXcuaW8lMkYxMy4yLjQlMjBDaHJvbWUlMkY4My4wLjQxMDMuMTA0JTIwRWxlY3Ryb24lMkY5LjAuNCUyMFNhZmFyaSUyRjUzNy4zNiUyMiUyMGV0YWclM0QlMjJLNnFHWkVQa3ZvbGgxWlhsR3ZyWSUyMiUyMHZlcnNpb24lM0QlMjIxMy4yLjQlMjIlMjB0eXBlJTNEJTIyZGV2aWNlJTIyJTIwcGFnZXMlM0QlMjIyJTIyJTNFJTNDZGlhZ3JhbSUyMGlkJTNEJTIyeDlVZFltZjlJRXhQZEVEcDVyd1olMjIlMjBuYW1lJTNEJTIyQVJNJTIyJTNFclpSTmM2TXdESVolMkZEY2QyJTJCRWhDT1RaczBqMDBNOTF5MkwwNldBRlBEV0ljRVVoJTJGJTJGWnBpODFIYW1jM01Yakxva1N4WmVoVTdRVnkwVDRwViUyQlFFNVNNZDNlZXNFUHh6ZkR4OTglMkZkdUJhdzlXVWRpRFRBbmVJMjhFaVhnSEExMURhOEhoUEFza1JFbWltc01VeXhKU21qR21GRGJ6c0JQS2VkV0taYkFBU2Nya2t2NFduUEtlUHZqaHlIJTJCQ3lISmIyZHRFdmFkZ050aDBjczRaeDJhQ2dwMFR4QXFSJTJCcSUyQmlqVUYyczdOejZjJTJGdHYlMkZFT0YxTlEwcjhjZU4zSWRCUCUyRk9TVEg1ellLZnIwJTJGVmRuYm5jbHlZYkkyRFp2TDB0Vk9vRUpSRXFqZFJkZnBodWs1d1hib3hkVUdaJTJCY2N1REZ5S3FRTklvVnZFS05FcFVtSnBVNjRQUWtwTFhMOFlMV0sxaCUyRkJraDFCdnVCWmtNQlMlMkIxTG9pbXJIQlJRSnJjZnpwNEFqRW1FeENYaVVJdXNjaEpXbXpGaERIcXhKaWxKZnglMkI2SjIlMkZkUmRXMFdiZFp0NyUyRjBGZ0JYM2FWVnJuNW1Nemc3dHR5UDNCaUgxSHdDd0FGSlhIV0lQYkl6Mlp2azl1d3ZOdUVwRFRENWRJd3VaV2Q5c3lEMHFyRCUyQk15RGNJN2k4RWYzdzlMRFRYTGRPTllocTBtUHRuZVFyQmVWZG0yJTJCU0NJS2xZMnRWczlQZzFVMWlYZk5pbEU1YVVtRXQ1eHA3c2p1dUclMkIlMkYzZXh2VXZSJTJCRCUyQkolMkJXaTlWeTVjTDFRTHZwQ3VQWHR1bWx6ZkFRJTJCZkpPWE5OajlCUSUzRCUzRCUzQyUyRmRpYWdyYW0lM0UlM0NkaWFncmFtJTIwaWQlM0QlMjJGVGdNb1NGTDE4SGV3anhNYXN4SSUyMiUyMG5hbWUlM0QlMjJ4ODYlMjIlM0V0WlJMajVzd0VNYyUyRkRjZXVlQ1FoSERkcDBqMjBWYVVjJTJCcmg1OFFUY05SN1dHUjdwcDY5WmJCNmhVaFdwdlNEOG0yRUd6JTJGOXZlOUclMkJhRDlvVnVhZmtJUDBRcCUyQjNYdlRlQzhONEc1cG5CNjQ5V0NWeER6SXRlSSUyQkNFWnpFTDdEUXQ3UVNIQzZ6UkVLVUpNbzVURkVwU0duR21OYll6TlBPS09kZFM1YkJBcHhTSnBmMHElMkJDVTkzUWJ4aU4lMkZBcEhscm5Pd1NmcEl3Vnl5M2NrbFp4eWJDWW9PWHJUWGlOUyUyRkZlMGVaRGM3TjVjZnRYejlYS0g0JTJGcXA4ZUh4cWZyNXMlMkZIZDlzZU05bnd4YjBLRG8zNWEyNHRaTVZuWmVkcTkwZFFNc1VTZ0NmYWhOODA2THdJdDJ3eWg4cyUyQkRza2dPM2k1d0s2WkpJNHd2c1VhSTJSS0V5QlhkbklhVkRYaGl0VnNuNkxWbXlaNUJmOENKSW9ES3hGTHFtSmxDREptSGslMkZIaVQ4SXhFV0V3U0hxWEl1Z0JoYVNpenE2RU9WaVNGTXIlMkZqYk9iMyUyQnlpN2JSWnQxcG4lMkZvUVpneFVOYVZpWm1KMk9xUTN0anBiJTJGb0VBem1NSWNLc0FEU1YlMkZPZHE3S3hmcklIS25EJTJCYWta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'
      } else {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKEAAAChCAYAAACvUd+2AAAEiXRFWHRteGZpbGUAJTNDbXhmaWxlJTIwaG9zdCUzRCUyMkVsZWN0cm9uJTIyJTIwbW9kaWZpZWQlM0QlMjIyMDIwLTA4LTI0VDA0JTNBNTklM0EwNy45NTBaJTIyJTIwYWdlbnQlM0QlMjI1LjAlMjAoV2luZG93cyUyME5UJTIwMTAuMCUzQiUyMFdpbjY0JTNCJTIweDY0KSUyMEFwcGxlV2ViS2l0JTJGNTM3LjM2JTIwKEtIVE1MJTJDJTIwbGlrZSUyMEdlY2tvKSUyMGRyYXcuaW8lMkYxMy4yLjQlMjBDaHJvbWUlMkY4My4wLjQxMDMuMTA0JTIwRWxlY3Ryb24lMkY5LjAuNCUyMFNhZmFyaSUyRjUzNy4zNiUyMiUyMGV0YWclM0QlMjJCU3pONFdnRzQwckE0YUR3QTM1RSUyMiUyMHZlcnNpb24lM0QlMjIxMy4yLjQlMjIlMjB0eXBlJTNEJTIyZGV2aWNlJTIyJTNFJTNDZGlhZ3JhbSUyMGlkJTNEJTIyeDlVZFltZjlJRXhQZEVEcDVyd1olMjIlMjBuYW1lJTNEJTIyQVJNJTIyJTNFclpSTmM2TXdESVolMkZEY2QyJTJCRWhDT1RaczBqMDBNOTF5MkwwNldBRlBEV0ljRVVoJTJGJTJGWnBpODFIYW1jM01Yakxva1N4WmVoVTdRVnkwVDRwViUyQlFFNVNNZDNlZXNFUHh6ZkR4OTglMkZkdUJhdzlXVWRpRFRBbmVJMjhFaVhnSEExMURhOEhoUEFza1JFbWltc01VeXhKU21qR21GRGJ6c0JQS2VkV0taYkFBU2Nya2t2NFduUEtlUHZqaHlIJTJCQ3lISmIyZHRFdmFkZ050aDBjczRaeDJhQ2dwMFR4QXFSJTJCcSUyQmlqVUYyczdOejZjJTJGdHYlMkZFT0YxTlEwcjhjZU4zSWRCUCUyRk9TVEg1ellLZnIwJTJGVmRuYm5jbHlZYkkyRFp2TDB0Vk9vRUpSRXFqZFJkZnBodWs1d1hib3hkVUdaJTJCY2N1REZ5S3FRTklvVnZFS05FcFVtSnBVNjRQUWtwTFhMOFlMV0sxaCUyRkJraDFCdnVCWmtNQlMlMkIxTG9pbXJIQlJRSnJjZnpwNEFqRW1FeENYaVVJdXNjaEpXbXpGaERIcXhKaWxKZnglMkI2SjIlMkZkUmRXMFdiZFp0NyUyRjBGZ0JYM2FWVnJuNW1Nemc3dHR5UDNCaUgxSHdDd0FGSlhIV0lQYkl6Mlp2azl1d3ZOdUVwRFRENWRJd3VaV2Q5c3lEMHFyRCUyQk15RGNJN2k4RWYzdzlMRFRYTGRPTllocTBtUHRuZVFyQmVWZG0yJTJCU0NJS2xZMnRWczlQZzFVMWlYZk5pbEU1YVVtRXQ1eHA3c2p1dUclMkIlMkYzZXh2VXZSJTJCRCUyQkolMkJXaTlWeTVjTDFRTHZwQ3VQWHR1bWx6ZkFRJTJCZkpPWE5OajlCUSUzRCUzRCUzQyUyRmRpYWdyYW0lM0UlM0MlMkZteGZpbGUlM0V46K9yAAAOyElEQVR4Xu2df4xdRRXHv+fttoIKNKIiiQo1xh9/2O0aE00IsqVbAQ0pCFFAEURF6FJtgQhR2L27rUZFaREWY42Wxj8AAUUJUt0H7EqIGn9sF2MCSIRGQ+NPQOMPurt3zNz79u277973Zu7buT/27ff+1e6be+bMmc89Z+bM3LmCEl+nf336xDm/cpFJxepQ36ipzODN0wOoVE4xlTPJcqWTrZzeir9v/+X9z7TT21XbTLbJ6nfJSrALuTXjPmySVR3qM7ZjcHzGAzCyVFmudLKVA9/fUN3aP9kWQkdtM9kmq9+NnZdVxTZybTuKELp5wGz6JIsyhLDJqiagXT0YtnLoCbPAPoVM244ygaOrZDgGbOyUonucFaUnpCd0BlOnggghIeyUHWf3EUJC6AymTgURQkLYKTvO7iOEhNAZTJ0KIoSEsFN2nN1HCAmhM5g6FUQICWGn7Di7jxASQmcwdSqIEBLCTtlxdh8hJITOYOpUECEkhJ2y4+w+QkgIncHUqSBCSAg7ZcfZfYSQEDqDqVNBpYaw00bxvuVlAUK4vPqrK7UlhF3ZrcurUYRwefVXV2pLCLuyW5dXowjh8uqvrtS2FBBuGp9er1TPCRC1viutXNJGiUjwUv3ElnVTRapYKISD4zP6RIRtANYUaQTWjecB7J477N80ub1f/zvXqxAIB3ZNr+ldXdHHe9Dz5drdxsoOzB32N+QNYiEQDt762MNQasBoEhbI3wIik9Ut6zbkWXHuEG4af+xiBbU3z0ayrpQWsDiEKaXEtsVzh3BwfOZeAJtdNoKy3FpAFPZNXNF3sVupraXlDuHG8ZmnBTgxrwayno4sMFUd6sttuJQ7hIPjM6ojs/CmXC2Q5+FJhDDXrl0+lRHC5dNXXaspIQy71ngOddcSkG3D9ITjBFMVhBDlPdDR1Hll/31wfEYv1dkcIJ/bUC23ihY6x3ZikueTWHZwXOpXSgj1pwzm9eYBR5dpMZwQOjJ0h2JcQKg3nEB6julQhchtPTJ/UGzPcrat0OTBCKGtJbMp5wJCWxmWLRglhJaW6pZitgC1cya2MixtRggtDdU1xWwBIoScHWcGPSEMvyditWxnGltm1ktdLpgQEsLCESeEhJAQxi3AiUnhVOSsAD0hPWHOyMWrKyWEeVuFE5O8LR6tzwWErlvAtWPXFi25PELIcFw4ooSQEBLCBAswHBeORb4K0BPSE+ZLXEJthJAQEkKG48IZKFwBekJ6QkKY5AkHb54eQKVifPHF1nrVob62b8kxWW1ryWzKufCEtfOE3LwS4vtT3FmdTV+XVqoLCG1lWBqBGxgsDdU1xWwB4s5q7qzODHpCyIlJZnDZCiaEhNCWlczKEUJCmBlctoIJISG0ZSWzcoSQEGYGl61gQkgIbVnJrFwpIcystS0Ec8Ukb4tH63MBoesWdOd+wuvVOyH4MQTRk6MUrsaYfNVoRE8NQ1kf0ulD4a8Q/BHAXRB8G578LVaHp44G8CMonJRQ/zQEg/DkH4m6Xa/eBsGDELwq9rvgTnhynrFNtQKEMK9w7KkvQuGahA57FMB74ck/23ZaOgijohReAPBRjMn3Iz+0g1Dfo3AadsgvEvXy1HlQuD3xN0Jo+/wtlss8HHvqFVCoAuiPaafwbyicgR3ySGYQasEKf6/V88t6Pe09oS72aYzK1xL1GlHfAHApIUzPW+IdmUM4rM4EcA8Eq1qofCNG5apMIQyFfw+HcB72yGzwPzOE9+EQzqmXX1Cw3UOly9ATpiczWwiVYAR7AHw80ExhFhV8FwrnA6jUtH0cglPgyV9aat8cjtt19HZ1JI7ChwHcEBmDKhyCj1OwU37fBsK5ml4VCA5iFifj86LHlotXdHy7WH6hBCEsGYSeeiMU9NdDX1vT7EkILgQCEMP9bxpM4ByMyX1OIFwQMqyuguArdZnN47wkTyh4Airw2G+o6bUZY/JARK8R9SkAN9UfIIVjIxMUQlgyCIfVRcHsdNHr7cEoLot4xzCE3Q4PHwIk+Zi6NJ5wEcJzILg7JYQ/g8K/ALyndl90qHCpWoXjcQ8APcTQeu+FwkYAr6/XQwhLBKGnXgoF7d1ObfB4oWeJjxP/BMEGePJUYgs6g7DZEz4HhU3YIb9uGY4Fera+Hwo7apBFZ++fU6/DKjwSePHQgw9BcF3XQdg1B6d7aj18VCE4tgbWYu7NU6+GwhSAt9R+07m9SzAm+5YGoRJ4OA7AufCxsykv+SsINsGT8EvqyeH4Ufi4AcDtEBwZ5Bu1p9shvw3uGVZnAPhBMMnSY8wKLoCC1rlQT2iba7R0UV20s7o5Nyj4Ejy5tm6I5jSHYAIvYDN2yX9jxlpKnjAUpiG/EmOyMJZrNTv+KQSfgMJ+AGtr3vBj8EQPKYARpRPrV9b002X1BEuPbxcT3gWEY0KY9Hh5ag0UJgC8oxaK4/nAYaW/Zn5/4HH0pXN5lWCV4oBjCH1I4K0ugyeH67KTPeGdeBYXNo37wvGqh6OaVlhuhASrONFVF0IYJ8J01nQmKZrGsBWqFA2FYTiMJ7F1QseTMWcQKvwZFVyL3+E7uEvmI3JbQaiX3KKeN0whzeO4hqU6DfYHAfyEEFoE+fwhbMoNah1bw9W8nBeHNQQ2zdqxvuMp+LgAj+M3MfgWbNYOwujYTw8P3ocK1kLhWzWvHY4Ve3CQEJYRwsYZpIV+kSKtlvHazY4/q47HKnwGClsh6GmQ9yR8nFufVDTr0g7CEaUnGnpmHOY3FTxU8OZakl3/5ef4H04Ppi4Mx+Zezt0TxnODZiWjJfZgVD7ZFDqjnjA27lKCYVwHPTdezEmGHlFwGjz5Q0KIj++iWZDrqZdD4X4A7w7uE+jZ8dH1BDsQ6thcLiyb+y4aTkwae7c5mZsWv7D8k5jFAL4gh+q32+QJPbUaCt8E8JGmavUsdnM9NdMuHC/ApctEZ8JRkYLFGbOn7oAKxofhRQjjvZ6rJ4znBtNjmLSMZwOhrslTr4HCQwDe2lCxTs94GMPOyIpMcjhenBh56lwo3NnkWXVobk56dx+E+lOzc3M4MX3vJd9R3dqvP+rc8nI6O47D0jr3t+iRkrZ6Ne94MYTjhuZ56lT4+CEEL6v/1XYrV+MEqvXG1eiGixJ4Qv2pWeVjjQtmenvxzPLdWd2cGwxD02LYameh+KbX6DKerScM6ghm518GcHWkSr2zG3g/PPlP8HeTJ7xGHYMjgqT1u5pUvxuj+EDdq5YAQhfwNcpYvhDGk8/RrVPtLHW9OhmCByLeq3FTaSoIA8BeCRVA9/amsHwpxiRMs5gg1GWSN69GN7sSwqU/A27CcUJuEEjeFJqkcpIXBR6C4MzAc6WFMIQsHpaBZzGPU7FTnrCC0FOX1HODgZNFmDMcE709Lbziy4+5z46XTkFUwvL0hGGuTo8931Rvjm0oXhwbRhPXjct4nUDYOizrd0MuBnBEQo7vfHhyR70N8Re0nsYsTko9c29DiW16xTTBdAni8oTQpQVWmCxCmNfbdisMrDTNJYSEMA0vmZQlhIQwE7DSCC0lhF2zszpNT5S8rF5AmPcrm5XoRQRZH6qrDsCXybnZ+anJ7f3hbu0OLhcQ2sqwVK+LdlZbtrjMxYLVK9WzF0oNtNFTA7jb9JWEVvfbAsQzq1fgmdW1zzLsAiyXw0Qm516cPzutVySEHBMmOqiNtz52ligVPbvGxmWLTFa3rNOvLVhfhJAQxmAJQrBfmbb2gM0SFLZXr+jbbUshISSEMVY23TJzmxJcZAtRQrnn5w77a23DMiEkhBGGal7w6SUAGM6bRc5+cMu6e23kEEJCGOFk8JaZbRDoyciSLgXc9OBQ3zYbIYSQEEYhHJ/R76iM2MBjKDNVHeprl9ap315OCMOvfFo1wMZY1aE+bdiWl5utXDaalL+Mg/HgQiNzhbCWTnKzG9/3J7mLpkBWHa5W5Qqha5MRQtcWTSGv5lH2prilVdFRUwRauNFFOHagb0QEIXRt0RTyBnZNr+ldXXkuxS2JRQV+/8RQf/xMnYTShJATkxgWDsaF1qFYV04ICWEMwlquUHux6DdXbN2j728wvWbbKIoQEsJEtDpdO06TH+SYsMH0TNEku7jBMFWmVz2sPKIo7Ju4ok+/QJXqoiekJ2wLTLCZdb7iGdaSDyqRbbbLdM0VEkJCaOW19Kx51eqesxSUTgivF4XnlejjMvx7bWfBrSoqJYQOE6ZBu03vqzIcW3GYWSEXENrKsGwEt/dbGqpritkCxO39Fh61a6jIuSGEkGPCnJGLV0cICSEhjFuAY8LCqchZAXpCesKckWM4TjQ4UzTFckhPSE9YLIGOdtHYgmzZ2FGprVlye7+lxZZ7MVuA2uUJV8z2foi0/QrAcoehMP2V0gcsGU/eN618udS/tDurXTaSstJbgBCmtxnvcGwBQujYoBSX2gIvVIf6jCE7tdQWN+QejjfeeuCAKOlz1QDKycQCqd5bWaoG+UM4PrNb9IdreJXZAtavkLpoRO4QujoEyEXjKSPZAr0Vf+3+y/ufycs+uUOoG+bqIKC8jLSi6kl53qEL2xQCYQCiu8OAXNiBMrQFCgBQV1sYhLpyHZpn/co2iBrgZKWY50CJmoGSyVUVf3eeIbixtYVCWIzZWWvZLEAIy9YjK1AfQrgCO71sTSaEZeuRFagPIVyBnV62JhPCsvXICtSn1BAGx2G8pMe4zjyxZd2Uqe+Cc15UzwmmciZZrnSylTP74vyM6Rslrtpmsk1Wv5cawtqu74dNjbfZdmSbHDfJcqWTrRxYnD/oqm0mO2f1OyFssiwhzAq11nIJISHMn7qmGgkhISSE7SxgO24yhVBdh6txkyudbOVwTFjwM2LbUYTQ7vNkNnYqossZjhmOi+AuUichJISEkGNCAwPMExb7kHBMCHBiUiyDIISEsGAEQQh1DzAcF8shPSEhLJZAnWAOP7XFDQxb+9ueUOYqEV9UhzNFwxRNUezV6yWEhJAQMk/IPCE9IT0hPSE9IT1hqT1h7QQv44elq0N9nulxtj0g3iTLlU62cnor/m2m4zlctc1kw6x+/z9hnwgGAD2PFQAAAABJRU5ErkJggg=='
      }
    },
    roleFilter(input) {
      if (input === 'dbscale-node') {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKEAAAChCAYAAACvUd+2AAANzXRFWHRteGZpbGUAJTNDbXhmaWxlJTIwaG9zdCUzRCUyMkVsZWN0cm9uJTIyJTIwbW9kaWZpZWQlM0QlMjIyMDIwLTA4LTI0VDA2JTNBMDYlM0E0NC40OTlaJTIyJTIwYWdlbnQlM0QlMjI1LjAlMjAoV2luZG93cyUyME5UJTIwMTAuMCUzQiUyMFdpbjY0JTNCJTIweDY0KSUyMEFwcGxlV2ViS2l0JTJGNTM3LjM2JTIwKEtIVE1MJTJDJTIwbGlrZSUyMEdlY2tvKSUyMGRyYXcuaW8lMkYxMy4yLjQlMjBDaHJvbWUlMkY4My4wLjQxMDMuMTA0JTIwRWxlY3Ryb24lMkY5LjAuNCUyMFNhZmFyaSUyRjUzNy4zNiUyMiUyMGV0YWclM0QlMjJXckZBNEx4dklzb3h2QzQ4VjFhLSUyMiUyMHZlcnNpb24lM0QlMjIxMy4yLjQlMjIlMjB0eXBlJTNEJTIyZGV2aWNlJTIyJTIwcGFnZXMlM0QlMjI0JTIyJTNFJTNDZGlhZ3JhbSUyMGlkJTNEJTIyeDlVZFltZjlJRXhQZEVEcDVyd1olMjIlMjBuYW1lJTNEJTIyQVJNJTIyJTNFclpSTmo1c3dFSVolMkZEY2V1JTJCRWhJT0c1b2toNDJVcnNjMnF1REoyQ3RZWkF6QkxLJTJGdm1heCUyQlZoYXFaRjZRZll6THg3UHZDTTdRVnkwUjhXcSUyRklRY3BPTzd2SFdDcjQ3dmI4S3QlMkZuYmczb1BWMXU5QnBnVHZrVGVDUkx5RGdhNmh0ZUJ3blFrSlVaS281akRGc29TVVpvd3BoYzFjZGtFNXoxcXhEQllnU1psYzBwJTJCQ1U5N1RyYjhaJTJCVGNRV1c0emUySFVSd3BteGFhU2E4NDROaE1VN0owZ1ZvalVyNG8yQnRuMXp2YWwlMkYlMkIlMkZ3bCUyQmh3TVFVbCUyRmNzUHI2Rk13JTJGalhLVG0lMkZ0Rkh3NCUyRjFZWlc5ZnpDazNKbXRUc0xrczNXMEhLaFFsZ2RyZmRKNnVtWjRUN0laYVhMM2g3Sm9ETjV1Y0NtbEZwUEFOWXBTb05DbXgxQWZ1TGtKS2l4dyUyRldLMmk5WWRZc2pQSTczZ1ZKTERVc1JTNnBEcHdBMFZDJTJCJTJGSHlTWEJHSWl3bWdtY3BzaTVBV0duS3pHNDRCMnVTb3RUWHNYUGk5blZVWFpsRm0zWFQlMkIzUURZTVZUV3RVNnR1eXZiWlpPQ08wRW1YNGZBUXNnZGRjU0d3Mk45MmI0UFRzTHpUaEtneWFmanBHRnpJeHZOcHc5T3F3WHh1UUhEUGNYaGolMkIlMkZuaGFlNiUyRnJvUVRNTld2VDlzejJGNEx4THMydHlRWkJVTE8xeU5ycjltaW1zU3o3TTBnVkxTc3lsUExPZnpJN3JiZzZIZzlYMUwwZmclMkZpZm5vdlhjdWMxNjRWejBCJTJCUFdqJTJGdW10JTJCTWo4QkdidktUQiUyRmpjJTNEJTNDJTJGZGlhZ3JhbSUzRSUzQ2RpYWdyYW0lMjBpZCUzRCUyMkZUZ01vU0ZMMThIZXdqeE1hc3hJJTIyJTIwbmFtZSUzRCUyMng4NiUyMiUzRXRWVExjdHN3RFB3YUhadlJ3NWJ0WSUyQnpheWFIdGRNYUhQbTZNQ0V0c0tFS2hJY251MTVlTVNEMmlIT3FaOXFJUkZpdUF3SzRZSkx2eThxQlpWWHhHRGpLSVEzNEprbzlCSEslMkZTdFhsYTROb0JpM1hjQWJrV3ZJT2lBVGlLMyUyQkRBMEtHMTRIQ2VFQWxSa3FpbVlJWktRVVlUakdtTjdaUjJRam50V3JFY1pzQXhZM0tPZmhPY2lnNWR4NnNCZndTUkY3NXpsRzY2VE1rODJVMXlMaGpIZGdRbCUyQnlEWmFVVHEzc3JMRHFUZG5kJTJGTHowYSUyQmZLbFIlMkZIaFJJZHclMkZ0ciUyQmUwJTJGQkRWJTJCeHd5eWY5Q0JvVSUyRmR2U1RzdUd5ZHJ0eTgxS1Y3JTJGQUNvVWkwUHZHTkxkYVJFR3k3VmNSbW9DemN3SGNCUVdWMHBOSTR6UHNVS0kyaUVKbENtNVBRa29QQlhHeVdHeVdyMlRKbmtCJTJCeGJNZ2djcmtNckJOVGFJQlRjTEklMkJla040UW1Kc0J3UjdxWEliWUt3TWloelVWOEhhNUpDbWVONG00WGRISlVkczd6azF2eDNEUUFyNzdLcU5ybSUyRlhMb1R4NTRDTGlQTE9SRWVBRXNnZlRVVW4wMmRuOXdQRlhsJTJGdFlNOWUwNHh0cVlIbWZzbDhyNzJJTHQ1Y2NyZjRJSms1b0x2NjNSbUJETWYzYWl3ZzJaaXZOV3NGSnpiTnR1MkVBVEhpbVcyWjJzME1aakdXdkhlWUNkVWRIU0hpbHc4TWxRWXJnNkhnJTJCZDF0MUVTJTJGazg1Tjh1cG5LdmxUTTdOTzJvdWJ4ZlRoTU50ODVvYlhkbkolMkZnOCUzRCUzQyUyRmRpYWdyYW0lM0UlM0NkaWFncmFtJTIwaWQlM0QlMjJyZ2hySTNnUGcxcFVSbmQ2RHY3aCUyMiUyMG5hbWUlM0QlMjJOb2RlUm9sZSUyMiUzRW5aVGRjcHN3RUlXZmhzdG1NTGpZWE5yVVRwdEpNcG02blZ4MlpDU0RHc0V5WW0xd243NnJJdjZDWjJybmhsbDlXcVJkblNNNWZwVFY5NW9WNlJOd29SelA1YlhqZjNFOGJ4RXM2V3ZBdVFIenBkZUFSRXZlb0ZrUGR2S1BzTkMxOUNpNUtFZUpDS0JRRm1NWVE1NkxHRWVNYVEzVk9PMEFhcnhyd1JJeEFidVlxU2w5bFJ6VGhpNjlSYyUyQiUyRkNwbWs3YzZ6SUd4bU10WW0yMDdLbEhHb0JzamZPSDZrQWJDSnNqb1N5cHhkZXk2ck9ucUl2UiUyQkx4OTNQNTglMkJyaDIlMkY2OTl2bVU3UFk5cFpmdWhhMHlQSERTNSUyQkM0b1dmbnlyMnZkb2lReDRXTXJhJTJGdUNlbWp2YThiSzk0YmclMkJ3YTl0MSUyRkRWblpTcTRIYVNZS1FwbkZKYW80VTFFb0VBVHlTR25uOWVLN1lWNmdWS2loSnh3VE9VTG1sJTJCZmhFWkpFajIlMkJTOWdESW1TRGhKV1NpWmxBS0lqQ0VaWE1hWmZXS2FZSVpsTzZ4YW5ld3BTZTFZa3g5QjBjRGpJV2Q1d2gyN05TbEYzMEt6N3VUWmtIcVZSYnVlUDVZUmhGMjYzaGtLUDFzJTJCJTJGYThhVzhLOVd4S3ByV1JEM3dwbFhyWGtBbVVKOHBwWjBOckRyMjVpM3RzT3B0M0tXa1F3dTNrTm1yazNSTDklMkZhZ3dEcmtCaU1HRTdjODAzTXhjUXoxaDFmWVkzanVGazNFZkclMkJFVEhKdXRsbFhxVVN4SzFoczlxeElhR0lhampudjNQa2YlMkJWeDNIb1ZobTJlTHYlMkZhbTNhN2xZcXpsYkg1QnpQa0ZNVCUyQmdKUTM3UiUyQm5mM09CbDl6ZCUyRkFRJTNEJTNEJTNDJTJGZGlhZ3JhbSUzRSUzQ2RpYWdyYW0lMjBuYW1lJTNEJTIyTm9kZS1zcGFyZSUyMiUyMGlkJTNEJTIyT1ZGSjZLTHZJNkhCT0I1b2JKRzMlMjIlM0VyVlJOajVzd0VQMDFIRGNpT0VySXNiREx0bElyclJxMWxYcXBIT3lBdFlaQnhsbElmMzNIWWZoYVZ1cW1LZ2ZrZVRPZThjeDd0c2Zpb24wMHZNcSUyRmdKRGFDM3pSZXV6ZUM0TGROc1MlMkZBeTRkc0FtRERzaU1FaDIwSG9HRCUyQmkwSjlBazlLeUhyV2FBRjBGWlZjekNGc3BTcG5XSGNHR2ptWVNmUTg2b1Z6JTJCUUNPS1JjTDlFZlN0aThROE5nTiUyQklmcGNyeXZ2SjZ1JTJCODhCZSUyQkRxWk02NXdLYUNjUWVQQlliQU51dGlqYVcyczJ1bjB2eHFmcWUlMkYyVGk2NFY5JTJCNVZzRXhZODNkMTF5WkpidGd3dEdGbmElMkY1dWF1SHpoJTJCa3p6b2w3dHBSOWdiZ3VOcTdYSG9oZHByTUxSZnVaSHFaJTJCZ1ZsWkJpYjRqV0FzRkJuQ3RNZ2VrZUZCcEVOQXVNdUxwYzJiZ1hJb1lOSmhyV25hNmZwT2tIMml2aFFyUjJocDRIaGdMQm1TU3dmZERQJTJGR2RweWZHR1lMWHVSUmtvS2R5YlJSdDVzUzlVbER2VmdxbFZxJTJGUzh4RTkwUWxLUzZKbFB0bVRHZ2wlMkJjVHcwQWtaSTA3dExLRjJHZDVKREpMcHVaVHVSSnBIMUtLR1ExbHd3cFBkdVNYZDA4VUl5bTFIRlEwZyUyQlZYQVBjcm81MlpCNlZBY3VTQ0EzaUlVdHhISndiUzhVZ3czaVdhS0pjT2JjMGVCT1N1dFgwRUklMkZyOFZSS0NGY21hakpsWlZZUG5VMUd5UVhzYXZFQnU3JTJGd3V4JTJCSDhkSjBzZlI0ZDk3MDI0bmN6Y25jNzE1ZzgzTkcyeiUyQkE1bG9qbyUyRlMxVGQ1MmRuREh3JTNEJTNEJTNDJTJGZGlhZ3JhbSUzRSUzQyUyRm14ZmlsZSUzRbR1OoQAABurSURBVHhe7Z1/lBXFlce/9d4M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'
      } else {
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKIAAACiCAYAAADC8hYbAAANzXRFWHRteGZpbGUAJTNDbXhmaWxlJTIwaG9zdCUzRCUyMkVsZWN0cm9uJTIyJTIwbW9kaWZpZWQlM0QlMjIyMDIwLTA4LTI0VDA2JTNBMDYlM0E1My40NzZaJTIyJTIwYWdlbnQlM0QlMjI1LjAlMjAoV2luZG93cyUyME5UJTIwMTAuMCUzQiUyMFdpbjY0JTNCJTIweDY0KSUyMEFwcGxlV2ViS2l0JTJGNTM3LjM2JTIwKEtIVE1MJTJDJTIwbGlrZSUyMEdlY2tvKSUyMGRyYXcuaW8lMkYxMy4yLjQlMjBDaHJvbWUlMkY4My4wLjQxMDMuMTA0JTIwRWxlY3Ryb24lMkY5LjAuNCUyMFNhZmFyaSUyRjUzNy4zNiUyMiUyMGV0YWclM0QlMjJlZ0FVZUdPay1rWkdPbHU2bkVCQiUyMiUyMHZlcnNpb24lM0QlMjIxMy4yLjQlMjIlMjB0eXBlJTNEJTIyZGV2aWNlJTIyJTIwcGFnZXMlM0QlMjI0JTIyJTNFJTNDZGlhZ3JhbSUyMGlkJTNEJTIyeDlVZFltZjlJRXhQZEVEcDVyd1olMjIlMjBuYW1lJTNEJTIyQVJNJTIyJTNFclpSTmo1c3dFSVolMkZEY2V1JTJCRWhJT0c1b2toNDJVcnNjMnF1REoyQ3RZWkF6QkxLJTJGdm1heCUyQlZoYXFaRjZRZll6THg3UHZDTTdRVnkwUjhXcSUyRklRY3BPTzd2SFdDcjQ3dmI4S3QlMkZuYmczb1BWMXU5QnBnVHZrVGVDUkx5RGdhNmh0ZUJ3blFrSlVaS281akRGc29TVVpvd3BoYzFjZGtFNXoxcXhEQllnU1psYzBwJTJCQ1U5N1RyYjhaJTJCVGNRV1c0emUySFVSd3BteGFhU2E4NDROaE1VN0owZ1ZvalVyNG8yQnRuMXp2YWwlMkYlMkIlMkZ3bCUyQmh3TVFVbCUyRmNzUHI2Rk13JTJGalhLVG0lMkZ0Rkh3NCUyRjFZWlc5ZnpDazNKbXRUc0xrczNXMEhLaFFsZ2RyZmRKNnVtWjRUN0laYVhMM2g3Sm9ETjV1Y0NtbEZwUEFOWXBTb05DbXgxQWZ1TGtKS2l4dyUyRldLMmk5WWRZc2pQSTczZ1ZKTERVc1JTNnBEcHdBMFZDJTJCJTJGSHlTWEJHSWl3bWdtY3BzaTVBV0duS3pHNDRCMnVTb3RUWHNYUGk5blZVWFpsRm0zWFQlMkIzUURZTVZUV3RVNnR1eXZiWlpPQ08wRW1YNGZBUXNnZGRjU0d3Mk45MmI0UFRzTHpUaEtneWFmanBHRnpJeHZOcHc5T3F3WHh1UUhEUGNYaGolMkIlMkZuaGFlNiUyRnJvUVRNTld2VDlzejJGNEx4THMydHlRWkJVTE8xeU5ycjltaW1zU3o3TTBnVkxTc3lsUExPZnpJN3JiZzZIZzlYMUwwZmclMkZpZm5vdlhjdWMxNjRWejBCJTJCUFdqJTJGdW10JTJCTWo4QkdidktUQiUyRmpjJTNEJTNDJTJGZGlhZ3JhbSUzRSUzQ2RpYWdyYW0lMjBpZCUzRCUyMkZUZ01vU0ZMMThIZXdqeE1hc3hJJTIyJTIwbmFtZSUzRCUyMng4NiUyMiUzRXRWVExjdHN3RFB3YUhadlJ3NWJ0WSUyQnpheWFIdGRNYUhQbTZNQ0V0c0tFS2hJY251MTVlTVNEMmlIT3FaOXFJUkZpdUF3SzRZSkx2eThxQlpWWHhHRGpLSVEzNEprbzlCSEslMkZTdFhsYTROb0JpM1hjQWJrV3ZJT2lBVGlLMyUyQkRBMEtHMTRIQ2VFQWxSa3FpbVlJWktRVVlUakdtTjdaUjJRam50V3JFY1pzQXhZM0tPZmhPY2lnNWR4NnNCZndTUkY3NXpsRzY2VE1rODJVMXlMaGpIZGdRbCUyQnlEWmFVVHEzc3JMRHFUZG5kJTJGTHowYSUyQmZLbFIlMkZIaFJJZHclMkZ0ciUyQmUwJTJGQkRWJTJCeHd5eWY5Q0JvVSUyRmR2U1RzdUd5ZHJ0eTgxS1Y3JTJGQUNvVWkwUHZHTkxkYVJFR3k3VmNSbW9DemN3SGNCUVdWMHBOSTR6UHNVS0kyaUVKbENtNVBRa29QQlhHeVdHeVdyMlRKbmtCJTJCeGJNZ2djcmtNckJOVGFJQlRjTEklMkJla040UW1Kc0J3UjdxWEliWUt3TWloelVWOEhhNUpDbWVONG00WGRISlVkczd6azF2eDNEUUFyNzdLcU5ybSUyRlhMb1R4NTRDTGlQTE9SRWVBRXNnZlRVVW4wMmRuOXdQRlhsJTJGdFlNOWUwNHh0cVlIbWZzbDhyNzJJTHQ1Y2NyZjRJSms1b0x2NjNSbUJETWYzYWl3ZzJaaXZOV3NGSnpiTnR1MkVBVEhpbVcyWjJzME1aakdXdkhlWUNkVWRIU0hpbHc4TWxRWXJnNkhnJTJCZDF0MUVTJTJGazg1Tjh1cG5LdmxUTTdOTzJvdWJ4ZlRoTU50ODVvYlhkbkolMkZnOCUzRCUzQyUyRmRpYWdyYW0lM0UlM0NkaWFncmFtJTIwaWQlM0QlMjJyZ2hySTNnUGcxcFVSbmQ2RHY3aCUyMiUyMG5hbWUlM0QlMjJOb2RlUm9sZSUyMiUzRW5aVGRjcHN3RUlXZmhzdG1NTGpZWE5yVVRwdEpNcG02blZ4MlpDU0RHc0V5WW0xd243NnJJdjZDWjJybmhsbDlXcVJkblNNNWZwVFY5NW9WNlJOd29SelA1YlhqZjNFOGJ4RXM2V3ZBdVFIenBkZUFSRXZlb0ZrUGR2S1BzTkMxOUNpNUtFZUpDS0JRRm1NWVE1NkxHRWVNYVEzVk9PMEFhcnhyd1JJeEFidVlxU2w5bFJ6VGhpNjlSYyUyQiUyRkNwbWs3YzZ6SUd4bU10WW0yMDdLbEhHb0JzamZPSDZrQWJDSnNqb1N5cHhkZXk2ck9ucUl2UiUyQkx4OTNQNTglMkJyaDIlMkY2OTl2bVU3UFk5cFpmdWhhMHlQSERTNSUyQkM0b1dmbnlyMnZkb2lReDRXTXJhJTJGdUNlbWp2YThiSzk0YmclMkJ3YTl0MSUyRkRWblpTcTRIYVNZS1FwbkZKYW80VTFFb0VBVHlTR25uOWVLN1lWNmdWS2loSnh3VE9VTG1sJTJCZmhFWkpFajIlMkJTOWdESW1TRGhKV1NpWmxBS0lqQ0VaWE1hWmZXS2FZSVpsTzZ4YW5ld3BTZTFZa3g5QjBjRGpJV2Q1d2gyN05TbEYzMEt6N3VUWmtIcVZSYnVlUDVZUmhGMjYzaGtLUDFzJTJCJTJGYThhVzhLOVd4S3ByV1JEM3dwbFhyWGtBbVVKOHBwWjBOckRyMjVpM3RzT3B0M0tXa1F3dTNrTm1yazNSTDklMkZhZ3dEcmtCaU1HRTdjODAzTXhjUXoxaDFmWVkzanVGazNFZkclMkJFVEhKdXRsbFhxVVN4SzFoczlxeElhR0lhampudjNQa2YlMkJWeDNIb1ZobTJlTHYlMkZhbTNhN2xZcXpsYkg1QnpQa0ZNVCUyQmdKUTM3UiUyQm5mM09CbDl6ZCUyRkFRJTNEJTNEJTNDJTJGZGlhZ3JhbSUzRSUzQ2RpYWdyYW0lMjBuYW1lJTNEJTIyTm9kZS1zcGFyZSUyMiUyMGlkJTNEJTIyT1ZGSjZLTHZJNkhCT0I1b2JKRzMlMjIlM0VyVlJOajVzd0VQMDFIRGNpT0VySXNiREx0bElyclJxMWxYcXBIT3lBdFlaQnhsbElmMzNIWWZoYVZ1cW1LZ2ZrZVRPZThjeDd0c2Zpb24wMHZNcSUyRmdKRGFDM3pSZXV6ZUM0TGROc1MlMkZBeTRkc0FtRERzaU1FaDIwSG9HRCUyQmkwSjlBazlLeUhyV2FBRjBGWlZjekNGc3BTcG5XSGNHR2ptWVNmUTg2b1Z6JTJCUUNPS1JjTDlFZlN0aThROE5nTiUyQklmcGNyeXZ2SjZ1JTJCODhCZSUyQkRxWk02NXdLYUNjUWVQQlliQU51dGlqYVcyczJ1bjB2eHFmcWUlMkYyVGk2NFY5JTJCNVZzRXhZODNkMTF5WkpidGd3dEdGbmElMkY1dWF1SHpoJTJCa3p6b2w3dHBSOWdiZ3VOcTdYSG9oZHByTUxSZnVaSHFaJTJCZ1ZsWkJpYjRqV0FzRkJuQ3RNZ2VrZUZCcEVOQXVNdUxwYzJiZ1hJb1lOSmhyV25hNmZwT2tIMml2aFFyUjJocDRIaGdMQm1TU3dmZERQJTJGR2RweWZHR1lMWHVSUmtvS2R5YlJSdDVzUzlVbER2VmdxbFZxJTJGUzh4RTkwUWxLUzZKbFB0bVRHZ2wlMkJjVHcwQWtaSTA3dExLRjJHZDVKREpMcHVaVHVSSnBIMUtLR1ExbHd3cFBkdVNYZDA4VUl5bTFIRlEwZyUyQlZYQVBjcm81MlpCNlZBY3VTQ0EzaUlVdHhISndiUzhVZ3czaVdhS0pjT2JjMGVCT1N1dFgwRUklMkZyOFZSS0NGY21hakpsWlZZUG5VMUd5UVhzYXZFQnU3JTJGd3V4JTJCSDhkSjBzZlI0ZDk3MDI0bmN6Y25jNzE1ZzgzTkcyeiUyQkE1bG9qbyUyRlMxVGQ1MmRuREh3JTNEJTNEJTNDJTJGZGlhZ3JhbSUzRSUzQyUyRm14ZmlsZSUzRRV1SskAABMKSURBVHhe7Z17cFTXfce/K+2u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'
      }
    },
    progressFilter(input) {
      return parseFloat((input * 100.0).toFixed(1))
    },
    progressStatusFilter(input) {
      if (input <= 0.5) {
        return 'success'
      } else if (input <= 0.75) {
        return 'warning'
      } else {
        return 'exception'
      }
    },
    usageFilter(input) {
      const inputs = input.split('/')
      let scale = 1
      // let unit = ''
      if (inputs.length >= 4) {
        scale = parseInt(inputs[2])
        // unit = inputs[3]
      }
      const used = parseInt(inputs[0]) / scale
      const total = parseInt(inputs[1]) / scale
      const usage_pct = (used / total) * 100.0
      // return usage_pct.toFixed(1) + '%(' + used.toFixed(0) + unit + '/' + total.toFixed(0) + unit + ')'
      return usage_pct.toFixed(1) + '%'
    },
    toInt(input) {
      return input.toFixed(0)
    }
  },
  data() {
    return {
      roles: this.$router.currentRoute.meta.roles,
      hostList: [],
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: true,
      dialogStatus: '',
      newHostFormVisible: false,
      deleteFormVisible: false,
      deleteConfirmExpect: '',
      deleteConfirmStr: {
        username: '',
        pwd: '',
        port: '22'
      },
      regions: null,
      roleOptions: [
        {
          role: 'dbscale-node'
        },
        {
          role: 'dbscale-spare'
        }
      ],
      dialogTemp: {
        clusterId: '',
        ip: '',
        sshPort: 22,
        sshUsername: '',
        sshPassword: '',
        room: '',
        seat: '',
        ntpServer: '',
        storage: {
          mediumPath: '',
          highPath: ''
        },
        storageRemoteId: '',
        maxUnitCnt: 0,
        maxUsage: {
          cpu: 80,
          mem: 80,
          bandwidth: 80,
          storage: 80
        },
        enabled: true,
        role: null,
        description: '',
        siteCluster: ''
      },
      clusters: [],
      clusterOptions: [],
      remoteStorages: [],
      ntpSeverList: [],
      deleteRules: {
        username: [{ required: true, message: 'username is required', trigger: 'change' }],
        pwd: [{ required: true, message: 'pwd is required', trigger: 'change' }],
        port: [{ required: true, message: 'port is required', trigger: 'change' }]
      },
      newHostRules: {
        clusterId: [
          {
            required: true,
            message: 'clusterId is required',
            trigger: 'change'
          }
        ],
        ip: [{ required: true, message: 'ip is required', trigger: 'change' }],
        sshPort: [
          { required: true, message: 'sshPort is required', trigger: 'change' }
        ],
        sshUsername: [
          {
            required: true,
            message: 'sshUsername is required',
            trigger: 'change'
          }
        ],
        sshPassword: [
          {
            required: true,
            message: 'sshPassword is required',
            trigger: 'change'
          }
        ],
        room: [
          { required: true, message: 'room is required', trigger: 'change' }
        ],
        seat: [
          { required: true, message: 'seat is required', trigger: 'change' }
        ],
        maxUnitCnt: [
          {
            required: true,
            message: 'maxUnitCnt is required',
            trigger: 'change'
          }
        ],
        enabled: [
          { required: true, message: 'enabled is required', trigger: 'change' }
        ],
        role: [
          { required: true, message: 'role is required', length: 1, trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['user_id'])
  },
  created() {
    this.getHostList()
  },
  methods: {
    refresh() {
      this.getHostList()
    },
    getHostList() {
      this.listLoading = true
      fetchHosts().then(response => {
        this.hostList = response.data
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
    handleDropdown(command) {
      const strs = command.split('/')
      const host_id = strs[1]
      const host_name = strs[2]
      this.resetTemp()
      if (strs[0] === 'view') {
        this.dialogStatus = 'view'
        for (const v of this.hostList) {
          if (v.id.toString() === host_id.toString()) {
            this.cloneForEdit(v)
            break
          }
        }
        this.newHostFormVisible = true
        this.deleteFormVisible = false
      } else if (strs[0] === 'modify') {
        this.dialogStatus = 'modify'
        for (const v of this.hostList) {
          if (v.id.toString() === host_id.toString()) {
            this.cloneForEdit(v)
            break
          }
        }
        this.newHostFormVisible = true
        this.deleteFormVisible = false
      } else if (strs[0] === 'monitor') {
        this.handleMonitor(host_id, host_name)
      } else if (strs[0] === 'enable') {
        this.handleHostStart(host_id, host_name)
      } else if (strs[0] === 'disable') {
        this.handleHostStop(host_id, host_name)
      } else {
        this.dialogTemp.id = host_id
        this.dialogTemp.name = host_name
        this.deleteFormVisible = true
        this.deleteConfirmExpect = host_name
      }
    },
    resetTemp() {
      this.dialogTemp = {
        clusterId: '',
        ip: '',
        sshPort: 22,
        sshUsername: '',
        sshPassword: '',
        room: '',
        seat: '',
        ntpServer: '',
        storage: {
          mediumPath: '',
          highPath: ''
        },
        storageRemoteId: '',
        maxUnitCnt: 0,
        maxUsage: {
          cpu: 80,
          mem: 80,
          bandwidth: 80,
          storage: 80
        },
        enabled: true,
        role: '',
        description: '',
        siteCluster: ''
      }
    },
    cloneForEdit: function(input) {
      Object.keys(input).forEach(element => {
        if (input[element] === null) {
          input[element] = ''
        }
        if (typeof input[element] === Array) {
          console.log(input[element])
        }
      })
      this.dialogTemp = {
        clusterId: input.cluster.id,
        id: input.id,
        site: input.site,
        ip: input.ip,
        room: input.room,
        seat: input.seat,
        storage: {
          mediumPath: '',
          highPath: ''
        },
        storageRemoteId: null,
        maxUnitCnt: input.maxUnitCnt,
        maxUsage: input.maxUsage,
        enabled: input.enabled,
        role: input.role,
        description: input.description,
        siteCluster: input.name + ' / ' + input.cluster.name,
        view: {
          unitCnt: input.unitCnt,
          cpu: input.cpu,
          mem: input.mem,
          bandwidth: input.bandwidth,
          storage: {
            medium: {
              totalSize: 0,
              usedSize: 0
            },
            high: {
              totalSize: 0,
              usedSize: 0
            }
          }
        }
      }
      if (input.storageRemote) {
        this.dialogTemp.storageRemoteId = input.storageRemote.id
      }
      for (const v of input.storage) {
        if (v.performance.code === 'high') {
          this.dialogTemp.storage.highPath = v.path
          this.dialogTemp.view.storage.high = {
            totalSize: v.totalSize,
            usedSize: v.usedSize
          }
        }
        if (v.performance.code === 'medium') {
          this.dialogTemp.storage.mediumPath = v.path
          this.dialogTemp.view.storage.medium = {
            totalSize: v.totalSize,
            usedSize: v.usedSize
          }
        }
      }
    },
    cloneForUpdateHost(input) {
      const res = {}
      res.room = input.room
      res.seat = input.seat
      res.maxUnitCnt = input.maxUnitCnt
      res.maxUsage = input.maxUsage
      res.description = input.description
      res.role = input.role
      return res
    },
    cloneForNewHost(input) {
      const res = JSON.parse(JSON.stringify(input))
      res.created_user = this.user_id
      res.clusterId = input.clusterId[1]
      res.storage = []
      console.log('input.storage', input.storage)
      if (input.storage.mediumPath) {
        console.log('medium')
        res.storage.push({
          performance: 'medium',
          path: [input.storage.mediumPath]
        })
      }
      if (input.storage.highPath) {
        console.log('high')
        res.storage.push({
          performance: 'high',
          path: [input.storage.highPath]
        })
      }
      return res
    },
    handleFormClose() {
      this.newHostFormVisible = false
      this.deleteFormVisible = false
      this.deleteConfirmExpect = ''
      this.dialogStatus = ''
      this.deleteConfirmStr = {
        username: '',
        pwd: '',
        port: '22'
      }
    },
    handleMonitor(host_id, host_ip) {
      const hostMonitorUrl =
          process.env.VUE_APP_PROMETHEUS_PATH +
          '/d/nodes/nodes' +
          '?let-instance=' +
          host_ip +
          ':9100'
      console.log(hostMonitorUrl)
      window.open(hostMonitorUrl)
    },
    handleHostStart(host_id, host_name) {
      this.$confirm('是否确认启动 ' + host_name, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          enableHost(host_id).then(_ => {
            this.getHostList()
          })
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleHostStop(host_id, host_name) {
      this.$confirm('是否确认停用 ' + host_name, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          disableHost(host_id).then(_ => {
            this.getHostList()
          })
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleHostDelete() {
      this.$refs['deleteForm'].validate(valid => {
        if (valid) {
          deleteHost(this.dialogTemp.id, this.deleteConfirmStr).then(() => {
            this.getHostList()
            this.handleFormClose()
            this.$notify({
              title: 'Success',
              message: '正在出库，请稍后刷新确认..',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    displayAddNewHost() {
      this.dialogStatus = 'add'
      this.resetTemp()
      this.newHostFormVisible = true
      this.deleteFormVisible = false
      getNtpSever().then(response => {
        this.ntpSeverList = response.data
      })
      this.clusterOptions = []
      fetchClusters().then(response => {
        this.clusters = response.data
        for (const v of this.clusters) {
          let foundOption = false
          for (const option of this.clusterOptions) {
            if (v.site.name === option.label) {
              foundOption = true
              option.children.push({
                value: v.id,
                label: v.name
              })
              break
            }
          }
          if (!foundOption) {
            this.clusterOptions.push({
              value: '',
              label: v.site.name,
              children: [
                {
                  value: v.id,
                  label: v.name
                }
              ]
            })
          }
        }
      })
      fetchRemoteStorages().then(response => {
        this.remoteStorages = response.data
      })
    },
    handleAddNewHost() {
      this.$refs['newHostForm'].validate(valid => {
        if (valid) {
          console.log(
            'dialogTemp', this.dialogTemp,
            'dialogTemp.storage', this.dialogTemp.storage)
          const tempData = this.cloneForNewHost(this.dialogTemp)
          addHost(tempData).then(() => {
            this.getHostList()
            this.newHostFormVisible = false
            this.$notify({
              title: 'Success',
              message: '正在入库，请稍后刷新确认..',
              type: 'success',
              duration: 2000
            })
          })
        }
      })
    },
    handleModifyHost() {
      this.$refs['newHostForm'].validate(valid => {
        if (valid) {
          const tempData = this.cloneForUpdateHost(this.dialogTemp)
          modifyHost(this.dialogTemp.id, tempData).then(() => {
            this.getHostList()
            this.newHostFormVisible = false
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
  }
}
</script>

<style scoped>
  .el-form-item {
    margin-bottom: 14px;
  }
</style>
