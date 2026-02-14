<template>
  <div class="settings-view p-6">
    <h1 class="text-2xl font-semibold text-gray-800 mb-6">设置</h1>

    <div class="w-full">
      <!-- 通用设置 -->
      <el-card shadow="hover" class="mb-4">
        <template #header>
          <span>通用设置</span>
        </template>

        <el-form label-width="100px">
          <el-form-item label="语言">
            <el-select v-model="settingsStore.language" @change="handleLanguageChange">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en" />
            </el-select>
          </el-form-item>

          <el-form-item label="主题">
            <el-radio-group v-model="settingsStore.theme" @change="handleThemeChange">
              <el-radio-button value="light">浅色</el-radio-button>
              <el-radio-button value="dark">深色</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="自动连接">
            <el-switch v-model="settingsStore.autoConnect" />
            <div class="text-sm text-gray-400 ml-2">启动时自动连接上次设备</div>
          </el-form-item>

          <el-form-item label="使用引导">
            <el-switch v-model="settingsStore.showTutorial" />
            <div class="text-sm text-gray-400 ml-2">显示功能使用引导</div>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 设备设置 -->
      <el-card shadow="hover" class="mb-4">
        <template #header>
          <span>设备设置</span>
        </template>

        <el-form label-width="100px">
          <el-form-item label="设备过滤">
            <el-input
              placeholder="输入设备名称过滤"
              clearable
            />
            <div class="text-sm text-gray-400 mt-1">留空则显示所有兼容设备</div>
          </el-form-item>

          <el-form-item label="USB VID">
            <el-input placeholder="如: 0x1234" />
          </el-form-item>

          <el-form-item label="USB PID">
            <el-input placeholder="如: 0x5678" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 数据管理 -->
      <el-card shadow="hover" class="mb-4">
        <template #header>
          <span>数据管理</span>
        </template>

        <div class="space-y-3">
          <div class="flex items-center justify-between py-2">
            <div>
              <div class="font-medium">导出所有配置</div>
              <div class="text-sm text-gray-400">将所有配置导出为JSON文件</div>
            </div>
            <el-button @click="exportAllConfig">
              <el-icon class="mr-1"><Download /></el-icon>
              导出
            </el-button>
          </div>

          <div class="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <div class="font-medium">导入配置</div>
              <div class="text-sm text-gray-400">从JSON文件恢复配置</div>
            </div>
            <el-button @click="importAllConfig">
              <el-icon class="mr-1"><Upload /></el-icon>
              导入
            </el-button>
          </div>

          <div class="flex items-center justify-between py-2 border-t border-gray-100">
            <div>
              <div class="font-medium">重置所有设置</div>
              <div class="text-sm text-gray-400">清除所有配置，恢复默认设置</div>
            </div>
            <el-button type="danger" @click="resetAllSettings">
              <el-icon class="mr-1"><RefreshLeft /></el-icon>
              重置
            </el-button>
          </div>
        </div>
      </el-card>

      <!-- 关于 -->
      <el-card shadow="hover">
        <template #header>
          <span>关于</span>
        </template>

        <div class="about-content">
          <div class="flex items-center mb-4">
            <el-icon class="text-4xl text-primary mr-4"><Monitor /></el-icon>
            <div>
              <div class="text-lg font-medium">键盘云驱</div>
              <div class="text-sm text-gray-400">版本 1.0.0</div>
            </div>
          </div>

          <div class="text-sm text-gray-500 space-y-1">
            <p>一款基于Web的键盘配置管理工具</p>
            <p>使用 WebUSB / WebBluetooth 与键盘通信</p>
            <p class="mt-2">推荐使用 Chrome 或 Edge 浏览器</p>
          </div>
        </div>
      </el-card>
    </div>

    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileImport" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useKeymapStore } from '@/stores/keymap'
import { useMacroStore } from '@/stores/macro'
import { useLightingStore } from '@/stores/lighting'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Monitor, Download, Upload, RefreshLeft } from '@element-plus/icons-vue'

const settingsStore = useSettingsStore()
const keymapStore = useKeymapStore()
const macroStore = useMacroStore()
const lightingStore = useLightingStore()

const fileInput = ref<HTMLInputElement | null>(null)

function handleLanguageChange(lang: string) {
  ElMessage.success('语言已切换')
}

function handleThemeChange(theme: string) {
  ElMessage.success(`主题已切换为${theme === 'dark' ? '深色' : '浅色'}`)
}

function exportAllConfig() {
  const config = {
    settings: JSON.parse(settingsStore.exportConfig()),
    keymap: JSON.parse(keymapStore.exportConfig()),
    macro: JSON.parse(macroStore.exportConfig()),
    lighting: JSON.parse(lightingStore.exportConfig())
  }

  const content = JSON.stringify(config, null, 2)
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'cloud-keyboard-backup.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('配置已导出')
}

function importAllConfig() {
  fileInput.value?.click()
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const content = e.target?.result as string
      const config = JSON.parse(content)

      if (config.settings) {
        settingsStore.importConfig(JSON.stringify(config.settings))
      }
      if (config.keymap) {
        keymapStore.importConfig(JSON.stringify(config.keymap))
      }
      if (config.macro) {
        macroStore.importConfig(JSON.stringify(config.macro))
      }
      if (config.lighting) {
        lightingStore.importConfig(JSON.stringify(config.lighting))
      }

      ElMessage.success('配置导入成功')
    } catch {
      ElMessage.error('配置导入失败，文件格式错误')
    }
  }
  reader.readAsText(file)
  target.value = ''
}

async function resetAllSettings() {
  try {
    await ElMessageBox.confirm(
      '此操作将清除所有配置数据，是否继续？',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    settingsStore.resetSettings()
    keymapStore.resetToDefault()
    localStorage.removeItem('macro-config')
    localStorage.removeItem('lighting-config')

    ElMessage.success('所有设置已重置')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  settingsStore.loadFromStorage()
})
</script>

<style scoped>
.about-content {
  padding: 10px 0;
}
</style>
