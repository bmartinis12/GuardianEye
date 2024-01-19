import Link from 'next/link'

export default function NotFound() {
    return (
        <div className='py-20 flex flex-col items-center justify-center'>
            <h2 className='text-4xl sm:text-6xl font-medium'>Sorry</h2>
            <p className='mt-2 sm:text-xl'>We could not find this page.</p>
            <Link className='mt-4 sm:text-xl text-red-600 hover:text-red-500' href="/">Return Home &rarr;</Link>
        </div>
    )
}