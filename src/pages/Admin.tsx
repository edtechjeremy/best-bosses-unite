import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink } from "lucide-react";

interface Nomination {
  id: string;
  boss_first_name: string;
  boss_last_name: string;
  company: string;
  location: string;
  industry: string;
  function: string;
  email: string;
  linkedin_profile: string;
  review: string;
  status: string;
  created_at: string;
  nominator_id: string;
  profiles: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export const Admin = () => {
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin) return;
    fetchNominations();
  }, [isAdmin]);

  const fetchNominations = async () => {
    try {
      const { data, error } = await supabase
        .from('nominations')
        .select(`
          *,
          profiles!inner(
            first_name,
            last_name,
            email
          )
        `)
        .eq('profiles.user_id', 'nominations.nominator_id')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNominations((data as any) || []);
    } catch (error) {
      console.error('Error fetching nominations:', error);
      toast({
        title: "Error",
        description: "Failed to fetch nominations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (nomination: Nomination) => {
    setActionLoading(nomination.id);
    try {
      const { error } = await supabase
        .from('nominations')
        .update({ status: 'approved' })
        .eq('id', nomination.id);

      if (error) throw error;

      // Send emails
      const baseUrl = window.location.origin;
      const bossSlug = `${nomination.boss_first_name.toLowerCase()}-${nomination.boss_last_name.toLowerCase()}-${nomination.id}`;
      
      // Email to nominator
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'nomination_approved_nominator',
          to: nomination.profiles?.email || '',
          data: {
            nominatorFirstName: nomination.profiles?.first_name || '',
            bossName: `${nomination.boss_first_name} ${nomination.boss_last_name}`,
            directoryUrl: `${baseUrl}/directory`,
            bossProfileUrl: `${baseUrl}/boss/${bossSlug}`,
          }
        }
      });

      // Email to boss
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'nomination_approved_boss',
          to: nomination.email,
          data: {
            bossFirstName: nomination.boss_first_name,
            nominatorName: `${nomination.profiles?.first_name || ''} ${nomination.profiles?.last_name || ''}`,
            review: nomination.review,
            bossProfileUrl: `${baseUrl}/boss/${bossSlug}`,
            certificateUrl: `${baseUrl}/boss/${bossSlug}#certificate`,
          }
        }
      });

      toast({
        title: "Nomination Approved!",
        description: "Boss has been added to the directory and emails sent.",
      });

      fetchNominations();
    } catch (error) {
      console.error('Error approving nomination:', error);
      toast({
        title: "Error",
        description: "Failed to approve nomination",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (nominationId: string) => {
    setActionLoading(nominationId);
    try {
      const { error } = await supabase
        .from('nominations')
        .update({ status: 'rejected' })
        .eq('id', nominationId);

      if (error) throw error;

      toast({
        title: "Nomination Rejected",
        description: "The nomination has been rejected.",
      });

      fetchNominations();
    } catch (error) {
      console.error('Error rejecting nomination:', error);
      toast({
        title: "Error",
        description: "Failed to reject nomination",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Review and manage boss nominations</p>
        </div>

        <div className="grid gap-6">
          {nominations.map((nomination) => (
            <Card key={nomination.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">
                      {nomination.boss_first_name} {nomination.boss_last_name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {nomination.company} • {nomination.location}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{nomination.industry}</Badge>
                      <Badge variant="secondary">{nomination.function}</Badge>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      nomination.status === 'approved' ? 'default' :
                      nomination.status === 'rejected' ? 'destructive' : 'secondary'
                    }
                  >
                    {nomination.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Contact Information</h4>
                  <p className="text-sm text-muted-foreground">Email: {nomination.email}</p>
                  <a 
                    href={nomination.linkedin_profile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                  >
                    LinkedIn Profile <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Review</h4>
                  <p className="text-sm bg-muted p-3 rounded-lg">{nomination.review}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Nominator</h4>
                  <p className="text-sm text-muted-foreground">
                    {nomination.profiles?.first_name} {nomination.profiles?.last_name} ({nomination.profiles?.email})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Submitted: {new Date(nomination.created_at).toLocaleDateString()}
                  </p>
                </div>

                {nomination.status === 'pending' && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={() => handleApprove(nomination)}
                      disabled={actionLoading === nomination.id}
                      variant="hero"
                    >
                      {actionLoading === nomination.id ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      onClick={() => handleReject(nomination.id)}
                      disabled={actionLoading === nomination.id}
                      variant="destructive"
                    >
                      {actionLoading === nomination.id ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {nominations.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No nominations found.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};