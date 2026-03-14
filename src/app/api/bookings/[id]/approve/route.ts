import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { BookingStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Approve booking
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, remarks } = body; // action: 'approve' or 'reject'

    const booking = await db.booking.findUnique({
      where: { id },
      include: { venue: true, user: true },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Check authorization based on booking status and user role
    let newStatus: BookingStatus;
    const now = new Date();

    if (action === 'reject') {
      // Admin or Registrar can reject
      if (
        (user.role === 'ADMIN' && booking.status === 'PENDING_ADMIN') ||
        (user.role === 'REGISTRAR' && booking.status === 'PENDING_REGISTRAR') ||
        user.role === 'SUPER_ADMIN'
      ) {
        newStatus = 'REJECTED';
      } else {
        return NextResponse.json({ error: 'Unauthorized to reject this booking' }, { status: 403 });
      }
    } else if (action === 'approve') {
      if (user.role === 'ADMIN' && booking.status === 'PENDING_ADMIN') {
        // Admin approves -> goes to Registrar
        newStatus = 'PENDING_REGISTRAR';
      } else if (
        (user.role === 'REGISTRAR' && booking.status === 'PENDING_REGISTRAR') ||
        (user.role === 'SUPER_ADMIN' && booking.status === 'PENDING_REGISTRAR')
      ) {
        // Registrar approves -> booking confirmed
        newStatus = 'APPROVED';
      } else if (user.role === 'SUPER_ADMIN' && booking.status === 'PENDING_ADMIN') {
        // Super admin can jump straight to approval
        newStatus = 'APPROVED';
      } else {
        return NextResponse.json({ error: 'Unauthorized to approve this booking' }, { status: 403 });
      }
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update booking
    const updateData: any = {
      status: newStatus,
    };

    if (action === 'reject') {
      updateData.rejectedAt = now;
      updateData.rejectedBy = user.id;
      updateData.rejectionReason = remarks;
    } else if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      updateData.adminApprovedAt = now;
      updateData.adminApprovedBy = user.id;
      updateData.adminRemarks = remarks;
    } else if (user.role === 'REGISTRAR') {
      updateData.registrarApprovedAt = now;
      updateData.registrarApprovedBy = user.id;
      updateData.registrarRemarks = remarks;
    }

    // If fully approved, generate QR code and create event
    if (newStatus === 'APPROVED') {
      const qrCode = `VL-${uuidv4().substring(0, 8).toUpperCase()}`;
      updateData.qrCode = qrCode;
      updateData.qrGeneratedAt = now;

      // Create event
      await db.event.create({
        data: {
          bookingId: booking.id,
          venueId: booking.venueId,
          userId: booking.userId,
          title: booking.purpose,
          eventDate: booking.eventDate,
          timeFrom: booking.timeFrom,
          timeTo: booking.timeTo,
          participants: booking.participants,
          qrCode: qrCode,
        },
      });
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: updateData,
      include: {
        venue: true,
        user: { select: { id: true, name: true, email: true, department: true } },
      },
    });

    return NextResponse.json({ booking: updatedBooking });
  } catch (error) {
    console.error('Approve booking error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
