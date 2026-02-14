import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface DeviceInfo {
  name: string
  vendorId: number
  productId: number
  serialNumber: string
}

export const useDeviceStore = defineStore('device', () => {
  const connected = ref(false)
  const connectionType = ref<'usb' | 'bluetooth' | null>(null)
  const deviceInfo = ref<DeviceInfo | null>(null)
  const firmwareVersion = ref<string | null>(null)
  const usbDevice = ref<USBDevice | null>(null)
  const bluetoothDevice = ref<BluetoothDevice | null>(null)

  // 检查USB API是否可用
  function isUSBSupported(): boolean {
    return 'usb' in navigator
  }

  // 检查蓝牙API是否可用
  function isBluetoothSupported(): boolean {
    return 'bluetooth' in navigator
  }

  // USB连接
  async function connectUSB(): Promise<{ success: boolean; error?: string }> {
    if (!isUSBSupported()) {
      return { success: false, error: '您的浏览器不支持WebUSB，请使用Chrome或Edge浏览器' }
    }

    try {
      const device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x1234 }] // TODO: 替换为实际的vendorId
      })
      await device.open()
      if (device.configuration === null) {
        await device.selectConfiguration(1)
      }
      await device.claimInterface(0)

      usbDevice.value = device
      connected.value = true
      connectionType.value = 'usb'
      deviceInfo.value = {
        name: device.productName || 'USB Keyboard',
        vendorId: device.vendorId,
        productId: device.productId,
        serialNumber: device.serialNumber || ''
      }

      return { success: true }
    } catch (error: any) {
      console.error('USB连接失败:', error)
      if (error.name === 'NotFoundError') {
        return { success: false, error: '未找到USB设备，请确保键盘已连接' }
      }
      return { success: false, error: error.message || 'USB连接失败' }
    }
  }

  // 蓝牙连接
  async function connectBluetooth(): Promise<{ success: boolean; error?: string }> {
    if (!isBluetoothSupported()) {
      return { success: false, error: '您的浏览器不支持WebBluetooth，请使用Chrome或Edge浏览器' }
    }

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['keyboard'] }], // TODO: 替换为实际的服务UUID
        optionalServices: ['battery_service', 'device_information']
      })

      const server = await device.gatt?.connect()

      bluetoothDevice.value = device
      connected.value = true
      connectionType.value = 'bluetooth'
      deviceInfo.value = {
        name: device.name || 'Bluetooth Keyboard',
        vendorId: 0,
        productId: 0,
        serialNumber: device.id
      }

      device.addEventListener('gattserverdisconnected', () => {
        disconnect()
      })

      return { success: true }
    } catch (error: any) {
      console.error('蓝牙连接失败:', error)
      if (error.name === 'NotFoundError') {
        return { success: false, error: '未找到蓝牙设备，请确保键盘蓝牙已开启' }
      }
      if (error.name === 'SecurityError') {
        return { success: false, error: '蓝牙访问被拒绝，请授予设备权限' }
      }
      return { success: false, error: error.message || '蓝牙连接失败' }
    }
  }

  // 断开连接
  function disconnect() {
    if (usbDevice.value) {
      try {
        usbDevice.value.releaseInterface(0)
        usbDevice.value.close()
      } catch (e) {
        // 忽略关闭错误
      }
      usbDevice.value = null
    }

    if (bluetoothDevice.value) {
      try {
        bluetoothDevice.value.gatt?.disconnect()
      } catch (e) {
        // 忽略断开错误
      }
      bluetoothDevice.value = null
    }

    connected.value = false
    connectionType.value = null
    deviceInfo.value = null
    firmwareVersion.value = null
  }

  // 发送数据到设备
  async function sendData(data: Uint8Array): Promise<boolean> {
    if (!connected.value || !usbDevice.value) {
      return false
    }

    try {
      await usbDevice.value.transferOut(1, data)
      return true
    } catch (error) {
      console.error('发送数据失败:', error)
      return false
    }
  }

  // 监听USB设备连接变化
  function initUSBListener() {
    if (!navigator.usb) return

    navigator.usb.addEventListener('connect', (event) => {
      console.log('USB设备连接:', event)
    })

    navigator.usb.addEventListener('disconnect', (event) => {
      console.log('USB设备断开:', event)
      if (usbDevice.value === event.device) {
        disconnect()
      }
    })
  }

  return {
    connected,
    connectionType,
    deviceInfo,
    firmwareVersion,
    usbDevice,
    bluetoothDevice,
    connectUSB,
    connectBluetooth,
    disconnect,
    sendData,
    initUSBListener
  }
})
