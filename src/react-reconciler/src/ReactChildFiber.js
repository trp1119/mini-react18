import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols"
import { createFiberFromElement, createFiberFromText } from "./ReactFiber"
import { Placement } from "./ReactFiberFlags"
import isArray from "shared/isArray"

/**
 * 
 * @param {*} shouldTrackSideEffects 是否跟踪副作用（是否比较）
 * 函数工厂
 */
function createChildReconciler (shouldTrackSideEffects) {

  function reconcileSingleElement (returnFiber, currentFirstFiber, element) {
    // 根据虚拟DOM 创建 fiber
    const created = createFiberFromElement(element)
    created.return = returnFiber
    return created
  }

  /**
   * 设置副作用
   * @param {*} newFiber 
   */
  function placeSingleChild (newFiber) {
    if (shouldTrackSideEffects) {
      // flag 为 Placement，说明此节点在最后提交阶段需要创建真实DOM插入到父容器中
      // 如果 fiber 是初次挂载，shouldTrackSideEffects 为 false，此时为 placement flags，那么子节点如何渲染的呢？
      // 这种情况会在完成阶段将所有子节点全部添加到自己身上

      newFiber.flags |= Placement
    }
    return newFiber
  }

  function createChild (returnFiber, newChild) {
    if ((typeof newChild === 'string' && newChild !== '') || typeof newChild === 'number') {
      const created = createFiberFromText(`${newChild}`)
      created.return = returnFiber // 新子 fiber 的 return 指向父 fiber
      return created
    }
    if (typeof newChild === 'object' && newChild !== null) {
      switch (newChild.$$typeof) {
        case REACT_ELEMENT_TYPE:
        const created = createFiberFromElement(newChild)
        created.return = returnFiber
        return created
        default:
          break
      }
    }
    return null
  }

  function placeChild (newFiber, newIndex) {
    newFiber.index = newIndex
    if (shouldTrackSideEffects) {
      newFiber.flags |= Placement
    }
  }
 
  function reconcileChildrenArray (returnFiber, currentFirstFiber, newChild) {
    let resultingFirstChild = null // 返回的第一个新儿子
    let previousNewFiber = null // 上一个新 fiber
    let newIndex = 0
    for (;newIndex < newChild.length; newIndex++) {
      const newFiber = createChild(returnFiber, newChild[newIndex])
      if (newFiber === null) continue
      placeChild(newFiber, newIndex)
      // 生成链表
      if (previousNewFiber === null) {
        resultingFirstChild = newFiber
      } else {
        previousNewFiber.sibling = newFiber
      }
      previousNewFiber = newFiber
    }

    return resultingFirstChild
  }

  /**
   * 协调子 fibers
   * @param {*} returnFiber 新的父 fiber
   * @param {*} currentFiber 老 fiber 的第一个子fiber
   * @param {*} newChild 新的子虚拟 DOM
   */
  function reconcileChildFibers (returnFiber, currentFirstFiber, newChild) {
    if (typeof newChild === 'object' && newChild !== null) {
        switch (newChild.$$typeof) {
          case REACT_ELEMENT_TYPE:
            return placeSingleChild(reconcileSingleElement(returnFiber, currentFirstFiber, newChild))
          default:
            break
        }
    }
    if (isArray(newChild)) {
      return reconcileChildrenArray(returnFiber, currentFirstFiber, newChild)
    }
    return null
  }
  return reconcileChildFibers
}

export const mountChildFibers = createChildReconciler(false)

export const reconcileChildFibers = createChildReconciler(true)