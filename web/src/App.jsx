import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'

// layouts
import AdminLayout from './layouts/AdminLayout'
import MainLayout from './layouts/MainLayout'

// public pages
import Home from './pages/user/Home'
import Doctors from './pages/user/Doctors'
import About from './pages/user/About'
import Contact from './pages/user/Contact'
import DoctorDetail from './pages/user/DoctorDetail' 

// admin pages
import Dashboard from './pages/admin/Dashboard'
import AddDoctor from './pages/admin/AddDoctor'
import DoctorsList from './pages/admin/DoctorsList'
import AllApointments from './pages/admin/AllApointments'

// contexts
import { AppContext } from './context/AppContext'
import { AdminContext } from './context/AdminContext'

// login
import AdminLogin from './pages/admin/AdminLogin'

// =========================================
// ✅ PROTECTED ROUTE COMPONENT
// =========================================
const ProtectedAdminRoute = ({ children }) => {
  const { aToken } = useContext(AdminContext);
  
  // If there is no token, redirect to login page
  if (!aToken) {
    return <Navigate to="/admin/login" replace />;
  }
  
  return children;
};


const App = () => {

  const { userData } = useContext(AppContext)
  const { aToken } = useContext(AdminContext)

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        theme="colored"
      />

      <Routes>

        {/* ================= ADMIN LOGIN ================= */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* ================= ADMIN ROUTES (PROTECTED) ================= */}
        <Route 
          path="/admin" 
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="add-doctor" element={<AddDoctor />} />
          <Route path="doctors" element={<DoctorsList />} />
          <Route path="appointments" element={<AllApointments />} />
        </Route>
    

        {/* ================= PUBLIC / USER ROUTES ================= */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:speciality" element={<Doctors />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="doctor/:docId" element={<DoctorDetail />} />
          
          {/* 🔥 CATCH-ALL 404 ROUTE */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

      </Routes>
    </>
  )
}

export default App