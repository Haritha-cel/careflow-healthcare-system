import React, { useContext } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { AdminContext } from '../context/AdminContext'
import Sidebar from '../components/admin/Sidebar'
import AdminNavbar from '../components/admin/AdminNavbar'

const AdminLayout = () => {

  const { aToken } = useContext(AdminContext)

  if (!aToken) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className='min-h-screen flex flex-col'>

      {/* Navbar */}
      <AdminNavbar />

      <div className='flex flex-1'>

        {/* Sidebar */}
        <Sidebar />

        {/* Page Content */}
        <div className='flex-1 p-5'>
          <Outlet />
        </div>

      </div>

    </div>
  )
}

export default AdminLayout