import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { BookingStatus } from '@prisma/client'
import { z } from 'zod'

const createBookingSchema = z.object({
  venueId: z.string(),
  eventDate: z.string(),
  timeFrom: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  timeTo: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  participants: z.number().min(1),
  purpose: z.string().min(5),
  remarks: z.string().optional(),
  refreshments: z.boolean().optional(),
  paSystem: z.boolean().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') as BookingStatus | null
    const venueId = searchParams.get('venueId')
    const date = searchParams.get('date')
    const userId = searchParams.get('userId')
    const upcoming = searchParams.get('upcoming') === 'true'

    // ---------- AVAILABILITY QUERY ----------
    if (venueId && date) {
      const selectedDate = new Date(date)

      const bookings = await db.booking.findMany({
        where: {
          venueId: venueId,
          eventDate: selectedDate,
          status: {
            in: ['APPROVED', 'PENDING_ADMIN', 'PENDING_REGISTRAR']
          }
        },
        select: {
          id: true,
          timeFrom: true,
          timeTo: true,
          status: true
        }
      })

      return NextResponse.json(bookings)
    }

    // ---------- NORMAL BOOKING LIST ----------
    const where: any = {}

    if (user.role === 'TEACHER') {
      where.userId = user.id
    }

    if (user.role === 'STUDENT') {
      return NextResponse.json(
        { error: 'Students cannot view bookings' },
        { status: 403 }
      )
    }

    if (status) where.status = status
    if (venueId) where.venueId = venueId
    if (userId) where.userId = userId
    if (date) where.eventDate = new Date(date)

    if (upcoming) {
      where.eventDate = { gte: new Date() }
      where.status = 'APPROVED'
    }

    const bookings = await db.booking.findMany({
      where,
      orderBy: [
        { eventDate: 'asc' },
        { timeFrom: 'asc' }
      ],
      include: {
        venue: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            designation: true
          }
        }
      }
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Get bookings error:', error)

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user || user.role === 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const data = createBookingSchema.parse(body)

    const venue = await db.venue.findUnique({
      where: { id: data.venueId }
    })

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 })
    }

    if (data.participants > venue.capacity) {
      return NextResponse.json(
        { error: `Venue capacity (${venue.capacity}) exceeded` },
        { status: 400 }
      )
    }

    const eventDate = new Date(data.eventDate)

    const existingBooking = await db.booking.findFirst({
      where: {
        venueId: data.venueId,
        eventDate: eventDate,
        status: {
          in: ['APPROVED', 'PENDING_ADMIN', 'PENDING_REGISTRAR']
        },
        OR: [
          {
            AND: [
              { timeFrom: { lte: data.timeFrom } },
              { timeTo: { gt: data.timeFrom } }
            ]
          },
          {
            AND: [
              { timeFrom: { lt: data.timeTo } },
              { timeTo: { gte: data.timeTo } }
            ]
          },
          {
            AND: [
              { timeFrom: { gte: data.timeFrom } },
              { timeTo: { lte: data.timeTo } }
            ]
          }
        ]
      }
    })

    if (existingBooking) {
      return NextResponse.json(
        {
          error: 'Venue already booked for this time slot',
          conflict: {
            timeFrom: existingBooking.timeFrom,
            timeTo: existingBooking.timeTo,
            status: existingBooking.status
          }
        },
        { status: 409 }
      )
    }

    const booking = await db.booking.create({
      data: {
        venueId: data.venueId,
        userId: user.id,
        eventDate: eventDate,
        timeFrom: data.timeFrom,
        timeTo: data.timeTo,
        participants: data.participants,
        purpose: data.purpose,
        remarks: data.remarks,
        refreshments: data.refreshments || false,
        paSystem: data.paSystem || false,
        status: 'PENDING_ADMIN'
      },
      include: {
        venue: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({ booking })

  } catch (error) {
    console.error('Create booking error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
  { error: error.errors?.[0]?.message || "Invalid booking data" },
  { status: 400 }
);
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}