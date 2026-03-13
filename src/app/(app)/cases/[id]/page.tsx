'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { casesApi, usersApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statuses = ['New', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Escalated'];

export default function CaseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [caseData, setCaseData] = useState<any>(null);
  const [caseManagers, setCaseManagers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await casesApi.getById(id as string);
        setCaseData(response.data);
        
        if (['secretariat', 'admin'].includes(user?.role || '')) {
          const cmResponse = await usersApi.getCaseManagers();
          setCaseManagers(cmResponse.data);
        }
      } catch (err) {
        console.error(err);
        router.push('/cases');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user, router]);

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true);
    try {
      await casesApi.update(id as string, { status });
      const response = await casesApi.getById(id as string);
      setCaseData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignment = async (assignedTo: string) => {
    setUpdating(true);
    try {
      await casesApi.update(id as string, { assignedTo, status: 'Assigned' });
      const response = await casesApi.getById(id as string);
      setCaseData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    setUpdating(true);
    try {
      await casesApi.update(id as string, { notes: note });
      const response = await casesApi.getById(id as string);
      setCaseData(response.data);
      setNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

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

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!caseData) {
    return <div className="p-8">Case not found</div>;
  }

  const canEdit = ['secretariat', 'admin', 'case_manager', 'management'].includes(user?.role || '');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{caseData.neoId}</h1>
          <p className="text-xl">{caseData.title}</p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Case Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span>
              <Badge variant={getStatusColor(caseData.status)}>{caseData.status}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Category:</span>
              <span>{caseData.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Severity:</span>
              <Badge variant={caseData.severity === 'High' ? 'destructive' : caseData.severity === 'Medium' ? 'warning' : 'secondary'}>
                {caseData.severity || 'Medium'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Department:</span>
              <span>{caseData.department}</span>
            </div>
            {caseData.location && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Location:</span>
                <span>{caseData.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Submitted:</span>
              <span>{new Date(caseData.createdAt).toLocaleDateString()}</span>
            </div>
            {caseData.isAnonymous && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Submitted:</span>
                <Badge variant="outline">Anonymous</Badge>
              </div>
            )}
            {(!caseData.isAnonymous || user?.role === 'admin') && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">By:</span>
                <span>{caseData.submitter?.name}</span>
                <span className="text-muted-foreground">({caseData.submitter?.department})</span>
              </div>
            )}
            {caseData.assignedTo && (
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Assigned to:</span>
                <span>{caseData.assignedTo.name}</span>
              </div>
            )}
            
            {caseData.attachments?.length > 0 && (
              <div>
                <span className="text-muted-foreground">Attachments:</span>
                <div className="mt-2 flex gap-2">
                  {caseData.attachments.map((file: string, idx: number) => (
                    <a 
                      key={idx}
                      href={`http://localhost:5000/uploads/${file}`}
                      target="_blank"
                      className="text-sm text-primary hover:underline"
                    >
                      File {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{caseData.description}</p>
          </CardContent>
        </Card>
      </div>

      {canEdit && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Update Case</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {['secretariat', 'admin'].includes(user?.role || '') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign to Case Manager</label>
                  <Select 
                    value={caseData.assignedTo?._id || 'unassigned'} 
                    onValueChange={(val) => handleAssignment(val === 'unassigned' ? '' : val)}
                    disabled={updating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select case manager" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {caseManagers.map(cm => (
                        <SelectItem key={cm._id} value={cm._id}>{cm.name} ({cm.department})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Update Status</label>
                <Select 
                  value={caseData.status} 
                  onValueChange={handleStatusUpdate}
                  disabled={updating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add a note or update..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
              <Button 
                className="mt-2" 
                onClick={handleAddNote}
                disabled={updating || !note.trim()}
              >
                Add Note
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {caseData.notes?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Case Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {caseData.notes.map((note: any, idx: number) => (
              <div key={idx} className="border-b pb-4 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{note.author?.name || 'Unknown'}</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(note.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{note.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}