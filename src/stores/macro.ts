import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type MacroActionType = 'press' | 'release' | 'delay'

export interface MacroAction {
  id: string
  type: MacroActionType
  keycode?: number
  key?: string
  duration?: number  // 延迟毫秒
}

export interface Macro {
  id: string
  name: string
  actions: MacroAction[]
}

export const useMacroStore = defineStore('macro', () => {
  const macros = ref<Macro[]>([])
  const activeMacro = ref<Macro | null>(null)
  const isRecording = ref(false)

  // 创建宏
  function createMacro(name: string): Macro {
    const macro: Macro = {
      id: Date.now().toString(),
      name,
      actions: []
    }
    macros.value.push(macro)
    return macro
  }

  // 删除宏
  function deleteMacro(id: string) {
    const index = macros.value.findIndex(m => m.id === id)
    if (index > -1) {
      macros.value.splice(index, 1)
      if (activeMacro.value?.id === id) {
        activeMacro.value = null
      }
    }
  }

  // 更新宏名称
  function updateMacroName(id: string, name: string) {
    const macro = macros.value.find(m => m.id === id)
    if (macro) {
      macro.name = name
    }
  }

  // 添加动作
  function addAction(macroId: string, action: Omit<MacroAction, 'id'>) {
    const macro = macros.value.find(m => m.id === macroId)
    if (macro) {
      macro.actions.push({
        ...action,
        id: Date.now().toString()
      })
    }
  }

  // 删除动作
  function deleteAction(macroId: string, actionId: string) {
    const macro = macros.value.find(m => m.id === macroId)
    if (macro) {
      const index = macro.actions.findIndex(a => a.id === actionId)
      if (index > -1) {
        macro.actions.splice(index, 1)
      }
    }
  }

  // 更新动作
  function updateAction(macroId: string, actionId: string, updates: Partial<MacroAction>) {
    const macro = macros.value.find(m => m.id === macroId)
    if (macro) {
      const action = macro.actions.find(a => a.id === actionId)
      if (action) {
        Object.assign(action, updates)
      }
    }
  }

  // 移动动作（用于排序）
  function moveAction(macroId: string, actionId: string, direction: 'up' | 'down') {
    const macro = macros.value.find(m => m.id === macroId)
    if (!macro) return

    const index = macro.actions.findIndex(a => a.id === actionId)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= macro.actions.length) return

    const [action] = macro.actions.splice(index, 1)
    macro.actions.splice(newIndex, 0, action)
  }

  // 开始录制
  function startRecording() {
    isRecording.value = true
  }

  // 停止录制
  function stopRecording(): MacroAction[] {
    isRecording.value = false
    return []
  }

  // 获取宏
  function getMacro(id: string): Macro | undefined {
    return macros.value.find(m => m.id === id)
  }

  // 导出配置
  function exportConfig(): string {
    return JSON.stringify(macros.value, null, 2)
  }

  // 导入配置
  function importConfig(json: string): boolean {
    try {
      const data = JSON.parse(json) as Macro[]
      macros.value = data
      return true
    } catch {
      return false
    }
  }

  // 持久化
  function loadFromStorage() {
    const stored = localStorage.getItem('macro-config')
    if (stored) {
      importConfig(stored)
    }
  }

  function saveToStorage() {
    localStorage.setItem('macro-config', exportConfig())
  }

  watch(macros, () => {
    saveToStorage()
  }, { deep: true })

  return {
    macros,
    activeMacro,
    isRecording,
    createMacro,
    deleteMacro,
    updateMacroName,
    addAction,
    deleteAction,
    updateAction,
    moveAction,
    startRecording,
    stopRecording,
    getMacro,
    exportConfig,
    importConfig,
    loadFromStorage,
    saveToStorage
  }
})
