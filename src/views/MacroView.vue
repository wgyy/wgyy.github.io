<template>
  <div class="macro-view p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">宏管理</h1>
      <div class="flex space-x-2">
        <el-button type="primary" @click="createNewMacro">
          <el-icon class="mr-1"><Plus /></el-icon>
          新建宏
        </el-button>
      </div>
    </div>

    <div class="flex gap-6">
      <!-- 左侧：宏列表 -->
      <div class="w-80">
        <el-card shadow="hover">
          <template #header>
            <span>宏列表</span>
          </template>

          <div v-if="macroStore.macros.length === 0" class="text-center text-gray-400 py-8">
            暂无宏，点击上方按钮创建
          </div>

          <div v-else class="macro-list space-y-2">
            <div
              v-for="macro in macroStore.macros"
              :key="macro.id"
              class="macro-item flex items-center justify-between p-3 rounded cursor-pointer"
              :class="macroStore.activeMacro?.id === macro.id ? 'bg-primary text-white' : 'bg-gray-50 hover:bg-gray-100'"
              @click="selectMacro(macro)"
            >
              <div>
                <div class="font-medium">{{ macro.name }}</div>
                <div class="text-xs" :class="macroStore.activeMacro?.id === macro.id ? 'text-white/70' : 'text-gray-400'">
                  {{ macro.actions.length }} 个动作
                </div>
              </div>
              <el-button
                size="small"
                text
                :type="macroStore.activeMacro?.id === macro.id ? 'default' : 'danger'"
                @click.stop="deleteMacro(macro.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：宏编辑 -->
      <div class="flex-1">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <el-input
                v-if="macroStore.activeMacro"
                v-model="macroStore.activeMacro.name"
                size="small"
                class="w-48"
                @change="handleNameChange"
              />
              <span v-else>请选择宏</span>

              <div v-if="macroStore.activeMacro" class="flex space-x-2">
                <el-button size="small" @click="startRecord" :disabled="macroStore.isRecording">
                  <el-icon class="mr-1"><VideoCamera /></el-icon>
                  录制
                </el-button>
                <el-button size="small" @click="importConfig">
                  <el-icon class="mr-1"><Download /></el-icon>
                  导入
                </el-button>
                <el-button size="small" @click="exportConfig">
                  <el-icon class="mr-1"><Upload /></el-icon>
                  导出
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="macroStore.activeMacro" class="macro-editor">
            <!-- 录制状态 -->
            <div v-if="macroStore.isRecording" class="recording-banner bg-red-50 border border-red-200 rounded p-3 mb-4 flex items-center">
              <span class="recording-dot w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></span>
              <span class="text-red-600">正在录制...</span>
              <el-button size="small" type="danger" class="ml-auto" @click="stopRecord">
                停止
              </el-button>
            </div>

            <!-- 动作列表 -->
            <div v-if="macroStore.activeMacro.actions.length === 0" class="text-center text-gray-400 py-8">
              暂无动作，点击上方录制或添加按钮
            </div>

            <div v-else class="action-list">
              <div
                v-for="(action, index) in macroStore.activeMacro.actions"
                :key="action.id"
                class="action-item flex items-center gap-3 p-3 bg-gray-50 rounded mb-2"
              >
                <span class="action-index text-gray-400 w-6">{{ index + 1 }}</span>

                <el-select v-model="action.type" size="small" class="w-24" @change="handleActionTypeChange(action)">
                  <el-option label="按下" value="press" />
                  <el-option label="释放" value="release" />
                  <el-option label="延迟" value="delay" />
                </el-select>

                <template v-if="action.type === 'delay'">
                  <el-input-number
                    v-model="action.duration"
                    :min="1"
                    :max="10000"
                    size="small"
                    controls-position="right"
                  />
                  <span class="text-gray-500 text-sm">毫秒</span>
                </template>

                <template v-else>
                  <el-select
                    v-model="action.key"
                    filterable
                    placeholder="选择按键"
                    size="small"
                    class="flex-1"
                  >
                    <el-option
                      v-for="key in keyOptions"
                      :key="key"
                      :label="key"
                      :value="key"
                    />
                  </el-select>
                </template>

                <div class="action-buttons flex gap-1">
                  <el-button size="small" text @click="moveAction(index, 'up')" :disabled="index === 0">
                    <el-icon><Top /></el-icon>
                  </el-button>
                  <el-button size="small" text @click="moveAction(index, 'down')" :disabled="index === macroStore.activeMacro.actions.length - 1">
                    <el-icon><Bottom /></el-icon>
                  </el-button>
                  <el-button size="small" text type="danger" @click="deleteAction(action.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <!-- 添加动作 -->
            <div class="mt-4 flex gap-2">
              <el-button @click="addAction('press')">
                <el-icon class="mr-1"><Plus /></el-icon>
                添加按下
              </el-button>
              <el-button @click="addAction('release')">
                <el-icon class="mr-1"><Plus /></el-icon>
                添加释放
              </el-button>
              <el-button @click="addAction('delay')">
                <el-icon class="mr-1"><Plus /></el-icon>
                添加延迟
              </el-button>
            </div>
          </div>

          <div v-else class="text-center text-gray-400 py-16">
            请从左侧选择或创建一个宏
          </div>
        </el-card>
      </div>
    </div>

    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileImport" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useMacroStore, type Macro } from '@/stores/macro'
