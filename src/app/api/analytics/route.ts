import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Get total bookings
    const totalBookings = await db.booking.count();
    
    // Get bookings by status
    const bookingsByStatus = await db.booking.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get upcoming events count
    const upcomingEvents = await db.event.count({
      where: {
        eventDate: { gte: new Date() },
        isCompleted: false,
      },
    });

    // Get most used venue
    const venueUsage = await db.booking.groupBy({
      by: ['venueId'],
      where: { status: 'APPROVED' },
      _count: true,
      orderBy: { _count: { venueId: 'desc' } },
      take: 1,
    });

    let mostUsedVenue = null;
    if (venueUsage.length > 0) {
      const venue = await db.venue.findUnique({
        where: { id: venueUsage[0].venueId },
        select: { id: true, name: true, type: true, capacity: true },
      });
      mostUsedVenue = venue ? { ...venue, bookingCount: venueUsage[0]._count } : null;
    }

    // Get venue type distribution
    const venueTypeDistribution = await db.booking.groupBy({
      by: ['venueId'],
      where: { status: 'APPROVED' },
      _count: true,
    });

    const venueTypeStats: Record<string, number> = {};
    for (const item of venueTypeDistribution) {
      const venue = await db.venue.findUnique({
        where: { id: item.venueId },
        select: { type: true },
      });
      if (venue) {
        venueTypeStats[venue.type] = (venueTypeStats[venue.type] || 0) + item._count;
      }
    }

    // Get bookings by day of week
    const allBookings = await db.booking.findMany({
      where: { status: 'APPROVED' },
      select: { eventDate: true },
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const bookingsByDay: Record<string, number> = {};
    dayNames.forEach(day => bookingsByDay[day] = 0);
    
    allBookings.forEach(booking => {
      const day = dayNames[booking.eventDate.getDay()];
      bookingsByDay[day]++;
    });

    // Find busiest day
    const busiestDay = Object.entries(bookingsByDay)
      .sort((a, b) => b[1] - a[1])[0];

    // Get monthly booking trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentBookings = await db.booking.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
      },
      select: { createdAt: true, status: true },
    });

    const monthlyTrend: Record<string, { total: number; approved: number; rejected: number }> = {};
    recentBookings.forEach(booking => {
      const monthKey = booking.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyTrend[monthKey]) {
        monthlyTrend[monthKey] = { total: 0, approved: 0, rejected: 0 };
      }
      monthlyTrend[monthKey].total++;
      if (booking.status === 'APPROVED') monthlyTrend[monthKey].approved++;
      if (booking.status === 'REJECTED') monthlyTrend[monthKey].rejected++;
    });

    // Events this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const eventsThisMonth = await db.event.count({
      where: {
        eventDate: { gte: startOfMonth },
      },
    });

    // Pending approvals count
    const pendingAdminApprovals = await db.booking.count({
      where: { status: 'PENDING_ADMIN' },
    });
    
    const pendingRegistrarApprovals = await db.booking.count({
      where: { status: 'PENDING_REGISTRAR' },
    });

    // Active venues
    const activeVenues = await db.venue.count({
      where: { isActive: true },
    });

    // Active users
    const activeUsers = await db.user.count({
      where: { isActive: true },
    });

    return NextResponse.json({
      overview: {
        totalBookings,
        upcomingEvents,
        eventsThisMonth,
        activeVenues,
        activeUsers,
      },
      bookingsByStatus: bookingsByStatus.reduce((acc, item) => {
        acc[item.status] = item._count;
        return acc;
      }, {} as Record<string, number>),
      mostUsedVenue,
      busiestDay: busiestDay ? { day: busiestDay[0], count: busiestDay[1] } : null,
      bookingsByDay,
      venueTypeStats,
      monthlyTrend,
      pendingApprovals: {
        admin: pendingAdminApprovals,
        registrar: pendingRegistrarApprovals,
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
