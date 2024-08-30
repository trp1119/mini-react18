
import { shouldSetTextContent } from "react-dom-bindings";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { HostComponent, HostRoot, HostText } from "./ReactWokerTags";
import logger, { indent } from "shared/logger";

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
 * 根据新的虚拟 DOM 构建新的 fiber 子链表
 * @param {*} current 老 fiber
 * @param {*} workInProgress 新 fiber
 */
export function beginWork (current, workInProgress) {
  logger(' '.repeat(indent.number) + 'beginWork', workInProgress)
  indent.number += 2
  switch (workInProgress.tag) {
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