'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { pollsApi } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function PollsPage() {
  const searchParams = useSearchParams();
  const pollId = searchParams.get('id');
  const { user } = useAuth();
  const [polls, setPolls] = useState<any[]>([]);
  const [currentPoll, setCurrentPoll] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await pollsApi.getActive();
        setPolls(response.data);
        if (pollId) {
          const pollRes = await pollsApi.getById(pollId);
          setCurrentPoll(pollRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();
  }, [pollId]);

  const hasVoted = (poll: any) => {
    return poll.options.some((opt: any) => 
      opt.votes.includes(user?._id)
    );
  };

  const handleVote = async (optionIndex: number) => {
    if (!currentPoll || hasVoted(currentPoll)) return;
    setVoting(true);
    try {
      const response = await pollsApi.vote(currentPoll._id, { optionIndex });
      setCurrentPoll(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  if (currentPoll) {
    const voted = hasVoted(currentPoll);
    const totalVotes = currentPoll.options.reduce((acc: number, opt: any) => acc + opt.votes.length, 0);
    const isActive = currentPoll.isActive && new Date(currentPoll.endsAt) > new Date();

    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Button variant="outline" onClick={() => setCurrentPoll(null)}>← Back to Polls</Button>
        
        <Card>
          <CardHeader>
            <CardTitle>{currentPoll.title}</CardTitle>
            <CardDescription>{currentPoll.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentPoll.options.map((option: any, idx: number) => {
              const voteCount = option.votes.length;
              const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
              
              return (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option.text}</span>
                    <span className="text-sm text-muted-foreground">
                      {voteCount} vote{voteCount !== 1 ? 's' : ''} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} />
                  {voted && (
                    <div className="flex justify-end">
                      {option.votes.includes(user?._id) && (
                        <span className="text-xs text-green-600">✓ You voted</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Total votes: {totalVotes}
              </p>
              <p className="text-sm text-muted-foreground">
                Ends: {new Date(currentPoll.endsAt).toLocaleDateString()}
              </p>
            </div>

            {!voted && isActive && (
              <div className="pt-4">
                <p className="text-sm font-medium mb-2">Cast your vote:</p>
                <div className="flex flex-wrap gap-2">
                  {currentPoll.options.map((_: any, idx: number) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => handleVote(idx)}
                      disabled={voting}
                    >
                      Vote for Option {idx + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {voted && (
              <div className="pt-4 text-green-600">
                ✓ You have voted in this poll
              </div>
            )}

            {!isActive && (
              <div className="pt-4 text-muted-foreground">
                This poll has ended
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Polls</h1>
          <p className="text-muted-foreground">Cast your vote on active polls</p>
        </div>
        {['secretariat', 'admin'].includes(user?.role || '') && (
          <Button onClick={() => window.location.href = '/polls/new'}>
            Create Poll
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {polls.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No active polls at the moment
            </CardContent>
          </Card>
        ) : (
          polls.map((poll) => (
            <Card key={poll._id}>
              <CardHeader>
                <CardTitle className="text-lg">{poll.title}</CardTitle>
                <CardDescription>{poll.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {poll.options.length} options • Ends {new Date(poll.endsAt).toLocaleDateString()}
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setCurrentPoll(poll)}
                >
                  View & Vote
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}