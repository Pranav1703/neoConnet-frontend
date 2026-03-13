'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { digestsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function CreateImpactPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    changeSummary: '',
    quarter: '',
    year: new Date().getFullYear(),
    casesResolved: 0,
    satisfactionScore: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await digestsApi.createImpact(formData);
      router.push('/public');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create impact record');
    } finally {
      setLoading(false);
    }
  };

  if (!['secretariat', 'admin'].includes(user?.role || '')) {
    return (
      <div className="p-8 text-center">
        <p>You do not have permission to create impact records.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add Impact Record</CardTitle>
          <CardDescription>Show how staff feedback led to concrete changes</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">What was raised?</Label>
              <Input
                id="title"
                placeholder="Short summary of the feedback or issue"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">What action was taken?</Label>
              <Textarea
                id="description"
                placeholder="Describe the decisions, initiatives, or fixes that were implemented"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="changeSummary">What changed as a result?</Label>
              <Textarea
                id="changeSummary"
                placeholder="Explain the concrete changes staff can see (policies, facilities, processes, etc.)"
                rows={3}
                value={formData.changeSummary}
                onChange={(e) => setFormData({ ...formData, changeSummary: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quarter</Label>
                <Select 
                  value={formData.quarter} 
                  onValueChange={(value) => setFormData({ ...formData, quarter: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select quarter" />
                  </SelectTrigger>
                  <SelectContent>
                    {quarters.map(q => (
                      <SelectItem key={q} value={q}>{q}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                  min={2020}
                  max={2030}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="casesResolved">Cases Resolved</Label>
                <Input
                  id="casesResolved"
                  type="number"
                  value={formData.casesResolved}
                  onChange={(e) => setFormData({ ...formData, casesResolved: parseInt(e.target.value) })}
                  min={0}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="satisfactionScore">Satisfaction Score (%)</Label>
                <Input
                  id="satisfactionScore"
                  type="number"
                  value={formData.satisfactionScore}
                  onChange={(e) => setFormData({ ...formData, satisfactionScore: parseInt(e.target.value) })}
                  min={0}
                  max={100}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Record'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}