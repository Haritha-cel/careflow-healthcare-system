import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'
import ConfirmDialog from '../../components/common/ConfirmDialog'

const AllAppointments = () => {

  const {
    aToken,
    appointments,
    getAllAppointments,
    cancelAppointment,
    completeAppointment
  } = useContext(AdminContext)

  const { calculateAge, slotDateFormat, currency, isTimePassed } = useContext(AppContext)

  const [sortOrder, setSortOrder] = useState('desc')
  
  const [dialog, setDialog] = useState({
    isOpen: false,
    appointmentId: null,
    actionType: null
  })

  useEffect(() => {
    if (aToken) getAllAppointments()
  }, [aToken])

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')
  }

  const handleOpenDialog = (id, type) => {
    setDialog({ isOpen: true, appointmentId: id, actionType: type })
  }

  const handleConfirmAction = async () => {
    const { appointmentId, actionType } = dialog
    let isSuccess = false;

    if (actionType === 'cancel') {
      isSuccess = await cancelAppointment(appointmentId)
    } else if (actionType === 'complete') {
      isSuccess = await completeAppointment(appointmentId)
    }

    setDialog({ isOpen: false, appointmentId: null, actionType: null })
  }

  const sortedAppointments = [...appointments].sort((a, b) => {
    const timeA = a.date || 0;
    const timeB = b.date || 0;
    if (sortOrder === 'asc') return timeA - timeB;
    return timeB - timeA;
  })

  return (
    <div className='p-4 md:p-6 max-w-7xl mx-auto'>

      {/* ---- Page Header & Sort Button ---- */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
        <div>
          <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>All Appointments</h1>
          <p className='text-gray-500 text-sm mt-1'>Manage patient bookings and statuses.</p>
        </div>
        
        <button 
          onClick={toggleSortOrder} 
          className='flex items-center gap-2 bg-white border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm'
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path></svg>
          {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
        </button>
      </div>

      {/* ---- Main Container ---- */}
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
        
        {/* ==================== DESKTOP TABLE VIEW ==================== */}
        
        {/* 🔥 FIXED: Hardcoded full class string so Tailwind compiles it */}
        <div className='hidden lg:grid lg:grid-cols-[2fr_0.7fr_1.8fr_2fr_100px_140px] gap-4 items-center px-6 py-3 bg-gray-50/80 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider'>
          <p>Patient</p>
          <p className='text-center'>Age</p>
          
          <div 
            className='flex items-center gap-1 cursor-pointer select-none hover:text-primary transition-colors justify-center' 
            onClick={toggleSortOrder}
          >
            <span>Date & Time</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={sortOrder === 'desc' ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} /></svg>
          </div>

          <p>Doctor</p>
          <p className='text-right pr-2'>Fees</p>
          <p className='text-center'>Actions</p>
        </div>

        {/* 🔥 FIXED: Hardcoded full class string in body too */}
        <div className='hidden lg:block divide-y divide-gray-50'>
          {sortedAppointments.length === 0 ? (
             <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
              <p className="text-sm font-medium">No appointments found</p>
            </div>
          ) : (
            sortedAppointments.map((item, index) => {
              const appointmentId = item._id || item.id;
              if (!appointmentId) return null;

              const isCancelled = item.cancelled === true
              const isCompleted = item.completed === true
              const canComplete = isTimePassed(item.slotDate, item.slotTime)

              return (
                <div className='hidden lg:grid lg:grid-cols-[2fr_0.7fr_1.8fr_2fr_100px_140px] gap-4 items-center px-6 py-4 hover:bg-gray-50/50 transition-colors text-sm' key={appointmentId || index}>
                  
                  {/* Patient */}
                  <div className='flex items-center gap-3 min-w-0'>
                    <img className='w-9 h-9 rounded-full object-cover bg-gray-100 flex-shrink-0' src={item.userData?.image || '/placeholder.png'} alt="" />
                    <p className='font-medium text-gray-800 truncate'>{item.userData?.name}</p>
                  </div>

                  {/* Age */}
                  <p className='text-gray-500 text-center'>{item.userData?.dob ? calculateAge(item.userData.dob) : '-'}</p>

                  {/* Date & Time */}
                  <div className='text-gray-500 text-center'>
                    <p>{slotDateFormat(item.slotDate)}</p>
                    <p className='text-xs text-gray-400'>{item.slotTime}</p>
                  </div>

                  {/* Doctor */}
                  <div className='flex items-center gap-3 min-w-0'>
                    <img className='w-9 h-9 rounded-full object-cover bg-gray-100 flex-shrink-0' src={item.docData?.image || '/placeholder.png'} alt="" />
                    <p className='font-medium text-gray-800 truncate'>{item.docData?.name}</p>
                  </div>

                  {/* Fees (Fixed Width - Right Aligned) */}
                  <p className='font-bold text-gray-800 text-right pr-2'>{currency}{item.amount}</p>

                  {/* Actions (Fixed Width - Centered) */}
                  <div className='flex items-center justify-center gap-1.5'>
                    {isCancelled ? (
                      <span className='font-bold text-[11px] px-2.5 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 w-full text-center'>Cancelled</span>
                    ) : isCompleted ? (
                      <span className='font-bold text-[11px] px-2.5 py-1 bg-green-50 text-green-600 rounded-full border border-green-100 w-full text-center'>Completed</span>
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
                        <span className='font-bold text-[11px] px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 flex items-center justify-center gap-1'>
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


        {/* ==================== MOBILE CARD VIEW (Hidden on Desktop) ==================== */}
        <div className='lg:hidden divide-y divide-gray-50'>
          {sortedAppointments.length === 0 ? (
             <div className='flex flex-col items-center justify-center py-20 text-gray-400'>
              <p className="text-sm font-medium">No appointments found</p>
            </div>
          ) : (
            sortedAppointments.map((item, index) => {
              const appointmentId = item._id || item.id;
              if (!appointmentId) return null;

              const isCancelled = item.cancelled === true
              const isCompleted = item.completed === true
              const canComplete = isTimePassed(item.slotDate, item.slotTime)

              return (
                <div className='p-4 space-y-3' key={appointmentId || index}>
                  {/* Top Row: Patient & Status */}
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <img className='w-10 h-10 rounded-full object-cover bg-gray-100' src={item.userData?.image || '/placeholder.png'} alt="" />
                      <div>
                        <p className='text-sm font-semibold text-gray-800'>{item.userData?.name}</p>
                        <p className='text-xs text-gray-500'>{slotDateFormat(item.slotDate)} • {item.slotTime}</p>
                      </div>
                    </div>
                    <div className='flex items-center gap-2'>
                      {isCancelled ? (
                        <span className='font-bold text-[11px] px-2.5 py-1 bg-red-50 text-red-600 rounded-full border border-red-100'>Cancelled</span>
                      ) : isCompleted ? (
                        <span className='font-bold text-[11px] px-2.5 py-1 bg-green-50 text-green-600 rounded-full border border-green-100'>Completed</span>
                      ) : !canComplete ? (
                        <span className='font-bold text-[11px] px-2.5 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 flex items-center gap-1'>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Pending
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {/* Bottom Row: Doctor, Fee, Actions */}
                  <div className='flex items-center justify-between pl-[52px]'>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs text-gray-500 truncate'><span className='text-gray-400'>Doc: </span>{item.docData?.name}</p>
                    </div>
                    
                    <p className='text-sm font-bold text-gray-800 mr-4'>{currency}{item.amount}</p>

                    {!isCancelled && !isCompleted && (
                      <div className='flex items-center gap-1'>
                        <button onClick={() => handleOpenDialog(appointmentId, 'cancel')} className='p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors'>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        {canComplete && (
                          <button onClick={() => handleOpenDialog(appointmentId, 'complete')} className='p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors'>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={() => setDialog({ isOpen: false, appointmentId: null, actionType: null })}
        onConfirm={handleConfirmAction}
        title={dialog.actionType === 'cancel' ? 'Cancel Appointment' : 'Complete Appointment'}
        message={
          dialog.actionType === 'cancel'
            ? 'Are you sure you want to cancel this appointment? The slot will be released.'
            : 'Are you sure you want to mark this appointment as completed?'
        }
        confirmText={dialog.actionType === 'cancel' ? 'Yes, Cancel It' : 'Yes, Complete It'}
        variant={dialog.actionType === 'cancel' ? 'danger' : 'success'}
      />

    </div>
  )
}

export default AllAppointments