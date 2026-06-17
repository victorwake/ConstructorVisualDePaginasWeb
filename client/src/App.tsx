import { Sidebar } from './components/sidebar/Sidebar'
import { Canvas } from './components/canvas/Canvas'

function App() {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      <Sidebar />
      <Canvas />
    </div>
  )
}

export default App
