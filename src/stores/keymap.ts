import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type KeyActionType = 'key' | 'fn' | 'macro' | 'layer' | 'none'

export interface KeyAction {
  type: KeyActionType
  value: string | number
}

export interface KeymapLayer {
  id: number
  name: string
  mappings: Record<string, KeyAction>
}

export interface KeymapConfig {
  layout: string
  layers: KeymapLayer[]
}

export const useKeymapStore = defineStore('keymap', () => {
  const layout = ref('60')
  const layers = ref<KeymapLayer[]>([
    {
      id: 0,
      name: '默认层',
      mappings: {}
    }
  ])
  const activeLayer = ref(0)
  const selectedKey = ref<string | null>(null)

  // 默认键位映射
  const defaultMappings: Record<string, KeyAction> = {
    // 字母键
    'Q': { type: 'key', value: 'Q' },
    'W': { type: 'key', value: 'W' },
    'E': { type: 'key', value: 'E' },
    'R': { type: 'key', value: 'R' },
    'T': { type: 'key', value: 'T' },
    'Y': { type: 'key', value: 'Y' },
    'U': { type: 'key', value: 'U' },
    'I': { type: 'key', value: 'I' },
    'O': { type: 'key', value: 'O' },
    'P': { type: 'key', value: 'P' },
    // 数字行
    '1': { type: 'key', value: '1' },
    '2': { type: 'key', value: '2' },
    '3': { type: 'key', value: '3' },
    '4': { type: 'key', value: '4' },
    '5': { type: 'key', value: '5' },
    '6': { type: 'key', value: '6' },
    '7': { type: 'key', value: '7' },
    '8': { type: 'key', value: '8' },
    '9': { type: 'key', value: '9' },
    '0': { type: 'key', value: '0' }
  }

  // 设置键位映射
  function setKeyMapping(key: string, action: KeyAction) {
    if (layers.value[activeLayer.value]) {
      layers.value[activeLayer.value].mappings[key] = action
    }
  }

  // 获取键位映射
  function getKeyMapping(key: string): KeyAction | null {
    const layer = layers.value[activeLayer.value]
    return layer?.mappings[key] || null
  }

  // 添加新层
  function addLayer(name: string) {
    const newId = Math.max(...layers.value.map(l => l.id)) + 1
    layers.value.push({
      id: newId,
      name,
      mappings: {}
    })
  }

  // 删除层
  function removeLayer(id: number) {
    if (layers.value.length <= 1) return
    const index = layers.value.findIndex(l => l.id === id)
    if (index > -1) {
      layers.value.splice(index, 1)
      if (activeLayer.value === id) {
        activeLayer.value = layers.value[0]?.id || 0
      }
    }
  }

  // 切换活动层
  function setActiveLayer(id: number) {
    activeLayer.value = id
    selectedKey.value = null
  }

  // 重置到默认
  function resetToDefault() {
    layers.value = [
      {
        id: 0,
        name: '默认层',
        mappings: { ...defaultMappings }
      }
    ]
    activeLayer.value = 0
  }

  // 导出配置
  function exportConfig(): string {
    return JSON.stringify({
      layout: layout.value,
      layers: layers.value
    }, null, 2)
  }

  // 导入配置
  function importConfig(json: string) {
    try {
      const config = JSON.parse(json) as KeymapConfig
      layout.value = config.layout
      layers.value = config.layers
      return true
    } catch {
      return false
    }
  }

  // 持久化存储
  function loadFromStorage() {
    const stored = localStorage.getItem('keymap-config')
    if (stored) {
      importConfig(stored)
    } else {
      layers.value[0].mappings = { ...defaultMappings }
    }
  }

  function saveToStorage() {
    localStorage.setItem('keymap-config', exportConfig())
  }

  watch([layout, layers], () => {
    saveToStorage()
  }, { deep: true })

  return {
    layout,
    layers,
    activeLayer,
    selectedKey,
    setKeyMapping,
    getKeyMapping,
    addLayer,
    removeLayer,
    setActiveLayer,
    resetToDefault,
    exportConfig,
    importConfig,
    loadFromStorage,
    saveToStorage
  }
})
