import { createRoot } from 'react-dom/client'

const element = (<h1>
  hello <span style={{color: 'red'}}>world</span>
</h1>)

const root = createRoot(document.getElementById('root'))

// 将虚拟DOM渲染到页面容器
root.render(element)

console.log(root)