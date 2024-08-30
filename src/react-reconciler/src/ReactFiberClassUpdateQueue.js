import assign from "shared/assign"
import { makeUpdateLaneFromFiberToRoot } from "./ReactFiberConcurrentUpdates"

export const UpdateState = 0

export function initialUpdateQueue (fiber) {
  // 更新队列
  const queue = {
    shared: {
      pending: null // 等待生效的队列，循环链表
    }
  }
  fiber.updateQueue = queue
}

export function createUpdate () {
  const update = { tag: UpdateState }
  return update
}

export function enqueueUpdate (fiber, update) {
  const updateQueue = fiber.updateQueue
  const pending = updateQueue.shared.pending

  // 单向循环链表
  if (pending === null) { // 处于初始化状态
    update.next = update
  } else {
    update.next = pending.next // 最后一个更新 next 指向第一个更新
    pending.next = update
  }
  updateQueue.shared.pending = update // pending 永远指向最后一个更新

    // 标记更新赛道
   return makeUpdateLaneFromFiberToRoot(fiber)
}

/**
 * 根据老状态和更新队列中的更新，更新新状态
 * @param {*} workInProgress 要计算的 fiber
 */
export function processUpdateQueue (workInProgress) {
  const queue = workInProgress.updateQueue // 更新队列
  const pendingQueue = queue.shared.pending

  // 有更新/更新队列中有内容
  if (pendingQueue !== null) {
    // 清除等待生效的更新
    queue.shared.pending = null

    // 得到最后一个更新
    const lastPendingUpdate = pendingQueue // { payload: { element } }
    // 得到第一个更新
    const firstPendingUpdate = lastPendingUpdate.next
    // 剪开更新链表，得到单链表
    lastPendingUpdate.next = null

    // 获取老状态
    let newState = workInProgress.memoizedState
    let update = firstPendingUpdate

    while (update) {
      // 根据老状态和更新计算新状态
      newState = getStateFromUpdate(update, newState)
      update = update.next
    }

    // 将最终计算的状态赋值给 memoizedState
    workInProgress.memoizedState = newState
  }
}

function getStateFromUpdate (update, prevState) {
  switch (update.tag) {
    case UpdateState:
      const { payload } = update
      return assign({}, prevState, payload)
  }
}