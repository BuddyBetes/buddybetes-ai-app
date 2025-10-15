import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subtitle: z.string().max(200).optional().nullable(),
  description: z.string().min(1, 'Description is required'),
  event_date: z.string().optional().nullable(),
  location: z.string().max(500).optional().nullable(),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  video_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  badge: z.string().max(50).optional().nullable(),
  color_gradient: z.string().max(200).optional().nullable(),
  max_attendees: z.number().int().positive().optional().nullable(),
});

interface EventFormProps {
  defaultValues?: any;
  onSubmit: (data: any) => Promise<void>;
}

const EventForm = ({ defaultValues, onSubmit }: EventFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      subtitle: defaultValues?.subtitle || '',
      description: defaultValues?.description || '',
      event_date: defaultValues?.event_date ? new Date(defaultValues.event_date).toISOString().slice(0, 16) : '',
      location: defaultValues?.location || '',
      image_url: defaultValues?.image_url || '',
      video_url: defaultValues?.video_url || '',
      badge: defaultValues?.badge || '',
      color_gradient: defaultValues?.color_gradient || '',
      max_attendees: defaultValues?.max_attendees || null,
    },
  });

  const onFormSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const processedData = {
        ...data,
        event_date: data.event_date ? new Date(data.event_date).toISOString() : null,
        image_url: data.image_url || null,
        video_url: data.video_url || null,
        subtitle: data.subtitle || null,
        badge: data.badge || null,
        color_gradient: data.color_gradient || null,
        max_attendees: data.max_attendees ? parseInt(data.max_attendees) : null,
      };
      await onSubmit(processedData);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input id="title" {...register('title')} />
        {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" {...register('subtitle')} />
        {errors.subtitle && <p className="text-sm text-destructive mt-1">{errors.subtitle.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" {...register('description')} rows={4} />
        {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="event_date">Event Date</Label>
        <Input id="event_date" type="datetime-local" {...register('event_date')} />
        {errors.event_date && <p className="text-sm text-destructive mt-1">{errors.event_date.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input id="location" {...register('location')} />
        {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input id="image_url" type="url" placeholder="https://example.com/image.jpg" {...register('image_url')} />
        {errors.image_url && <p className="text-sm text-destructive mt-1">{errors.image_url.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="video_url">Video URL</Label>
        <Input id="video_url" type="url" placeholder="https://youtube.com/..." {...register('video_url')} />
        {errors.video_url && <p className="text-sm text-destructive mt-1">{errors.video_url.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="badge">Badge Text</Label>
        <Input id="badge" placeholder="NEW" {...register('badge')} />
        {errors.badge && <p className="text-sm text-destructive mt-1">{errors.badge.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="color_gradient">Color Gradient</Label>
        <Input id="color_gradient" placeholder="from-blue-500 to-purple-600" {...register('color_gradient')} />
        {errors.color_gradient && <p className="text-sm text-destructive mt-1">{errors.color_gradient.message as string}</p>}
      </div>

      <div>
        <Label htmlFor="max_attendees">Max Attendees</Label>
        <Input id="max_attendees" type="number" {...register('max_attendees', { valueAsNumber: true })} />
        {errors.max_attendees && <p className="text-sm text-destructive mt-1">{errors.max_attendees.message as string}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {defaultValues ? 'Update Event' : 'Create Event'}
      </Button>
    </form>
  );
};

export default EventForm;
