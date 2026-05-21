import React, { useContext, useState } from 'react'
import { AdminContext } from "../../context/AdminContext";
import { NavLink } from 'react-router-dom'

const Sidebar = () => {

    const { aToken } = useContext(AdminContext)
    const [mobileOpen, setMobileOpen] = useState(false)

    if (!aToken) return null

    // Close mobile menu when a link is clicked
    const closeMobileMenu = () => setMobileOpen(false)

    return (
        <>
            {/* ---- MOBILE FLOATING MENU BUTTON ---- */}
            <button 
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed bottom-6 left-6 z-50 w-14 h-14 bg-primary text-white rounded-2xl shadow-xl flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>

            {/* ---- MOBILE BACKDROP ---- */}
            <div 
                className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={closeMobileMenu}
            ></div>

            {/* ---- SIDEBAR CONTAINER ---- */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50 
                w-64 bg-white border-r border-gray-200 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
            `}>
                
                {/* Sidebar Header */}
                <div className='h-16 flex items-center px-5 border-b border-gray-100 mt-16 md:mt-0'>
                    <h2 className='text-sm font-bold text-gray-800 uppercase tracking-wider'>Menu</h2>
                </div>

                {/* Navigation Links */}
                <nav className='flex-1 px-3 py-4 space-y-1 overflow-y-auto'>
                    
                    {/* Dashboard */}
                    <NavLink 
                        to={'/admin/dashboard'} 
                        onClick={closeMobileMenu}
                        className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive 
                                ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        <span>Dashboard</span>
                    </NavLink>

                    {/* Appointments */}
                    <NavLink 
                        to={'/admin/appointments'} 
                        onClick={closeMobileMenu}
                        className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive 
                                ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span>Appointments</span>
                    </NavLink>

                    {/* Add Doctor */}
                    <NavLink 
                        to={'/admin/add-doctor'} 
                        onClick={closeMobileMenu}
                        className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive 
                                ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                        <span>Add Doctor</span>
                    </NavLink>

                    {/* Doctors List */}
                    <NavLink 
                        to={'/admin/doctors'} 
                        onClick={closeMobileMenu}
                        className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive 
                                ? 'bg-primary/10 text-primary border-l-4 border-primary shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                    >
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        <span>Doctors List</span>
                    </NavLink>

                </nav>

            </aside>
        </>
    )
}

export default Sidebar