<template>
  <div class="keymap-view p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">键位映射</h1>
      <div class="flex space-x-2">
        <el-button @click="importConfig">
          <el-icon class="mr-1"><Download /></el-icon>
          导入
        </el-button>
        <el-button @click="exportConfig">
          <el-icon class="mr-1"><Upload /></el-icon>
          导出
        </el-button>
        <el-button type="danger" plain @click="resetConfig">
          <el-icon class="mr-1"><RefreshLeft /></el-icon>
          重置
        </el-button>
      </div>
    </div>

    <div class="flex gap-6" style="min-height: 500px;">
      <!-- 左侧：键盘布局 -->
      <div class="flex-1">
        <el-card shadow="hover" class="h-full">
          <template #header>
            <div class="flex items-center justify-between">
              <span>键盘布局</span>
              <el-select v-model="keymapStore.layout" size="small" style="width: 100px">
                <el-option label="60%" value="60" />
                <el-option label="65%" value="65" />
                <el-option label="75%" value="75" />
                <el-option label="100%" value="100" />
              </el-select>
            </div>
          </template>

          <div class="keyboard-container flex justify-center items-start" style="min-height: 400px; padding: 40px 20px;">
            <KeyboardCanvas
              :layout="keymapStore.layout"
              :mappings="currentLayerMappings"
              :selected-key="keymapStore.selectedKey"
              @select-key="selectKey"
            />
          </div>
        </el-card>
      </div>

      <!-- 右侧：配置面板 -->
      <div class="w-80">
        <!-- 层选择 -->
        <el-card shadow="hover" class="mb-4">
          <template #header>
            <div class="flex items-center justify-between">
              <span>键盘层</span>
              <el-button size="small" text @click="addLayer">
                <el-icon><Plus /></el-icon>
              </el-button>
            </div>
          </template>

          <div class="layer-list space-y-2">
            <div
              v-for="layer in keymapStore.layers"
              :key="layer.id"
              class="layer-item flex items-center justify-between p-2 rounded cursor-pointer"
              :class="layer.id === keymapStore.activeLayer ? 'bg-primary text-white' : 'bg-gray-50 hover:bg-gray-100'"
              @click="keymapStore.setActiveLayer(layer.id)"
            >
              <span>{{ layer.name }}</span>
              <el-button
                v-if="keymapStore.layers.length > 1"
                size="small"
                text
                :type="layer.id === keymapStore.activeLayer ? 'default' : 'danger'"
                @click.stop="removeLayer(layer.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-card>

        <!-- 按键配置 -->
        <el-card shadow="hover">
          <template #header>
            <span>按键配置</span>
          </template>

          <div v-if="keymapStore.selectedKey" class="key-config">
            <div class="selected-key text-center mb-4">
              <div class="text-sm text-gray-500">当前按键</div>
              <div class="text-2xl font-bold text-primary">{{ keymapStore.selectedKey }}</div>
            </div>

            <el-form label-width="60px">
              <el-form-item label="功能">
                <el-select v-model="currentAction.type" @change="handleActionTypeChange">
                  <el-option label="普通按键" value="key" />
                  <el-option label="功能键" value="fn" />
                  <el-option label="宏命令" value="macro" />
                  <el-option label="层切换" value="layer" />
                  <el-option label="无功能" value="none" />
                </el-select>
              </el-form-item>

              <el-form-item v-if="currentAction.type === 'key'" label="按键">
                <el-select v-model="currentAction.value" filterable placeholder="选择按键">
                  <el-option
                    v-for="key in keyOptions"
                    :key="key"
                    :label="key"
                    :value="key"
                  />
                </el-select>
              </el-form-item>

              <el-form-item v-if="currentAction.type === 'fn'" label="FN键">
                <el-select v-model="currentAction.value" placeholder="选择FN组合">
                  <el-option label="FN1" value="FN1" />
                  <el-option label="FN2" value="FN2" />
                  <el-option label="FN3" value="FN3" />
                </el-select>
              </el-form-item>

              <el-form-item v-if="currentAction.type === 'macro'" label="宏">
                <el-select v-model="currentAction.value" placeholder="选择宏">
                  <el-option
                    v-for="macro in macroStore.macros"
                    :key="macro.id"
                    :label="macro.name"
                    :value="macro.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item v-if="currentAction.type === 'layer'" label="目标层">
                <el-select v-model="currentAction.value" placeholder="选择层">
                  <el-option
                    v-for="layer in keymapStore.layers"
                    :key="layer.id"
                    :label="layer.name"
                    :value="layer.id"
                  />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" class="w-full" @click="applyKeyConfig">
                  应用
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div v-else class="text-center text-gray-400 py-8">
            点击键盘上的按键进行配置
          </div>
        </el-card>
      </div>
    </div>

    <!-- 隐藏的文件输入 -->
    <input
      ref="fileInput"
      type="file"
      accept=".json"
      style="display: none"
      @change="handleFileImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useKeymapStore, type KeyAction, type KeyActionType } from '@/stores/keymap'
