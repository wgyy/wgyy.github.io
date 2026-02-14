<template>
  <div class="lighting-view p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-semibold text-gray-800">灯效控制</h1>
      <div class="flex space-x-2">
        <el-button @click="importConfig">
          <el-icon class="mr-1"><Download /></el-icon>
          导入
        </el-button>
        <el-button @click="exportConfig">
          <el-icon class="mr-1"><Upload /></el-icon>
          导出
        </el-button>
      </div>
    </div>

    <div class="flex gap-6" style="min-height: 500px;">
      <!-- 左侧：预设效果 -->
      <div class="w-80">
        <el-card shadow="hover">
          <template #header>
            <span>预设效果</span>
          </template>

          <div class="preset-grid grid grid-cols-2 gap-3">
            <div
              v-for="(preset, index) in lightingStore.presets"
              :key="index"
              class="preset-item p-3 rounded cursor-pointer border-2 transition-all"
              :class="lightingStore.config.effect === preset.effect ? 'border-primary bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
              @click="lightingStore.applyPreset(index)"
            >
              <div
                class="preview-box w-full h-12 rounded mb-2"
                :style="{ background: getPresetColor(preset) }"
              ></div>
              <div class="text-center text-sm">{{ preset.name }}</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧：详细设置 -->
      <div class="flex-1">
        <el-card shadow="hover">
          <template #header>
            <div class="flex items-center justify-between">
              <span>效果设置</span>
              <el-switch
                v-model="lightingStore.config.enabled"
                active-text="开"
                inactive-text="关"
              />
            </div>
          </template>

          <div class="settings-content">
            <!-- 效果选择 -->
            <div class="setting-item mb-6">
              <div class="setting-label text-gray-600 mb-2">灯效模式</div>
              <el-radio-group v-model="lightingStore.config.effect" class="effect-group">
                <el-radio-button value="static">静态</el-radio-button>
                <el-radio-button value="breathing">呼吸</el-radio-button>
                <el-radio-button value="wave">波浪</el-radio-button>
                <el-radio-button value="rain">雨滴</el-radio-button>
                <el-radio-button value="reactive">响应</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 颜色选择 -->
            <div class="setting-item mb-6">
              <div class="setting-label text-gray-600 mb-2">主颜色</div>
              <div class="flex items-center gap-4">
                <el-color-picker v-model="colorHex" @change="handleColorChange" />
                <div class="flex-1">
                  <el-slider v-model="brightness" :min="0" :max="100" @change="handleBrightnessChange" />
                  <div class="flex justify-between text-xs text-gray-400 mt-1">
                    <span>亮度</span>
                    <span>{{ lightingStore.config.brightness }}%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 速度调节 -->
            <div v-if="['breathing', 'wave', 'rain', 'reactive'].includes(lightingStore.config.effect)" class="setting-item mb-6">
              <div class="setting-label text-gray-600 mb-2">速度</div>
              <el-slider v-model="lightingStore.config.speed" :min="0" :max="100" />
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>慢</span>
                <span>{{ lightingStore.config.speed }}%</span>
                <span>快</span>
              </div>
            </div>

            <!-- 方向选择 -->
            <div v-if="['wave', 'rain'].includes(lightingStore.config.effect)" class="setting-item mb-6">
              <div class="setting-label text-gray-600 mb-2">方向</div>
              <el-radio-group v-model="lightingStore.config.direction">
                <el-radio-button value="left">← 左</el-radio-button>
                <el-radio-button value="right">右 →</el-radio-button>
                <el-radio-button value="up">↑ 上</el-radio-button>
                <el-radio-button value="down">下 ↓</el-radio-button>
              </el-radio-group>
            </div>

            <!-- 次颜色 -->
            <div v-if="['wave', 'reactive', 'rain'].includes(lightingStore.config.effect)" class="setting-item mb-6">
              <div class="setting-label text-gray-600 mb-2">次颜色</div>
              <div class="flex items-center gap-4">
                <el-color-picker v-model="secondaryColorHex" @change="handleSecondaryColorChange" />
                <span class="text-sm text-gray-500">可选，用于渐变效果</span>
              </div>
            </div>

            <!-- 预览 -->
            <div class="preview-section mt-8 p-4 rounded" style="background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);">
              <div class="text-sm text-gray-500 mb-2">预览</div>
              <div
                class="preview-keyboard h-32 rounded flex items-center justify-center"
                :class="animationClass"
                :style="previewStyle"
              >
                <span class="text-gray-700 text-lg font-medium">Keyboard Preview</span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <input ref="fileInput" type="file" accept=".json" style="display: none" @change="handleFileImport" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useLightingStore } from '@/stores/lighting'
