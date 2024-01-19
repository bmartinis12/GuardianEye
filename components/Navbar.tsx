import Image from 'next/image'
import React from 'react'

const Navbar = () => {
    return (
        <div className="bg-secondary h-16">
            <header className='bg-secondary flex items-center justify-center sm:gap-x-4'>
                <Image src='/logo.png' alt='GuardianEye logo' width={75} height={50} />
                <h1 className='text-2xl font-medium'>GuardianEye</h1>
            </header>
        </div>
    )
}

export default Navbar