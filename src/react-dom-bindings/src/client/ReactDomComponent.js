import { setValueForStyles } from "./CssPropertyOperations"
import { setValueForProperty } from "./DomPropertyOperations"
import setTextContent from "./SetTextContent"

const STYLE = 'style'
const CHILDREN = 'children'

function setInitialDomProperties(tag, domElement, nextProps) {
  for (const propKey in nextProps) {
    if (nextProps.hasOwnProperty(propKey)) {
      const nextProp = nextProps[propKey]
      if (propKey === STYLE) {
        setValueForStyles(domElement, nextProp)
      } else if (propKey === CHILDREN) {
        if (typeof nextProp === 'string' || typeof nextProp === 'number') {
          setTextContent(domElement, `${nextProp}`)
        }
      } else if (nextProp !== null) {
        setValueForProperty(domElement, propKey, nextProp)
      }
    }
  }
}

export function setInitialProperties (domElement, tag, props) { 
  setInitialDomProperties(tag, domElement, props)
}