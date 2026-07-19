'use client'

import Image from 'next/image'
import { signOut } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'

interface User {
  name?: string | null
  email?: string | null
  image?: string | null
}

export default function UserProfileDropdown({ user }: Readonly<{ user: User }>) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div
      ref={dropdownRef}
      className="relative"
      role="menu"
      tabIndex={0}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(e) => {
        if (!dropdownRef.current?.contains(e.relatedTarget as Node)) {
          setIsOpen(false)
        }
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || 'User'}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full ring-2 ring-blue-500/50"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
            {user.name?.[0] || user.email?.[0] || 'U'}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full pt-2 z-50">
          <div className="w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-gray-700">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
            <div className="p-2">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                  aria-label="Sign out"
                >
                  <title>Sign out</title>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                  />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
