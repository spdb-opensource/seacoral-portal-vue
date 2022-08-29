<template>
  <div class="app-container">
    <el-row>
      <el-col :span="12" :offset="0">
        <el-button
          type="primary"
          icon="el-icon-refresh"
          size="small"
          style="margin:8px;"
          @click="getList"
        >刷新</el-button>
        <el-button
          v-if="transData.spec.cmha === null"
          type="warning"
          icon="el-icon-custom"
          size="small"
          style="margin:8px;"
          @click="handleRoleChange"
        >角色变更</el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="listLoading"
      :data="list.slice((currentPage-1)*pagesize,currentPage*pagesize)"
      border
      fit
      highlight-current-row
      size="mini"
      style="width: 100%"
    >

      <el-table-column
        label="单元名称"
        width="auto"
        min-width="100px"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.id.split('-').slice(1,4).join('-') }}</span>
        </template>
      </el-table-column>

      <el-table-column
        width="auto"
        min-width="50px"
        align="center"
        label="所属集群"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.node.cluster.name }}</span>
        </template>
      </el-table-column>

      <el-table-column
        width="auto"
        min-width="50px"
        align="center"
        label="所属主机IP"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.node.hostIp }}</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="80px"
        align="center"
        label="服务链接"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.ip }}:{{ originalData.spec.database.services.ports[0].port }} </span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="90px"
        width="auto"
        align="center"
        label="版本号"
      >
        <template slot-scope="scope">
          <p>{{ scope.row.image.major }}.{{ scope.row.image.minor }}.{{ scope.row.image.patch }}.{{ scope.row.image.build }}</p>
        </template>
      </el-table-column>

      <el-table-column
        min-width="50px"
        width="auto"
        align="center"
        label="性能套餐"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.resources.cpu/1000 }}C{{ scope.row.resources.memory }}M</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="50px"
        align="center"
        label="表空间"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.image.type === 'mysql'">{{ (originalData.spec.database.services.units.resources.requests.storage. volumes[0].capacity /1024).toFixed(1) }}G</span>
          <span v-if="scope.row.image.type === 'cmha'">{{ (originalData.spec.cmha.services.units.resources.requests.storage. volumes[0].capacity /1024).toFixed(1) }}G</span>
          <span v-if="scope.row.image.type === 'proxysql'">{{ (originalData.spec.proxy.services.units.resources.requests.storage. volumes[0].capacity /1024).toFixed(1) }}G</span>
        </template>
      </el-table-column>

      <el-table-column
        min-width="50px"
        align="center"
        label="日志空间"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.image.type === 'mysql'">{{ (originalData.spec.database.services.units.resources.requests.storage. volumes[1].capacity /1024).toFixed(1) }}G</span>
          <span v-if="scope.row.image.type === 'cmha'">{{ (originalData.spec.cmha.services.units.resources.requests.storage. volumes[1].capacity /1024).toFixed(1) }}G</span>
          <span v-if="scope.row.image.type === 'proxysql'">{{ (originalData.spec.proxy.services.units.resources.requests.storage. volumes[1].capacity /1024).toFixed(1) }}G</span>
        </template>
      </el-table-column>

      <el-table-column
        width="auto"
        align="center"
        label="角色"
      >
        <template slot-scope="scope">
          <span v-if="scope.row.replication.role==='slave'">
            <el-tooltip placement="top">
              <div slot="content">
                复制io状态：{{ scope.row.replication.slaveIoRunning }}<br>
                复制sql状态：{{ scope.row.replication.slaveSqlRunning }}<br>
                复制延迟：{{ scope.row.replication.secondsBehindMaster }}
              </div>
              <el-button type="text">{{ scope.row.replication ? scope.row.replication.role : '' }}</el-button>
            </el-tooltip>
          </span>
          <span v-else>{{ scope.row.replication ? scope.row.replication.role : '' }}</span>
        </template>
      </el-table-column>

      <el-table-column
        width="auto"
        align="center"
        label="容器状态"
      >
        <template slot-scope="scope">
          <span>{{ scope.row.podState }}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="运行状态"
        align="center"
        width="auto"
      >
        <template slot-scope="scope">
          <i
            v-if="scope.row.state === 'passing'"
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
        width="auto"
        align="center"
        label="任务详情"
        min-width="180px"
      >

        <template slot-scope="scope">
          <el-button v-if="scope.row.task && scope.row.task.id" type="text" @click="handleTaskDetail(scope.row)">
            {{ scope.row.task.action }}:{{ scope.row.task.status }}
          </el-button>
        </template>
      </el-table-column>

      <el-table-column
        label="管理"
        width="150px"
        align="center"
      >
        <template slot-scope="{row}">

          <!-- <el-tooltip content="监控" placement="bottom" effect="light">
            <el-button
              round
              size="small"
              icon="el-icon-s-platform"
              @click="handleMonitor(row)"
            />
          </el-tooltip> -->

          <el-tooltip content="终端" placement="bottom" effect="light">
            <el-button
              round
              size="small"
              icon="el-icon-monitor"
              style="margin-left: 0;"
              @click="handleShell(row)"
            />
          </el-tooltip>

          <el-dropdown
            trigger="click"
            :hide-on-click="false"
            @command="handleDropdown($event,row)"
          >
            <el-button
              plain
              size="small"
              icon="el-icon-arrow-down"
            />
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item
                command="start"
                :disabled="row.state === 'passing'"
              ><i class="el-icon-video-play" />启动
              </el-dropdown-item>
              <el-dropdown-item
                command="stop"
                :disabled="row.state === 'critical'"
              ><i class="el-icon-video-pause" />停止
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.image.type === 'mysql'"
                command="backup"
              ><i class="el-icon-takeaway-box" />备份
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.image.type === 'mysql'"
                command="restore"
              ><i class="el-icon-refresh-left" />还原
              </el-dropdown-item>
              <el-dropdown-item
                command="migrate"
              ><i class="el-icon-c-scale-to-original" />迁移
              </el-dropdown-item>
              <el-dropdown-item
                command="rebuild"
              ><i class="el-icon-folder-delete" />重建
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.image.type === 'mysql' && row.replication.role !== 'master' && transData.spec.cmha === null"
                command="roleChangeSlave"
              ><i class="el-icon-s-operation" />设置为从
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.image.type === 'mysql' && row.replication.role === 'master' && transData.spec.cmha !== null"
                command="semi_sync"
              ><i class="el-icon-orange" />设置半同步
              </el-dropdown-item>
              <el-dropdown-item
                v-if="row.image.type === 'mysql' && row.replication.role !== 'master' && transData.spec.cmha !== null"
                command="set_source"
              ><i class="el-icon-refresh" />设置同步源
              </el-dropdown-item>
              <!-- TODO:目前发现所有的都没有这几个按钮了，所以暂时注释
              <el-dropdown-item
                command="isolate"
              ><i class="el-icon-umbrella" />隔离
              </el-dropdown-item>
              <el-dropdown-item
                command="recover"
              ><i class="el-icon-refresh-right" />回切
              </el-dropdown-item>
              <el-dropdown-item
                command="upgrade"
              ><i class="el-icon-arrow-up" />升级
              </el-dropdown-item>
              <el-dropdown-item
                command="slowlog"
              ><i class="el-icon-document" />慢日志
              </el-dropdown-item>

              -->
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
      :visible.sync="backupFormVisible"
      :before-close="cancelBackup"
    >
      <el-form
        ref="backupForm"
        :rules="backupRules"
        :model="backupStr"
        label-position="left"
        label-width="100px"
      >
        <el-form-item label="存储节点" prop="endpointId">
          <el-cascader
            :key="cascaderKey"
            :options="BackupEndpointOptions"
            @change="handleBackupEndpointChange"
          />
        </el-form-item>
        <el-form-item label="备份类型" prop="type">
          <el-select v-model="backupStr.type" placeholder="请选择">
            <el-option
              v-for="item in backupTypeOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="有效天数" prop="retention">
          <el-input v-model="backupStr.retention" type="number" placeholder="请输入备份文件保留天数" :min="0" />
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelBackup()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="backup()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogStatus"
      :visible.sync="restoreFormVisible"
      :before-close="cancelRestore"
      width="75%"
    >
      <el-table
        v-loading="backupListLoading"
        :data="backupList.slice((backupListCurrentPage-1)*backupListPagesize,backupListCurrentPage*backupListPagesize)"
        border
        fit
        highlight-current-row
        style="width: 100%"
        @current-change="handleBackupSelectCurrentChange"
      >
        <el-table-column
          label="名称"
          width="auto"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.path.split('-').slice(1,6).join('-') }}</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          min-width="50px"
          align="center"
          label="所属单元"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.path.split('-').slice(1,4).join('-') }}</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          min-width="50px"
          align="center"
          label="备份类型"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.type? scope.row.type==='full'?'全备':'' :'' }}</span>
          </template>
        </el-table-column>
        <el-table-column
          width="auto"
          min-width="50px"
          align="center"
          label="存储类型"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.endpointType }}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="80px"
          align="center"
          label="备份大小"
        >
          <template slot-scope="scope">
            <span>{{ (scope.row.size/1024).toFixed(2) }}G </span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="90px"
          width="auto"
          align="center"
          label="开始时间"
        >
          <template slot-scope="scope">
            <p>{{ scope.row.gmtStart }}</p>
          </template>
        </el-table-column>

        <el-table-column
          min-width="50px"
          width="auto"
          align="center"
          label="结束时间"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.gmtEnd ==='0001-01-01 00:00:00' ? '' : scope.row.gmtEnd }}</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          align="center"
          label="耗时"
        >
          <template slot-scope="scope">
            <span>{{ formatUptime(scope.row) }}</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          align="center"
          label="过期时间"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.expire }}</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          align="center"
          label="备注"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.remark ? scope.row.remark : '' }}</span>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="backupListTotal>0"
        :current-page="backupListCurrentPage"
        :page-sizes="[10, 20, 30]"
        :limit="parseInt(backupListPagesize)"
        :total="backupListTotal"
        @size-change="handleBackupTableSizeChange"
        @current-change="handleBackupTableCurrentChange"
        @pagination="handleBackupTablePagination"
      />

      <div>
        当前选中备份： <span v-if="currentSelection !== null" style="color:green">{{ currentSelection.path }}</span>
      </div>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelRestore()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="restore()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogStatus"
      :visible.sync="rebuildFormVisible"
      :before-close="cancelRebuild"
    >
      <el-form
        ref="rebuildForm"
        :model="rebuildStr"
        :rules="rebuildRules"
        label-position="left"
        label-width="100px"
      >
        <el-form-item
          label="分配方式"
          prop="rebuildStrategy"
        >
          <el-select
            v-model="rebuildStr.rebuildStrategy"
            collapse-tags
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in rebuildStrategyOptions"
              :key="item.code"
              :label="item.name"
              :value="item.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="rebuildStr.rebuildStrategy === 'manual'"
          label="选择主机"
          prop="rebuildStrategy"
        >
          <el-select
            v-model="rebuildStr.hostId"
            collapse-tags
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in rebuildHostOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelRebuild()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="rebuild()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogStatus"
      :visible.sync="upgradeFormVisible"
      :before-close="cancelUpgrade"
    >
      <el-form
        ref="upgradeForm"
        :model="upgradeStr"
        label-position="left"
        label-width="100px"
      >
        <el-form-item
          label="服务类型"
          prop="select"
        >
          <el-select
            value="MySQL"
            collapse-tags
            filterable
            disabled
            placeholder="请选择"
          >
            <el-option :key="'MySQL'" :label="'MySQL'" :value="'MySQL'" />
          </el-select>
        </el-form-item>
        <el-form-item
          label="版本选择"
          prop="select"
        >
          <el-select
            v-model="upgradeStr.select"
            collapse-tags
            filterable
            placeholder="请选择"
          >
            <el-option
              v-for="item in imageOptions"
              :key="item.id"
              :label="item.version.major +'.'+item.version.minor+'.'+item.version.patch+'.'+item.version.build"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelUpgrade()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="upgrade()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogStatus"
      :visible.sync="taskFormVisible"
      :before-close="cancelTaskDetail"
      width="75%"
    >
      <el-table
        v-loading="taskDetailListLoading"
        :data="taskDetailList.slice((taskDetailListCurrentPage-1)*taskDetailListPagesize,taskDetailListCurrentPage*taskDetailListPagesize)"
        border
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column
          label="操作者"
          width="auto"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.userDTO.name }}({{ scope.row.userDTO.username }})</span>
          </template>
        </el-table-column>

        <el-table-column
          label="开始时间"
          width="auto"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.startDateTime }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="结束时间"
          width="auto"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.endDateTime }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="任务名称"
          width="auto"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.action }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="状态"
          width="auto"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.status }}</span>
          </template>
        </el-table-column>

        <el-table-column
          label="回执信息"
          width="auto"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.error }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="taskDetailListTotal>0"
        :current-page="taskDetailListCurrentPage"
        :page-sizes="[10, 20, 30]"
        :limit="parseInt(taskDetailListPagesize)"
        :total="taskDetailListTotal"
        @size-change="handleTaskDetailTableSizeChange"
        @current-change="handleTaskDetailTableCurrentChange"
        @pagination="handleTaskDetailTablePagination"
      />
    </el-dialog>

    <el-dialog
      :title="'监控图'"
      :visible.sync="monitorGraphVisible"
      width="60%"
    >
      <monitorTab :trans-data="monitorData" :visible1="monitorGraphVisible" />
    </el-dialog>

    <el-dialog
      :title="dialogStatus"
      :visible.sync="roleChangeSlaveFormVisible"
      :before-close="cancelRoleChangeSlave"
      width="75%"
    >
      <el-table
        v-loading="roleChangeSlaveListLoading"
        :data="roleChangeSlaveList.slice((roleChangeSlaveListCurrentPage-1)*roleChangeSlaveListPagesize,roleChangeSlaveListCurrentPage*roleChangeSlaveListPagesize)"
        border
        fit
        highlight-current-row
        style="width: 100%"
        @current-change="handleRoleChangeSlaveSelectCurrentChange"
      >
        <el-table-column
          label="单元名称"
          width="auto"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.id.split("-").slice(1,4).join("-") }}</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          min-width="50px"
          align="center"
          label="所属主机ip"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.node.hostIp }}</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          min-width="50px"
          align="center"
          label="服务链接"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.ip }}:{{ originalData.spec.database.services.ports[0].port }} </span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="80px"
          align="center"
          label="角色"
        />

        <el-table-column
          min-width="90px"
          width="auto"
          align="center"
          label="容器状态"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.podState }}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="50px"
          width="auto"
          align="center"
          label="运行状态"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.state }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="roleChangeSlaveListTotal>0"
        :current-page="roleChangeSlaveListCurrentPage"
        :page-sizes="[10, 20, 30]"
        :limit="parseInt(roleChangeSlaveListPagesize)"
        :total="roleChangeSlaveListTotal"
        @size-change="handleRoleChangeSlaveSizeChange"
        @current-change="handleRoleChangeSlaveCurrentChange"
        @pagination="handleRoleChangeSlavePagination"
      />

      <div>
        当前选中作为主的单元： <span v-if="currentSelection !== null" style="color:green">{{ currentSelection.id }}</span>
      </div>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelRoleChangeSlave()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="roleChangeSlave()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
      :title="dialogStatus"
      :visible.sync="roleChangeFormVisible"
      :before-close="cancelRoleChange"
      width="75%"
    >
      <el-table
        ref="roleChangeFormTable"
        v-loading="roleChangeListLoading"
        :data="roleChangeList.slice((roleChangeListCurrentPage-1)*roleChangeListPagesize,roleChangeListCurrentPage*roleChangeListPagesize)"
        border
        fit
        highlight-current-row
        style="width: 100%"
        @current-change="handleRoleChangeSelectCurrentChange"
      >
        <el-table-column
          label="单元名称"
          width="auto"
          min-width="100px"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.id }}</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          min-width="50px"
          align="center"
          label="所属主机ip"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.node.hostIp }}</span>
          </template>
        </el-table-column>

        <el-table-column
          width="auto"
          min-width="50px"
          align="center"
          label="服务链接"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.ip }}:{{ originalData.spec.database.services.ports[0].port }} </span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="80px"
          align="center"
          label="角色"
        >
          <template slot-scope="scope">
            <span v-if="scope.row.replication && scope.row.replication.role === 'master'">
              {{ scope.row.replication.role }}
            </span>
            <span v-else-if="scope.row.replication && scope.row.replication.role ==='slave'">
              <el-tooltip placement="top">
                <div slot="content">
                  复制io状态：{{ scope.row.replication.slaveIoRunning }}<br>
                  复制sql状态：{{ scope.row.replication.slaveSqlRunning }}<br>
                  复制延迟：{{ scope.row.replication.secondsBehindMaster }}
                </div>
                <el-button type="text">{{ scope.row.replication ? scope.row.replication.role : '' }}</el-button>
              </el-tooltip>
            </span>
            <span v-else>{{ scope.row.replication.role }}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="90px"
          width="auto"
          align="center"
          label="容器状态"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.podState }}</span>
          </template>
        </el-table-column>

        <el-table-column
          min-width="50px"
          width="auto"
          align="center"
          label="运行状态"
        >
          <template slot-scope="scope">
            <span>{{ scope.row.state }}</span>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="roleChangeListTotal>0"
        :current-page="roleChangeListCurrentPage"
        :page-sizes="[10, 20, 30]"
        :limit="parseInt(roleChangeListPagesize)"
        :total="roleChangeListTotal"
        @size-change="handleRoleChangeSizeChange"
        @current-change="handleRoleChangeCurrentChange"
        @pagination="handleRoleChangePagination"
      />

      <div>
        当前选中作为主的单元：<span v-if="currentSelection !== null" style="color:green">{{ currentSelection.id }}</span>
      </div>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button @click="cancelRoleChange()">
          关闭
        </el-button>
        <el-button
          type="primary"
          @click="roleChange()"
        >
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { fetchServiceById, getMySQLVersionEnabled, rebuildMySQL, getPodShell } from '@/api/service/mysql/mysql' // fetchServiceById,
import { startUnit, stopUnit, backupUnit, isolateUnit, recoverUnit, updateUnitVersion, getTasksById, setSource, setSemiSync } from '@/api/service/mysql/units'
import { fetchBackupFiles, restoreBackupFiles } from '@/api/service/mysql/backupList'
import { getBackupTypes, getDirTypes, getRebuildStrategys, getEnabledHostsById } from '@/api/selections'
import { fetchBackupFileEndPoints } from '@/api/manager/backupEndpoints'
import { fetchClusterById } from '@/api/manager/clusters'
import { unitRoleChangeSlaveAction, roleChangeAction } from '@/api/service/mysql/roleChange'
import Pagination from '@/components/Pagination'
import monitorTab from './monitorTab'