import { ElMessage } from 'element-plus'
import { Download, Upload } from '@element-plus/icons-vue'

const lightingStore = useLightingStore()
const fileInput = ref<HTMLInputElement | null>(null)

const colorHex = computed({
  get: () => rgbToHex(lightingStore.config.customColor),
  set: (val) => {
    const rgb = hexToRgb(val)
    if (rgb) {
      lightingStore.setColor(rgb.r, rgb.g, rgb.b)
    }
  }
})

const secondaryColorHex = computed({
  get: () => lightingStore.config.secondaryColor ? rgbToHex(lightingStore.config.secondaryColor) : '#000000',
  set: (val) => {
    const rgb = hexToRgb(val)
    if (rgb) {
      lightingStore.config.secondaryColor = rgb
    }
  }
})

const brightness = ref(lightingStore.config.brightness)

function handleColorChange(color: string) {
  const rgb = hexToRgb(color)
  if (rgb) {
    lightingStore.setColor(rgb.r, rgb.g, rgb.b)
  }
}

function handleSecondaryColorChange(color: string) {
  const rgb = hexToRgb(color)
  if (rgb) {
    lightingStore.config.secondaryColor = rgb
  }
}

function handleBrightnessChange(val: number) {
  lightingStore.setBrightness(val)
}

function rgbToHex(color: { r: number; g: number; b: number }): string {
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

function getPresetColor(preset: { effect: string; color: { r: number; g: number; b: number } }): string {
  const { r, g, b } = preset.color
  if (preset.effect === 'static') {
    return `rgb(${r}, ${g}, ${b})`
  }
  if (preset.effect === 'breathing') {
    return `linear-gradient(180deg, rgb(${Math.round(r*0.3)}, ${Math.round(g*0.3)}, ${Math.round(b*0.3)}), rgb(${r}, ${g}, ${b}))`
  }
  if (preset.effect === 'wave') {
    return `linear-gradient(90deg, rgb(${r}, ${g}, ${b}), rgb(${Math.round(r*0.3)}, ${Math.round(g*0.3)}, ${Math.round(b*0.3)}))`
  }
  if (preset.effect === 'rain') {
    return `linear-gradient(180deg, rgb(${Math.round(r*0.2)}, ${Math.round(g*0.2)}, ${Math.round(b*0.2)}), rgb(${r}, ${g}, ${b}))`
  }
  if (preset.effect === 'reactive') {
    return `radial-gradient(circle, rgb(${r}, ${g}, ${b}), rgb(${Math.round(r*0.3)}, ${Math.round(g*0.3)}, ${Math.round(b*0.3)}))`
  }
  return `rgb(${r}, ${g}, ${b})`
}

const previewColor = computed(() => {
  if (!lightingStore.config.enabled) {
    return '#1a1a1a'
  }

  const { r, g, b } = lightingStore.config.customColor
  const brightness = lightingStore.config.brightness / 100

  return `rgb(${Math.round(r * brightness)}, ${Math.round(g * brightness)}, ${Math.round(b * brightness)})`
})

const animationClass = computed(() => {
  if (!lightingStore.config.enabled) return ''
  const effect = lightingStore.config.effect
  const direction = lightingStore.config.direction
  return `effect-${effect} direction-${direction}`
})

const previewStyle = computed(() => {
  const { r, g, b } = lightingStore.config.customColor
  const brightness = lightingStore.config.brightness / 100
  const sec = lightingStore.config.secondaryColor || { r: 0, g: 0, b: 0 }
  const speed = (100 - lightingStore.config.speed) / 100 * 3 + 0.5

  const baseColor = `rgb(${Math.round(r * brightness)}, ${Math.round(g * brightness)}, ${Math.round(b * brightness)})`
  const secColor = `rgb(${Math.round(sec.r * brightness)}, ${Math.round(sec.g * brightness)}, ${Math.round(sec.b * brightness)})`

  const styles: Record<string, any> = { background: baseColor }

  if (lightingStore.config.effect === 'wave') {
    const dir = lightingStore.config.direction
    let gradient = ''
    if (dir === 'left' || dir === 'right') {
      gradient = `linear-gradient(90deg, ${baseColor}, ${secColor})`
      styles.backgroundSize = '200% 100%'
    } else if (dir === 'up' || dir === 'down') {
      gradient = `linear-gradient(180deg, ${baseColor}, ${secColor})`
      styles.backgroundSize = '100% 200%'
    } else {
      gradient = `linear-gradient(135deg, ${baseColor}, ${secColor})`
      styles.backgroundSize = '200% 200%'
    }
    styles.background = gradient
  } else if (lightingStore.config.effect === 'rain') {
    const dir = lightingStore.config.direction
    if (dir === 'left' || dir === 'right') {
      styles.background = `linear-gradient(90deg, ${secColor}, ${baseColor})`
      styles.backgroundSize = '200% 100%'
    } else if (dir === 'up' || dir === 'down') {
      styles.background = `linear-gradient(180deg, ${secColor}, ${baseColor})`
      styles.backgroundSize = '100% 200%'
    } else {
      styles.background = `linear-gradient(180deg, ${secColor}, ${baseColor})`
      styles.backgroundSize = '100% 200%'
    }
  } else if (lightingStore.config.effect === 'reactive') {
    styles.background = `radial-gradient(circle, ${baseColor}, ${secColor})`
  } else if (lightingStore.config.effect === 'breathing') {
    styles.background = baseColor
  }

  return styles
})

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
    if (lightingStore.importConfig(content)) {
      ElMessage.success('灯效配置导入成功')
    } else {
      ElMessage.error('灯效配置导入失败')
    }
  }
  reader.readAsText(file)
  target.value = ''
}

