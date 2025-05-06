import { BrowserRouter as Router, useRoutes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import routes from './routes'
import { Toaster } from 'react-hot-toast'
import AutoLogoutWrapper from './components/AutoLogoutWrapper'

function AppRoutes() {
  return useRoutes(routes)
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-center" reverseOrder={false} />
        <AutoLogoutWrapper>
          <AppRoutes />
        </AutoLogoutWrapper>
      </Router>
    </AuthProvider>
  )
}

export default App
