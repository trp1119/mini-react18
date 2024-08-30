import { createHostRootFiber } from "./ReactFiber"
import { initialUpdateQueue } from './ReactFiberClassUpdateQueue'

function FiberRootNode (containerInfo) {
  this.containerInfo = containerInfo // div#root
}

export function createFiberRoot (containerInfo) {
  const root = new FiberRootNode(containerInfo) // 真实DOM 节点

  const uninitializedFiber = createHostRootFiber() // 根fiber

  root.current = uninitializedFiber // current 当前页面渲染的 fiber 树
  uninitializedFiber.stateNode = root // 根fiber 的 stateNode 指向真实 DOM 节点

  initialUpdateQueue(uninitializedFiber)

  return root
}