import { BrowserRouter as Router, useRoutes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import routes from './routes'

function AppRoutes() {
  return useRoutes(routes)
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
