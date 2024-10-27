import React from 'react'
import { assets } from '../assets/assets'

const Hero = () => {
  return (
    <div className='flex flex-col items-center '>
      <div className='w-full flex items-center justify-center py-10 sm:py-0 max-w-2xl'>
        <img className='w-full' src={assets.hero_img} alt="" />
      </div>
    </div>
  )
}

export default Hero
