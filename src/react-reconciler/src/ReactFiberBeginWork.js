
import { shouldSetTextContent } from "react-dom-bindings";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { FunctionComponent, HostComponent, HostRoot, HostText, IndeterminateComponent } from "./ReactWokerTags";
import logger, { indent } from "shared/logger";
import { renderWithHooks } from "./ReactFiberHooks";

/**
 * 根据新的虚拟DOM 生成新的 fiber 链表
 * @param {*} current 老 fiber
 * @param {*} workInProgress 新的子 fiber
 * @param {*} nextChildren 新子虚拟 DOM
 */
function reconcileChildren (current, workInProgress, nextChildren) {
  if (current === null) {
    // 无老fiber，新建
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren)
  } else {
    // 有老 fiber，dom-diff，老 fiber 链表与新子虚拟DOM更新
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren)
  }
}

function updateHostRoot(current, workInProgress) {
  processUpdateQueue(workInProgress) // workInProgress.memoized = { element }
  const nextState = workInProgress.memoizedState
  const nextChildren = nextState.element
  // 协调子节点 DOM-DIFF
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

/**
 * 构建原生组件的子 fiber 链表
 * @param {*} current 老 fiber
 * @param {*} workInProgress 新 fiber
 * @returns 
 */
function updateHostComponent(current, workInProgress) {
  const type = workInProgress
  const nextProps = workInProgress.pendingProps
  let nextChildren = nextProps.children
  // 是否是直接的文本节点
  const isDirectTextChild = shouldSetTextContent(type, nextProps)
  if (isDirectTextChild) {
    nextChildren = null
  }
  reconcileChildren(current, workInProgress, nextChildren)
  return workInProgress.child
}

/**
 * 挂载函数组件
 * @param {*} current 老组件
 * @param {*} workInProgress 新组建
 * @param {*} Component 函数类型，也就是函数组件的定义
 */
function mountIndeterminateComponent (current, workInProgress, Component) {
  const props = workInProgress.pendingProps
  const value = renderWithHooks(current, workInProgress, Component, props)

  workInProgress.tag = FunctionComponent
  reconcileChildren(current, workInProgress, value)
  return workInProgress.child
}

/**
 * 根据新的虚拟 DOM 构建新的 fiber 子链表
 * @param {*} current 老 fiber
 * @param {*} workInProgress 新 fiber
 */
export function beginWork (current, workInProgress) {
  logger(' '.repeat(indent.number) + 'beginWork', workInProgress)
  indent.number += 2
  switch (workInProgress.tag) {
    // 暂时不确定是函数组件还是类组件
    case IndeterminateComponent:
      return mountIndeterminateComponent(current, workInProgress, workInProgress.type)
    case HostRoot:
      return updateHostRoot(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress)
    case HostText:
      return null
    default:
      return null
  }
}