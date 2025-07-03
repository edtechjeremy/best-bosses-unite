import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Eye, Mail } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { hasProfile } from "@/lib/typeGuards";

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
    linkedin_profile: string;
  } | null;
}

export const Admin = () => {
  const [nominations, setNominations] = useState<Nomination[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedNomination, setSelectedNomination] = useState<Nomination | null>(null);
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAdmin) return;
    fetchNominations();
  }, [isAdmin]);

  const fetchNominations = async () => {
    try {
      console.log('Fetching nominations with profile data...');
      
      // Get all nominations with nominator profiles in a single query
      const { data: nominationsData, error: nominationsError } = await supabase
        .from('nominations')
        .select(`
          *,
          profiles!nominations_nominator_id_fkey (
            first_name,
            last_name,
            email,
            linkedin_profile
          )
        `)
        .order('created_at', { ascending: false });

      if (nominationsError) {
        console.error('Error fetching nominations:', nominationsError);
        throw nominationsError;
      }

      console.log('Nominations data:', nominationsData);
      
      // Transform the data to ensure proper typing and handle null profiles
      const transformedNominations: Nomination[] = (nominationsData || []).map(nomination => ({
        ...nomination,
        profiles: hasProfile(nomination.profiles) ? nomination.profiles : null
      }));
      
      setNominations(transformedNominations);
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

      toast({
        title: "Nomination Approved!",
        description: "Boss has been added to the directory.",
      });

      // Try to send emails, but don't fail the whole operation if they fail
      try {
        const baseUrl = window.location.origin;
        const bossSlug = `${nomination.boss_first_name.toLowerCase()}-${nomination.boss_last_name.toLowerCase()}-${nomination.id}`;
        
        // Get fresh nominator data to ensure we have the latest info
        const { data: nominatorProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('user_id', nomination.nominator_id)
          .single();

        if (!nominatorProfile) {
          console.warn('No nominator profile found for user:', nomination.nominator_id);
        }

        console.log('Sending emails with nominator data:', nominatorProfile);
        
        // Email to nominator
        if (nominatorProfile?.email) {
          await supabase.functions.invoke('send-email', {
            body: {
              type: 'nomination_approved_nominator',
              to: nominatorProfile.email,
              data: {
                nominatorFirstName: nominatorProfile.first_name || '',
                bossName: `${nomination.boss_first_name} ${nomination.boss_last_name}`,
                directoryUrl: `${baseUrl}/directory`,
                bossProfileUrl: `${baseUrl}/boss/${bossSlug}`,
              }
            }
          });
        }

        // Email to boss
        await supabase.functions.invoke('send-email', {
          body: {
            type: 'nomination_approved_boss',
            to: nomination.email,
            data: {
              bossFirstName: nomination.boss_first_name,
              nominatorName: nominatorProfile ? `${nominatorProfile.first_name || ''} ${nominatorProfile.last_name || ''}`.trim() : 'A colleague',
              review: nomination.review,
              bossProfileUrl: `${baseUrl}/boss/${bossSlug}`,
            }
          }
        });

        console.log("Emails sent successfully");
      } catch (emailError) {
        console.warn("Email sending failed, but nomination was still approved:", emailError);
        toast({
          title: "Note",
          description: "Nomination approved but emails may not have been sent.",
          variant: "destructive",
        });
      }

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

  const handleResendNominationEmail = async (nomination: Nomination) => {
    setActionLoading(`resend-${nomination.id}`);
    try {
      const baseUrl = window.location.origin;
      const bossSlug = `${nomination.boss_first_name.toLowerCase()}-${nomination.boss_last_name.toLowerCase()}-${nomination.id}`;
      
      // Get fresh nominator data
      const { data: nominatorProfile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', nomination.nominator_id)
        .single();
      
      // Send the nomination email to the boss
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'nomination_approved_boss',
          to: nomination.email,
          data: {
            bossFirstName: nomination.boss_first_name,
            bossLastName: nomination.boss_last_name,
            nominatorName: nominatorProfile ? `${nominatorProfile.first_name || ''} ${nominatorProfile.last_name || ''}`.trim() : 'A colleague',
            review: nomination.review,
            bossProfileUrl: `${baseUrl}/boss/${bossSlug}`,
          }
        }
      });

      toast({
        title: "Email Sent!",
        description: "The nomination email has been resent to the boss.",
      });
    } catch (error) {
      console.error('Error resending nomination email:', error);
      toast({
        title: "Error",
        description: "Failed to resend nomination email",
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

        <Card>
          <CardHeader>
            <CardTitle>All Nominations</CardTitle>
            <CardDescription>
              {nominations.length} total nominations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Boss Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Industry</TableHead>
                  <TableHead>Nominator</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nominations.map((nomination) => {
                  const profile = hasProfile(nomination.profiles) ? nomination.profiles : null;
                  
                  return (
                  <TableRow key={nomination.id}>
                    <TableCell className="font-medium">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-left"
                            onClick={() => setSelectedNomination(nomination)}
                          >
                            {nomination.boss_first_name} {nomination.boss_last_name}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>
                              {selectedNomination?.boss_first_name} {selectedNomination?.boss_last_name}
                            </DialogTitle>
                            <DialogDescription>
                              {selectedNomination?.company} • {selectedNomination?.location}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedNomination && (
                            <div className="space-y-6">
                              <div className="flex gap-2">
                                <Badge variant="secondary">{selectedNomination.industry}</Badge>
                                <Badge variant="secondary">{selectedNomination.function}</Badge>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-2">Contact Information</h4>
                                <p className="text-sm text-muted-foreground">Email: {selectedNomination.email}</p>
                                <a 
                                  href={selectedNomination.linkedin_profile} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                                >
                                  LinkedIn Profile <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Review</h4>
                                <p className="text-sm bg-muted p-3 rounded-lg">{selectedNomination.review}</p>
                              </div>

                              <div>
                                <h4 className="font-medium mb-2">Nominator</h4>
                                <p className="text-sm text-muted-foreground">
                                  {selectedNomination.profiles?.first_name || 'Unknown'} {selectedNomination.profiles?.last_name || 'User'} ({selectedNomination.profiles?.email || 'No email'})
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Submitted: {new Date(selectedNomination.created_at).toLocaleDateString()}
                                </p>
                              </div>

                              <div className="flex gap-3 pt-4">
                                {selectedNomination.status === 'pending' && (
                                  <>
                                    <Button
                                      onClick={() => handleApprove(selectedNomination)}
                                      disabled={actionLoading === selectedNomination.id}
                                      variant="hero"
                                    >
                                      {actionLoading === selectedNomination.id ? "Approving..." : "Approve"}
                                    </Button>
                                    <Button
                                      onClick={() => handleReject(selectedNomination.id)}
                                      disabled={actionLoading === selectedNomination.id}
                                      variant="destructive"
                                    >
                                      {actionLoading === selectedNomination.id ? "Rejecting..." : "Reject"}
                                    </Button>
                                  </>
                                )}
                                
                                {selectedNomination.status === 'approved' && (
                                  <Button
                                    onClick={() => handleResendNominationEmail(selectedNomination)}
                                    disabled={actionLoading === `resend-${selectedNomination.id}`}
                                    variant="outline"
                                  >
                                    <Mail className="w-4 h-4 mr-2" />
                                    {actionLoading === `resend-${selectedNomination.id}` ? "Sending..." : "Resend Nomination Email"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                    <TableCell>{nomination.company}</TableCell>
                    <TableCell>{nomination.industry}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User'}
                        </span>
                        {profile?.linkedin_profile && (
                          <a 
                            href={profile.linkedin_profile} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          nomination.status === 'approved' ? 'default' :
                          nomination.status === 'rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {nomination.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {nomination.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleApprove(nomination)}
                            disabled={actionLoading === nomination.id}
                            variant="hero"
                            size="sm"
                          >
                            {actionLoading === nomination.id ? "..." : "Approve"}
                          </Button>
                          <Button
                            onClick={() => handleReject(nomination.id)}
                            disabled={actionLoading === nomination.id}
                            variant="destructive"
                            size="sm"
                          >
                            {actionLoading === nomination.id ? "..." : "Reject"}
                          </Button>
                        </div>
                      )}
                      {nomination.status === 'approved' && (
                        <Button
                          onClick={() => handleResendNominationEmail(nomination)}
                          disabled={actionLoading === `resend-${nomination.id}`}
                          variant="outline"
                          size="sm"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          {actionLoading === `resend-${nomination.id}` ? "..." : "Resend"}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {nominations.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No nominations found.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
