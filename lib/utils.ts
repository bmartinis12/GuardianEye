import { type ClassValue, clsx } from "clsx"
import { Metadata } from "next/types"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
};

export function constructMetadata({
  title = 'GuardianEye - the AI powered security camera',
  description = 'GuardianEye is a browser secuirty camera appliaction that uses AI to detect when a person is in frame.',
  image = '/thumbnail.png',
  icons = '/favicon.ico',
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  icons?: string
  noIndex?: boolean
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@benmartinis',
    },
    icons,
    metadataBase: new URL('https://guardianeye-ai.vercel.app'),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  }
}