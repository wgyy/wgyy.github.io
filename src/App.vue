<template>
  <div class="app-container flex h-screen">
    <!-- 侧边栏 -->
    <aside class="sidebar w-56 bg-white border-r border-gray-200 flex flex-col">
      <div class="logo h-14 flex items-center px-4 border-b border-gray-200">
        <el-icon class="text-primary text-xl mr-2"><Monitor /></el-icon>
        <span class="font-semibold text-gray-800">键盘云驱</span>
      </div>

      <nav class="flex-1 py-4">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="menu-item flex items-center px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
          active-class="menu-item-active"
        >
          <el-icon class="mr-3 text-lg"><component :is="item.icon" /></el-icon>
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- 设备状态 -->
      <div class="device-status p-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <span
              class="status-dot w-2 h-2 rounded-full mr-2"
              :class="deviceStore.connected ? 'bg-green-500' : 'bg-gray-400'"
            ></span>
            <span class="text-sm text-gray-600">
              {{ deviceStore.connected ? deviceStore.deviceInfo?.name || '已连接' : '未连接' }}
            </span>
          </div>
          <el-button
            v-if="deviceStore.connected"
            type="danger"
            size="small"
            text
            @click="disconnect"
          >
            断开
          </el-button>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content flex-1 overflow-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDeviceStore } from '@/stores/device'
import { Monitor, Connection, Key, List, Sunny, Setting } from '@element-plus/icons-vue'

const deviceStore = useDeviceStore()

const menuItems = [
  { path: '/', label: '设备连接', icon: Connection },
  { path: '/keymap', label: '键位映射', icon: Key },
  { path: '/macro', label: '宏管理', icon: List },
  { path: '/lighting', label: '灯效控制', icon: Sunny },
  { path: '/settings', label: '设置', icon: Setting }
]

const disconnect = () => {
  deviceStore.disconnect()
}
</script>

<style scoped>
.menu-item {
  margin: 2px 8px;
  border-radius: 6px;
}

.menu-item-active {
  background-color: #ecf5ff;
  color: #409eff;
}

.status-dot {
  transition: background-color 0.3s;
}
</style>
