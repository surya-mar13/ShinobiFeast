import React, { useState, useCallback, useEffect } from 'react'
import FoodItems from '../components/FoodItems'
import Restarunts from '../components/Restarunts'
import { Link } from 'react-router-dom'
import LocationInput from '../components/LocationInput'
import { LocateFixed, ArrowRight, ShieldCheck, Clock3, Bike } from 'lucide-react'

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
      <h2 className="brand-heading text-2xl font-bold text-slate-800 mb-2">QuickBite is still expanding here</h2>
      <p className="text-slate-500 text-sm max-w-sm mb-6">
        Sorry, our services are currently unavailable at{' '}
        <span className="font-semibold text-slate-700">{location}</span>.<br />
        We hope to serve you in the future.
      </p>
      <button
        onClick={onReset}
        className="qb-btn-primary text-white px-6 py-2.5 rounded-full font-semibold text-sm transition"
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
      <div className="relative overflow-hidden bg-[linear-gradient(140deg,#ff7a1a_0%,#f15a0f_46%,#d64507_100%) text-white">
        <div className="pointer-events-none absolute inset-0 opacity-35 [background:radial-gradient(circle_at_20%_0%,#fff_0%,transparent_35%),radial-gradient(circle_at_95%_100%,#fff_0%,transparent_28%)" />
        <div className="relative flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-4 sm:px-8 py-12 gap-7">
          <img
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/testing/seo-home/Veggies_new.png"
            alt="food"
            className="hidden md:block h-56 lg:h-72 shrink-0 drop-shadow-2xl"
          />
          <div className="text-center w-full max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold tracking-[0.16em] uppercase">
              <ShieldCheck size={14} /> Verified Kitchens. Faster Delivery.
            </p>
            <h1 className="brand-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
              Fresh food in minutes,<br />only on QuickBite
            </h1>
            <p className="text-orange-50/95 mb-8 text-sm sm:text-base">Track every order live, discover top-rated local spots, and checkout in seconds.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <div className="flex items-center bg-white text-slate-700 px-4 py-3 rounded-2xl w-full sm:w-auto shadow-lg border border-orange-100">
                <LocateFixed size={18} className="text-orange-600" />
                <LocationInput
                  value={location}
                  onChange={setLocation}
                  onCommit={handleLocationCommit}
                  placeholder="Enter your location"
                  inputClassName="ml-2 outline-none w-full sm:w-48 text-sm"
                  className="relative flex-1"
                />
              </div>
              <Link to="/restaurants" className="bg-white text-orange-600 px-6 py-3 rounded-2xl font-bold text-sm hover:bg-orange-50 transition shadow-lg inline-flex items-center justify-center gap-2">
                Find Restaurants <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5"><Clock3 size={14} /> Avg 30 min</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5"><Bike size={14} /> Live Rider Tracking</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5"><ShieldCheck size={14} /> Safe Payments</span>
            </div>
          </div>
          <img
            src="https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/portal/testing/seo-home/Sushi_replace.png"
            alt="food"
            className="hidden md:block h-56 lg:h-72 shrink-0 drop-shadow-2xl"
          />
        </div>
      </div>

      {serviceable === null ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
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
