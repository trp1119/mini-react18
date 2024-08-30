// 每种虚拟 DOM 都有对应的 fiber tag

// 函数组件
export const FunctionComponent = 0
// 类组件
export const ClassComponent = 1
// 初始创建 fiber 时不确定组件类型
export const IndeterminateComponent = 2
// 根节点 fiber 的 tag
export const HostRoot = 3
// 原生组件
export const HostComponent = 5
// 纯文本节点
export const HostText = 6