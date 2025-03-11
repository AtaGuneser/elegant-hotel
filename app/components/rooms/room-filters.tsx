'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { Label } from '@/app/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/app/components/ui/select'

export function RoomFilters () {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value === 'all') {
        params.delete(name)
      } else {
        params.set(name, value)
      }
      return params.toString()
    },
    [searchParams]
  )

  return (
    <aside className='md:col-span-1'>
      <div className='space-y-2'>
        <div>
          <Label htmlFor='category' className='text-sm font-medium p-1'>
            Room Type
          </Label>
          <Select
            defaultValue={searchParams.get('category') || 'all'}
            onValueChange={value => {
              router.push(`/rooms?${createQueryString('category', value)}`)
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select room type' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='Basic'>Basic</SelectItem>
              <SelectItem value='Premium'>Premium</SelectItem>
              <SelectItem value='Suite'>Suite</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor='minPrice' className='text-sm font-medium p-1'>
            Minimum Price
          </Label>
          <Input
            id='minPrice'
            type='number'
            placeholder='Min price'
            defaultValue={searchParams.get('minPrice') || ''}
            onChange={e => {
              router.push(
                `/rooms?${createQueryString('minPrice', e.target.value)}`
              )
            }}
          />
        </div>
        <div>
          <Label htmlFor='maxPrice' className='text-sm font-medium p-1'>
            Maximum Price
          </Label>
          <Input
            id='maxPrice'
            type='number'
            placeholder='Max price'
            defaultValue={searchParams.get('maxPrice') || ''}
            onChange={e => {
              router.push(
                `/rooms?${createQueryString('maxPrice', e.target.value)}`
              )
            }}
          />
        </div>
        <div>
          <Label htmlFor='capacity' className='text-sm font-medium p-1'>
            Capacity
          </Label>
          <Input
            id='capacity'
            type='number'
            placeholder='Number of guests'
            defaultValue={searchParams.get('capacity') || ''}
            onChange={e => {
              router.push(
                `/rooms?${createQueryString('capacity', e.target.value)}`
              )
            }}
          />
        </div>
        <Button
          onClick={() => {
            router.push('/rooms')
          }}
          className='p-4 cursor-pointer'
        >
          Clear Filters
        </Button>
      </div>
    </aside>
  )
}
