import React, { useState, useCallback, useEffect } from 'react'
import FoodItems from '../components/FoodItems'
import Restarunts from '../components/Restarunts'
import { Link } from 'react-router-dom'
import LocationInput from '../components/LocationInput'

function NotServiceable({ location, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <img
        src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/m/location_unserviceable.png"
        alt="Not serviceable"
        className="w-72 mb-6"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <h2 className="text-2xl font-bold text-gray-800 mb-2">We're not there yet!</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-6">
        Sorry, our services are currently unavailable at{' '}
        <span className="font-semibold text-gray-700">{location}</span>.<br />
        We hope to serve you in the future.
      </p>
      <button
        onClick={onReset}
        className="bg-[#FF5C00] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-orange-600 transition"
      >
        Change Location
      </button>
    </div>
  )
}

function Home() {
  const [location, setLocation] = useState(() => localStorage.getItem('userLocation') || '')
  const [serviceable, setServiceable] = useState(true)

  // Cities where we have seeded restaurants
  const SERVED_CITIES = ['bangalore', 'delhi', 'mumbai', 'hyderabad', 'chennai', 'noida', 'kolkata', 'pune']

  const checkServiceability = useCallback((loc) => {
    if (!loc.trim()) {
      setServiceable(true)
      return
    }
    const lower = loc.toLowerCase()
    const served = SERVED_CITIES.some(city => lower.includes(city))
    setServiceable(served)
  }, [])

  // Check on mount if a location was previously saved
  useEffect(() => {
    const saved = localStorage.getItem('userLocation')
    if (saved) checkServiceability(saved)
  }, [checkServiceability])

  const handleLocationCommit = (loc) => {
    setLocation(loc)
    localStorage.setItem('userLocation', loc)
    checkServiceability(loc)
  }

  const handleReset = () => {
    setLocation('')
    localStorage.removeItem('userLocation')
    setServiceable(true)
  }

  return (
    <div>
      {/* Hero Banner */}
      <div className="bg-[#FF5C00] text-white">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-8 py-10 gap-6">
          <img
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/testing/seo-home/Veggies_new.png"
            alt="food"
            className="hidden md:block h-55 lg:h-70 shrink-0"
          />
          <div className="text-center w-full max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
              Order food & groceries.<br />Discover best restaurants!
            </h1>
            <p className="text-orange-100 mb-8 text-sm sm:text-base">Delivered to your door in minutes.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <div className="flex items-center bg-white text-gray-700 px-4 py-3 rounded-2xl w-full sm:w-auto shadow">
                📍
                <LocationInput
                  value={location}
                  onChange={setLocation}
                  onCommit={handleLocationCommit}
                  placeholder="Enter your location"
                  inputClassName="ml-2 outline-none w-full sm:w-48 text-sm"
                  className="relative flex-1"
                />
              </div>
              <Link to="/restaurants" className="bg-white text-[#FF5C00] px-6 py-3 rounded-2xl font-bold text-sm hover:bg-yellow-100 transition shadow">
                Find Restaurants →
              </Link>
            </div>
          </div>
          <img
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/testing/seo-home/Sushi_replace.png"
            alt="food"
            className="hidden md:block h-55 lg:h-70 shrink-0"
          />
        </div>
      </div>

      {/* Content */}
      {serviceable === null ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-[#FF5C00] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : serviceable === false ? (
        <NotServiceable location={location} onReset={handleReset} />
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FoodItems />
          <Restarunts />
        </div>
      )}
    </div>
  )
}

export default Home
