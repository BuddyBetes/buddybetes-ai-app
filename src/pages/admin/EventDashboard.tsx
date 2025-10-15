import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, QrCode, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { format, isPast, isFuture, isToday } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import EventDialog from '@/components/admin/EventDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Event {
  id: string;
  title: string;
  event_date: string | null;
  location: string | null;
  description: string;
  totalRegistrations: number;
  checkedInCount: number;
}

const EventDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();

    // Subscribe to realtime updates for event registrations
    const channel = supabase
      .channel('event-registrations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_registrations'
        },
        () => {
          console.log('Registration updated, reloading events...');
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select(`
          *,
          event_registrations (
            id,
            checked_in
          )
        `)
        .eq("is_active", true)
        .order("event_date", { ascending: true });

      if (eventsError) throw eventsError;

      const formattedEvents = eventsData?.map((event) => {
        const registrations = event.event_registrations || [];
        const totalRegistrations = registrations.length;
        const checkedInCount = registrations.filter((reg: any) => reg.checked_in).length;
        
        return {
          id: event.id,
          title: event.title,
          event_date: event.event_date,
          location: event.location || "TBA",
          description: event.description,
          totalRegistrations,
          checkedInCount,
        };
      }) || [];

      setEvents(formattedEvents);
    } catch (error: any) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      if (editingEvent) {
        const { error } = await supabase
          .from('events')
          .update(data)
          .eq('id', editingEvent.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Event updated successfully' });
      } else {
        const { error } = await supabase
          .from('events')
          .insert([{ ...data, is_active: true }]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Event created successfully' });
      }
      setIsDialogOpen(false);
      setEditingEvent(null);
      loadEvents();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const confirmDelete = async () => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ is_active: false })
        .eq('id', eventToDelete);
      if (error) throw error;
      toast({ title: 'Success', description: 'Event deleted successfully' });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
      loadEvents();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (eventDate: string | null) => {
    if (!eventDate) return null;
    
    const date = new Date(eventDate);
    
    if (isToday(date)) {
      return <Badge className="bg-green-500">Happening Now</Badge>;
    } else if (isPast(date)) {
      return <Badge variant="secondary">Ended</Badge>;
    } else if (isFuture(date)) {
      return <Badge variant="outline">Upcoming</Badge>;
    }
    return null;
  };

  const getProgressPercentage = (checkedIn: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((checkedIn / total) * 100);
  };

  // Calculate summary stats
  const totalEvents = events.length;
  const totalRegistrations = events.reduce((sum, event) => sum + event.totalRegistrations, 0);
  const totalCheckedIn = events.reduce((sum, event) => sum + event.checkedInCount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Event Management</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Manage events and track registrations</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="h-12 sm:h-10 w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{totalEvents}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{totalRegistrations}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Checked In</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold">{totalCheckedIn}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0}% attendance
              </p>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No active events found</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Event
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
            {events.map((event) => {
              const progress = getProgressPercentage(event.checkedInCount, event.totalRegistrations);

              return (
                <Card key={event.id} className="overflow-hidden">
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-bold break-words">{event.title}</h3>
                          <p className="text-sm text-muted-foreground break-words line-clamp-2 mt-1">
                            {event.description}
                          </p>
                        </div>
                        {getStatusBadge(event.event_date)}
                      </div>

                      <div className="space-y-2 text-sm">
                        {event.event_date && (
                          <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">{format(new Date(event.event_date), 'PPP')}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span className="break-words">{event.location}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Check-in Progress</span>
                          <span className="font-medium">
                            {event.checkedInCount}/{event.totalRegistrations}
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="bg-primary rounded-full h-2 transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid gap-2 sm:gap-3 pt-2">
                        <Button
                          onClick={() => navigate(`/admin/events/scan/${event.id}`)}
                          className="w-full h-12 sm:h-11 text-base"
                          size="lg"
                        >
                          <QrCode className="mr-2 h-5 w-5" />
                          Scan QR Codes
                        </Button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            onClick={() => { setEditingEvent(event); setIsDialogOpen(true); }}
                            className="h-11 sm:h-10"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => { setEventToDelete(event.id); setDeleteDialogOpen(true); }}
                            className="h-11 sm:h-10 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <EventDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSubmit={handleSubmit}
          defaultValues={editingEvent}
          title={editingEvent ? 'Edit Event' : 'Create Event'}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this event? This will deactivate it and it will no longer appear in the active events list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
};

export default EventDashboard;
