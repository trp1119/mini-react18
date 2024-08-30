/**
 * 更新队列
 */


/**
 * 队列初始化
 * @param {*} fiber 
 */
function initialUpdateQueue (fiber) {
  const queue = {
    shared: {
      pending: null
    }
  }
  fiber.updateQueue = queue // 每个 fiber 上有有一个更新队列，更新队列是循环链表
}

/**
 * 创建更新
 */
function createUpdate () {
  return {}
}

/**
 * 将更新加入队列
 */
function enqueueUpdate (fiber, update) {
  const updateQueue = fiber.updateQueue
  const shared = updateQueue.shared
  const pending = shared.pending

  if (pending === null) {
    update.next = update
  } else {
    // 更新队列不为空，取出第一个更新
    update.next = pending.next // 最后一个更新指向第一个更新
    pending.next = update
  }
  updateQueue.shared.pending = update // pending 指向最后一个更新
}

/**
 * 处理更新队列
 */
function processUpdateQueue (fiber) {
  const queue = fiber.updateQueue
  const pending = queue.shared.pending
  if (pending !== null) { // 有更新
    queue.shared.pending = null // 清空
    const lastPendingUpdate = pending
    const firstPendingUpdate = pending.next
    lastPendingUpdate.next = null // 剪开环装链表，方便单向循环

    let newState = fiber.memoizedState
    let update = firstPendingUpdate
    while(update) {
      newState = getStateFromUpdate(update, newState)
      update = update.next
    }
    fiber.memoizedState = newState
  }
}

function getStateFromUpdate (update, newState) {
  return Object.assign({}, newState, update.payload)
}

// fiber 示例
const fiber = { memoizedState: { id: 1 } }
initialUpdateQueue(fiber)

// 进行更新
const update1 = createUpdate()
update1.payload = { name: 'zhangsan' }
enqueueUpdate(fiber, update1)

const update2 = createUpdate()
update2.payload = { age: 18 }
enqueueUpdate(fiber, update2)

// 处理更新
processUpdateQueue(fiber)

console.log(fiber.memoizedState)