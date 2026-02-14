<template>
  <div class="keyboard-canvas" :class="`layout-${layout}`">
    <div class="keyboard" :style="keyboardStyle">
      <div
        v-for="(key, index) in layoutKeys"
        :key="index"
        class="key"
        :class="[
          `key-${key.width || 1}`,
          { selected: selectedKey === key.key }
        ]"
        :style="getKeyStyle(key)"
        @click="$emit('selectKey', key.key)"
      >
        <span class="key-label">{{ getKeyLabel(key.key) }}</span>
        <span v-if="getMapping(key.key)" class="key-action">
          {{ getActionLabel(getMapping(key.key)) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KeyAction } from '@/stores/keymap'

interface LayoutKey {
  key: string
  row: number
  col: number
  width?: number
}

interface Props {
  layout: string
  mappings: Record<string, KeyAction>
  selectedKey?: string | null
}

const props = defineProps<Props>()
defineEmits<{
  selectKey: [key: string]
}>()

// 键盘布局定义
const layoutConfigs: Record<string, LayoutKey[]> = {
  '60': [
    // 第一行
    { key: 'Esc', row: 0, col: 0, width: 1 },
    { key: '1', row: 0, col: 1 }, { key: '2', row: 0, col: 2 }, { key: '3', row: 0, col: 3 },
    { key: '4', row: 0, col: 4 }, { key: '5', row: 0, col: 5 }, { key: '6', row: 0, col: 6 },
    { key: '7', row: 0, col: 7 }, { key: '8', row: 0, col: 8 }, { key: '9', row: 0, col: 9 },
    { key: '0', row: 0, col: 10 }, { key: '-', row: 0, col: 11 }, { key: '=', row: 0, col: 12 },
    { key: 'Backspace', row: 0, col: 13, width: 2 },
    // 第二行
    { key: 'Tab', row: 1, col: 0, width: 1.5 },
    { key: 'Q', row: 1, col: 1.5 }, { key: 'W', row: 1, col: 2.5 }, { key: 'E', row: 1, col: 3.5 },
    { key: 'R', row: 1, col: 4.5 }, { key: 'T', row: 1, col: 5.5 }, { key: 'Y', row: 1, col: 6.5 },
    { key: 'U', row: 1, col: 7.5 }, { key: 'I', row: 1, col: 8.5 }, { key: 'O', row: 1, col: 9.5 },
    { key: 'P', row: 1, col: 10.5 }, { key: '[', row: 1, col: 11.5 }, { key: ']', row: 1, col: 12.5 },
    { key: '\\', row: 1, col: 13.5, width: 1.5 },
    // 第三行
    { key: 'CapsLock', row: 2, col: 0, width: 1.75 },
    { key: 'A', row: 2, col: 1.75 }, { key: 'S', row: 2, col: 2.75 }, { key: 'D', row: 2, col: 3.75 },
    { key: 'F', row: 2, col: 4.75 }, { key: 'G', row: 2, col: 5.75 }, { key: 'H', row: 2, col: 6.75 },
    { key: 'J', row: 2, col: 7.75 }, { key: 'K', row: 2, col: 8.75 }, { key: 'L', row: 2, col: 9.75 },
    { key: ';', row: 2, col: 10.75 }, { key: "'", row: 2, col: 11.75 },
    { key: 'Enter', row: 2, col: 12.75, width: 2.25 },
    // 第四行
    { key: 'Shift', row: 3, col: 0, width: 2.25 },
    { key: 'Z', row: 3, col: 2.25 }, { key: 'X', row: 3, col: 3.25 }, { key: 'C', row: 3, col: 4.25 },
    { key: 'V', row: 3, col: 5.25 }, { key: 'B', row: 3, col: 6.25 }, { key: 'N', row: 3, col: 7.25 },
    { key: 'M', row: 3, col: 8.25 }, { key: ',', row: 3, col: 9.25 }, { key: '.', row: 3, col: 10.25 },
    { key: '/', row: 3, col: 11.25 },
    { key: 'Shift', row: 3, col: 12.25, width: 2.75 },
    // 第五行
    { key: 'Ctrl', row: 4, col: 0, width: 1.25 }, { key: 'Win', row: 4, col: 1.25, width: 1.25 },
    { key: 'Alt', row: 4, col: 2.5, width: 1.25 },
    { key: 'Space', row: 4, col: 3.75, width: 6.25 },
    { key: 'Alt', row: 4, col: 10, width: 1.25 }, { key: 'Win', row: 4, col: 11.25, width: 1.25 },
    { key: 'Menu', row: 4, col: 12.25, width: 1.25 }, { key: 'Ctrl', row: 4, col: 13.5, width: 1.25 }
  ],
  '65': [
    // 65%配列（带方向键）
    { key: 'Esc', row: 0, col: 0 },
    { key: '1', row: 0, col: 1 }, { key: '2', row: 0, col: 2 }, { key: '3', row: 0, col: 3 },
    { key: '4', row: 0, col: 4 }, { key: '5', row: 0, col: 5 }, { key: '6', row: 0, col: 6 },
    { key: '7', row: 0, col: 7 }, { key: '8', row: 0, col: 8 }, { key: '9', row: 0, col: 9 },
    { key: '0', row: 0, col: 10 }, { key: '-', row: 0, col: 11 }, { key: '=', row: 0, col: 12 },
    { key: 'Backspace', row: 0, col: 13, width: 2 },
    { key: 'Home', row: 0, col: 15 },
    // 第二行
    { key: 'Tab', row: 1, col: 0, width: 1.5 },
    { key: 'Q', row: 1, col: 1.5 }, { key: 'W', row: 1, col: 2.5 }, { key: 'E', row: 1, col: 3.5 },
    { key: 'R', row: 1, col: 4.5 }, { key: 'T', row: 1, col: 5.5 }, { key: 'Y', row: 1, col: 6.5 },
    { key: 'U', row: 1, col: 7.5 }, { key: 'I', row: 1, col: 8.5 }, { key: 'O', row: 1, col: 9.5 },
    { key: 'P', row: 1, col: 10.5 }, { key: '[', row: 1, col: 11.5 }, { key: ']', row: 1, col: 12.5 },
    { key: '\\', row: 1, col: 13.5, width: 1.5 },
    { key: 'PgUp', row: 1, col: 15 },
    // 第三行
    { key: 'CapsLock', row: 2, col: 0, width: 1.75 },
    { key: 'A', row: 2, col: 1.75 }, { key: 'S', row: 2, col: 2.75 }, { key: 'D', row: 2, col: 3.75 },
    { key: 'F', row: 2, col: 4.75 }, { key: 'G', row: 2, col: 5.75 }, { key: 'H', row: 2, col: 6.75 },
    { key: 'J', row: 2, col: 7.75 }, { key: 'K', row: 2, col: 8.75 }, { key: 'L', row: 2, col: 9.75 },
    { key: ';', row: 2, col: 10.75 }, { key: "'", row: 2, col: 11.75 },
    { key: 'Enter', row: 2, col: 12.75, width: 2.25 },
    { key: 'PgDn', row: 2, col: 15 },
    // 第四行
    { key: 'Shift', row: 3, col: 0, width: 2.25 },
    { key: 'Z', row: 3, col: 2.25 }, { key: 'X', row: 3, col: 3.25 }, { key: 'C', row: 3, col: 4.25 },
    { key: 'V', row: 3, col: 5.25 }, { key: 'B', row: 3, col: 6.25 }, { key: 'N', row: 3, col: 7.25 },
    { key: 'M', row: 3, col: 8.25 }, { key: ',', row: 3, col: 9.25 }, { key: '.', row: 3, col: 10.25 },
    { key: '/', row: 3, col: 11.25 },
    { key: 'Shift', row: 3, col: 12.25, width: 1.75 },
    { key: 'Up', row: 3, col: 14 },
    { key: 'End', row: 3, col: 15 },
    // 第五行
    { key: 'Ctrl', row: 4, col: 0, width: 1.25 }, { key: 'Win', row: 4, col: 1.25, width: 1.25 },
    { key: 'Alt', row: 4, col: 2.5, width: 1.25 },
    { key: 'Space', row: 4, col: 3.75, width: 6.25 },
    { key: 'Alt', row: 4, col: 10, width: 1.25 }, { key: 'Win', row: 4, col: 11.25, width: 1.25 },
    { key: 'Fn', row: 4, col: 12.25, width: 1.25 },
    { key: 'Left', row: 4, col: 13.25 }, { key: 'Down', row: 4, col: 14 }, { key: 'Right', row: 4, col: 15 }
  ]
}

const layoutKeys = computed(() => {
  return layoutConfigs[props.layout] || layoutConfigs['60']
})

const keyboardStyle = computed(() => {
  const maxCol = Math.max(...layoutKeys.value.map(k => k.col + (k.width || 1)))
  const keySize = 50
  const keyGap = 4
  const width = maxCol * (keySize + keyGap)
  return {
    width: `${width}px`,
    position: 'relative'
  }
})

function getKeyStyle(key: LayoutKey) {
  const keySize = 50
  const keyGap = 4
  const width = key.width || 1

  return {
    position: 'absolute',
    left: `${key.col * (keySize + keyGap)}px`,
    top: `${key.row * (keySize + keyGap)}px`,
    width: `${width * keySize + (width - 1) * keyGap}px`,
    height: `${keySize}px`
  }
}

function getKeyLabel(key: string): string {
  const labels: Record<string, string> = {
    'Backspace': '←',
    'Space': '',
    'CapsLock': 'Caps',
    'Enter': '↵',
    'Tab': 'Tab',
    'Shift': '⇧',
    'Ctrl': 'Ctrl',
    'Win': '⊞',
    'Alt': 'Alt',
    'Escape': 'Esc',
    'Esc': 'Esc'
  }
  return labels[key] || key
}

function getMapping(key: string): KeyAction | null {
  return props.mappings[key] || null
}

function getActionLabel(action: KeyAction): string {
  if (action.type === 'key') return String(action.value)
  if (action.type === 'fn') return String(action.value)
  if (action.type === 'macro') return 'M'
  if (action.type === 'layer') return `MO(${action.value})`
  if (action.type === 'none') return '✕'
  return ''
}
</script>

<style scoped>
.keyboard-canvas {
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
  display: inline-block;
}

.key {
  background: linear-gradient(145deg, #f0f0f0, #e0e0e0);
  border: 1px solid #ccc;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.key:hover {
  background: linear-gradient(145deg, #e8e8e8, #d8d8d8);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.key.selected {
  background: linear-gradient(145deg, #409eff, #337ecc);
  border-color: #337ecc;
  color: white;
  box-shadow: 0 0 10px rgba(64, 158, 255, 0.5);
}

.key-label {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.key.selected .key-label {
  color: white;
}

.key-action {
  font-size: 10px;
  color: #666;
  margin-top: 2px;
}

.key.selected .key-action {
  color: rgba(255, 255, 255, 0.8);
}
</style>
