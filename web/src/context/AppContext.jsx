import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import dayjs from 'dayjs'

export const AppContext = createContext();

const AppContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const currency = "$"
    const [doctors, setDoctors] = useState([])

    const calculateAge = (dob) => {
        const today = new Date()
        const birthDate = new Date(dob)
        return today.getFullYear() - birthDate.getFullYear()
    }

    const slotDateFormat = (slotDate) => {
        return dayjs(slotDate).format('DD MMM YYYY')
    }

    const isTimePassed = (slotDate, slotTime) => {
        try {
            const appointmentDate = new Date(`${slotDate}T${slotTime}`);
            return new Date() > appointmentDate;
        } catch {
            return false;
        }
    }

    // ✅ Public endpoint — plain axios, no auth, no cookies needed
    const getDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list')
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getDoctorsData()
    }, [])

    const value = {
        doctors,
        getDoctorsData,
        calculateAge,
        slotDateFormat,
        isTimePassed,
        currency,
        backendUrl
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;