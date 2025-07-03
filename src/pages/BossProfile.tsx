
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Boss {
  id: string;
  first_name: string;
  last_name: string;
  company: string;
  location: string;
  industry: string;
  function: string;
  email: string;
  linkedin_profile: string;
  review: string;
  nominator_id: string;
  slug: string;
  profiles: {
    first_name: string;
    last_name: string;
    linkedin_profile: string;
  } | null;
}

export const BossProfile = () => {
  const { slug } = useParams();
  const [boss, setBoss] = useState<Boss | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkAccess();
    }
    fetchBoss();
  }, [slug, user]);

  const checkAccess = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('has_approved_nomination, email')
        .eq('user_id', user.id)
        .single();
      
      setHasAccess(data?.has_approved_nomination || data?.email === 'schifeling@gmail.com');
    } catch (error) {
      console.error('Error checking access:', error);
    }
  };

  const fetchBoss = async () => {
    try {
      console.log('Fetching boss with slug:', slug);
      
      // First try to get the boss directly
      const { data: bossData, error: bossError } = await supabase
        .from('bosses')
        .select('*')
        .eq('slug', slug)
        .single();

      if (bossError) {
        console.error('Error fetching boss:', bossError);
        
        // If boss not found, try to get from nominations table using the slug pattern
        // The slug format is: firstname-lastname-nominationid
        const slugParts = slug?.split('-') || [];
        if (slugParts.length >= 3) {
          const nominationId = slugParts[slugParts.length - 1];
          console.log('Trying to find nomination with ID:', nominationId);
          
          const { data: nominationData, error: nominationError } = await supabase
            .from('nominations')
            .select('*')
            .eq('id', nominationId)
            .eq('status', 'approved')
            .single();

          if (nominationData && !nominationError) {
            console.log('Found nomination, creating boss object:', nominationData);
            
            // Get nominator profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('first_name, last_name, linkedin_profile')
              .eq('user_id', nominationData.nominator_id)
              .single();

            // Create boss object from nomination data
            const bossFromNomination = {
              id: nominationData.id,
              first_name: nominationData.boss_first_name,
              last_name: nominationData.boss_last_name,
              company: nominationData.company,
              location: nominationData.location,
              industry: nominationData.industry,
              function: nominationData.function,
              email: nominationData.email,
              linkedin_profile: nominationData.linkedin_profile,
              review: nominationData.review,
              nominator_id: nominationData.nominator_id,
              slug: slug!,
              profiles: profileData || null
            };
            
            setBoss(bossFromNomination);
            return;
          }
        }
        
        throw bossError;
      }
      
      // Get nominator profile for the boss
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, linkedin_profile')
        .eq('user_id', bossData.nominator_id)
        .single();

      setBoss({
        ...bossData,
        profiles: profileData || null
      });
    } catch (error) {
      console.error('Error fetching boss:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareText = encodeURIComponent(`🏆 Congratulations to ${boss?.first_name} ${boss?.last_name} for being recognized as a Certified #BestBoss!\n\nWho's a manager who made a big difference in your career?\n\nGive 'em a little ❤️ today!`);
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${shareText}&url=${encodeURIComponent(window.location.href)}`;
    window.open(shareUrl, '_blank');
  };

  const handleDownloadCertificate = () => {
    // Create a styled certificate matching the website theme
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext('2d')!;
    
    // Background gradient (matching website theme)
    const gradient = ctx.createLinearGradient(0, 0, 1200, 800);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#f8fafc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 800);
    
    // Primary border (matching website primary color)
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, 1120, 720);
    
    // Secondary border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, 1080, 680);
    
    // Title
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Certified Best Boss', 600, 160);
    
    // Subtitle
    ctx.font = '32px Arial, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('This is to certify that', 600, 240);
    
    // Name with gradient
    const nameGradient = ctx.createLinearGradient(0, 280, 0, 340);
    nameGradient.addColorStop(0, '#3b82f6');
    nameGradient.addColorStop(1, '#1d4ed8');
    ctx.fillStyle = nameGradient;
    ctx.font = 'bold 52px Arial, sans-serif';
    ctx.fillText(`${boss?.first_name} ${boss?.last_name}`, 600, 320);
    
    // Description
    ctx.fillStyle = '#1e293b';
    ctx.font = '28px Arial, sans-serif';
    ctx.fillText('has been recognized as an outstanding leader by their team.', 600, 420);
    
    // Company info
    ctx.fillStyle = '#64748b';
    ctx.font = '24px Arial, sans-serif';
    ctx.fillText(`${boss?.company} • ${boss?.location}`, 600, 480);
    
    // Footer
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Arial, sans-serif';
    ctx.fillText('Certified by BestBosses.org | Great Leaders, Verified.', 600, 600);
    
    // Date
    const today = new Date();
    ctx.fillText(`Issued: ${today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 600, 640);
    
    // Download
    const link = document.createElement('a');
    link.download = `${boss?.first_name}-${boss?.last_name}-best-boss-certificate.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    
    toast({
      title: "Certificate Downloaded!",
      description: "Your Best Boss certificate has been saved to your downloads.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!boss) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Boss Not Found</CardTitle>
            <CardDescription>The boss profile you're looking for doesn't exist.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user || !hasAccess) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="text-center p-8">
                  <h2 className="text-2xl font-bold mb-4">Access Required</h2>
                  <p className="text-muted-foreground mb-6">
                    To view boss profiles, you need to register and nominate a great boss first.
                    <br />Just like Glassdoor, this gives you lifetime access to our directory!
                  </p>
                  <Button asChild variant="hero">
                    <a href="/register">Get Free Access</a>
                  </Button>
                </div>
              </div>
              
              {/* Blurred content preview */}
              <div className="filter blur-sm">
                <CardHeader>
                  <CardTitle className="text-3xl">{boss.first_name} {boss.last_name}</CardTitle>
                  <CardDescription className="text-lg">{boss.company} • {boss.location}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex gap-2">
                    <Badge variant="secondary">{boss.industry}</Badge>
                    <Badge variant="secondary">{boss.function}</Badge>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p>{boss.review}</p>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-3xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                    {boss.first_name} {boss.last_name}
                  </CardTitle>
                  <CardDescription className="text-lg mt-2">
                    {boss.company} • {boss.location}
                  </CardDescription>
                  <div className="flex gap-2 mt-4">
                    <Badge variant="secondary">{boss.industry}</Badge>
                    <Badge variant="secondary">{boss.function}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleShare} variant="outline" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={handleDownloadCertificate} variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Certificate
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
                <div className="space-y-2">
                  <p className="text-muted-foreground">Email: {boss.email}</p>
                  <a 
                    href={boss.linkedin_profile} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    LinkedIn Profile <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Why They're a Best Boss</h3>
                <div className="bg-gradient-to-r from-primary/5 to-primary-glow/5 p-6 rounded-lg border border-primary/10">
                  <p className="text-lg leading-relaxed">{boss.review}</p>
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      Nominated by{" "}
                       <a 
                         href={boss.profiles?.linkedin_profile || '#'} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-primary hover:underline"
                       >
                         {boss.profiles?.first_name} {boss.profiles?.last_name}
                       </a>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
