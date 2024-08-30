import { scheduleCallback } from "scheduler";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactFiberCompleteWork";
import { MutationMask, NoFlags } from "./ReactFiberFlags";
import { commitMutationEffectsOnFiber } from "./ReactFiberCommitWork";

let workInProgress = null

export function scheduleUpdateOnFiber (root) {
  // 确保调度执行 root 上的更新
  ensureRootIsScheduled(root)
}

function ensureRootIsScheduled (root) {
  // 浏览器执行 performConcurrentWorkOnRoot
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root))
}

/**
 * 工作循环，根据虚拟 dom，构建 fiber 树，创建真实 dom 节点，插入容器
 * @param {*} root 
 */
function performConcurrentWorkOnRoot (root) {
  // 已同步方式渲染根节点。
  // 初次渲染时，不论是并发模式还是异步模式，为保证页面快速渲染呈现给用户，都是同步的。
  renderRootSync(root)
  // 进入提交阶段，执行副作用，修改真实 DOM
  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  commitRoot(root)
}

function commitRoot (root) {
  const { finishedWork } = root
  // 判断子树是是否有副作用
  const subtreeHasEffects = (finishedWork.subtreeFlags & MutationMask) !== NoFlags
  // 自己有副作用
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags

  if (subtreeHasEffects || rootHasEffect) {
    commitMutationEffectsOnFiber(finishedWork, root)
  }
  // DOM 变更后，可以将 root 的 current 指向新 fiber
  root.current = finishedWork
}

function prepareFreshStack (root) {
  // 根据老 fiber 创建新 fiber，双缓存
  workInProgress = createWorkInProgress(root.current, null)
}

function workLoopSync () {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

function performUnitOfWork (unitOfWork) {
  // 获取新  fiber 对应的老 fiber(页面内容对应的 fiber)
  const current = unitOfWork.alternate
  const next = beginWork(current, unitOfWork)
  unitOfWork.memoizedProps = unitOfWork.pendingProps // 计划生效的属性变为已经生效的属性
  if (next === null) { // 没有子节点了，当前 fiber 已完成
    completeUnitOfWork(unitOfWork)
  } else { // 有子节点，让子节点成为下一个工作单元
    workInProgress = next
  }
}

function renderRootSync (root) {
  // 构建 fiber 树
  
  // 创建新栈
  prepareFreshStack(root)
  // 循环创建子 fiber
  workLoopSync()
}

function completeUnitOfWork (unitOfWork) {
  let completedWork = unitOfWork
  do {
    const current = completedWork.alternate
    const returnFiber = completedWork.return
    // 执行此 fiber 的完成工作
    completeWork(current, completedWork)
    const siblingFiber = completedWork.sibling
    if (siblingFiber !== null) {
      workInProgress = siblingFiber
      return
    }
    // 没有弟弟节点了，说明当前就是父 fiber 的最后一个节点
    completedWork = returnFiber
    workInProgress = completedWork
  } while (completedWork !== null) // 根 fiber 父 fiber 为 null，退出循环
}