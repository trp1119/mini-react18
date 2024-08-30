import * as ReactWokTags from 'react-reconciler/src/ReactWokerTags'

const ReactWorkMap = new Map()
for (let tag in ReactWokTags) {
  ReactWorkMap.set(ReactWokTags[tag], tag)
}

export default function (prefix, workInProgress) {
  const tagValue = workInProgress.tag
  const tagName = ReactWorkMap.get(tagValue)
  let str = ` ${tagName} `
  if (tagName === 'HostComponent') {
    str += ` ${workInProgress.type}`
  } else if (tagName === 'HostText') {
    str += ` ${workInProgress.pendingProps}`
  }

  console.log(`${prefix} ${str}`)
}

let indent = { number: 0 }
export { indent }