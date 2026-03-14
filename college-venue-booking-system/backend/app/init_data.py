"""
Database initialization script.
Creates sample venues and admin user for the booking system.
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.models import User, Venue, Booking, VenueStatus, UserRole, BookingStatus
from app.auth.auth import hash_password
from datetime import date, timedelta


def initialize_data():
    """
    Initialize the database with sample data.
    Creates admin user and sample venues if they don't exist.
    """
    db = SessionLocal()
    
    try:
        # Create admin user if not exists
        admin_user = db.query(User).filter(User.email == "admin@college.edu").first()
        if not admin_user:
            admin_user = User(
                name="System Admin",
                email="admin@college.edu",
                password=hash_password("admin"),
                role=UserRole.ADMIN,
                department="Administration"
            )
            db.add(admin_user)
            db.commit()
            print("Created admin user: admin@college.edu / admin123")
        
        # Create sample faculty user
        faculty_user = db.query(User).filter(User.email == "faculty@college.edu").first()
        if not faculty_user:
            faculty_user = User(
                name="Dr. John Smith",
                email="faculty@college.edu",
                password=hash_password("faculty"),
                role=UserRole.FACULTY,
                department="Computer Science"
            )
            db.add(faculty_user)
            db.commit()
            print("Created faculty user: faculty@college.edu / faculty123")
        
        # Create sample student user
        student_user = db.query(User).filter(User.email == "student@college.edu").first()
        if not student_user:
            student_user = User(
                name="Jane Doe",
                email="student@college.edu",
                password=hash_password("student"),
                role=UserRole.STUDENT,
                department="Computer Science"
            )
            db.add(student_user)
            db.commit()           
            print("Created student user: student@college.edu / student123")
        
        # Check if venues already exist
        existing_venues_count = db.query(Venue).count()
        if existing_venues_count > 0:
            print(f"Venues already exist ({existing_venues_count} venues found). Skipping venue creation.")
            return
        
        # Define sample venues
        venues_data = [
            # Event Venues
            {
                "name": "Main Auditorium",
                "type": "Event Venues",
                "capacity": 500,
                "facilities": "Projector, Sound System, Air Conditioning, Stage, Green Room, VIP Lounge",
                "description": "Large auditorium for major events, conferences, and cultural programs. Features state-of-the-art audio-visual equipment.",
                "status": VenueStatus.AVAILABLE,
                "location": "Main Building, Ground Floor"
            },
            {
                "name": "Lecture Theatre A",
                "type": "Event Venues",
                "capacity": 200,
                "facilities": "Projector, Microphone, Air Conditioning, Podium",
                "description": "Medium-sized lecture theatre suitable for guest lectures and seminars.",
                "status": VenueStatus.AVAILABLE,
                "location": "Academic Block A, First Floor"
            },
            {
                "name": "Lecture Theatre B",
                "type": "Event Venues",
                "capacity": 150,
                "facilities": "Projector, Microphone, Air Conditioning",
                "description": "Second lecture theatre with modern presentation facilities.",
                "status": VenueStatus.AVAILABLE,
                "location": "Academic Block B, Ground Floor"
            },
            {
                "name": "Seminar Hall 1",
                "type": "Event Venues",
                "capacity": 100,
                "facilities": "Projector, Whiteboard, Air Conditioning, Video Conferencing",
                "description": "Seminar hall equipped for workshops and interactive sessions.",
                "status": VenueStatus.AVAILABLE,
                "location": "Administrative Block, First Floor"
            },
            {
                "name": "Seminar Hall 2",
                "type": "Event Venues",
                "capacity": 80,
                "facilities": "Projector, Whiteboard, Air Conditioning",
                "description": "Smaller seminar hall for focused group sessions.",
                "status": VenueStatus.AVAILABLE,
                "location": "Administrative Block, Second Floor"
            },
            {
                "name": "GD Room",
                "type": "Event Venues",
                "capacity": 50,
                "facilities": "Round Tables, Whiteboard, Projector",
                "description": "Dedicated room for group discussions, interviews, and small group activities.",
                "status": VenueStatus.AVAILABLE,
                "location": "Placement Cell Building"
            },
            {
                "name": "Language Lab",
                "type": "Event Venues",
                "capacity": 40,
                "facilities": "Computers, Headsets, Audio Recording Equipment, Language Learning Software",
                "description": "Modern language laboratory with multimedia learning facilities.",
                "status": VenueStatus.AVAILABLE,
                "location": "Humanities Block, First Floor"
            },
        ]
        
        # Add Classrooms (19 classrooms)
        for i in range(1, 20):
            venues_data.append({
                "name": f"Classroom {i:02d}",
                "type": "Academic Rooms",
                "capacity": 60,
                "facilities": "Whiteboard, Projector, Fans, Benches",
                "description": f"Standard classroom with basic teaching facilities.",
                "status": VenueStatus.AVAILABLE,
                "location": f"Academic Block {(i % 3) + 1}, Floor {(i // 6) + 1}"
            })
        
        # Add Tutorial Rooms (6 tutorial rooms)
        for i in range(1, 7):
            venues_data.append({
                "name": f"Tutorial Room {chr(64 + i)}",
                "type": "Academic Rooms",
                "capacity": 30,
                "facilities": "Whiteboard, Fans, Tables and Chairs",
                "description": f"Small tutorial room for group study and discussions.",
                "status": VenueStatus.AVAILABLE,
                "location": f"Academic Block {i % 2 + 1}, Ground Floor"
            })
        
        # Add Computer Labs (12 labs)
        lab_names = [
            "Programming Lab", "Database Lab", "Network Lab", 
            "AI/ML Lab", "Web Development Lab", "Mobile App Lab",
            "Cybersecurity Lab", "Cloud Computing Lab", "Data Science Lab",
            "Computer Graphics Lab", "Operating Systems Lab", "Project Lab"
        ]
        
        for i, lab_name in enumerate(lab_names):
            venues_data.append({
                "name": f"Computer Lab - {lab_name}",
                "type": "Computer Labs",
                "capacity": 50,
                "facilities": "50 Computers, High-Speed Internet, Projector, Air Conditioning, UPS",
                "description": f"Well-equipped computer laboratory with modern hardware and software for {lab_name.lower()} activities.",
                "status": VenueStatus.AVAILABLE,
                "location": f"IT Building, Floor {(i // 4) + 1}"
            })
        
        # Add Department Facilities - Civil Engineering Labs
        civil_labs = [
            ("Survey Lab", 30, "Theodolites, Total Station, GPS Devices, Survey Equipment"),
            ("Strength of Materials Lab", 25, "Universal Testing Machine, Compression Machine, Hardness Tester"),
            ("Geotechnical Lab", 20, "Soil Testing Equipment, Sieve Shakers, Compaction Test Equipment"),
            ("Environmental Lab", 20, "Water Quality Testing Equipment, Air Quality Monitors"),
            ("Transportation Lab", 25, "Bitumen Testing Equipment, Aggregate Testing Equipment"),
            ("Concrete Lab", 20, "Concrete Mixers, Compression Testing Machine, Curing Tank"),
        ]
        
        for lab_name, capacity, facilities in civil_labs:
            venues_data.append({
                "name": f"Civil Engineering - {lab_name}",
                "type": "Department Facilities",
                "capacity": capacity,
                "facilities": facilities,
                "description": f"Dedicated {lab_name.lower()} for civil engineering students and research.",
                "status": VenueStatus.AVAILABLE,
                "location": "Civil Engineering Building"
            })
        
        # Add Sports Facilities
        sports_facilities = [
            {
                "name": "Basketball Court",
                "type": "Sports Facilities",
                "capacity": 100,
                "facilities": "Professional Basketball Court, Floodlights, Seating Gallery, Scoreboard",
                "description": "Outdoor basketball court with professional-grade equipment and spectator seating.",
                "status": VenueStatus.AVAILABLE,
                "location": "Sports Complex"
            },
            {
                "name": "Badminton Court 1",
                "type": "Sports Facilities",
                "capacity": 30,
                "facilities": "Indoor Court, Floodlights, Seating",
                "description": "Indoor badminton court with professional flooring.",
                "status": VenueStatus.AVAILABLE,
                "location": "Indoor Stadium"
            },
            {
                "name": "Badminton Court 2",
                "type": "Sports Facilities",
                "capacity": 30,
                "facilities": "Indoor Court, Floodlights, Seating",
                "description": "Second indoor badminton court.",
                "status": VenueStatus.AVAILABLE,
                "location": "Indoor Stadium"
            },
            {
                "name": "College Ground",
                "type": "Sports Facilities",
                "capacity": 500,
                "facilities": "Football Field, Cricket Pitch, Athletics Track, Floodlights",
                "description": "Main college ground for outdoor sports and athletic events.",
                "status": VenueStatus.AVAILABLE,
                "location": "Sports Complex, Main Ground"
            },
            {
                "name": "Volleyball Court",
                "type": "Sports Facilities",
                "capacity": 50,
                "facilities": "Sand Court, Net, Floodlights",
                "description": "Beach volleyball court with spectator area.",
                "status": VenueStatus.AVAILABLE,
                "location": "Sports Complex"
            },
            {
                "name": "Table Tennis Hall",
                "type": "Sports Facilities",
                "capacity": 20,
                "facilities": "4 Table Tennis Tables, Lighting, Seating",
                "description": "Indoor hall with multiple table tennis tables.",
                "status": VenueStatus.AVAILABLE,
                "location": "Indoor Stadium, Ground Floor"
            },
        ]
        venues_data.extend(sports_facilities)
        
        # Add Social Spaces
        social_spaces = [
            {
                "name": "Open Cafeteria",
                "type": "Social Spaces",
                "capacity": 150,
                "facilities": "Food Court, Seating Area, WiFi, Charging Points",
                "description": "Main cafeteria with food court and open seating area for students.",
                "status": VenueStatus.AVAILABLE,
                "location": "Central Block, Ground Floor"
            },
            {
                "name": "Student Lounge",
                "type": "Social Spaces",
                "capacity": 50,
                "facilities": "Seating, TV, Indoor Games, Vending Machines",
                "description": "Relaxation area for students with recreational facilities.",
                "status": VenueStatus.AVAILABLE,
                "location": "Student Center, First Floor"
            },
            {
                "name": "Conference Room",
                "type": "Social Spaces",
                "capacity": 30,
                "facilities": "Conference Table, Projector, Video Conferencing, Air Conditioning",
                "description": "Executive conference room for meetings and discussions.",
                "status": VenueStatus.AVAILABLE,
                "location": "Administrative Block, Third Floor"
            },
        ]
        venues_data.extend(social_spaces)
        
        # Add all venues to database
        for venue_data in venues_data:
            venue = Venue(**venue_data)
            db.add(venue)
        
        db.commit()
        print(f"Created {len(venues_data)} venues successfully!")
        
        # Create a sample booking for demonstration
        sample_booking = Booking(
            user_id=student_user.id,
            venue_id=1,  # Main Auditorium
            event_name="Annual Tech Fest",
            department="Computer Science",
            event_date=date.today() + timedelta(days=7),
            start_time="09:00",
            end_time="17:00",
            participants=300,
            purpose="Annual technical festival featuring projects, competitions, and guest lectures.",
            status=BookingStatus.APPROVED
        )
        db.add(sample_booking)
        db.commit()
        print("Created sample approved booking for demonstration.")
        
    except Exception as e:
        print(f"Error initializing data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Create tables
    Base.metadata.create_all(bind=engine)
    # Initialize data
    initialize_data()
