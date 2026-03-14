import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { VenueType } from '@prisma/client';

// Get all venues
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as VenueType | null;
    const building = searchParams.get('building');
    const minCapacity = searchParams.get('minCapacity');
    const date = searchParams.get('date');
    const timeFrom = searchParams.get('timeFrom');
    const timeTo = searchParams.get('timeTo');

    // Build filter
    const where: any = { isActive: true };
    if (type) where.type = type;
    if (building) where.building = building;
    if (minCapacity) where.capacity = { gte: parseInt(minCapacity) };

    const venues = await db.venue.findMany({
      where,
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { bookings: true, events: true } },
      },
    });

    // If checking availability for a specific time slot
    if (date && timeFrom && timeTo) {
      const eventDate = new Date(date);
      
      const venuesWithAvailability = await Promise.all(
        venues.map(async (venue) => {
          const conflictingBookings = await db.booking.findFirst({
            where: {
              venueId: venue.id,
              eventDate: eventDate,
              status: { in: ['APPROVED', 'PENDING_ADMIN', 'PENDING_REGISTRAR'] },
              OR: [
                {
                  AND: [
                    { timeFrom: { lte: timeFrom } },
                    { timeTo: { gt: timeFrom } },
                  ],
                },
                {
                  AND: [
                    { timeFrom: { lt: timeTo } },
                    { timeTo: { gte: timeTo } },
                  ],
                },
                {
                  AND: [
                    { timeFrom: { gte: timeFrom } },
                    { timeTo: { lte: timeTo } },
                  ],
                },
              ],
            },
          });

          return {
            ...venue,
            isAvailable: !conflictingBookings,
            facilities: JSON.parse(venue.facilities || '[]'),
          };
        })
      );

      return NextResponse.json({ venues: venuesWithAvailability });
    }

    return NextResponse.json({
      venues: venues.map((v) => ({
        ...v,
        facilities: JSON.parse(v.facilities || '[]'),
      })),
    });
  } catch (error) {
    console.error('Get venues error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create venue (Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, type, building, floor, roomNumber, capacity, facilities, description } = body;

    const venue = await db.venue.create({
      data: {
        name,
        code: code.toUpperCase(),
        type,
        building,
        floor,
        roomNumber,
        capacity: parseInt(capacity),
        facilities: JSON.stringify(facilities || []),
        description,
      },
    });

    return NextResponse.json({ venue });
  } catch (error) {
    console.error('Create venue error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
