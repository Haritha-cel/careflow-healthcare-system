import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

const TopDoctors = () => {
    const navigate = useNavigate();
    const { doctors } = useContext(AppContext);

  return (
    <div className='flex flex-col items-center gap-4 my-16 text-gray-900'>
        
        {/* 🔥 NEW TEXT */}
        <h1 className='text-3xl font-bold text-gray-800'>
          Our Leading Specialists
        </h1>
        <p className='sm:w-1/2 text-center text-sm text-gray-500'>
          Handpicked experts dedicated to providing you with exceptional healthcare.
        </p>
        
        <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-5 px-3 sm:px-0'>
            
            {doctors.length > 0 ? (
                doctors.slice(0, 10).map((item, index) => {
                  
                  // 🔥 Safety check for ID
                  const doctorId = item._id || item.id || item.userId;
                  if (!doctorId) return null;

                  return (
                    <div 
                      onClick={() => { navigate(`/doctor/${doctorId}`); window.scrollTo(0, 0); }} 
                      className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
                      key={index}
                    >
                      {/* Image Container */}
                      <div className='relative overflow-hidden bg-blue-50 h-60'>
                        <img 
                          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' 
                          src={item.image} 
                          alt={item.name} 
                        />
                        
                        {/* Availability Badge */}
                        <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                          item.available 
                            ? 'bg-green-100/90 text-green-700' 
                            : 'bg-red-100/90 text-red-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${item.available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {item.available ? 'Available' : 'Unavailable'}
                        </div>
                      </div>

                      {/* Info Container */}
                      <div className='p-4'>
                        <h3 className='text-base sm:text-lg font-bold text-gray-900 truncate'>
                          {item.name}
                        </h3>
                        <p className='text-sm text-gray-500 mt-0.5'>
                          {item.speciality}
                        </p>
                        
                        {item.experience && (
                          <p className='text-xs text-gray-400 mt-2 border-t border-gray-100 pt-2'>
                            {item.experience} Experience
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })
            ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                    <p className="text-gray-400 text-lg mb-2">No doctors added yet.</p>
                    <p className="text-gray-300 text-sm">Admin needs to add doctors via the Admin Panel.</p>
                </div>
            )}
        </div>

        {/* 🔥 Styled Button to match the new design */}
        <button 
          onClick={() => { navigate('/doctors'); window.scrollTo(0, 0); }} 
          className='mt-8 px-8 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-sm hover:shadow-md'
        >
            View All Doctors
        </button>
    </div>  
  )
}

export default TopDoctors