import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Get all events
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const upcoming = searchParams.get('upcoming') === 'true';
    const venueId = searchParams.get('venueId');

    const where: any = {};
    if (date) where.eventDate = new Date(date);
    if (upcoming) where.eventDate = { gte: new Date() };
    if (venueId) where.venueId = venueId;
    
    // Teachers can only see their own events
    if (user.role === 'TEACHER') {
      where.userId = user.id;
    }

    const events = await db.event.findMany({
      where,
      orderBy: [{ eventDate: 'asc' }, { timeFrom: 'asc' }],
      include: {
        venue: true,
        user: { select: { id: true, name: true, email: true, department: true, designation: true } },
        booking: { select: { purpose: true, remarks: true, refreshments: true, paSystem: true } },
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
