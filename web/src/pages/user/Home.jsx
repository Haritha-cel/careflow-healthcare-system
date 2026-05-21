import React from 'react'
import Header from "../../components/user/Header";
import HowItWorks from "../../components/user/HowItWorks";
import TopDoctors from "../../components/user/TopDoctors";

const Home = () => {
  return (
    <div>
      {/* 1. Hero / Navbar Section */}
      <Header />
      
      {/* 2. HowItWorks Section */}
      <HowItWorks />
      
      {/* 3. Top Doctors Section  */}
      <TopDoctors />
      
    </div>
  )
}

export default Home