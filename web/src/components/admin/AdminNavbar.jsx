import React, { useContext, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { assets } from '../../assets/admin/assets/assets'
import { useNavigate } from 'react-router-dom'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const AdminNavbar = () => {

    // ✅ UPDATED: Destructure the 'logout' function instead of just setAToken
    const { logout } = useContext(AdminContext)
    const navigate = useNavigate()
    
    const [showLogoutDialog, setShowLogoutDialog] = useState(false)

    // ✅ UPDATED: Use the secure logout function from Context
    const handleConfirmLogout = () => {
        logout(); 
    }

    return (
        <nav className='sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm'>
            <div className='flex items-center justify-between px-4 sm:px-6 h-16'>
                
                {/* ---- LEFT: Logo & Badge ---- */}
                <div className='flex items-center gap-3'>
                    <img 
                        className='w-32 sm:w-36 cursor-pointer' 
                        src={assets.admin_logo} 
                        alt="Admin Logo" 
                        onClick={() => navigate('/admin/dashboard')}
                    />

                    {/* Modern Admin Badge */}
                    <div className='hidden sm:flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full'>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        <span className='text-xs font-semibold'>Admin</span>
                    </div>
                </div>

                {/* ---- RIGHT: Logout Button ---- */}
                <button 
                    onClick={() => setShowLogoutDialog(true)} 
                    className='flex items-center gap-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200 group'
                >
                    <svg className="w-5 h-5 transition-transform group-hover:-rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span className='hidden sm:inline'>Logout</span>
                </button>

            </div>

            {/* Custom Logout Confirmation Dialog */}
            <ConfirmDialog
                isOpen={showLogoutDialog}
                onClose={() => setShowLogoutDialog(false)}
                onConfirm={handleConfirmLogout}
                title="Logout Admin"
                message="Are you sure you want to logout from the admin panel?"
                confirmText="Yes, Logout"
                variant="danger"
            />
        </nav>
    )
}

export default AdminNavbar