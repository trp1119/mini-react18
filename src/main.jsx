import { createRoot } from 'react-dom/client'

function FunctionComponent () {
  return (<h1>
    hello <span style={{color: 'red'}}>world</span>
  </h1>)
}

const element = <FunctionComponent />
// old const element = React.createElement(FunctionComponent)
// new const element = jsx(FunctionComponent)

const root = createRoot(document.getElementById('root'))

// 将虚拟DOM渲染到页面容器
root.render(element)

console.log(root)