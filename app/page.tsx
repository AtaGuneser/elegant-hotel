export default function Home () {
  return (
    <div className='flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] gap-8 text-center'>
      <div className='space-y-4'>
        <h1 className='text-4xl font-bold tracking-tight'>
          Welcome to Elegant Hotel
        </h1>
        <p className='text-xl text-muted-foreground'>
          Where luxury meets comfort
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl'>
        {/* Room cards will be added here */}
      </div>

      <div className='flex gap-4'>
        <a
          href='/rooms'
          className='rounded-full bg-primary text-primary-foreground px-6 py-3 hover:bg-primary/90 transition-colors'
        >
          View Rooms
        </a>
      </div>
    </div>
  )
}
