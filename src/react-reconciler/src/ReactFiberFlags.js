// 无操作
export const NoFlags = 0b00000000000000000000000000000000 // 0
// 插入
export const Placement = 0b00000000000000000000000000000010 // 2
// 更新
export const Update = 0b00000000000000000000000000000100 // 4
// 子节点删除
export const ChildDeletion = 0b00000000000000000000000000001000 // 8

export const MutationMask = Placement | Update