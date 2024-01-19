"use client"

import Link from "next/link"

interface ErrorProps {
    error: any,
    reset: () => void
}

export default function error({ error, reset }: ErrorProps) {
    return (
        <main className="py-20 flex flex-col items-center justify-center">
            <h2 className="text-4xl sm:text-6xl font-medium">Oh No!</h2>
            <p className="mt-2 sm:text-xl">{error.message}</p>
            <Link className='mt-4 sm:text-xl text-red-600 hover:text-red-500' href="/">Return Home &rarr;</Link>
        </main>
    )
}
