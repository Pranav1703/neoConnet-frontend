'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { analyticsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overviewRes, hotspotsRes, trendsRes] = await Promise.all([
          analyticsApi.getOverview(),
          analyticsApi.getHotspots(),
          analyticsApi.getTrends(),
        ]);
        setOverview(overviewRes.data);
        setHotspots(hotspotsRes.data);
        setTrends(trendsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (!['secretariat', 'admin', 'management'].includes(user?.role || '')) {
    return (
      <div className="p-8 text-center">
        <p>You do not have permission to view analytics.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Overview and insights</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview?.totalCases || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">New Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {overview?.byStatus?.find((s: any) => s._id === 'New')?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(overview?.byStatus?.find((s: any) => s._id === 'In Progress')?.count || 0) +
               (overview?.byStatus?.find((s: any) => s._id === 'Assigned')?.count || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Escalated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {overview?.byStatus?.find((s: any) => s._id === 'Escalated')?.count || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {hotspots.length > 0 && (
        <Card className="border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              ⚠️ Hotspot Alerts
            </CardTitle>
            <CardDescription>
              Departments with 5+ cases sharing the same category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {hotspots.map((spot, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div>
                    <span className="font-medium">{spot._id.department}</span>
                    <span className="text-muted-foreground"> - {spot._id.category}</span>
                  </div>
                  <Badge variant="destructive">{spot.count} cases</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cases by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview?.byStatus?.map((item: any) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span>{item._id}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview?.byCategory?.map((item: any) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span>{item._id}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cases by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overview?.byDepartment?.map((item: any) => (
                <div key={item._id} className="flex items-center justify-between">
                  <span>{item._id}</span>
                  <Badge variant="outline">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>30-Day Trend</CardTitle>
            <CardDescription>Cases created per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {trends.slice(-10).map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item._id}</span>
                  <span className="font-medium">{item.count} cases</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}