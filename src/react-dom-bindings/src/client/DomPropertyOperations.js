export function setValueForProperty (node, name, value) {
  if (value === null) {
    node.removeAttribute(name)
  }
  domElement.setAttribute(name, value)
}