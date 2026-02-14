import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type LightingEffect = 'static' | 'breathing' | 'wave' | 'rain' | 'reactive' | 'off'

export interface LightingConfig {
  enabled: boolean
  brightness: number      // 0-100
  effect: LightingEffect
  speed: number           // 0-100, 效果速度
  direction: 'left' | 'right' | 'up' | 'down'
  customColor: {
    r: number
    g: number
    b: number
  }
  secondaryColor?: {
    r: number
    g: number
    b: number
  }
}

export const useLightingStore = defineStore('lighting', () => {
  const config = ref<LightingConfig>({
    enabled: true,
    brightness: 80,
    effect: 'static',
    speed: 50,
    direction: 'left',
    customColor: { r: 0, g: 122, b: 255 },  // 默认蓝色
    secondaryColor: { r: 255, g: 0, b: 128 }
  })

  const presets: { name: string; effect: LightingEffect; color: { r: number; g: number; b: number } }[] = [
    { name: '静态', effect: 'static', color: { r: 0, g: 122, b: 255 } },
    { name: '呼吸', effect: 'breathing', color: { r: 0, g: 200, b: 100 } },
    { name: '波浪', effect: 'wave', color: { r: 255, g: 100, b: 0 } },
    { name: '雨滴', effect: 'rain', color: { r: 50, g: 100, b: 200 } },
    { name: '响应', effect: 'reactive', color: { r: 255, g: 0, b: 255 } },
    { name: '关闭', effect: 'off', color: { r: 0, g: 0, b: 0 } }
  ]

  // 设置效果
  function setEffect(effect: LightingEffect) {
    config.value.effect = effect
  }

  // 设置颜色
  function setColor(r: number, g: number, b: number) {
    config.value.customColor = { r, g, b }
  }

  // 设置亮度
  function setBrightness(brightness: number) {
    config.value.brightness = Math.max(0, Math.min(100, brightness))
  }

  // 设置速度
  function setSpeed(speed: number) {
    config.value.speed = Math.max(0, Math.min(100, speed))
  }

  // 设置方向
  function setDirection(direction: 'left' | 'right' | 'up' | 'down') {
    config.value.direction = direction
  }

  // 开关灯效
  function toggleEnabled() {
    config.value.enabled = !config.value.enabled
  }

  // 应用预设
  function applyPreset(index: number) {
    const preset = presets[index]
    if (preset) {
      config.value.effect = preset.effect
      config.value.customColor = { ...preset.color }
    }
  }

  // 转换为设备数据
  function toDeviceData(): number[] {
    return [
      config.value.enabled ? 1 : 0,
      config.value.brightness,
      config.value.effect === 'off' ? 0 : ['static', 'breathing', 'wave', 'rain', 'reactive'].indexOf(config.value.effect) + 1,
      config.value.speed,
      config.value.direction === 'left' ? 0 : config.value.direction === 'right' ? 1 : config.value.direction === 'up' ? 2 : 3,
      config.value.customColor.r,
      config.value.customColor.g,
      config.value.customColor.b,
      config.value.secondaryColor?.r || 0,
      config.value.secondaryColor?.g || 0,
      config.value.secondaryColor?.b || 0
    ]
  }

  // 导出配置
  function exportConfig(): string {
    return JSON.stringify(config.value, null, 2)
  }

  // 导入配置
  function importConfig(json: string): boolean {
    try {
      const data = JSON.parse(json) as LightingConfig
      config.value = data
      return true
    } catch {
      return false
    }
  }

  // 持久化
  function loadFromStorage() {
    const stored = localStorage.getItem('lighting-config')
    if (stored) {
      importConfig(stored)
    }
  }

  function saveToStorage() {
    localStorage.setItem('lighting-config', exportConfig())
  }

  watch(config, () => {
    saveToStorage()
  }, { deep: true })

  return {
    config,
    presets,
    setEffect,
    setColor,
    setBrightness,
    setSpeed,
    setDirection,
    toggleEnabled,
    applyPreset,
    toDeviceData,
    exportConfig,
    importConfig,
    loadFromStorage,
    saveToStorage
  }
})