import { ElMessage } from 'element-plus'
import { Plus, Delete, VideoCamera, Download, Upload, Top, Bottom } from '@element-plus/icons-vue'

const macroStore = useMacroStore()
const fileInput = ref<HTMLInputElement | null>(null)

const keyOptions = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
  'Space', 'Enter', 'Tab', 'Escape', 'Esc', 'Backspace',
  'Up', 'Down', 'Left', 'Right'
]

function selectMacro(macro: Macro) {
  macroStore.activeMacro = macro
}

function createNewMacro() {
  const name = `宏 ${macroStore.macros.length + 1}`
  const macro = macroStore.createMacro(name)
  macroStore.activeMacro = macro
  ElMessage.success(`已创建 "${name}"`)
}

function deleteMacro(id: string) {
  macroStore.deleteMacro(id)
  ElMessage.info('宏已删除')
}

function handleNameChange() {
  // 名称变更自动保存
}

function addAction(type: 'press' | 'release' | 'delay') {
  if (!macroStore.activeMacro) return

  macroStore.addAction(macroStore.activeMacro.id, {
    type,
    key: type === 'delay' ? undefined : '',
    keycode: undefined,
    duration: type === 'delay' ? 100 : undefined
  })
}

function deleteAction(actionId: string) {
  if (!macroStore.activeMacro) return
  macroStore.deleteAction(macroStore.activeMacro.id, actionId)
}

function moveAction(index: number, direction: 'up' | 'down') {
  if (!macroStore.activeMacro) return
  const action = macroStore.activeMacro.actions[index]
  if (action) {
    macroStore.moveAction(macroStore.activeMacro.id, action.id, direction)
  }
}

function handleActionTypeChange(action: any) {
  if (action.type === 'delay') {
    action.key = undefined
    action.keycode = undefined
    action.duration = 100
  } else {
    action.duration = undefined
    action.key = action.key || ''
  }
}

// 录制功能
let recordInterval: number | null = null

function startRecord() {
  macroStore.startRecording()

  // 监听键盘事件
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!macroStore.activeMacro || !macroStore.isRecording) return

    macroStore.addAction(macroStore.activeMacro.id, {
      type: 'press',
      key: e.key.toUpperCase(),
      keycode: e.keyCode
    })
  }

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!macroStore.activeMacro || !macroStore.isRecording) return

    macroStore.addAction(macroStore.activeMacro.id, {
      type: 'release',
      key: e.key.toUpperCase(),
      keycode: e.keyCode
    })
  }

  window.addEventListener('keydown', handleKeyDown)
  window.addEventListener('keyup', handleKeyUp)

  // 存储事件处理器以便移除
  ;(window as any).__macroRecordHandlers = { handleKeyDown, handleKeyUp }
}

function stopRecord() {
  const handlers = (window as any).__macroRecordHandlers
  if (handlers) {
    window.removeEventListener('keydown', handlers.handleKeyDown)
    window.removeEventListener('keyup', handlers.handleKeyUp)
    delete (window as any).__macroRecordHandlers
  }

  macroStore.stopRecording()
  ElMessage.success('录制完成')
}

// 导入导出
function importConfig() {
  fileInput.value?.click()
}

function handleFileImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    if (macroStore.importConfig(content)) {
      ElMessage.success('宏配置导入成功')
    } else {
      ElMessage.error('宏配置导入失败')
    }
  }
  reader.readAsText(file)
  target.value = ''
}

function exportConfig() {
  const content = macroStore.exportConfig()
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'macro-config.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('宏配置已导出')
}

onMounted(() => {
  macroStore.loadFromStorage()
})

onUnmounted(() => {
  if (recordInterval) {
    clearInterval(recordInterval)
  }
  stopRecord()
})
</script>

<style scoped>
.macro-item {
  transition: all 0.2s;
}

.action-item {
  transition: all 0.2s;
}

.recording-dot {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
</style>
