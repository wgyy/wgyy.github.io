<template>
  <div class="home-view p-6">
    <h1 class="text-2xl font-semibold text-gray-800 mb-6">设备连接</h1>

    <!-- 未连接状态 -->
    <div v-if="!deviceStore.connected" class="max-w-2xl">
      <el-card shadow="hover" class="mb-6">
        <template #header>
          <div class="flex items-center">
            <el-icon class="text-primary mr-2"><Connection /></el-icon>
            <span>连接方式</span>
          </div>
        </template>

        <div class="connection-options grid grid-cols-2 gap-4">
          <!-- USB连接 -->
          <div
            class="connection-card p-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
            @click="connectUSB"
          >
            <el-icon class="text-4xl text-gray-400 mb-2"><Monitor /></el-icon>
            <div class="text-center">
              <div class="font-medium text-gray-700">USB 连接</div>
              <div class="text-sm text-gray-400">通过USB线缆连接键盘</div>
            </div>
          </div>

          <!-- 蓝牙连接 -->
          <div
            class="connection-card p-4 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors"
            @click="connectBluetooth"
          >
            <el-icon class="text-4xl text-gray-400 mb-2"><Promotion /></el-icon>
            <div class="text-center">
              <div class="font-medium text-gray-700">蓝牙连接</div>
              <div class="text-sm text-gray-400">通过蓝牙无线连接键盘</div>
            </div>
          </div>
        </div>

        <div class="mt-4 text-center">
          <el-button type="primary" @click="refreshDevices" :loading="scanning">
            <el-icon class="mr-1"><Refresh /></el-icon>
            刷新设备
          </el-button>
        </div>
      </el-card>

      <!-- 使用说明 -->
      <el-card shadow="hover">
        <template #header>
          <div class="flex items-center">
            <el-icon class="mr-2"><InfoFilled /></el-icon>
            <span>使用说明</span>
          </div>
        </template>

        <div class="usage-guide text-gray-600">
          <ul class="space-y-2">
            <li class="flex items-start">
              <el-icon class="text-primary mt-1 mr-2"><Check /></el-icon>
              <span>请确保键盘通过USB线缆或蓝牙与电脑正常连接</span>
            </li>
            <li class="flex items-start">
              <el-icon class="text-primary mt-1 mr-2"><Check /></el-icon>
              <span>部分浏览器可能需要授予设备访问权限</span>
            </li>
            <li class="flex items-start">
              <el-icon class="text-primary mt-1 mr-2"><Check /></el-icon>
              <span>建议使用Chrome或Edge浏览器以获得最佳兼容性</span>
            </li>
            <li class="flex items-start">
              <el-icon class="text-primary mt-1 mr-2"><Check /></el-icon>
              <span>WebUSB/WebBluetooth需要在HTTPS环境下运行</span>
            </li>
          </ul>
        </div>
      </el-card>
    </div>

    <!-- 已连接状态 -->
    <div v-else class="max-w-2xl">
      <el-card shadow="hover">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <el-icon class="text-green-500 mr-2"><SuccessFilled /></el-icon>
              <span>已连接设备</span>
            </div>
            <el-tag :type="deviceStore.connectionType === 'usb' ? 'primary' : 'success'">
              {{ deviceStore.connectionType === 'usb' ? 'USB' : '蓝牙' }}
            </el-tag>
          </div>
        </template>

        <div class="device-info">
          <div class="info-row flex py-2 border-b border-gray-100">
            <span class="text-gray-500 w-24">设备名称:</span>
            <span class="font-medium">{{ deviceStore.deviceInfo?.name }}</span>
          </div>
          <div class="info-row flex py-2 border-b border-gray-100">
            <span class="text-gray-500 w-24">连接方式:</span>
            <span>{{ deviceStore.connectionType === 'usb' ? 'USB 有线' : '蓝牙 无线' }}</span>
          </div>
          <div v-if="deviceStore.connectionType === 'usb'" class="info-row flex py-2 border-b border-gray-100">
            <span class="text-gray-500 w-24">VID/PID:</span>
            <span>{{ deviceStore.deviceInfo?.vendorId.toString(16) }} / {{ deviceStore.deviceInfo?.productId.toString(16) }}</span>
          </div>
          <div v-if="deviceStore.firmwareVersion" class="info-row flex py-2">
            <span class="text-gray-500 w-24">固件版本:</span>
            <span>{{ deviceStore.firmwareVersion }}</span>
          </div>
        </div>

        <div class="mt-4 flex justify-end space-x-2">
          <el-button type="danger" plain @click="disconnect">
            <el-icon class="mr-1"><Close /></el-icon>
            断开连接
          </el-button>
        </div>
      </el-card>

      <!-- 快捷操作 -->
      <el-card shadow="hover" class="mt-4">
        <template #header>
          <span>快捷操作</span>
        </template>

        <div class="grid grid-cols-3 gap-4">
          <el-button class="w-full" @click="$router.push('/keymap')">
            <el-icon class="mr-1"><Key /></el-icon>
            键位映射
          </el-button>
          <el-button class="w-full" @click="$router.push('/macro')">
            <el-icon class="mr-1"><List /></el-icon>
            宏管理
          </el-button>
          <el-button class="w-full" @click="$router.push('/lighting')">
            <el-icon class="mr-1"><Sunny /></el-icon>
            灯效控制
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeviceStore } from '@/stores/device'
import { ElMessage } from 'element-plus'
import {
  Connection,
  Monitor,
  Promotion,
  Refresh,
  InfoFilled,
  Check,
  SuccessFilled,
  Close,
  Key,
  List,
  Sunny
} from '@element-plus/icons-vue'

const deviceStore = useDeviceStore()
const scanning = ref(false)

onMounted(() => {
  deviceStore.initUSBListener()
})

async function connectUSB() {
  scanning.value = true
  const result = await deviceStore.connectUSB()
  scanning.value = false

  if (result.success) {
    ElMessage.success('USB连接成功')
  } else {
    ElMessage.error(result.error || 'USB连接失败')
  }
}

async function connectBluetooth() {
  scanning.value = true
  const result = await deviceStore.connectBluetooth()
  scanning.value = false

  if (result.success) {
    ElMessage.success('蓝牙连接成功')
  } else {
    ElMessage.error(result.error || '蓝牙连接失败')
  }
}

function refreshDevices() {
  scanning.value = true
  setTimeout(() => {
    scanning.value = false
    ElMessage.info('请选择连接方式')
  }, 1000)
}

function disconnect() {
  deviceStore.disconnect()
  ElMessage.info('已断开连接')
}
</script>

<style scoped>
.connection-card {
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
