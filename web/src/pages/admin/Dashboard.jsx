import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/admin/assets/assets'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const Dashboard = () => {

  const {
    getDashData,
    cancelAppointment,
    completeAppointment,
    dashData
  } = useContext(AdminContext)

  const { slotDateFormat, isTimePassed } = useContext(AppContext)

  // 🔥 Dialog State
  const [dialog, setDialog] = useState({
    isOpen: false,
    appointmentId: null,
    actionType: null
  })

  useEffect(() => {
    getDashData()
  }, [])

  // 🔥 Open Dialog Handlers
  const handleOpenDialog = (id, type) => {
    setDialog({ isOpen: true, appointmentId: id, actionType: type })
  }

  // 🔥 Confirm Action & REFRESH DASHBOARD
  const handleConfirmAction = async () => {
    const { appointmentId, actionType } = dialog
    let isSuccess = false;

    if (actionType === 'cancel') {
      isSuccess = await cancelAppointment(appointmentId)
    } else if (actionType === 'complete') {
      isSuccess = await completeAppointment(appointmentId)
    }

    setDialog({ isOpen: false, appointmentId: null, actionType: null })

    if (isSuccess) {
      getDashData()
    }
  }

  return dashData && (
    <div className='p-4 md:p-6 max-w-7xl mx-auto'>

      {/* ---- Page Header ---- */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Dashboard</h1>
        <p className='text-gray-500 text-sm mt-1'>Welcome back! Here's what's happening today.</p>
      </div>

      {/* ---- Stats Cards Grid ---- */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10'>
        
        {/* Doctors Card */}
        <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow'>
          <div className='w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0'>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div>
            <p className='text-3xl font-bold text-gray-800'>{dashData.doctors}</p>
            <p className='text-sm text-gray-500 font-medium'>Total Doctors</p>
          </div>
        </div>

        {/* Appointments Card */}
        <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow'>
          <div className='w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0'>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <div>
            <p className='text-3xl font-bold text-gray-800'>{dashData.appointments}</p>
            <p className='text-sm text-gray-500 font-medium'>Appointments</p>
          </div>
        </div>

        {/* Patients Card */}
        <div className='bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1'>
          <div className='w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0'>
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
          </div>
          <div>
            <p className='text-3xl font-bold text-gray-800'>{dashData.patients}</p>
            <p className='text-sm text-gray-500 font-medium'>Total Patients</p>
          </div>
        </div>

      </div>

      {/* ---- Latest Bookings Section ---- */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
        
        {/* Header */}
        <div className='p-5 border-b border-gray-100 flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-bold text-gray-800'>Latest Bookings</h2>
            <p className='text-xs text-gray-500 mt-0.5'>Recent patient appointments</p>
          </div>
          <div className='w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-600'>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
          </div>
        </div>

        {/* List Body */}
        <div className='divide-y divide-gray-50'>
          {dashData.latestAppointments?.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-gray-400'>
              <svg className="w-12 h-12 mb-3 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <p className="text-sm font-medium">No appointments yet</p>
            </div>
          ) : (
            dashData.latestAppointments.map((item, index) => {
              const appointmentId = item._id || item.id;
              if (!appointmentId) return null;

              const isCancelled = item.cancelled === true
              const isCompleted = item.completed === true
              const canComplete = isTimePassed(item.slotDate, item.slotTime)

              return (
                <div className='flex flex-col md:flex-row md:items-center gap-3 p-4 md:px-6 hover:bg-gray-50/50 transition-colors' key={index}>
                  
                  {/* Left: Info */}
                  <div className='flex items-center gap-3 flex-1 min-w-0'>
                    <img className='w-10 h-10 rounded-full object-cover bg-gray-100 flex-shrink-0' src={item.docData?.image || '/placeholder.png'} alt="" />
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold text-gray-800 truncate'>
                        {item.userData?.name} <span className='font-normal text-gray-400'>→</span> {item.docData?.name}
                      </p>
                      <p className='text-xs text-gray-500 mt-0.5'>
                        {slotDateFormat(item.slotDate)} • {item.slotTime}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className='flex items-center gap-2 md:justify-end pl-13 md:pl-0'>
                    {isCancelled ? (
                      <span className='font-bold text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100'>Cancelled</span>
                    ) : isCompleted ? (
                      <span className='font-bold text-xs px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-100'>Completed</span>
                    ) : canComplete ? (
                      <>
                        <button onClick={() => handleOpenDialog(appointmentId, 'cancel')} className='p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors' title='Cancel'>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <button onClick={() => handleOpenDialog(appointmentId, 'complete')} className='p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors' title='Complete'>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleOpenDialog(appointmentId, 'cancel')} className='p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors' title='Cancel'>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        <span className='font-bold text-xs px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full border border-amber-100 flex items-center gap-1'>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Pending
                        </span>
                      </>
                    )}
                  </div>

                </div>
              )
            })
          )} 
        </div>
      </div>

      {/* 🔥 Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ isOpen: false, appointmentId: null, actionType: null })}
        onConfirm={handleConfirmAction}
        title={dialog.actionType === 'cancel' ? 'Cancel Appointment' : 'Complete Appointment'}
        message={
          dialog.actionType === 'cancel'
            ? 'This will cancel the appointment and release the doctor slot.'
            : 'This will mark the appointment as completed.'
        }
        confirmText={dialog.actionType === 'cancel' ? 'Yes, Cancel' : 'Yes, Complete'}
        variant={dialog.actionType === 'cancel' ? 'danger' : 'success'}
      />

    </div>
  )
}

export default Dashboard