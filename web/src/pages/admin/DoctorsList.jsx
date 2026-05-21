import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const { doctors, aToken, getAllDoctors, changeAvailability } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
      getAllDoctors()
    }
  }, [aToken])

  return (
    <div className='p-4 md:p-6 max-w-7xl mx-auto'>

      {/* ---- Page Header ---- */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>Doctors List</h1>
        <p className='text-gray-500 text-sm mt-1'>Manage your medical staff and their availability.</p>
      </div>

      {/* ---- Doctors Grid ---- */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
        {
          doctors.length > 0 ? doctors.map((item, index) => {
            const doctorId = item._id || item.id;
            if (!doctorId) return null;

            return (
              <div className='bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col' key={index}>
                
                {/* Image Container */}
                <div className='relative h-56 bg-blue-50'>
                  <img className='w-full h-full object-cover' src={item.image} alt={item.name} />
                  
                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                    item.available 
                      ? 'bg-green-100/90 text-green-700' 
                      : 'bg-red-100/90 text-red-600'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </div>
                </div>

                {/* Info Container */}
                <div className='p-4 flex flex-col flex-1'>
                  <h3 className='text-lg font-bold text-gray-900 truncate'>{item.name}</h3>
                  <p className='text-sm text-gray-500 mt-0.5'>{item.speciality}</p>
                  
                  {item.degree && (
                    <p className='text-xs text-gray-400 mt-1'>{item.degree}</p>
                  )}

                  {/* ---- Custom Toggle Switch ---- */}
                  <div className='mt-auto pt-4 border-t border-gray-100 flex items-center justify-between'>
                    <span className='text-xs text-gray-500 font-medium'>Availability</span>
                    
                    <button 
                      onClick={() => changeAvailability(doctorId)} 
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                        item.available ? 'bg-primary' : 'bg-gray-300'
                      }`}
                      title={item.available ? "Click to make Unavailable" : "Click to make Available"}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${
                        item.available ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>

                </div>
              </div>
            )
          }) : (
            /* Empty State */
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              <p className="text-gray-500 font-medium">No doctors added yet</p>
              <p className="text-gray-400 text-sm mt-1">Go to "Add Doctor" to get started.</p>
            </div>
          )
        }
      </div>

    </div>
  )
}

export default DoctorsList