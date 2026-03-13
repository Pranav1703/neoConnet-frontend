'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { casesApi, pollsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DashboardPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.role === 'staff') {
          const casesRes = await casesApi.getAll();
          setCases(casesRes.data);
        } else if (user?.role === 'case_manager') {
          const casesRes = await casesApi.getAll();
          setCases(casesRes.data);
        } else if (['secretariat', 'admin', 'management'].includes(user?.role || '')) {
          const casesRes = await casesApi.getAllAdmin();
          setCases(casesRes.data);
        }
        const pollsRes = await pollsApi.getActive();
        setPolls(pollsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'default';
      case 'Assigned': return 'secondary';
      case 'In Progress': return 'warning';
      case 'Pending': return 'outline';
      case 'Resolved': return 'success';
      case 'Escalated': return 'destructive';
      default: return 'default';
    }
  };

  const myCases = cases.filter(c => 
    user?.role === 'staff' ? true : cases.length > 0
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
        <p className="text-muted-foreground">Dashboard Overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Polls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{polls.length}</div>
          </CardContent>
        </Card>
        {['secretariat', 'admin', 'management'].includes(user?.role || '') && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cases.filter(c => c.status === 'New').length}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Escalated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {cases.filter(c => c.status === 'Escalated').length}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">Recent Cases</TabsTrigger>
          <TabsTrigger value="polls">Active Polls</TabsTrigger>
        </TabsList>
        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Cases</CardTitle>
              <CardDescription>Recent case submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p>Loading...</p>
              ) : cases.length === 0 ? (
                <p className="text-muted-foreground">No cases found</p>
              ) : (
                <div className="space-y-4">
                  {myCases.map((c) => (
                    <div key={c._id} className="flex items-center justify-between border-b pb-4 last:border-0">
                      <div>
                        <p className="font-medium">{c.title}</p>
                        <p className="text-sm text-muted-foreground">{c.neoId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(c.status)}>{c.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="polls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Polls</CardTitle>
              <CardDescription>Cast your vote</CardDescription>
            </CardHeader>
            <CardContent>
              {polls.length === 0 ? (
                <p className="text-muted-foreground">No active polls</p>
              ) : (
                <div className="space-y-4">
                  {polls.map((poll) => (
                    <div key={poll._id} className="border-b pb-4 last:border-0">
                      <p className="font-medium">{poll.title}</p>
                      <p className="text-sm text-muted-foreground mb-2">{poll.description}</p>
                      <a href={`/polls?id=${poll._id}`} className="text-sm text-primary hover:underline">
                        View & Vote →
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}