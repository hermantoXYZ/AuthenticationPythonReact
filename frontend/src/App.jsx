import react from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
// import Register from "./pages/Register" [saya tutup untuk register]
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"
import DashboardHome from "./pages/Dashboard/DashboardHome"


function Logout() {
  localStorage.clear()
  return <Navigate to="/login" />
}

// function RegisterAndLogout() {
//   localStorage.clear()
//   return <Register />
// }

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route
          path="/dashboard/note"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
           <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardHome />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* <Route path="/register" element={<RegisterAndLogout />} /> */}
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App