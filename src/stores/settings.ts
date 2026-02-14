import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const language = ref<'zh-CN' | 'en'>('zh-CN')
  const autoConnect = ref(false)
  const theme = ref<'light' | 'dark'>('light')
  const showTutorial = ref(true)

  // 语言切换
  function setLanguage(lang: 'zh-CN' | 'en') {
    language.value = lang
  }

  // 主题切换
  function setTheme(t: 'light' | 'dark') {
    theme.value = t
  }

  // 自动连接开关
  function setAutoConnect(enabled: boolean) {
    autoConnect.value = enabled
  }

  // 引导开关
  function setShowTutorial(show: boolean) {
    showTutorial.value = show
  }

  // 重置所有设置
  function resetSettings() {
    language.value = 'zh-CN'
    autoConnect.value = false
    theme.value = 'light'
    showTutorial.value = true
  }

  // 导出配置
  function exportConfig(): string {
    return JSON.stringify({
      language: language.value,
      autoConnect: autoConnect.value,
      theme: theme.value,
      showTutorial: showTutorial.value
    }, null, 2)
  }

  // 导入配置
  function importConfig(json: string): boolean {
    try {
      const data = JSON.parse(json)
      if (data.language) language.value = data.language
      if (typeof data.autoConnect === 'boolean') autoConnect.value = data.autoConnect
      if (data.theme) theme.value = data.theme
      if (typeof data.showTutorial === 'boolean') showTutorial.value = data.showTutorial
      return true
    } catch {
      return false
    }
  }

  // 持久化
  function loadFromStorage() {
    const stored = localStorage.getItem('app-settings')
    if (stored) {
      importConfig(stored)
    }
  }

  function saveToStorage() {
    localStorage.setItem('app-settings', exportConfig())
  }

  watch([language, autoConnect, theme, showTutorial], () => {
    saveToStorage()
  })

  return {
    language,
    autoConnect,
    theme,
    showTutorial,
    setLanguage,
    setTheme,
    setAutoConnect,
    setShowTutorial,
    resetSettings,
    exportConfig,
    importConfig,
    loadFromStorage,
    saveToStorage
  }
})
