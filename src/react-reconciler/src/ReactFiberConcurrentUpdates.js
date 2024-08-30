import { HostRoot } from "./ReactWokerTags"

/**
 * 向上找到根节点
 * 处理优先级
 */
export function makeUpdateLaneFromFiberToRoot (sourceFiber) {
  let node = sourceFiber // 当前 fiber
  let parent = sourceFiber.return // 当前 fiber 父 fiber

  if (parent !== null) {
    node = parent
    parent = parent.return
  }

  if (node.tag === HostRoot) {
    return node.stateNode
  }
  return null
}