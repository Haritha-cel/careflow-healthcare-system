import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from "../../context/AppContext";

// 🔥 Move hardcoded specialities into an array for cleaner code
const specialityList = [
  "General physician",
  "Dermatologist", 
  "Gynecologist", 
  "Neurologist", 
  "Pediatrician", 
  "Gastroenterologist"
]

const Doctors = () => {

  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const navigate = useNavigate()

  const { doctors } = useContext(AppContext);

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality));
    } else {
      setFilterDoc(doctors);
    }
  }

  useEffect(() => {
    applyFilter()
    // Scroll to top when filter changes
    window.scrollTo(0, 0)
  }, [doctors, speciality]);

  return (
    <div className='max-w-6xl mx-auto'>
      
      {/* ---- Header Section ---- */}
      <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>
          Find Your Doctor
        </h1>
        <p className='text-gray-500 mt-2 text-sm md:text-base max-w-xl'>
          Explore our top-rated specialists and book your appointment instantly.
        </p>
      </div>

      {/* ---- Filter Section ---- */}
      <div className='flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide'>
        
        {/* All Button */}
        <button 
          onClick={() => navigate('/doctors')} 
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
            !speciality 
              ? 'bg-primary text-white border-primary shadow-sm' 
              : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
          }`}
        >
          All Doctors
        </button>

        {/* Speciality Buttons */}
        {specialityList.map((spec) => (
          <button 
            key={spec}
            onClick={() => speciality === spec ? navigate('/doctors') : navigate(`/doctors/${spec}`)}
            className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 ${
              speciality === spec 
                ? 'bg-primary text-white border-primary shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary'
            }`}
          >
            {spec}
          </button>
        ))}
      </div>

      {/* ---- Doctors Grid ---- */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-10'>
        {
          filterDoc.length > 0 ? (
            filterDoc.map((item, index) => {
              
              const doctorId = item._id || item.id || item.userId;

              if (!doctorId) return null;

              return (
                <div 
                  onClick={() => navigate(`/doctor/${doctorId}`)} 
                  className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer group hover:shadow-lg hover:-translate-y-1 transition-all duration-300'
                  key={index}
                >
                  {/* Image Container */}
                  <div className='relative overflow-hidden bg-blue-50 h-64'>
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
                    <h3 className='text-lg font-bold text-gray-900 truncate'>
                      {item.name}
                    </h3>
                    <p className='text-sm text-gray-500 mt-0.5'>
                      {item.speciality}
                    </p>
                    
                    {/* Optional: Show experience if available */}
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
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-400 text-lg">No doctors found for this speciality.</p>
              <button 
                onClick={() => navigate('/doctors')}
                className="mt-4 text-primary font-medium hover:underline text-sm"
              >
                Clear Filters
              </button>
            </div>
          )
        }
      </div>
      
    </div>
  )
}

export default Doctors