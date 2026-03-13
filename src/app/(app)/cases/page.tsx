'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { casesApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

export default function CasesPage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const params = statusFilter ? { status: statusFilter } : {};
        if (['secretariat', 'admin', 'management'].includes(user?.role || '')) {
          const response = await casesApi.getAllAdmin(params);
          setCases(response.data);
        } else {
          const response = await casesApi.getAll(params);
          setCases(response.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, [user, statusFilter]);

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

  const canCreateCase = user?.role === 'staff';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-muted-foreground">
            {['secretariat', 'admin', 'management'].includes(user?.role || '') ? 'All submissions' : 'Your submissions'}
          </p>
        </div>
        {canCreateCase && (
          <Link href="/cases/new">
            <Button>Submit New Case</Button>
          </Link>
        )}
      </div>

      <div className="flex gap-4">
        <Select value={statusFilter || 'all'} onValueChange={(val) => setStatusFilter(val === 'all' ? '' : val)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Assigned">Assigned</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Escalated">Escalated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Case List</CardTitle>
          <CardDescription>{cases.length} total cases</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : cases.length === 0 ? (
            <p className="text-muted-foreground">No cases found</p>
          ) : (
            <div className="space-y-4">
              {cases.map((c) => (
                <div key={c._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm text-muted-foreground">{c.neoId}</span>
                      <Badge variant={getStatusColor(c.status)}>{c.status}</Badge>
                      {c.isAnonymous && (
                        <Badge variant="outline">Anonymous</Badge>
                      )}
                      <Badge variant={c.severity === 'High' ? 'destructive' : c.severity === 'Medium' ? 'warning' : 'secondary'}>
                        {c.severity || 'Medium'}
                      </Badge>
                    </div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.category} • {c.department} • {c.location}
                    </p>
                    {!c.isAnonymous || user?.role === 'admin' ? (
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted by: {c.submitter?.name || 'Unknown'}
                      </p>
                    ) : null}
                  </div>
                  <Link href={`/cases/${c._id}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}