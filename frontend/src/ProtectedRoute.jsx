import { Navigate } from 'react-router-dom'

function ProtectedRoute({ children }) {
  // LocalStorage-il 'token' irukka nu paakkurom
  const token = localStorage.getItem('token')

  // Token illai endral, allathu 'undefined'/'null' endra thappana string-aaga irunthaal
  if (!token || token === 'undefined' || token === 'null') {
    // Token sari illai, Login page-ukku po (Redirect)
    return <Navigate to="/login" replace />
  }

  // Token irunthaal, ulla vidu (Children components)
  return children
}

export default ProtectedRoute