import { createFiberRoot } from "./ReactFiberRoot"
import { createUpdate, enqueueUpdate } from './ReactFiberClassUpdateQueue'
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop"

/**
 * 创建容器
 * @param {*} containerInfo 
 * @returns 
 */
export function createContainer (containerInfo) {
  return createFiberRoot(containerInfo)
}

/**
 * 更新容器
 * 将虚拟DOM 转变为真实dom，插入到容器中
 * @param {*} element 虚拟DOM
 * @param {*} container DOM容器 FiberRootNode -> .containerInfo -> div#root
 */
export function updateContainer (element, container) {
  // 根容器的 fiber
  const current = container.current

  // 创建更新
  const update = createUpdate()
  // 要更新的虚拟DOM
  update.payload = { element }
  // 将更新对象添加到根 fiber 的更新队列
  const root = enqueueUpdate(current, update)

  scheduleUpdateOnFiber(root)
}