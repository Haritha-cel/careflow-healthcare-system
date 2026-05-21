import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RelatedDoctors = ({ docId, speciality }) => {
    const { doctors } = useContext(AppContext)
    const navigate = useNavigate();
    const [relDoc, setRelDocs] = useState([])

    useEffect(() => {
        if (doctors.length > 0 && speciality) {
            const doctorsData = doctors.filter((doc) => doc.speciality === speciality && (doc._id !== docId && doc.id !== docId))
            setRelDocs(doctorsData)
        }
    }, [doctors, speciality, docId])

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-gray-900'>
            <h1 className='text-3xl font-medium'>Related Doctors</h1>
            <p className='sm:w-1/3 text-center text-sm text-gray-500'>Other doctors in the same speciality.</p>
            
            {/* ✅ FIXED: Responsive Grid */}
            <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-5 px-3 sm:px-0'>
                {relDoc.slice(0, 5).map((item, index) => (
                    <div 
                      // ✅ FIXED: Singular /doctor/ and window.scrollTo
                      onClick={() => { navigate(`/doctor/${item._id || item.id}`); window.scrollTo(0, 0); }} 
                      className='border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-5px] transition-all duration-300 hover:shadow-md' 
                      key={index}
                    >
                        <img className='bg-blue-50 h-32 sm:h-40 object-cover w-full' src={item.image} alt='' />
                        <div className='p-3'>
                            <div className={`flex items-center gap-2 text-xs ${item.available ? 'text-green-500' : 'text-gray-400'}`}>
                                <p className={`w-2 h-2 ${item.available ? 'bg-green-500' : 'bg-gray-400'} rounded-full`}></p>
                                <p>{item.available ? 'Available' : 'Not Available'}</p>
                            </div>
                            <p className='text-gray-900 text-sm font-medium mt-1 truncate'>{item.name}</p>
                            <p className='text-gray-500 text-xs'>{item.speciality}</p>
                        </div>
                    </div>
                ))}
            </div>

            <button 
              // ✅ FIXED: Link to speciality filter correctly
              onClick={() => { navigate(`/doctors/${speciality}`); window.scrollTo(0, 0); }} 
              className='bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 hover:bg-blue-100 transition-colors'
            >
                more
            </button>
        </div>
    )
}

export default RelatedDoctors