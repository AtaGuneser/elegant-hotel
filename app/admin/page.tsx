'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Hotel,
  Calendar,
  DollarSign,
  Clock,
  Percent
} from 'lucide-react'
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
  const response = await fetch('/api/admin/stats')
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }
  return response.json()
}

const stats = [
  {
    name: 'Toplam Kullanıcı',
    value: 'totalUsers',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    name: 'Toplam Oda',
    value: 'totalRooms',
    icon: Hotel,
    color: 'bg-green-500'
  },
  {
    name: 'Toplam Rezervasyon',
    value: 'totalBookings',
    icon: Calendar,
    color: 'bg-purple-500'
  },
  {
    name: 'Toplam Gelir',
    value: 'totalRevenue',
    icon: DollarSign,
    color: 'bg-yellow-500'
  },
  {
    name: 'Ortalama Konaklama',
    value: 'averageStayDuration',
    icon: Clock,
    color: 'bg-red-500'
  },
  {
    name: 'Doluluk Oranı',
    value: 'occupancyRate',
    icon: Percent,
    color: 'bg-indigo-500'
  }
]

export default function AdminDashboard () {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats
  })

  if (isLoading) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent' />
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex h-96 items-center justify-center'>
        <div className='text-center'>
          <h3 className='text-lg font-medium text-gray-900'>
            Veriler yüklenirken bir hata oluştu
          </h3>
          <p className='mt-2 text-sm text-gray-500'>
            Lütfen daha sonra tekrar deneyin
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className='text-2xl font-semibold text-gray-900'>Dashboard</h1>

      <div className='mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {stats.map(stat => {
          const Icon = stat.icon
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
                  {data?.[stat.value as keyof DashboardStats]}
                </p>
              </dd>
            </div>
          )
        })}
      </div>

      {/* Recent Bookings */}
      <div className='mt-8'>
        <h2 className='text-lg font-medium text-gray-900'>
          Son Rezervasyonlar
        </h2>
        <div className='mt-4 overflow-hidden rounded-lg bg-white shadow'>
          <RecentBookings />
        </div>
      </div>
    </div>
  )
}
