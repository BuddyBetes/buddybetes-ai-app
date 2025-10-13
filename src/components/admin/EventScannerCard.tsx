import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { QrCode, MapPin, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  event_date: string | null;
  location: string | null;
  description: string;
  total_registrations: number;
  checked_in: number;
}

interface EventScannerCardProps {
  event: Event;
  onScan: () => void;
}

const EventScannerCard = ({ event, onScan }: EventScannerCardProps) => {
  const percentage = event.total_registrations > 0
    ? Math.round((event.checked_in / event.total_registrations) * 100)
    : 0;

  const getStatusBadge = () => {
    if (!event.event_date) return null;
    
    const eventDate = new Date(event.event_date);
    const now = new Date();
    const isToday = eventDate.toDateString() === now.toDateString();
    const isPast = eventDate < now && !isToday;
    const isFuture = eventDate > now;

    if (isToday) {
      return <Badge className="bg-green-500">Happening Now</Badge>;
    } else if (isPast) {
      return <Badge variant="secondary">Ended</Badge>;
    } else if (isFuture) {
      return <Badge variant="outline">Upcoming</Badge>;
    }
    return null;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{event.title}</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          {event.event_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.event_date), 'PPP p')}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{event.total_registrations} registered</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Check-in Progress</span>
            <span className="text-muted-foreground">
              {event.checked_in} / {event.total_registrations} ({percentage}%)
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>

        <Button
          onClick={onScan}
          className="w-full touch-manipulation"
          size="lg"
        >
          <QrCode className="h-5 w-5 mr-2" />
          Scan QR Codes
        </Button>
      </CardContent>
    </Card>
  );
};

export default EventScannerCard;
