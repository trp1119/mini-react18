import { appendChild } from "react-dom-bindings";
import { MutationMask, Placement } from "./ReactFiberFlags";
import { HostComponent, HostRoot, HostText } from "./ReactWokerTags";

function recursivelyTraverseMutationEffects(root, parentFiber) {
  if (parentFiber.subtreeFlags & MutationMask) {
    let { child } = parentFiber
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root)
      child = child.sibling
    }
  }
}

function isHostParent (fiber) {
  return fiber.tag === HostComponent || fiber.tag === HostRoot // funtion fiber 没有对应 dom 节点
}

function getHostParentFiber (fiber) {
  let parent = fiber.return
  while (parent !== null) {
    if (isHostParent(parent)) {
      return parent
    }
    parent = parent.return
  }
  return parent
}

/**
 * 将子节点对应的真实 dom 插入到父节点中
 * @param {*} node 将要插入的 fiber 节点
 * @param {*} parent 父 DOM 节点
 */
function insertOrAppendPlacementNode (node, before, parent) {
  const { tag } = node
  // 判断此 fiber 对应的节点是否是真实DOM 节点
  const isHost = tag === HostComponent || tag === HostText
  if (isHost) {
    const { stateNode } = node
    if (before) {
      insertBefore(parent, stateNode, before)
    } else {
      appendChild(parent, stateNode)
    }
  } else {  
    // node 不是真实DOM节点，获取其大儿子
    const { child } = node
    if (child !== null) {
      insertOrAppendPlacementNode(child, parent)
      let { sibling } = child
      while (sibling !== null) {
        insertOrAppendPlacementNode(sibling, parent)
        sibling = sibling.sibling
      }
    }
  }
}

/**
 * 找到可以查到它前面的弟fiber,将此fiber 对应的真实dom 插入到弟真实dom前
 * @param {*} fiber 
 */
function getHostSibling (fiber) {
  let node = fiber
  siblings: while(true) {
    while (node.sibling === null) {
      if (node.return === null || isHostParent(node.return)) {
        return null
      }
      node = node.return
    }
    node = node.sibling
    // 弟弟不是原生节点与文本节点
    while (node.tag !== HostComponent && node.tag !== HostText) {
      // 如果是要插入的新节点，找它弟弟
      if (node.flags & Placement) {
        continue siblings
      } else {
        node = node.child  
      }
    }
    if (!(node.flags & Placement)) { // 非插入
      return node.stateNode
    }
  }
}

/**
 * 将此 fiber 的真实 dom 插入到父 dom 中
 * @param {*} finishedWork 
 */
function commitPlacement (finishedWork) {
  console.log('finish', finishedWork)
  const parentFiber = getHostParentFiber(finishedWork)
  switch (parentFiber.tag) {
    case HostRoot: {
      const parent = parentFiber.stateNode.containerInfo
      const before = getHostSibling(finishedWork) // 获取最近的弟弟真实 DOM 节点
      insertOrAppendPlacementNode(finishedWork, before, parent)
      break
    }
    case HostComponent: {
      const parent = parentFiber.stateNode
      const before = getHostSibling(finishedWork)
      insertOrAppendPlacementNode(finishedWork, before, parent)
      break
    }
    default:
      break
  }

}

function commitReconcilationEffects(finishedWork) {
  const { flags } = finishedWork
  if (flags & Placement) {
    // 插入操作：将此 fiber 对应的真实 DOM 节点添加到父DOM节点
    commitPlacement(finishedWork)
    // 将 flags 中的 Placement 删除
    finishedWork.flags & ~Placement
  }
}

/**
 * 遍历 fiber 树，执行 fiber 上的副作用
 * @param {*} finishedWork fiber 节点
 * @param {*} root 根节点
 */
export function commitMutationEffectsOnFiber(finishedWork, root) {
  switch (finishedWork.tag) {
    case HostRoot:
    case HostComponent:
    case HostText:
      // 先遍历它们的子节点，处理子节点副作用
      recursivelyTraverseMutationEffects(root, finishedWork)
      // 再处理自身上的副作用
      commitReconcilationEffects(finishedWork)
      break
    default:
      break
  }
}