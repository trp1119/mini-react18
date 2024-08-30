import logger, { indent } from "shared/logger";
import { HostComponent, HostRoot, HostText } from "./ReactWokerTags";
import { createTextInstance, createInstance, appendInitialChild, finalizeInitialChildren } from "react-dom-bindings";
import { NoFlags } from "./ReactFiberFlags";

/**
 * 将当前完成所有子 fiber 的真实 dom 挂载到当前父DOM 节点上
 * @param {*} parent 当前完成fiber 的真实 dom 节点
 * @param {*} workInProgress 当前完成的 fiber
 */
function appendAllChildren (parent, workInProgress) {
  let node = workInProgress.child
  while (node) {
    if (node.tag === HostComponent || node.tag === HostText) {
      // 原生 dom 或文本节点直接通过 dom 方法添加
      appendInitialChild(parent, node.stateNode)
    } else if (node.child !== null) {
      // 函数组件（函数组件会返回虚拟dom）
      // 注意：parent -> function -> function -> div，parent 的儿子是 div，funtion 在虚拟DOM中没有节点，在fiber 树中有
      node = node.child
      continue
    }
    if (node === workInProgress) {
      return
    }
    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return
      }
      // 回到父节点
      node = node.return
    }
    node = node.sibling 
  }
}

/**
 * 完成一个 fiber 节点
 * @param {*} current 老 fiber
 * @param {*} workInProgress 新构建的 fiber
 */
export function completeWork (current, workInProgress) {
  indent.number -= 2
  logger(' '.repeat(indent.number) + 'completed', workInProgress)

  const newProps = workInProgress.pendingProps
  switch (workInProgress.tag) {
    case HostRoot:
      bubbleProperties(workInProgress)
      break
    case HostComponent:
      // 创建真实 DOM 节点
      const { type } = workInProgress
      const instance = createInstance(type, newProps, workInProgress)
      workInProgress.stateNode = instance
      // 将所有子节点加到自己身上
      appendAllChildren(instance, workInProgress)
      finalizeInitialChildren(instance, type, newProps)
      bubbleProperties(workInProgress)
      break
    case HostText:
      // 如果完成的 fiber 是文本，则创建真实的文本节点
      const newText = newProps
      workInProgress.stateNode = createTextInstance(newText)
      // 向上冒泡副作用
      bubbleProperties(workInProgress)
      break
  }
}

function bubbleProperties(completedWork) {
  let subtreeFlags = NoFlags
  // 遍历当前 fiber 的所有子节点，将所有子节点的副作用，以及子节点的子节点的副作用都合并起来
  let child = completedWork.child
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags
    subtreeFlags |= child.flags
    child = child.sibling
  }
  completedWork.subtreeFlags = subtreeFlags
}