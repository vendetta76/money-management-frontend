import { BrowserRouter as Router, useRoutes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import routes from './routes'
import { Toaster } from 'react-hot-toast'

function AppRoutes() {
  return useRoutes(routes)
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  )
}

export default App