function exportConfig() {
  const content = lightingStore.exportConfig()
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'lighting-config.json'
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('灯效配置已导出')
}

onMounted(() => {
  lightingStore.loadFromStorage()
})
</script>

<style scoped>
.preset-item {
  transition: all 0.2s;
}

.effect-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preview-keyboard {
  transition: all 0.3s ease;
}

/* 呼吸效果 */
.effect-breathing {
  animation: breathing 2s ease-in-out infinite;
}
@keyframes breathing {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* 波浪效果 - 不同方向 */
.effect-wave.direction-left {
  animation: wave-left 2s linear infinite;
  background-size: 200% 100%;
}
.effect-wave.direction-right {
  animation: wave-right 2s linear infinite;
  background-size: 200% 100%;
}
.effect-wave.direction-up {
  animation: wave-up 2s linear infinite;
  background-size: 100% 200%;
}
.effect-wave.direction-down {
  animation: wave-down 2s linear infinite;
  background-size: 100% 200%;
}
@keyframes wave-left {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
@keyframes wave-right {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
@keyframes wave-up {
  0% { background-position: 0 100%; }
  100% { background-position: 0 -100%; }
}
@keyframes wave-down {
  0% { background-position: 0 -100%; }
  100% { background-position: 0 100%; }
}

/* 雨滴效果 - 不同方向 */
.effect-rain.direction-left {
  animation: rain-left 1.5s linear infinite;
  background-size: 200% 100%;
}
.effect-rain.direction-right {
  animation: rain-right 1.5s linear infinite;
  background-size: 200% 100%;
}
.effect-rain.direction-up {
  animation: rain-up 1.5s linear infinite;
  background-size: 100% 200%;
}
.effect-rain.direction-down {
  animation: rain-down 1.5s linear infinite;
  background-size: 100% 200%;
}
@keyframes rain-left {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}
@keyframes rain-right {
  0% { background-position: -100% 0; }
  100% { background-position: 100% 0; }
}
@keyframes rain-up {
  0% { background-position: 0 100%; }
  100% { background-position: 0 -100%; }
}
@keyframes rain-down {
  0% { background-position: 0 -100%; }
  100% { background-position: 0 100%; }
}

/* 响应效果 */
.effect-reactive {
  animation: reactive 0.5s ease-out infinite;
}
@keyframes reactive {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
</style>
