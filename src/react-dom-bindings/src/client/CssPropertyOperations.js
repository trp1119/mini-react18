/**
 * 
 * @param {*} domElement 
 * @param {*} styles { color: 'red' }
 */
export function setValueForStyles(domElement, styles) {
  const { style } = domElement
  for (const styleName in styles) {
    if (styles.hasOwnProperty(styleName)) {
      const styleValue = styles[styleName]
      style[styleName] = styleValue
    }
  }
}