export default {
  name: 'MySQLTab',
  components: { Pagination, monitorTab },
  filters: {
    stateFilter(status) {
      const stateMap = {
        passing: 'success',
        critical: 'danger'
      }
      return stateMap[status]
    }
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
      cascaderKey: 0,

      roles: this.$router.currentRoute.meta.roles,
      monitorData: [],
      monitorGraphVisible: false,
      list: [],
      originalData: {},
      total: 0,
      currentPage: 1,
      pagesize: 10,
      listLoading: false,
      dialogStatus: '',
      backupTypeOptions: [],
      storageTypeOptions: [],
      backupEndpointList: [],
      backupFormVisible: false,
      backupStr: {
        type: '',
        endpoint_id: '',
        retention: 1
      },
      restoreFormVisible: false,
      backupList: [],
      BackupEndpointOptions: [],
      backupListLoading: false,
      backupListTotal: 0,
      backupListCurrentPage: 1,
      backupListPagesize: 10,
      roleChangeSlaveFormVisible: false,
      roleChangeSlaveList: [],
      roleChangeSlaveListLoading: false,
      roleChangeSlaveListTotal: 0,
      roleChangeSlaveListCurrentPage: 1,
      roleChangeSlaveListPagesize: 10,
      roleChangeFormVisible: false,
      roleChangeList: [],
      roleChangeListLoading: false,
      roleChangeListTotal: 0,
      roleChangeListCurrentPage: 1,
      roleChangeListPagesize: 10,
      taskFormVisible: false,
      taskDetailList: [],
      taskDetailListLoading: false,
      taskDetailListTotal: 0,
      taskDetailListCurrentPage: 1,
      taskDetailListPagesize: 10,
      currentSelection: {},
      rebuildFormVisible: false,
      rebuildStr: {
        rebuildStrategy: '',
        hostId: ''
      },
      rebuildStrategyOptions: [],
      rebuildHostOptions: [],
      upgradeFormVisible: false,
      upgradeStr: {
        select: ''
      },

      imageOptions: [],
      dialogTemp: {},
      editRules: {
        name: [
          { required: true, message: 'name is required', trigger: 'change' }
        ]
      },
      backupRules: {
        // storageType: [{ required: true, message: '存储类型不能为空', trigger: 'change' }],
        endpoint_id: [{ required: true, message: '存储节点不能为空', trigger: 'change' }],
        type: [{ required: true, message: '备份类型不能为空', trigger: 'change' }],
        retention: [{ required: true, message: 'retention is required', trigger: 'change' }]
        // name: [
        //   { required: true, message: 'name is required', trigger: 'change' }
        // ]
      }
    }
  },
  computed: {
    ...mapGetters(['user_id']),
    rebuildRules() {
      const rule = {
        rebuildStrategy: [{ required: true, message: 'name is required', trigger: 'change' }]
      }
      if (this.rebuildStr.rebuildStrategy === 'manual') {
        rule.hostId = [{ required: true, message: 'hostId is required', trigger: 'change' }]
      }
      return rule
    }
  },
  created() {
    this.getList()
  },
  methods: {
    formatUptime(row) {
      if (row.gmtEnd === null || row.gmtEnd === '') {
        return ''
      }
      const startDate = new Date(row.gmtStart)
      const endDate = new Date(row.gmtEnd)
      if (row.gmtEnd === '0001-01-01 00:00:00') {
        return ''
      }
      const uptime = (endDate - startDate) / 1000
      if (uptime != null) {
        if (uptime < 60) {
          return (uptime + '秒')
        } else if (uptime > 60 && uptime < 3600) {
          return (Math.floor(uptime / 60) + '分' + (uptime % 60) + '秒')
        } else {
          return (Math.floor(uptime / 3600) + '小时' + Math.floor(uptime % 3600 / 60) + '分' + (uptime % 3600 % 60) + '秒')
        }
      }
    },
    getList() {
      this.listLoading = true
      fetchServiceById(this.transData.id).then(response => {
        this.originalData = response.data
        // response.data.servs[0].units.forEach(element => {
        //   element.dataDirSize = response.data.specs[0].dataDirSize
        //   element.logDirSize = response.data.specs[0].logDirSize
        // })
        this.list = response.data.status.database.services[0].units
        // console.log(this.list)
        this.total = response.data.status.database.services[0].units.length
        var num = 0
        for (const unit of this.list) {
          if (unit.replication == null) {
            this.$set(this.list[num], 'replication', { role: '/' })
          }
          num++
        }
        if (response.data.status.cmha.services !== null) {
          for (const cmha of response.data.status.cmha.services[0].units) {
            this.list.push(cmha)
            this.total = this.total + 1
          }
        }
        if (response.data.status.proxy.services !== null) {
          for (const proxy of response.data.status.proxy.services[0].units) {
            this.list.push(proxy)
            this.total = this.total + 1
          }
        }
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
    handleBackupTableSizeChange(val) {
      this.backupListPagesize = val
    },
    handleBackupTableCurrentChange(val) {
      this.backupListCurrentPage = val
    },
    handleBackupTablePagination(val) {
      this.backupListCurrentPage = val.page
      this.backupListPagesize = val.limit
    },
    handleRoleChangeSlaveSizeChange(val) {
      this.roleChangeSlaveListPagesize = val
    },
    handleRoleChangeSlaveCurrentChange(val) {
      this.roleChangeSlaveListCurrentPage = val
    },
    handleRoleChangeSlavePagination(val) {
      this.roleChangeSlaveListCurrentPage = val.page
      this.roleChangeSlaveListPagesize = val.limit
    },
    handleRoleChangeSlaveSelectCurrentChange(val) {
      this.currentSelection = val
    },
    handleRoleChangeSizeChange(val) {
      this.roleChangeListPagesize = val
    },
    handleRoleChangeCurrentChange(val) {
      this.roleChangeListCurrentPage = val
    },
    handleRoleChangePagination(val) {
      this.roleChangeListCurrentPage = val.page
      this.roleChangeListCurrentPage = val.limit
    },
    handleRoleChangeSelectCurrentChange(val) {
      if (val && (val.replication && val.replication.role === 'slave')) {
        this.currentSelection = val
      } else {
        this.currentSelection = {}
        this.$refs.roleChangeFormTable.setCurrentRow()
      }
    },
    handleTaskDetailTableSizeChange(val) {
      this.taskDetailListPagesize = val
    },
    handleTaskDetailTableCurrentChange(val) {
      this.taskDetailListCurrentPage = val
    },
    handleTaskDetailTablePagination(val) {
      this.taskDetailListCurrentPage = val.page
      this.taskDetailListPagesize = val.limit
    },
    handleServiceStart(row) {
      this.$confirm(
        '是否确认启动 ' + row.id,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          startUnit(this.originalData.id, row.id).then(response => {
            this.getList()
            this.$message.success('操作成功')
          })
            .catch(error => {
              this.$message.info(error)
            })
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleServiceStop(row) {
      this.$confirm(
        '是否确认停止 ' + row.id,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        stopUnit(this.originalData.id, row.id).then(response => {
          this.getList()
          this.$message.success('操作成功')
        })
          .catch(error => {
            this.$message.info(error)
          })
      })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleSemiSync(row) {
      this.$confirm(
        '是否确认设置半同步 ' + row.id,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          setSemiSync(this.originalData.id, row.id).then(response => {
            this.getList()
            this.$message.success('操作成功')
          })
            .catch(error => {
              this.$message.info(error)
            })
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleSetSource(row) {
      this.$confirm(
        '是否确认设置同步源 ' + row.id,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          setSource(this.originalData.id, row.id).then(response => {
            this.getList()
            this.$message.success('操作成功')
          })
            .catch(error => {
              this.$message.info(error)
            })
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    emptyDialogData() {
      this.dialogStatus = ''
      this.dialogTemp = {}
    },
    handleBackupEndpointChange(val) {
      this.backupStr.storageType = val[0]
      this.backupStr.endpointId = val[1]
    },
    handleBackup(row) {
      getBackupTypes().then(response => {
        this.backupTypeOptions = response.data
      })

      getDirTypes().then(response => {
        this.storageTypeOptions = response.data
        fetchBackupFileEndPoints().then(response => {
          this.backupEndpointList = response.data
          for (const storageType of this.storageTypeOptions) {
            const children = []
            for (const backupEndpoint of this.backupEndpointList) {
              if (storageType.code.toLowerCase() === backupEndpoint.type.toLowerCase()) {
                children.push({
                  value: backupEndpoint.id,
                  label: backupEndpoint.name
                })
              }
            }
            this.BackupEndpointOptions.push({
              value: storageType.code,
              label: storageType.name,
              children: children
            })
          }
        })
      })

      this.dialogTemp.id = row.id
      this.dialogStatus = '备份'
      this.backupFormVisible = true
    },
    cancelBackup() {
      ++this.cascaderKey
      this.dialogStatus = ''
      this.backupFormVisible = false
      this.BackupEndpointOptions = []
      this.dialogTemp = {}
      this.backupStr = {
        storageType: '',
        endpointId: '',
        type: '',
        retention: 1
      }
    },
    backup() {
      this.$refs['backupForm'].validate(valid => {
        if (valid) {
          this.backupStr.name = 'default'
          backupUnit(this.transData.id, this.dialogTemp.id, this.backupStr).then(response => {
            this.cancelBackup()
            this.getList()
            this.$message.success('操作成功')
          }).catch(error => {
            this.$message.info(error)
          })
        }
      })
    },
    handleRestore(row) {
      this.backupList = []
      console.log(this.originalData)

      // fetchBackupFileEndPoints().then()

      fetchClusterById(row.node.cluster.id).then(response => {
        // 这个接口表面上传了Complete，实际上全返回了，要靠前端筛选
        fetchBackupFiles(response.data.site.id, this.originalData.id, true).then(response => {
          response.data.forEach(element => {
            if (element.status === 'Complete') {
              this.backupList.push(element)
            }
          })
        })
        this.backupListTotal = this.backupList.length
      })
      this.restoreFormVisible = true
      this.dialogTemp = Object.assign({}, row)
      this.currentSelection = {}
      this.dialogStatus = '还原'
    },
    cancelRestore() {
      this.restoreFormVisible = false
      this.currentSelection = {}
      this.emptyDialogData()
    },
    restore() {
      if (!this.currentSelection.id) {
        this.$message.error('请选择一行数据')
        return
      }
      const arr = this.currentSelection.path.split('-')
      const unitName = arr.slice(1, 4).join('-')
      const restoreName = arr.slice(4, 6).join('-')
      let changeText = ''
      changeText = "确认要还原单元：<span style='color:red'>" + unitName + '</span></br>至' +
        "备份 <span style='color:green'>" + restoreName + '</span>'
      this.$confirm(
        changeText,
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        const temp = {}
        temp.appId = this.originalData.id
        temp.unitId = this.dialogTemp.id
        temp.backupFileId = this.currentSelection.id
        restoreBackupFiles(temp).then(response => {
          this.getList()
          this.cancelRestore()
          this.$message.success('操作成功')
        })
          .catch(error => {
            this.$message.info(error)
          })
      })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleBackupSelectCurrentChange(val) {
      this.currentSelection = val
    },
    handleMigrate(row) {
      // TODO:一个select（需要判断是否显示按钮）
    },
    handleRebuild(row) {
      this.rebuildStrategyOptions = []
      this.rebuildHostOptions = []
      this.dialogTemp = Object.assign({}, row)
      getRebuildStrategys().then(response => {
        this.rebuildStrategyOptions = response.data
        if (this.rebuildStrategyOptions.length > 0) {
          this.rebuildStr.rebuildStrategy = this.rebuildStrategyOptions[0].code
        }
      })
      getEnabledHostsById(this.dialogTemp.node.cluster.id).then(response => {
        this.rebuildHostOptions = response.data
        if (this.rebuildHostOptions.length > 0) {
          this.rebuildStr.hostId = this.rebuildHostOptions[0].code
        }
      })
      this.dialogStatus = '重建'
      this.rebuildFormVisible = true
    },
    cancelRebuild() {
      this.rebuildFormVisible = false
      this.rebuildStr = {
        rebuildStrategy: '',
        hostId: ''
      }
      this.emptyDialogData()
    },
    rebuild() {
      this.$refs['rebuildForm'].validate(valid => {
        if (valid) {
          this.$confirm(
            '确认要重建 ' + this.dialogTemp.id,
            '提示',
            {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }
          ).then(() => {
            const temp = {}
            temp.appId = this.originalData.id
            temp.unitId = this.dialogTemp.id
            if (this.rebuildStr.rebuildStrategy === 'auto') {
              temp.hostId = '000'
            } else {
              temp.hostId = this.rebuildStr.hostId
            }
            rebuildMySQL(temp).then(response => {
              this.getList()
              this.cancelRebuild()
              this.$message.success('操作成功')
            }).catch(error => {
              this.$message.info(error)
            })
          }).catch(() => {
            this.$message.info('取消操作！')
          })
        }
      })
    },
    handleIsolate(row) {
      // TODO:8088 403 error,8098 405 error
      this.$confirm(
        '是否确认隔离 ' + row.name.split('-')[2],
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          isolateUnit(row.id).then(response => {
            this.getList()
            this.$message.success('操作成功')
          })
            .catch(error => {
              this.$message.info(error)
            })
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleRecover(row) {
      // TODO:8088 403 error,8098 405 error
      this.$confirm(
        '是否确认回切 ' + row.name.split('-')[2],
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          recoverUnit(row.id).then(response => {
            this.getList()
            this.$message.success('操作成功')
          })
            .catch(error => {
              this.$message.info(error)
            })
        })
        .catch(() => {
          this.$message.info('取消操作！')
        })
    },
    handleUpgrade(row) {
      // TODO:8098 405 error,8088 没法操作
      this.dialogTemp = row
      getMySQLVersionEnabled().then(response => {
        this.imageOptions = response.data
        for (let index = 0; index < this.imageOptions.length; index++) {
          const element = this.imageOptions[index]
          const { major, minor, patch, build } = element.version
          if (major === this.dialogTemp.version.major && minor === this.dialogTemp.version.minor && patch === this.dialogTemp.version.patch && build === this.dialogTemp.version.build) {
            this.upgradeStr.select = element.id
            break
          }
        }
      })
      this.dialogStatus = '升级'
      this.upgradeFormVisible = true
    },
    upgrade() {
      const temp = {}
      for (let index = 0; index < this.imageOptions.length; index++) {
        const element = this.imageOptions[index]
        if (element.id === this.upgradeStr.select) {
          const { major, minor, patch, build } = element.version
          temp.majorVersion = major
          temp.minVersion = minor
          temp.patchVersion = patch
          temp.buildVersion = build
          break
        }
      }
      const { major, minor, patch, build } = this.dialogTemp.version
      if ((temp.majorVersion === major) && (temp.minVersion === minor) && (temp.patchVersion === patch) && (temp.buildVersion === build)) {
        this.$message.error('与当前版本一致请变更版本')
        return
      } else {
        updateUnitVersion(this.dialogTemp.id, this.upgradeStr.select).then(response => {
          this.$message.success('操作成功')
          this.getList()
          this.cancelUpgrade()
        })
      }
    },
    cancelUpgrade() {
      this.upgradeFormVisible = false
      this.dialogStatus = ''
      this.dialogTemp = {}
      this.upgradeStr = {
        select: ''
      }
    },
    handleSlowLog(row) {
      // TODO:因为按钮没了，所以也没法写了
    },
    handleRoleChangeSlave(row) {
      if (row.replication && row.replication.role === 'undefined') {
        this.$message.error('当前单元不可设置为从')
      } else {
        this.roleChangeSlaveList = [...this.list]
        for (let i = 0; i < this.roleChangeSlaveList.length; i++) {
          if (
            this.roleChangeSlaveList[i].replication &&
            this.roleChangeSlaveList[i].replication.role !== 'master') {
            this.roleChangeSlaveList.splice(i, 1)
          } else if (row.id === this.roleChangeSlaveList[i].id) {
            this.roleChangeSlaveList.splice(i, 1)
          }
        }
        this.dialogTemp = Object.assign({}, row)
        this.roleChangeSlaveFormVisible = true
        this.currentSelection = {}
        this.dialogStatus = '设置为从'
      }
    },
    cancelRoleChangeSlave() {
      this.roleChangeSlaveFormVisible = false
      this.currentSelection = {}
      this.emptyDialogData()
    },
    roleChangeSlave() {
      if (!this.currentSelection.id) {
        this.$message.error('请选择一行数据')
        return
      }
      let changeText = ''
      changeText += "将该单元设置为单元：<span style='color:red'>" + this.currentSelection.id + '</span>的从'
      for (let i = 0; i < this.roleChangeList.length; i++) {
        if (this.roleChangeList[i].id !== this.currentSelection.id) {
          changeText = changeText + "<span style='color:green'>主：" + this.list[i].servIp + '</span></br>'
        }
      }
      this.$confirm(
        changeText,
        '确认变更为以下情况？',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        const temp = {}
        temp.appId = this.originalData.id
        temp.units = [{ id: this.currentSelection.id, role: 'slave' }]
        unitRoleChangeSlaveAction(this.dialogTemp.id, temp).then(response => {
          this.getList()
          this.cancelRoleChangeSlave()
          this.$message.success('操作成功')
        }).catch(error => {
          this.$message.info(error)
        })
          .catch(() => {
            this.$message.info('取消操作！')
          })
      })
    },
    handleRoleChange(row) {
      this.roleChangeFormVisible = true
      this.currentSelection = {}
      this.dialogStatus = '角色变更'
      this.roleChangeList = [...this.list]
    },
    cancelRoleChange() {
      this.roleChangeFormVisible = false
      this.currentSelection = {}
      this.emptyDialogData()
    },
    roleChange() {
      if (!this.currentSelection.id) {
        this.$message.error('请选择一行数据')
        return
      }
      var changeText = ''
      const temp = {}
      temp.appId = this.originalData.id
      temp.units = []
      // '<span style="color:red">主：</span>
      changeText = "<span style='color:red'>主：" + this.currentSelection.ip + '</span></br>'
      temp.units.push({ id: this.currentSelection.id, role: 'master' })
      for (let i = 0; i < this.list.length; i++) {
        if (this.list[i].id !== this.currentSelection.id) {
          changeText = changeText + "<span style='color:green'>从：" + this.list[i].ip + '</span></br>'
          temp.units.push({ id: this.list[i].id, role: 'slave' })
        }
      }
      this.$confirm(
        changeText,
        '确认变更为以下情况？',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          dangerouslyUseHTMLString: true
        }
      ).then(() => {
        roleChangeAction(temp).then(response => {
          this.getList()
          this.cancelRoleChange()
          this.$message.success('操作成功')
        }).catch(error => {
          this.$message.info(error)
        })
          .catch(() => {
            this.$message.info('取消操作！')
          })
      })
    },
    handleTaskDetail(row) {
      this.taskDetailListLoading = true
      this.taskFormVisible = true
      getTasksById(row.task.id).then(response => {
        this.taskDetailListLoading = false
        this.taskDetailList = response.data
        this.taskDetailListTotal = response.data.length
      })
    },
    cancelTaskDetail() {
      this.taskFormVisible = false
      this.emptyDialogData()
    },
    handleMonitor(row) {
      this.monitorData = row
      // this.monitorGraphVisible = true
    },
    handleShell(row) {
      getPodShell(row.node.site.name, row.id, row.image.type).then(response => {
        const responseJson = JSON.parse(response.data)
        const routeData = this.$router.resolve({ name: 'Shell',
          query: { siteName: row.node.site.name, sessionId: responseJson.id, podName: row.id, podIP: row.ip }})
        window.open(routeData.href, '_self')
      })
    },
    handleDropdown(command, row) {
      if (command === 'start') {
        this.handleServiceStart(row)
      } else if (command === 'stop') {
        this.handleServiceStop(row)
      } else if (command === 'backup') {
        this.handleBackup(row)
      } else if (command === 'restore') {
        this.handleRestore(row)
      } else if (command === 'migrate') {
        this.handleMigrate(row)
      } else if (command === 'rebuild') {
        this.handleRebuild(row)
      } else if (command === 'isolate') {
        this.handleIsolate(row)
      } else if (command === 'recover') {
        this.handleRecover(row)
      } else if (command === 'upgrade') {
        this.handleUpgrade(row)
      } else if (command === 'slowlog') {
        this.handleSlowLog(row)
      } else if (command === 'roleChangeSlave') {
        this.handleRoleChangeSlave(row)
      } else if (command === 'roleChange') {
        this.handleRoleChange()
      } else if (command === 'semi_sync') {
        this.handleSemiSync(row)
      } else if (command === 'set_source') {
        this.handleSetSource(row)
      } else {
        this.handleMonitor(row)
      }
    }
  }
}
</script>
