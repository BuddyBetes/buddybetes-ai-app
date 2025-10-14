import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  subtitle: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  event_date: z.string().optional(),
  location: z.string().optional(),
  video_url: z.string().url().optional().or(z.literal('')),
  max_attendees: z.number().int().positive().optional().or(z.literal(0)),
  badge: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  color_gradient: z.string().optional(),
  is_active: z.boolean().default(true),
});

export type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  defaultValues?: Partial<EventFormData>;
  onSubmit: (data: EventFormData) => Promise<void>;
  isLoading?: boolean;
}

const EventForm = ({ defaultValues, onSubmit, isLoading }: EventFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      is_active: true,
      ...defaultValues,
    },
  });

  const isActive = watch('is_active');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="title">Event Title *</Label>
        <Input id="title" {...register('title')} />
        {errors.title && (
          <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" {...register('subtitle')} />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea id="description" {...register('description')} rows={4} />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event_date">Event Date</Label>
          <Input
            id="event_date"
            type="datetime-local"
            {...register('event_date')}
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input id="location" {...register('location')} />
        </div>
      </div>

      <div>
        <Label htmlFor="video_url">Video URL</Label>
        <Input
          id="video_url"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          {...register('video_url')}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="max_attendees">Max Attendees</Label>
          <Input
            id="max_attendees"
            type="number"
            min="0"
            {...register('max_attendees', { valueAsNumber: true })}
          />
        </div>

        <div>
          <Label htmlFor="badge">Badge Text</Label>
          <Input
            id="badge"
            placeholder="e.g., New, Featured"
            {...register('badge')}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          placeholder="https://..."
          {...register('image_url')}
        />
      </div>

      <div>
        <Label htmlFor="color_gradient">Color Gradient (CSS)</Label>
        <Input
          id="color_gradient"
          placeholder="e.g., from-blue-500 to-purple-600"
          {...register('color_gradient')}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={isActive}
          onCheckedChange={(checked) => setValue('is_active', checked)}
        />
        <Label htmlFor="is_active" className="cursor-pointer">
          Event is Active
        </Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Event'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
