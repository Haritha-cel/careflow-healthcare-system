import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/user/Navbar'
import Footer from '../components/user/Footer'

const MainLayout = () => {
  return (
    <div className='mx-4 sm:mx-[10%] min-h-screen flex flex-col'>
      <Navbar />
      
      <div className='flex-1'>
        {/* Outlet renders the child routes here */}
        <Outlet />
      </div>

      <Footer />
    </div>
  )
}

export default MainLayout