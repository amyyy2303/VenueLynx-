# Smart College Venue Booking System

A comprehensive web application for managing and booking venues within a college campus. This system provides a centralized platform for students, faculty, and administrators to manage venue reservations efficiently.

## 📋 Table of Contents

- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Default Users](#default-users)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## ✨ Features

### For Students & Faculty
- **Browse Venues**: View all available venues with detailed information
- **Search & Filter**: Find venues by type, capacity, location, and availability
- **Submit Bookings**: Create booking requests for events
- **Track Status**: Monitor the status of booking requests
- **View Schedule**: See upcoming events on campus

### For Administrators
- **Dashboard Overview**: View statistics and pending requests at a glance
- **Approve/Reject Bookings**: Review and process booking requests
- **Manage Venues**: Add, edit, and delete venue information
- **View Reports**: Access booking statistics and utilization reports
- **User Management**: View all registered users

### Core Features
- **Conflict Detection**: Automatic prevention of double-booking
- **Real-time Availability**: Check venue availability instantly
- **Role-based Access**: Different permissions for students, faculty, and admins
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **JWT Authentication**: Secure user authentication system

## 🛠 Technology Stack

### Backend
- **Python 3.9+** - Programming Language
- **FastAPI** - Modern web framework for building APIs
- **SQLAlchemy** - SQL Toolkit and ORM
- **MySQL** - Relational Database
- **JWT** - JSON Web Tokens for authentication

### Frontend
- **HTML5** - Markup Language
- **CSS3** - Styling
- **JavaScript** - Client-side scripting
- **Bootstrap 5** - CSS Framework

## 📦 Prerequisites

Before installing the application, ensure you have the following installed:

1. **Python 3.9 or higher**
   ```bash
   python --version
   ```

2. **MySQL Server 8.0 or higher**
   ```bash
   mysql --version
   ```

3. **pip (Python package manager)**
   ```bash
   pip --version
   ```

## 🚀 Installation

### Step 1: Clone or Download the Project

```bash
cd /path/to/your/workspace
# If you have the project files, navigate to the project directory
cd college-venue-booking-system
```

### Step 2: Create MySQL Database

Open MySQL command line or workbench and run:

```sql
CREATE DATABASE college_venue_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or using command line:

```bash
mysql -u root -p -e "CREATE DATABASE college_venue_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### Step 3: Configure Environment Variables

Edit the `.env` file in the `backend` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=college_venue_booking

# JWT Configuration
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_HOURS=24
```

### Step 4: Install Python Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### Step 5: Run the Application

```bash
cd backend/app
python main.py
```

Or using uvicorn directly:

```bash
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 6: Access the Application

Open your web browser and navigate to:

```
http://localhost:8000
```

## ⚙️ Configuration

### Database Configuration

The application automatically creates all required tables on first run. The following tables are created:

- `users` - User accounts and profiles
- `venues` - Venue information
- `bookings` - Booking requests and status
- `equipment_requests` - Equipment requests linked to bookings

### JWT Configuration

For production, generate a secure secret key:

```python
import secrets
print(secrets.token_urlsafe(32))
```

Update the `SECRET_KEY` in `.env` with this value.

## 📖 API Documentation

Once the application is running, access the interactive API documentation at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### API Endpoints

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user info |

#### Venues
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/venues` | Get all venues |
| GET | `/api/venues/{id}` | Get venue by ID |
| GET | `/api/venues/category/{type}` | Get venues by category |
| GET | `/api/venues/{id}/availability` | Check venue availability |
| POST | `/api/venues` | Create venue (Admin) |
| PUT | `/api/venues/{id}` | Update venue (Admin) |
| DELETE | `/api/venues/{id}` | Delete venue (Admin) |

#### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | Get user's bookings |
| GET | `/api/bookings/all` | Get all bookings |
| GET | `/api/bookings/schedule` | Get upcoming events |
| PUT | `/api/bookings/{id}/cancel` | Cancel booking |

#### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Get dashboard stats |
| GET | `/api/admin/pending-bookings` | Get pending bookings |
| PUT | `/api/admin/bookings/{id}/approve` | Approve booking |
| PUT | `/api/admin/bookings/{id}/reject` | Reject booking |

## 👤 Default Users

The system creates these default users on first run:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Faculty | faculty@college.edu | faculty123 |
| Student | student@college.edu | student123 |

**⚠️ Important**: Change these passwords in production!

## 📁 Project Structure

```
college-venue-booking-system/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Configuration settings
│   │   ├── database.py          # Database connection
│   │   ├── init_data.py         # Sample data initialization
│   │   ├── models/
│   │   │   └── models.py        # SQLAlchemy models
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic schemas
│   │   ├── routers/
│   │   │   ├── auth.py          # Authentication routes
│   │   │   ├── venues.py        # Venue routes
│   │   │   ├── bookings.py      # Booking routes
│   │   │   └── admin.py         # Admin routes
│   │   ├── services/
│   │   │   └── services.py      # Business logic
│   │   └── auth/
│   │       └── auth.py          # JWT authentication
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── templates/
│   │   ├── index.html           # Home page
│   │   ├── login.html           # Login page
│   │   ├── register.html        # Registration page
│   │   ├── venues.html          # Venue listing
│   │   ├── booking.html         # Booking form
│   │   ├── my-bookings.html     # User's bookings
│   │   ├── admin.html           # Admin dashboard
│   │   └── schedule.html        # Event schedule
│   └── static/
│       ├── css/
│       │   └── style.css        # Custom styles
│       └── js/
│           ├── api.js           # API wrapper
│           └── main.js          # Utility functions
└── README.md
```

## 📸 Screenshots

### Home Page
The landing page showcases venue categories and upcoming events.

### Venue Listing
Browse and search for venues with filters for type, capacity, and availability.

### Booking Form
Submit booking requests with event details and check availability in real-time.

### Admin Dashboard
Manage bookings, venues, and view statistics.

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt
- **JWT Tokens**: Secure authentication with configurable expiration
- **Role-based Access**: Different permissions for different user types
- **SQL Injection Prevention**: SQLAlchemy ORM prevents SQL injection
- **CORS Configuration**: Configurable allowed origins

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Can't connect to MySQL server
```
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure the database `college_venue_booking` exists

### Module Not Found Error
```
ModuleNotFoundError: No module named 'fastapi'
```
- Install dependencies: `pip install -r requirements.txt`

### Port Already in Use
```
Error: Address already in use
```
- Change the port: `uvicorn app.main:app --port 8001`

## 📝 License

This project is created for educational purposes.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Smart College Venue Booking System** - Making campus venue management simple and efficient.
