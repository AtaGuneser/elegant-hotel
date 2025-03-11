# Elegant Hotel - Room Booking System

## 🌟 Live Demo

Visit the live demo: [Elegant Hotel](https://elegant-hotel-ataguneser.vercel.app)

A modern, full-stack hotel room booking system built with Next.js, TypeScript, and MongoDB.

## 🌟 Features

### Room Management

- Different room categories (Basic, Premium, Suite)
- Custom pricing for each room type
- Room availability tracking
- Image gallery for each room
- Detailed room descriptions and amenities

### User Authentication

- Secure JWT-based authentication
- Role-based access control (Customer & Admin)
- Protected routes based on user roles
- Password hashing with bcrypt
- Email validation

### Booking System

- Real-time room availability checking
- Date range selection with validation
- Double booking prevention
- Booking confirmation system
- Booking history for users
- Booking management for admins

### Admin Dashboard

- Comprehensive booking overview
- Room management interface
- User management
- Booking statistics and reports
- Monthly occupancy rates

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 14 with TypeScript
- **UI Components**: Shadcn UI (based on Radix UI)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Tables**: TanStack Table
- **Date Handling**: date-fns
- **Styling**: Tailwind CSS

### Backend

- **API Routes**: Next.js API Routes
- **Database**: MongoDB (Native Driver)
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **File Upload**: React Dropzone

## 📦 Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AtaGuneser/elegant-hotel.git
   cd elegant-hotel
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory:

   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

```
elegant-hotel/
├── app/
│   ├── api/           # API routes
│   ├── components/    # Reusable components
│   ├── lib/          # Utility functions
│   ├── store/        # Zustand store
│   └── types/        # TypeScript types
├── public/           # Static files
└── styles/          # Global styles
```

## 🔐 Authentication

The system uses JWT-based authentication with two roles:

- **Customer**: Can browse rooms, make bookings, and manage their bookings
- **Admin**: Has full access to manage rooms, bookings, and users

## 💾 Database Schema

### Users Collection

```typescript
{
  _id: ObjectId,
  name: string,
  email: string,
  password: string, // hashed
  role: "admin" | "customer",
  createdAt: Date,
  updatedAt: Date
}
```

### Rooms Collection

```typescript
{
  _id: ObjectId,
  number: string,
  category: "Basic" | "Premium" | "Suite",
  price: number,
  description: string,
  amenities: string[],
  images: string[],
  capacity: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Bookings Collection

```typescript
{
  _id: ObjectId,
  userId: ObjectId,
  roomId: ObjectId,
  checkIn: Date,
  checkOut: Date,
  guests: number,
  totalPrice: number,
  status: "pending" | "confirmed" | "cancelled" | "completed",
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Scalability Approach

1. **Database Optimization**

   - Proper indexing on frequently queried fields
   - MongoDB aggregation pipelines for efficient reporting
   - Pagination for large data sets

2. **Performance**

   - Client-side caching with TanStack Query
   - Image optimization with Next.js Image component
   - Code splitting and lazy loading

3. **Security**
   - Input validation with Zod
   - JWT token expiration
   - Rate limiting on API routes
   - XSS protection
   - CSRF protection

## 📝 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Room Endpoints

- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room (Admin)
- `PATCH /api/rooms/:id` - Update room (Admin)
- `DELETE /api/rooms/:id` - Delete room (Admin)

### Booking Endpoints

- `GET /api/bookings` - Get user's bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id` - Update booking status
- `DELETE /api/bookings/:id` - Cancel booking

### Admin Endpoints

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/bookings` - Get all bookings
- `GET /api/admin/users` - Get all users

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
