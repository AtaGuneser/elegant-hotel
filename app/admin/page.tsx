'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Users, Hotel, Calendar } from 'lucide-react'
import { RecentBookings } from '@/app/components/admin/recent-bookings'

interface DashboardStats {
  totalUsers: number
  totalRooms: number
  totalBookings: number
  totalRevenue: number
  averageStayDuration: number
  occupancyRate: number
}

async function fetchDashboardStats (): Promise<DashboardStats> {
  const response = await fetch('/api/admin/stats', {
    credentials: 'include'
  })
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }
  return response.json()
}

const stats = [
  {
    name: 'Total Users',
    value: 'totalUsers',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    name: 'Total Rooms',
    value: 'totalRooms',
    icon: Hotel,
    color: 'bg-green-500'
  },
  {
    name: 'Total Bookings',
    value: 'totalBookings',
    icon: Calendar,
    color: 'bg-purple-500'
  }
]

export default function AdminDashboard () {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', {
          credentials: 'include'
        })
        const data = await response.json()
        if (!response.ok || data.role !== 'admin') {
          router.push('/admin/login')
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/admin/login')
      }
    }

    checkAuth()
  }, [router])

  const { data } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    enabled: !isLoading
  })

  if (isLoading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    )
  }

  return (
    <div>
      <h1 className='text-2xl font-semibold text-gray-900'>Dashboard</h1>

      <div className='mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {stats.map(stat => {
          const Icon = stat.icon
          const value = data?.[stat.value as keyof DashboardStats]
          const displayValue = value ?? 0

          return (
            <div
              key={stat.name}
              className='relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6'
            >
              <dt>
                <div className={`absolute rounded-md p-3 ${stat.color}`}>
                  <Icon className='h-6 w-6 text-white' aria-hidden='true' />
                </div>
                <p className='ml-16 truncate text-sm font-medium text-gray-500'>
                  {stat.name}
                </p>
              </dt>
              <dd className='ml-16 flex items-baseline pb-6 sm:pb-7'>
                <p className='text-2xl font-semibold text-gray-900'>
                  {displayValue}
                </p>
              </dd>
            </div>
          )
        })}
      </div>

      {/* Recent Bookings */}
      <div className='mt-8'>
        <h2 className='text-lg font-medium text-gray-900'>Recent Bookings</h2>
        <div className='mt-4 overflow-hidden rounded-lg bg-white shadow'>
          <RecentBookings />
        </div>
      </div>
    </div>
  )
}
