import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { VenueType } from '@prisma/client';

// Smart venue recommendation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { participants, facilities, eventDate, timeFrom, timeTo, venueType } = body;

    // Get all active venues
    const venues = await db.venue.findMany({
      where: {
        isActive: true,
        capacity: { gte: participants },
        ...(venueType && { type: venueType as VenueType }),
      },
    });

    // Filter by facilities
    let matchingVenues = venues;
    if (facilities && facilities.length > 0) {
      matchingVenues = venues.filter(venue => {
        const venueFacilities: string[] = JSON.parse(venue.facilities || '[]');
        return facilities.every((f: string) => 
          venueFacilities.some(vf => vf.toLowerCase().includes(f.toLowerCase()))
        );
      });
    }

    // Check availability for each venue
    const checkDate = eventDate ? new Date(eventDate) : null;
    
    const recommendations = await Promise.all(
      matchingVenues.map(async (venue) => {
        let isAvailable = true;
        let conflictInfo = null;

        if (checkDate && timeFrom && timeTo) {
          const conflict = await db.booking.findFirst({
            where: {
              venueId: venue.id,
              eventDate: checkDate,
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
              ],
            },
          });

          if (conflict) {
            isAvailable = false;
            conflictInfo = {
              timeFrom: conflict.timeFrom,
              timeTo: conflict.timeTo,
              status: conflict.status,
            };
          }
        }

        // Calculate score
        let score = 100;
        
        // Prefer venues with capacity close to participants
        const capacityRatio = participants / venue.capacity;
        if (capacityRatio > 0.8) score += 20; // Good utilization
        else if (capacityRatio > 0.5) score += 10;
        else if (capacityRatio < 0.3) score -= 10; // Too much wasted space

        // Prefer certain venue types for certain participant counts
        if (participants <= 30 && venue.type === 'TUTORIAL_ROOM') score += 15;
        if (participants <= 50 && venue.type === 'GD_ROOM') score += 15;
        if (participants >= 100 && venue.type === 'AUDITORIUM') score += 15;
        if (participants >= 50 && venue.type === 'SEMINAR_HALL') score += 10;

        return {
          venue: {
            ...venue,
            facilities: JSON.parse(venue.facilities || '[]'),
          },
          isAvailable,
          conflict: conflictInfo,
          score,
          capacityUtilization: Math.round(capacityRatio * 100),
        };
      })
    );

    // Sort by availability and score
    const sorted = recommendations.sort((a, b) => {
      // Available venues first
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1;
      }
      // Then by score
      return b.score - a.score;
    });

    return NextResponse.json({
      recommendations: sorted.slice(0, 5), // Top 5 recommendations
      criteria: { participants, facilities, eventDate, timeFrom, timeTo },
    });
  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
