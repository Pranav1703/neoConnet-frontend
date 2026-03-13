'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { digestsApi, minutesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

export default function PublicHubPage() {
  const { user } = useAuth();
  const [digests, setDigests] = useState<any[]>([]);
  const [impacts, setImpacts] = useState<any[]>([]);
  const [minutes, setMinutes] = useState<any[]>([]);
  const [minutesSearch, setMinutesSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDigest, setSelectedDigest] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [digestsRes, impactsRes, minutesRes] = await Promise.all([
          digestsApi.getAll(),
          digestsApi.getImpact(),
          minutesApi.getAll(),
        ]);
        setDigests(digestsRes.data);
        setImpacts(impactsRes.data);
        setMinutes(minutesRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const canCreateDigest = ['secretariat', 'admin'].includes(user?.role || '');

  const handleMinutesSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await minutesApi.getAll(minutesSearch);
      setMinutes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Public Hub</h1>
          <p className="text-muted-foreground">
            See how staff feedback leads to real changes, and browse meeting minutes.
          </p>
        </div>
        <div className="flex gap-2">
          {!user && (
            <>
              <Button variant="outline" onClick={() => window.location.href = '/login'}>Login</Button>
              <Button onClick={() => window.location.href = '/register'}>Register</Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="digest" className="space-y-4">
        <TabsList>
          <TabsTrigger value="digest">Quarterly Digest</TabsTrigger>
          <TabsTrigger value="impact">Impact Tracking</TabsTrigger>
          <TabsTrigger value="minutes">Minutes Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="digest" className="space-y-4">
          {selectedDigest ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedDigest.title}</CardTitle>
                    <CardDescription>
                      {selectedDigest.quarter} {selectedDigest.year} • By {selectedDigest.author?.name}
                    </CardDescription>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedDigest(null)}>
                    ← Back
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none whitespace-pre-wrap">
                  {selectedDigest.content}
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {canCreateDigest && (
                <Button onClick={() => window.location.href = '/public/digest/new'}>
                  Create New Digest
                </Button>
              )}
              
              {digests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    No digests published yet
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {digests.map((digest) => (
                    <Card 
                      key={digest._id} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedDigest(digest)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg">{digest.title}</CardTitle>
                        <CardDescription>
                          {digest.quarter} {digest.year}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {digest.content.substring(0, 200)}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          By {digest.author?.name} • {new Date(digest.publishedAt).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          {canCreateDigest && (
            <Button onClick={() => window.location.href = '/public/impact/new'}>
              Add Impact Record
            </Button>
          )}

          {impacts.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No impact records available
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>How feedback turned into change</CardTitle>
                <CardDescription>
                  Each row shows what was raised, what action was taken, and what changed.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left text-sm font-medium">Period</th>
                      <th className="p-4 text-left text-sm font-medium">What was raised</th>
                      <th className="p-4 text-left text-sm font-medium">What action was taken</th>
                      <th className="p-4 text-left text-sm font-medium">What changed</th>
                      <th className="p-4 text-left text-sm font-medium">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {impacts.map((impact) => (
                      <tr key={impact._id} className="border-b align-top">
                        <td className="p-4 text-sm whitespace-nowrap">
                          {impact.quarter} {impact.year}
                        </td>
                        <td className="p-4 text-sm font-medium">
                          {impact.title}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {impact.description}
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {impact.changeSummary}
                        </td>
                        <td className="p-4 text-sm">
                          <span className={`px-2 py-1 rounded ${
                            impact.satisfactionScore >= 80 ? 'bg-green-100 text-green-800' :
                            impact.satisfactionScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {impact.satisfactionScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="minutes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Meeting Minutes Archive</CardTitle>
              <CardDescription>Search and open meeting documents (PDFs)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleMinutesSearch} className="flex gap-2">
                <Input
                  placeholder="Search minutes by title or description..."
                  value={minutesSearch}
                  onChange={(e) => setMinutesSearch(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Search</Button>
              </form>

              {minutes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No minutes found</p>
              ) : (
                <div className="space-y-3">
                  {minutes.map((minute: any) => (
                    <div
                      key={minute._id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{minute.title}</p>
                        {minute.description && (
                          <p className="text-sm text-muted-foreground">
                            {minute.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          Meeting Date: {new Date(minute.meetingDate).toLocaleDateString()}
                        </p>
                      </div>
                      <a
                        href={`http://localhost:5000/uploads/${minute.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="outline" size="sm">
                          View PDF
                        </Button>
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

