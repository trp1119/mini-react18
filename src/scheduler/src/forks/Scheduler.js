export function scheduleCallback (callback) {
  // 浏览器空闲时执行回调
  requestIdleCallback(callback)
}