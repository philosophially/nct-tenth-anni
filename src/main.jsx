import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'

// Surface any uncaught JS error visibly on the dark page
window.addEventListener('error', (e) => {
  document.getElementById('root').innerHTML = `
    <div style="color:#C8E94B;background:#1a1008;padding:32px;font-family:monospace;font-size:13px;white-space:pre-wrap;min-height:100vh">
      <b>JS Error — paste this to Claude:</b>\n\n${e.message}\n\nFile: ${e.filename}:${e.lineno}:${e.colno}\n\n${e.error?.stack ?? ''}
    </div>`
})
window.addEventListener('unhandledrejection', (e) => {
  document.getElementById('root').innerHTML = `
    <div style="color:#C8E94B;background:#1a1008;padding:32px;font-family:monospace;font-size:13px;white-space:pre-wrap;min-height:100vh">
      <b>Unhandled Promise — paste this to Claude:</b>\n\n${e.reason}
    </div>`
})

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          color: '#C8E94B', background: '#1a1008', padding: '32px',
          fontFamily: 'monospace', fontSize: '13px', whiteSpace: 'pre-wrap', minHeight: '100vh',
        }}>
          <strong>Render error — paste this to Claude:</strong>
          {'\n\n'}{String(this.state.error)}{'\n'}{this.state.error?.stack}
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
