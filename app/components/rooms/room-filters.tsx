'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { RoomCategory } from '@/app/types/room'
import { roomFilterSchema } from '@/app/lib/validations/room'
import { Button } from '../ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select'
import { Input } from '../ui/input'
import { DatePicker } from '../ui/date-picker'
import * as z from 'zod'

type FilterFormValues = z.infer<typeof roomFilterSchema>

export function RoomFilters () {
  const router = useRouter()
  const searchParams = useSearchParams()

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(roomFilterSchema),
    defaultValues: {
      category: (searchParams.get('category') as RoomCategory) || undefined,
      minPrice: searchParams.get('minPrice')
        ? Number(searchParams.get('minPrice'))
        : undefined,
      maxPrice: searchParams.get('maxPrice')
        ? Number(searchParams.get('maxPrice'))
        : undefined,
      capacity: searchParams.get('capacity')
        ? Number(searchParams.get('capacity'))
        : undefined,
      startDate: searchParams.get('startDate')
        ? new Date(searchParams.get('startDate')!)
        : undefined,
      endDate: searchParams.get('endDate')
        ? new Date(searchParams.get('endDate')!)
        : undefined
    }
  })

  function onSubmit (data: FilterFormValues) {
    const params = new URLSearchParams()

    if (data.category) params.set('category', data.category)
    if (data.minPrice) params.set('minPrice', data.minPrice.toString())
    if (data.maxPrice) params.set('maxPrice', data.maxPrice.toString())
    if (data.capacity) params.set('capacity', data.capacity.toString())
    if (data.startDate) params.set('startDate', data.startDate.toISOString())
    if (data.endDate) params.set('endDate', data.endDate.toISOString())

    router.push(`/rooms?${params.toString()}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='category'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Room Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select room type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='Basic'>Basic</SelectItem>
                  <SelectItem value='Premium'>Premium</SelectItem>
                  <SelectItem value='Suite'>Suite</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='minPrice'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Price</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='0'
                  {...field}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='maxPrice'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Price</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='5000'
                  {...field}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='capacity'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Capacity</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  placeholder='1'
                  {...field}
                  onChange={e => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='startDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-in Date</FormLabel>
              <FormControl>
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  minDate={new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='endDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-out Date</FormLabel>
              <FormControl>
                <DatePicker
                  selected={field.value}
                  onSelect={field.onChange}
                  minDate={form.watch('startDate') || new Date()}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full'>
          Filter
        </Button>
      </form>
    </Form>
  )
}
