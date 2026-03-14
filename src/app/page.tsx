'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppStore, User, Venue, Booking, Event } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2, Calendar, Users, BarChart3, Settings, LogOut, Menu, X, 
  CheckCircle, XCircle, Clock, MapPin, Phone, Mail, Award, ChevronRight,
  Search, Filter, Plus, QrCode, Download, Eye, AlertTriangle, TrendingUp,
  CalendarDays, LayoutDashboard, FileText, CheckCircle2, UserCheck, Shield,
  Coffee, Volume2, Presentation, BookOpen, Laptop,
  Dumbbell, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

// ============= LOGIN COMPONENT =============
function LoginPage() {
  const { setUser } = useAppStore();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: '',
    designation: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin 
          ? { email: formData.email, password: formData.password }
          : { ...formData, role: 'TEACHER' }
        ),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
      } else {
        toast.error(data.error || 'Authentication failed');
      }
    } catch {
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMDI0MmEiIGZpbGwtb3BhY2l0eT0iMC40Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnY0em0wLTZ2LTRoLTJ2NGgyek0zNiAyMnYtNGgtMnY0aDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      
      <Card className="w-full max-w-md relative backdrop-blur-xl bg-slate-800/50 border-slate-700">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg shadow-emerald-500/20">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">VenuLynx</CardTitle>
          <CardDescription className="text-slate-400">
            Smart Campus Venue Management System
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(v) => setIsLogin(v === 'login')}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-700/50">
              <TabsTrigger value="login" className="data-[state=active]:bg-slate-600">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-slate-600">Register</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Prof. John Smith"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-slate-300">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Computer Science"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="designation" className="text-slate-300">Designation</Label>
                      <Input
                        id="designation"
                        value={formData.designation}
                        onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        placeholder="Professor"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@university.edu"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>
          </Tabs>

          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 text-center mb-3">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button variant="outline" size="sm" className="bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setFormData({ email: 'admin@venulynx.edu', password: 'admin123', name: '', department: '', designation: '' })}>
                Super Admin
              </Button>
              <Button variant="outline" size="sm" className="bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setFormData({ email: 'registrar@venulynx.edu', password: 'registrar123', name: '', department: '', designation: '' })}>
                Registrar
              </Button>
              <Button variant="outline" size="sm" className="bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setFormData({ email: 'admin.staff@venulynx.edu', password: 'admin123', name: '', department: '', designation: '' })}>
                Admin Staff
              </Button>
              <Button variant="outline" size="sm" className="bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-700" onClick={() => setFormData({ email: 'john.smith@venulynx.edu', password: 'teacher123', name: '', department: '', designation: '' })}>
                Teacher
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= SIDEBAR COMPONENT =============
function Sidebar() {
  const { user, currentView, setCurrentView, sidebarOpen, setSidebarOpen, logout } = useAppStore();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['TEACHER', 'ADMIN', 'REGISTRAR', 'SUPER_ADMIN'] },
    { id: 'venues', label: 'Venues', icon: Building2, roles: ['TEACHER', 'ADMIN', 'REGISTRAR', 'SUPER_ADMIN'] },
    { id: 'availability', label: 'Availability', icon: Calendar, roles: ['TEACHER', 'ADMIN', 'REGISTRAR', 'SUPER_ADMIN'] },
    { id: 'bookings', label: 'Bookings', icon: FileText, roles: ['TEACHER', 'ADMIN', 'REGISTRAR', 'SUPER_ADMIN'] },
    { id: 'approvals', label: 'Approvals', icon: UserCheck, roles: ['ADMIN', 'REGISTRAR', 'SUPER_ADMIN'] },
    { id: 'events', label: 'Events', icon: CalendarDays, roles: ['TEACHER', 'ADMIN', 'REGISTRAR', 'SUPER_ADMIN'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN', 'REGISTRAR', 'SUPER_ADMIN'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['SUPER_ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-900 border-r border-slate-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">VenuLynx</h1>
                <p className="text-xs text-slate-500">Campus Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 p-3">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentView(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
                    transition-all duration-200
                    ${currentView === item.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </nav>
          </ScrollArea>

          {/* User Profile */}
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
                <span className="text-white font-semibold">{user?.name?.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ============= HEADER COMPONENT =============
function Header() {
  const { sidebarOpen, setSidebarOpen, user } = useAppStore();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="hidden sm:flex items-center gap-2 text-slate-400 text-sm">
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              {user?.role.replace('_', ' ')}
            </Badge>
            {user?.department && (
              <>
                <ChevronRight className="h-4 w-4" />
                <span>{user.department}</span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="hidden md:flex border-slate-700 text-slate-400 hover:bg-slate-800">
            <Calendar className="h-4 w-4 mr-2" />
            {format(new Date(), 'EEEE, MMM d')}
          </Button>
        </div>
      </div>
    </header>
  );
}

// ============= DASHBOARD COMPONENT =============
function DashboardView() {
  const { user } = useAppStore();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">{getGreeting()}, {user?.name?.split(' ').pop()}! 👋</h1>
        <p className="text-emerald-100 mt-1">Here's what's happening with your venue bookings today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold text-white">{analytics?.overview?.totalBookings || 0}</p>
              </div>
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <FileText className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Upcoming Events</p>
                <p className="text-2xl font-bold text-white">{analytics?.overview?.upcomingEvents || 0}</p>
              </div>
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <CalendarDays className="h-6 w-6 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Events This Month</p>
                <p className="text-2xl font-bold text-white">{analytics?.overview?.eventsThisMonth || 0}</p>
              </div>
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Venues</p>
                <p className="text-2xl font-bold text-white">{analytics?.overview?.activeVenues || 0}</p>
              </div>
              <div className="p-3 bg-orange-500/20 rounded-xl">
                <Building2 className="h-6 w-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Venue */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-400" />
              Most Used Venue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.mostUsedVenue ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{analytics.mostUsedVenue.name}</p>
                    <p className="text-sm text-slate-400">{analytics.mostUsedVenue.type.replace('_', ' ')}</p>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                    {analytics.mostUsedVenue.bookingCount} bookings
                  </Badge>
                </div>
                <div className="text-sm text-slate-500">
                  Capacity: {analytics.mostUsedVenue.capacity} people
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No booking data available yet</p>
            )}
          </CardContent>
        </Card>

        {/* Busiest Day */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Busiest Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.busiestDay ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">{analytics.busiestDay.day}</p>
                    <p className="text-sm text-slate-400">Most events scheduled</p>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {analytics.busiestDay.count} events
                  </Badge>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No booking data available yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pending Approvals (for Admin/Registrar) */}
      {['ADMIN', 'REGISTRAR', 'SUPER_ADMIN'].includes(user?.role || '') && analytics?.pendingApprovals && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-400" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {analytics.pendingApprovals.admin > 0 && (
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <span className="text-amber-400">Admin Review</span>
                  <Badge className="bg-amber-500/20 text-amber-400">{analytics.pendingApprovals.admin}</Badge>
                </div>
              )}
              {analytics.pendingApprovals.registrar > 0 && (
                <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <span className="text-orange-400">Registrar Review</span>
                  <Badge className="bg-orange-500/20 text-orange-400">{analytics.pendingApprovals.registrar}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Distribution */}
      {analytics?.bookingsByDay && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Weekly Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-end h-32 gap-2">
              {Object.entries(analytics.bookingsByDay).map(([day, count]) => {
                const maxCount = Math.max(...Object.values(analytics.bookingsByDay) as number[]);
                const height = maxCount > 0 ? ((count as number) / maxCount) * 100 : 0;
                return (
                  <div key={day} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t"
                      style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <span className="text-xs text-slate-500">{day.slice(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============= VENUES VIEW =============
function VenuesView() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: 'all', search: '' });

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const response = await fetch('/api/venues');
      const data = await response.json();
      setVenues(data.venues || []);
    } catch (error) {
      toast.error('Failed to load venues');
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue => {
    const matchesType = filter.type === 'all' || venue.type === filter.type;
    const matchesSearch = !filter.search || 
      venue.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      venue.code.toLowerCase().includes(filter.search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const venueTypes = [...new Set(venues.map(v => v.type))];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'AUDITORIUM': return <Presentation className="h-4 w-4" />;
      case 'CLASSROOM': return <BookOpen className="h-4 w-4" />;
      case 'COMPUTER_LAB': return <Laptop className="h-4 w-4" />;
      case 'BASKETBALL_COURT': 
      case 'BADMINTON_COURT':
      case 'COLLEGE_GROUND': return <Dumbbell className="h-4 w-4" />;
      default: return <Building2 className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Campus Venues</h1>
          <p className="text-slate-400">Browse and manage campus facilities</p>
        </div>
        <div className="text-sm text-slate-400">
          {filteredVenues.length} venues found
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search venues..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white"
          />
        </div>
        <Select value={filter.type} onValueChange={(v) => setFilter({ ...filter, type: v })}>
          <SelectTrigger className="w-full sm:w-48 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Types</SelectItem>
            {venueTypes.map(type => (
              <SelectItem key={type} value={type}>{type.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredVenues.map((venue) => (
          <Card key={venue.id} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    {getTypeIcon(venue.type)}
                  </div>
                  <div>
                    <CardTitle className="text-white text-base">{venue.name}</CardTitle>
                    <p className="text-xs text-slate-500">{venue.code}</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-slate-600 text-slate-400">
                  {venue.type.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{venue.capacity}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{venue.building}, {venue.floor}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {Array.isArray(venue.facilities) &&
  venue.facilities.slice(0, 3).map((facility, i) => (
    <Badge
      key={i}
      variant="secondary"
      className="text-xs bg-slate-700 text-slate-300"
    >
      {facility}
    </Badge>
))}
                {venue.facilities?.length > 3 && (
                  <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                    +{venue.facilities.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============= AVAILABILITY VIEW =============
function AvailabilityView() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedVenue, setSelectedVenue] = useState<string>('all');

  const timeSlots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);

    try {

      const venuesRes = await fetch('/api/venues');
      const venuesData = await venuesRes.json();
      const venuesList = venuesData.venues || [];
      setVenues(venuesList);

      // fetch bookings for availability
      const bookingsRes = await fetch(`/api/bookings?date=${selectedDate}`);
      const bookingsData = await bookingsRes.json();

      setBookings(bookingsData.bookings || []);

    } catch {
      toast.error('Failed to load availability');
    } finally {
      setLoading(false);
    }
  };

  function getSlotStatus(venueId:string, slot:string){

    const booking = bookings.find((b:any)=>{
      return (
        b.venueId === venueId &&
        slot >= b.timeFrom &&
        slot < b.timeTo
      )
    })

    if(!booking) return "available"

    if(booking.status === "PENDING_ADMIN" || booking.status === "PENDING_REGISTRAR")
      return "pending"

    return "booked"
  }

  const filteredVenues =
    selectedVenue === 'all'
      ? venues
      : venues.filter(v => v.id === selectedVenue)

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl font-bold text-white">Venue Availability</h1>
        <p className="text-slate-400">Check real-time availability of campus venues</p>
      </div>

      {/* Filters */}

      <div className="flex gap-4">

        <Input
          type="date"
          value={selectedDate}
          onChange={(e)=>setSelectedDate(e.target.value)}
          className="bg-slate-800 border-slate-700 text-white w-48"
        />

        <Select value={selectedVenue} onValueChange={setSelectedVenue}>
          <SelectTrigger className="w-64 bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="All Venues"/>
          </SelectTrigger>

          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Venues</SelectItem>
            {venues.map(v=>(
              <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

      </div>

      {/* Legend */}

      <div className="flex gap-6 text-sm">

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded"/>
          <span className="text-slate-400">Available</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"/>
          <span className="text-slate-400">Booked</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded"/>
          <span className="text-slate-400">Pending</span>
        </div>

      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500"/>
        </div>
      ) : (

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr>
                <th className="text-left p-2 text-slate-400">Venue</th>

                {timeSlots.map(slot=>(
                  <th key={slot} className="p-2 text-slate-400 text-center">
                    {slot}
                  </th>
                ))}

              </tr>
            </thead>

            <tbody>

              {filteredVenues.map((venue,i)=>(
                <tr key={venue.id} className={i%2===0?'bg-slate-800/20':''}>

                  <td className="p-2">
                    <p className="text-white text-sm font-medium">{venue.name}</p>
                    <p className="text-xs text-slate-500">{venue.capacity} seats</p>
                  </td>

                  {timeSlots.map(slot=>{

                    const status = getSlotStatus(venue.id,slot)

                    const color =
                      status==="available"
                        ? "bg-emerald-500/30 border-emerald-500"
                        : status==="pending"
                        ? "bg-amber-500/30 border-amber-500"
                        : "bg-red-500/30 border-red-500"

                    return(
                      <td key={slot} className="p-1">
                        <div className={`h-8 rounded border ${color}`} />
                      </td>
                    )

                  })}

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      )}
    </div>
  )
}
// ============= BOOKINGS VIEW =============
function BookingsView() {
  const { user, setCurrentView } = useAppStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({
    venueId: '',
    eventDate: '',
    timeFrom: '09:00',
    timeTo: '10:00',
    participants: 1,
    purpose: '',
    remarks: '',
    refreshments: false,
    paSystem: false,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, venuesRes] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/venues'),
      ]);
      const bookingsData = await bookingsRes.json();
      const venuesData = await venuesRes.json();
      setBookings(bookingsData.bookings || []);
      setVenues(venuesData.venues || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Booking request submitted successfully!');
        setShowForm(false);
        setFormStep(1);
        setFormData({
          venueId: '',
          eventDate: '',
          timeFrom: '09:00',
          timeTo: '10:00',
          participants: 1,
          purpose: '',
          remarks: '',
          refreshments: false,
          paSystem: false,
        });
        fetchData();
      } else {
        if (data.conflict) {
          toast.error(`Venue already booked from ${data.conflict.timeFrom} to ${data.conflict.timeTo}`);
        } else {
          toast.error(data.error || 'Failed to create booking');
        }
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING_ADMIN: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      PENDING_REGISTRAR: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      APPROVED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
      CANCELLED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
      COMPLETED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return styles[status] || styles.PENDING_ADMIN;
  };

  const selectedVenue = venues.find(v => v.id === formData.venueId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="text-slate-400">Manage your venue booking requests</p>
        </div>
        {user?.role === 'TEACHER' && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        )}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No bookings found</p>
              {user?.role === 'TEACHER' && (
                <Button 
                  variant="outline" 
                  className="mt-4 border-slate-600 text-slate-300"
                  onClick={() => setShowForm(true)}
                >
                  Create your first booking
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-white">{booking.purpose}</h3>
                      <Badge className={getStatusBadge(booking.status)}>
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        <span>{booking.venue?.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(booking.eventDate), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{booking.timeFrom} - {booking.timeTo}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{booking.participants}</span>
                      </div>
                    </div>
                  </div>
                  
                  {booking.qrCode && (
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-slate-700 rounded-lg">
                        <QrCode className="h-6 w-6 text-emerald-400" />
                      </div>
                      <div className="text-xs">
                        <p className="text-slate-500">QR Code</p>
                        <p className="text-slate-300 font-mono">{booking.qrCode}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Booking Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Venue Booking</DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete the form below to request a venue booking
            </DialogDescription>
          </DialogHeader>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= formStep 
                    ? 'bg-emerald-500 text-white' 
                    : 'bg-slate-700 text-slate-400'
                }`}>
                  {step}
                </div>
                {step < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    step < formStep ? 'bg-emerald-500' : 'bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Event Details */}
            {formStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Event Date</Label>
                  <Input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Start Time</Label>
                    <Input
                      type="time"
                      value={formData.timeFrom}
                      onChange={(e) => setFormData({ ...formData, timeFrom: e.target.value })}
                      required
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">End Time</Label>
                    <Input
                      type="time"
                      value={formData.timeTo}
                      onChange={(e) => setFormData({ ...formData, timeTo: e.target.value })}
                      required
                      className="bg-slate-700/50 border-slate-600"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Expected Participants</Label>
                  <Input
  type="number"
  value={formData.participants || ""}
  onChange={(e) =>
    setFormData({
      ...formData,
      participants: Number(e.target.value) || 1
    })
  }
  min={1}
  required
  className="bg-slate-700/50 border-slate-600"
/>
                </div>
              </div>
            )}

            {/* Step 2: Venue Selection */}
            {formStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Select Venue</Label>
                  <Select value={formData.venueId} onValueChange={(v) => setFormData({ ...formData, venueId: v })}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600">
                      <SelectValue placeholder="Choose a venue" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {venues.map(venue => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.name} ({venue.capacity} seats)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedVenue && (
                  <Card className="bg-slate-700/30 border-slate-600">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-white mb-2">{selectedVenue.name}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
                        <div>Building: {selectedVenue.building}</div>
                        <div>Floor: {selectedVenue.floor}</div>
                        <div>Room: {selectedVenue.roomNumber}</div>
                        <div>Capacity: {selectedVenue.capacity}</div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Array.isArray(selectedVenue.facilities) &&
  selectedVenue.facilities.map((f, i) => (
    <Badge key={i} variant="secondary" className="text-xs bg-slate-600">
      {f}
    </Badge>
  ))
}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {formData.participants > (selectedVenue?.capacity || 0) && selectedVenue && (
                  <Alert className="bg-red-500/10 border-red-500/30">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      Participants exceed venue capacity ({selectedVenue.capacity})
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Step 3: Purpose & Facilities */}
            {formStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Purpose of Event</Label>
                  <Textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Describe the purpose of your event..."
                    required
                    className="bg-slate-700/50 border-slate-600 min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Additional Remarks</Label>
                  <Textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Any special requirements or notes..."
                    className="bg-slate-700/50 border-slate-600"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-slate-300">Additional Requirements</Label>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="refreshments"
                      checked={formData.refreshments}
                      onCheckedChange={(c) => setFormData({ ...formData, refreshments: !!c })}
                    />
                    <label htmlFor="refreshments" className="text-slate-300 flex items-center gap-2">
                      <Coffee className="h-4 w-4" /> Refreshments Required
                    </label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id="paSystem"
                      checked={formData.paSystem}
                      onCheckedChange={(c) => setFormData({ ...formData, paSystem: !!c })}
                    />
                    <label htmlFor="paSystem" className="text-slate-300 flex items-center gap-2">
                      <Volume2 className="h-4 w-4" /> PA System Required
                    </label>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-6">
              {formStep > 1 && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setFormStep(formStep - 1)}
                  className="border-slate-600 text-slate-300"
                >
                  Back
                </Button>
              )}
              {formStep < 3 ? (
                <Button 
                  type="button"
                  onClick={() => setFormStep(formStep + 1)}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  Next
                </Button>
              ) : (
                <Button 
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-500 hover:bg-emerald-600"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Booking'
                  )}
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============= APPROVALS VIEW =============
function ApprovalsView() {
  const { user } = useAppStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      // Filter for pending approvals based on role
      const pending = (data.bookings || []).filter((b: Booking) => {
        if (user?.role === 'ADMIN') return b.status === 'PENDING_ADMIN';
        if (user?.role === 'REGISTRAR') return b.status === 'PENDING_REGISTRAR';
        if (user?.role === 'SUPER_ADMIN') return ['PENDING_ADMIN', 'PENDING_REGISTRAR'].includes(b.status);
        return false;
      });
      setBookings(pending);
    } catch (error) {
      toast.error('Failed to load approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (bookingId: string, action: 'approve' | 'reject', remarks?: string) => {
    setProcessing(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, remarks }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(action === 'approve' ? 'Booking approved successfully!' : 'Booking rejected');
        fetchBookings();
      } else {
        toast.error(data.error || 'Action failed');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
        <p className="text-slate-400">
          {user?.role === 'ADMIN' && 'Review and approve booking requests'}
          {user?.role === 'REGISTRAR' && 'Final approval for booking requests'}
          {user?.role === 'SUPER_ADMIN' && 'Manage all pending approvals'}
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-slate-400">No pending approvals</p>
            <p className="text-sm text-slate-500 mt-1">All booking requests have been processed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="font-semibold text-white text-lg">{booking.purpose}</h3>
                      <p className="text-slate-400 text-sm mt-1">{booking.remarks}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Requested By</p>
                        <p className="text-white">{booking.user?.name}</p>
                        <p className="text-slate-400 text-xs">{booking.user?.department}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Venue</p>
                        <p className="text-white">{booking.venue?.name}</p>
                        <p className="text-slate-400 text-xs">{booking.venue?.building}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Date & Time</p>
                        <p className="text-white">{format(new Date(booking.eventDate), 'MMM d, yyyy')}</p>
                        <p className="text-slate-400 text-xs">{booking.timeFrom} - {booking.timeTo}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Participants</p>
                        <p className="text-white">{booking.participants} people</p>
                        <p className="text-slate-400 text-xs">Capacity: {booking.venue?.capacity}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {booking.refreshments && (
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          <Coffee className="h-3 w-3 mr-1" /> Refreshments
                        </Badge>
                      )}
                      {booking.paSystem && (
                        <Badge variant="outline" className="border-slate-600 text-slate-300">
                          <Volume2 className="h-3 w-3 mr-1" /> PA System
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <Button
                      onClick={() => handleAction(booking.id, 'approve')}
                      disabled={processing === booking.id}
                      className="bg-emerald-500 hover:bg-emerald-600 flex-1 lg:flex-none"
                    >
                      {processing === booking.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleAction(booking.id, 'reject')}
                      disabled={processing === booking.id}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex-1 lg:flex-none"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= EVENTS VIEW =============
function EventsView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events?upcoming=true');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Upcoming Events</h1>
        <p className="text-slate-400">View and manage scheduled events</p>
      </div>

      {events.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <CalendarDays className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No upcoming events</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-white text-base">{event.title}</CardTitle>
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <QrCode className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.eventDate), 'MMM d')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{event.timeFrom} - {event.timeTo}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-300">{event.venue?.name}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-slate-500" />
                  <span className="text-slate-300">{event.participants} participants</span>
                </div>

                <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                  <span className="text-xs text-slate-500">QR: {event.qrCode}</span>
                  <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300">
                    <Eye className="h-4 w-4 mr-1" /> View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ============= ANALYTICS VIEW =============
function AnalyticsView() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
        <p className="text-slate-400">Campus venue usage insights and statistics</p>
      </div>

      {/* Booking Status Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Approved</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {analytics?.bookingsByStatus?.APPROVED || 0}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-emerald-500/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending</p>
                <p className="text-2xl font-bold text-amber-400">
                  {(analytics?.bookingsByStatus?.PENDING_ADMIN || 0) + 
                   (analytics?.bookingsByStatus?.PENDING_REGISTRAR || 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Rejected</p>
                <p className="text-2xl font-bold text-red-400">
                  {analytics?.bookingsByStatus?.REJECTED || 0}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-500/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Venue Type Distribution */}
      {analytics?.venueTypeStats && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Venue Type Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.venueTypeStats).map(([type, count]) => {
                const total = Object.values(analytics.venueTypeStats).reduce((a: number, b) => a + (b as number), 0);
                const percentage = total > 0 ? ((count as number) / total) * 100 : 0;
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{type.replace('_', ' ')}</span>
                      <span className="text-slate-500">{count as number} bookings</span>
                    </div>
                    <Progress value={percentage} className="h-2 bg-slate-700" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monthly Trend */}
      {analytics?.monthlyTrend && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Monthly Booking Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-48">
              {Object.entries(analytics.monthlyTrend).map(([month, data]) => {
                const maxTotal = Math.max(...Object.values(analytics.monthlyTrend).map((d: any) => d.total));
                const height = maxTotal > 0 ? ((data as any).total / maxTotal) * 100 : 0;
                return (
                  <div key={month} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col gap-1" style={{ height: '150px' }}>
                      <div 
                        className="w-full bg-emerald-500 rounded-t flex-1"
                        style={{ height: `${(data as any).approved / ((data as any).total || 1) * 100}%`, marginTop: 'auto' }}
                      />
                    </div>
                    <span className="text-xs text-slate-500">{month.split('-')[1]}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============= SETTINGS VIEW =============
function SettingsView() {
  const { user } = useAppStore();
  const [seeding, setSeeding] = useState(false);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      if (response.ok) {
        toast.success('Database seeded successfully! Check console for demo credentials.');
        console.log('Demo Credentials:', data.credentials);
      } else {
        toast.error(data.error || 'Failed to seed database');
      }
    } catch {
      toast.error('Connection error');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">System Settings</h1>
        <p className="text-slate-400">Configure and manage the VenuLynx platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400 text-sm">
              Manage user accounts, roles, and permissions.
            </p>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              Manage Users
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-emerald-400" />
              Venue Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400 text-sm">
              Add, edit, or deactivate campus venues.
            </p>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              Manage Venues
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-400" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400 text-sm">
              Seed the database with sample data for testing.
            </p>
            <Button 
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              {seeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Seeding...
                </>
              ) : (
                'Seed Database'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5 text-emerald-400" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-400 text-sm">
              Configure system settings and preferences.
            </p>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              Configure
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============= MAIN APP COMPONENT =============
export default function VenuLynxApp() {
  const { user, isAuthenticated, isLoading, setLoading, setUser, currentView } = useAppStore();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };
    checkAuth();
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading VenuLynx...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'venues': return <VenuesView />;
      case 'availability': return <AvailabilityView />;
      case 'bookings': return <BookingsView />;
      case 'approvals': return <ApprovalsView />;
      case 'events': return <EventsView />;
      case 'analytics': return <AnalyticsView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {renderView()}
        </main>
        <footer className="bg-slate-900 border-t border-slate-800 py-4 px-6 text-center text-sm text-slate-500">
          VenuLynx © {new Date().getFullYear()} - Smart Campus Venue Management System
        </footer>
      </div>
    </div>
  );
}

// Import Database icon for Settings
function Database({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}
