import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface CohortData {
  cohort_week: string;
  signup_count: number;
  day_1_retention: number;
  day_7_retention: number;
  day_30_retention: number;
}

interface CohortRetentionHeatmapProps {
  data: CohortData[];
}

const CohortRetentionHeatmap = ({ data }: CohortRetentionHeatmapProps) => {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading cohort data...
          </div>
        </CardContent>
      </Card>
    );
  }

  const getRetentionColor = (retention: number) => {
    if (retention >= 75) return 'bg-green-500';
    if (retention >= 50) return 'bg-green-400';
    if (retention >= 25) return 'bg-yellow-400';
    if (retention >= 10) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Cohort Retention Analysis</CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">User retention by signup week</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[500px]">
            <div className="grid grid-cols-5 gap-2 mb-2 text-xs sm:text-sm font-medium">
              <div className="text-muted-foreground">Week</div>
              <div className="text-center text-muted-foreground">Signups</div>
              <div className="text-center text-muted-foreground">Day 1</div>
              <div className="text-center text-muted-foreground">Day 7</div>
              <div className="text-center text-muted-foreground">Day 30</div>
            </div>
            <div className="space-y-2">
              {data.map((cohort) => (
                <div key={cohort.cohort_week} className="grid grid-cols-5 gap-2 items-center text-xs sm:text-sm">
                  <div className="font-medium">
                    {format(new Date(cohort.cohort_week), 'MMM d')}
                  </div>
                  <div className="text-center font-semibold">{cohort.signup_count}</div>
                  <div className="flex items-center justify-center">
                    <div className={`w-full h-8 rounded flex items-center justify-center text-white font-medium ${getRetentionColor(cohort.day_1_retention)}`}>
                      {cohort.day_1_retention.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className={`w-full h-8 rounded flex items-center justify-center text-white font-medium ${getRetentionColor(cohort.day_7_retention)}`}>
                      {cohort.day_7_retention.toFixed(1)}%
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className={`w-full h-8 rounded flex items-center justify-center text-white font-medium ${getRetentionColor(cohort.day_30_retention)}`}>
                      {cohort.day_30_retention.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-muted-foreground">≥75%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-muted-foreground">25-50%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span className="text-muted-foreground">&lt;10%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CohortRetentionHeatmap;
