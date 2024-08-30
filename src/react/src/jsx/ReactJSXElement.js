
import { REACT_ELEMENT_TYPE } from 'shared/ReactSymbols'
import hasOwnProperty from 'shared/hasOwnProperty'

// 不会放到 props 上的属性
const RESOLVED_PRPPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
}

function hasValidKey (config) {
  return config.key !== undefined
}

function hasValidRef (config) {
  return config.ref !== undefined
}

// 工厂函数
function ReactElement(type, key, ref, props) {
  return { // 虚拟DOM
    $$typeof: REACT_ELEMENT_TYPE, // 表示此虚拟DOM 类型是一个 react 元素
    type,
    key,
    ref,
    props
  }
}

export function jsxDEV (type, config) {
  let propName // 属性名
  const props = {} // 属性对象
  let key = null // 每个虚拟DOM 都有可选的 key，用于后续 diff
  let ref = null // 引用，可以通过这个获取真实 DOM

  if (hasValidKey(config)) {
    key = config.key
  }

  if (hasValidRef(config)) {
    ref = config.ref
  }

  for (propName in config) {
    // 拷贝自身属性，排除原型链属性
    // call 避免原型污染
    if (hasOwnProperty.call(config, propName) && !RESOLVED_PRPPS.hasOwnProperty(propName)) {
      props[propName] = config[propName]
    }
  }

  return ReactElement(type, key, ref, props)
}