import { useMacroStore } from '@/stores/macro'
import { ElMessage } from 'element-plus'
import { Download, Upload, RefreshLeft, Plus, Delete } from '@element-plus/icons-vue'
import KeyboardCanvas from '@/components/keyboard/KeyboardCanvas.vue'

const keymapStore = useKeymapStore()
const macroStore = useMacroStore()
const fileInput = ref<HTMLInputElement | null>(null)

const currentAction = ref<KeyAction>({
  type: 'key',
  value: ''
})

// 按键选项
const keyOptions = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Space', 'Tab', 'CapsLock', 'Shift', 'Ctrl', 'Alt', 'Win', 'Enter', 'Backspace',
  'Esc', 'PrintScreen', 'ScrollLock', 'Pause',
  'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown',
  'Up', 'Down', 'Left', 'Right',
  '`', '-', '=', '[', ']', '\\', ';', '\'', ',', '.', '/'
]

// 当前层的映射
const currentLayerMappings = computed(() => {
  const layer = keymapStore.layers.find(l => l.id === keymapStore.activeLayer)
  return layer?.mappings || {}
})

// 选择按键
function selectKey(key: string) {
  keymapStore.selectedKey = key
  const mapping = keymapStore.getKeyMapping(key)
  if (mapping) {
    currentAction.value = { ...mapping }
  } else {
    currentAction.value = { type: 'key', value: key }
  }
}

// 处理功能类型变化
function handleActionTypeChange() {
  currentAction.value.value = ''
}

// 应用按键配置
function applyKeyConfig() {
  if (!keymapStore.selectedKey) return

  keymapStore.setKeyMapping(keymapStore.selectedKey, {
    type: currentAction.value.type as KeyActionType,
    value: currentAction.value.value
  })

  ElMessage.success('按键配置已应用')
}

// 添加层
function addLayer() {
  const name = `层 ${keymapStore.layers.length + 1}`
  keymapStore.addLayer(name)
  ElMessage.success(`已添加 "${name}"`)
}

// 删除层
function removeLayer(id: number) {
  keymapStore.removeLayer(id)
  ElMessage.info('层已删除')
}

// 导入配置
function importConfig() {
  fileInput.value?.click()
}

// 处理文件导入
function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (keymapStore.importConfig(content)) {
      ElMessage.success('配置导入成功')
    } else {
      ElMessage.error('配置导入失败')
    }
  }
  reader.readAsText(file)

  // 清空input
  target.value = ''
}

// 导出配置
function exportConfig() {
  const content = keymapStore.exportConfig()
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'keymap-config.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('配置已导出')
}

// 重置配置
function resetConfig() {
  keymapStore.resetToDefault()
  ElMessage.info('配置已重置')
}

onMounted(() => {
  keymapStore.loadFromStorage()
  macroStore.loadFromStorage()
})
</script>

<style scoped>
.layer-item {
  transition: all 0.2s;
}
</style>
