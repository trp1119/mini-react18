import { HostComponent, HostRoot, HostText, IndeterminateComponent } from "./ReactWokerTags";
import { NoFlags } from "./ReactFiberFlags";

/**
 * 
 * @param {*} tag Fiber 类型 函数组件0 类组件1 原生组件5 根元素3
 * @param {*} pendingProps 等待处理或生效的属性
 * @param {*} key 唯一标识
 */
function FiberNode (tag, pendingProps, key) {
  this.tag = tag
  this.key = key
  this.type = null // 虚拟节点的 type，div span
  this.stateNode = null // 此 fiber 对应的真实DOM节点

  this.return = null // 指向父节点
  this.child = null // 指向子节点
  this.sibling = null // 指向弟节点

  this.pendingProps = pendingProps // 等待生效的属性
  this.memoizedProps = null // 已生效的属性

  this.memoizedState = null // fiber 状态

  this.updateQueue = null // 更新队列

  this.flags = NoFlags // 副作用标识，表示对 fiber 节点进行何种操作
  this.subtreeFlags = NoFlags // 子节点对应的副作用标识

  this.alternate = null // 轮替的替身

  this.index = 0
}

export function createFiber (tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key)
}

export function createHostRootFiber () {
  return createFiber(HostRoot, null, null)
}

/**
 *  根据老 fiber 和新属性创建新fiber
 * @param {*} current 老 fiber
 * @param {*} pendingProps 新属性
 */
export function createWorkInProgress (current, pendingProps) {
  let workInProgress = current.alternate // 拿到轮替
  if (workInProgress === null) {
    // 没有轮替则创建新 fiber
    workInProgress = createFiber(current.tag, pendingProps, current.key)
    // 拷贝老 fiber 数据
    workInProgress.type = current.type
    workInProgress.stateNode = current.stateNode
    // 双向指针
    workInProgress.alternate = current
    current.alternate = workInProgress
  } else {
    // 更新
    workInProgress.pendingProps = pendingProps

    workInProgress.type = current.type
    workInProgress.flags = NoFlags
    workInProgress.subtreeFlags = NoFlags
  }

  workInProgress.child = current.child
  workInProgress.memoizedProps = current.memoizedProps
  workInProgress.memoizedState = current.memoizedState
  workInProgress.updateQueue = current.updateQueue
  workInProgress.sibling = current.sibling
  workInProgress.index = current.index

  return workInProgress
}

export function createFiberFromElement (element) {
  const { type, key, props: pendingProps } = element
  // 根据类型和属性创建 fiber
  return createFiberFromTypeAndProps(type, key, pendingProps)
}

function createFiberFromTypeAndProps (type, key, pendingProps) {
  let tag = IndeterminateComponent
  if (typeof type === 'string') {
    // type => string，即 div span，说明 fiber 类型是一个原生组件
    tag = HostComponent
  }
  const fiber = createFiber(tag, pendingProps, key)
  fiber.type = type
  return fiber
}

export function createFiberFromText (content) {
  const fiber = createFiber(HostText, content, null)
  return fiber
}