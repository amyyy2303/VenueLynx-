import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { VenueType, UserRole } from '@prisma/client';

export async function POST() {
  try {
    // Create super admin
    const adminPassword = await hashPassword('admin123');
    const superAdmin = await db.user.upsert({
      where: { email: 'admin@venulynx.edu' },
      update: {},
      create: {
        email: 'admin@venulynx.edu',
        password: adminPassword,
        name: 'Super Admin',
        role: 'SUPER_ADMIN',
        designation: 'System Administrator',
        department: 'IT',
      },
    });

    // Create registrar
    const registrarPassword = await hashPassword('registrar123');
    const registrar = await db.user.upsert({
      where: { email: 'registrar@venulynx.edu' },
      update: {},
      create: {
        email: 'registrar@venulynx.edu',
        password: registrarPassword,
        name: 'Dr. Sarah Johnson',
        role: 'REGISTRAR',
        designation: 'Registrar',
        department: 'Administration',
      },
    });

    // Create admin staff
    const adminStaffPassword = await hashPassword('admin123');
    const adminStaff = await db.user.upsert({
      where: { email: 'admin.staff@venulynx.edu' },
      update: {},
      create: {
        email: 'admin.staff@venulynx.edu',
        password: adminStaffPassword,
        name: 'Michael Chen',
        role: 'ADMIN',
        designation: 'Administrative Officer',
        department: 'Administration',
      },
    });

    // Create sample teachers
    const teacherPassword = await hashPassword('teacher123');
    const teachers = await Promise.all([
      db.user.upsert({
        where: { email: 'john.smith@venulynx.edu' },
        update: {},
        create: {
          email: 'john.smith@venulynx.edu',
          password: teacherPassword,
          name: 'Prof. John Smith',
          role: 'TEACHER',
          designation: 'Professor',
          department: 'Computer Science',
          phone: '+1234567890',
        },
      }),
      db.user.upsert({
        where: { email: 'jane.doe@venulynx.edu' },
        update: {},
        create: {
          email: 'jane.doe@venulynx.edu',
          password: teacherPassword,
          name: 'Dr. Jane Doe',
          role: 'TEACHER',
          designation: 'Associate Professor',
          department: 'Electronics',
          phone: '+1234567891',
        },
      }),
      db.user.upsert({
        where: { email: 'robert.wilson@venulynx.edu' },
        update: {},
        create: {
          email: 'robert.wilson@venulynx.edu',
          password: teacherPassword,
          name: 'Dr. Robert Wilson',
          role: 'TEACHER',
          designation: 'Assistant Professor',
          department: 'Mechanical Engineering',
          phone: '+1234567892',
        },
      }),
    ]);

    // Create teacher availability
    for (const teacher of teachers) {
      await db.teacherAvailability.upsert({
        where: { userId: teacher.id },
        update: {},
        create: { userId: teacher.id, isActive: true },
      });
    }

    // Define venues
    const venues = [
      // Event Venues
      { name: 'Main Auditorium', code: 'AUD-01', type: 'AUDITORIUM' as VenueType, building: 'Main Block', floor: 'Ground', roomNumber: 'A001', capacity: 500, facilities: ['Projector', 'Sound System', 'AC', 'Stage', 'Green Room', 'Parking'] },
      { name: 'Mini Auditorium', code: 'AUD-02', type: 'AUDITORIUM' as VenueType, building: 'Main Block', floor: 'First', roomNumber: 'A101', capacity: 200, facilities: ['Projector', 'Sound System', 'AC'] },
      { name: 'Lecture Theatre 1', code: 'LT-01', type: 'LECTURE_THEATRE' as VenueType, building: 'Academic Block', floor: 'Ground', roomNumber: 'LT01', capacity: 150, facilities: ['Projector', 'Mic', 'AC', 'Whiteboard'] },
      { name: 'Lecture Theatre 2', code: 'LT-02', type: 'LECTURE_THEATRE' as VenueType, building: 'Academic Block', floor: 'First', roomNumber: 'LT02', capacity: 150, facilities: ['Projector', 'Mic', 'AC', 'Whiteboard'] },
      { name: 'Board Room', code: 'BR-01', type: 'BOARD_ROOM' as VenueType, building: 'Admin Block', floor: 'Second', roomNumber: 'BR01', capacity: 30, facilities: ['Video Conferencing', 'Projector', 'AC', 'Whiteboard', 'Coffee Machine'] },
      { name: 'Seminar Hall A', code: 'SH-01', type: 'SEMINAR_HALL' as VenueType, building: 'Academic Block', floor: 'Ground', roomNumber: 'SH01', capacity: 120, facilities: ['Projector', 'Sound System', 'AC', 'Podium'] },
      { name: 'Seminar Hall B', code: 'SH-02', type: 'SEMINAR_HALL' as VenueType, building: 'Academic Block', floor: 'First', roomNumber: 'SH02', capacity: 80, facilities: ['Projector', 'AC', 'Whiteboard'] },
      { name: 'GD Room 1', code: 'GD-01', type: 'GD_ROOM' as VenueType, building: 'Placement Block', floor: 'Ground', roomNumber: 'GD01', capacity: 50, facilities: ['Projector', 'Whiteboard', 'AC'] },
      { name: 'GD Room 2', code: 'GD-02', type: 'GD_ROOM' as VenueType, building: 'Placement Block', floor: 'First', roomNumber: 'GD02', capacity: 50, facilities: ['Projector', 'Whiteboard', 'AC'] },
      { name: 'Language Lab', code: 'LL-01', type: 'LANGUAGE_LAB' as VenueType, building: 'Humanities Block', floor: 'First', roomNumber: 'LL01', capacity: 40, facilities: ['Audio System', 'Computers', 'Headsets', 'AC'] },

      // Classrooms
      ...Array.from({ length: 19 }, (_, i) => ({
        name: `Classroom ${i + 1}`,
        code: `CR-${String(i + 1).padStart(2, '0')}`,
        type: 'CLASSROOM' as VenueType,
        building: i < 10 ? 'Academic Block A' : 'Academic Block B',
        floor: i < 10 ? 'Ground' : 'First',
        roomNumber: `CR${String(i + 1).padStart(2, '0')}`,
        capacity: 60,
        facilities: ['Projector', 'Whiteboard', 'Fans'],
      })),

      // Tutorial Rooms
      ...Array.from({ length: 6 }, (_, i) => ({
        name: `Tutorial Room ${i + 1}`,
        code: `TR-${String(i + 1).padStart(2, '0')}`,
        type: 'TUTORIAL_ROOM' as VenueType,
        building: 'Academic Block',
        floor: i < 3 ? 'Ground' : 'First',
        roomNumber: `TR${String(i + 1).padStart(2, '0')}`,
        capacity: 30,
        facilities: ['Whiteboard', 'Fans'],
      })),

      // Computer Labs
      ...Array.from({ length: 12 }, (_, i) => ({
        name: `Computer Lab ${i + 1}`,
        code: `CL-${String(i + 1).padStart(2, '0')}`,
        type: 'COMPUTER_LAB' as VenueType,
        building: 'IT Block',
        floor: i < 6 ? 'Ground' : 'First',
        roomNumber: `CL${String(i + 1).padStart(2, '0')}`,
        capacity: 50,
        facilities: ['Computers', 'Projector', 'AC', 'Internet', 'UPS'],
      })),

      // Civil Engineering Labs
      { name: 'Survey Lab', code: 'CE-01', type: 'CIVIL_ENGINEERING_LAB' as VenueType, building: 'Engineering Block', floor: 'Ground', roomNumber: 'CE01', capacity: 40, facilities: ['Survey Equipment', 'Drafting Tables'] },
      { name: 'Material Testing Lab', code: 'CE-02', type: 'CIVIL_ENGINEERING_LAB' as VenueType, building: 'Engineering Block', floor: 'Ground', roomNumber: 'CE02', capacity: 30, facilities: ['Testing Machines', 'Safety Equipment'] },
      { name: 'Geotechnical Lab', code: 'CE-03', type: 'CIVIL_ENGINEERING_LAB' as VenueType, building: 'Engineering Block', floor: 'Ground', roomNumber: 'CE03', capacity: 25, facilities: ['Soil Testing Equipment'] },

      // Sports Facilities
      { name: 'Basketball Court', code: 'SP-01', type: 'BASKETBALL_COURT' as VenueType, building: 'Sports Complex', floor: 'Ground', roomNumber: 'BC01', capacity: 200, facilities: ['LED Display', 'Seating', 'Lights'] },
      { name: 'Badminton Court 1', code: 'SP-02', type: 'BADMINTON_COURT' as VenueType, building: 'Sports Complex', floor: 'Ground', roomNumber: 'BD01', capacity: 50, facilities: ['Lights', 'Seating'] },
      { name: 'Badminton Court 2', code: 'SP-03', type: 'BADMINTON_COURT' as VenueType, building: 'Sports Complex', floor: 'Ground', roomNumber: 'BD02', capacity: 50, facilities: ['Lights', 'Seating'] },
      { name: 'College Ground', code: 'SP-04', type: 'COLLEGE_GROUND' as VenueType, building: 'Campus', floor: 'Ground', roomNumber: 'CG01', capacity: 2000, facilities: ['Football Field', 'Cricket Pitch', 'Track', 'Seating'] },

      // Social Spaces
      { name: 'Open Cafeteria', code: 'CF-01', type: 'OPEN_CAFETERIA' as VenueType, building: 'Main Block', floor: 'Ground', roomNumber: 'CF01', capacity: 300, facilities: ['Food Court', 'Seating', 'AC Zone'] },
    ];

    // Create venues
    let createdCount = 0;
    for (const venue of venues) {
      try {
        await db.venue.create({
          data: {
            ...venue,
            facilities: JSON.stringify(venue.facilities),
          },
        });
        createdCount++;
      } catch (e) {
        // Venue already exists, skip
      }
    }

    // Create some sample bookings
    const teacher = teachers[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Get some venues for bookings
    const auditorium = await db.venue.findFirst({ where: { type: 'AUDITORIUM' } });
    const seminarHall = await db.venue.findFirst({ where: { type: 'SEMINAR_HALL' } });
    const computerLab = await db.venue.findFirst({ where: { type: 'COMPUTER_LAB' } });

    const sampleBookings = [
      {
        venueId: auditorium?.id || '',
        userId: teacher.id,
        eventDate: tomorrow,
        timeFrom: '10:00',
        timeTo: '12:00',
        participants: 200,
        purpose: 'Annual Tech Fest Opening Ceremony',
        remarks: 'Chief Guest: Industry Expert',
        refreshments: true,
        paSystem: true,
        status: 'APPROVED',
      },
      {
        venueId: seminarHall?.id || '',
        userId: teacher.id,
        eventDate: nextWeek,
        timeFrom: '14:00',
        timeTo: '16:00',
        participants: 80,
        purpose: 'Workshop on Machine Learning',
        remarks: 'Hands-on session planned',
        refreshments: false,
        paSystem: true,
        status: 'PENDING_ADMIN',
      },
      {
        venueId: computerLab?.id || '',
        userId: teachers[1].id,
        eventDate: tomorrow,
        timeFrom: '09:00',
        timeTo: '11:00',
        participants: 45,
        purpose: 'Python Programming Lab',
        remarks: 'Regular lab session',
        refreshments: false,
        paSystem: false,
        status: 'PENDING_REGISTRAR',
      },
    ];

    for (const booking of sampleBookings) {
      if (booking.venueId) {
        try {
          await db.booking.create({ data: booking as any });
        } catch (e) {
          // Skip if exists
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        users: { superAdmin: 1, registrar: 1, admin: 1, teachers: teachers.length },
        venues: createdCount,
        sampleBookings: sampleBookings.length,
      },
      credentials: {
        superAdmin: { email: 'admin@venulynx.edu', password: 'admin123' },
        registrar: { email: 'registrar@venulynx.edu', password: 'registrar123' },
        admin: { email: 'admin.staff@venulynx.edu', password: 'admin123' },
        teacher: { email: 'john.smith@venulynx.edu', password: 'teacher123' },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
