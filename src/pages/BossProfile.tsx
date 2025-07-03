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
      
      // First try to get the boss directly with profile data
      const { data: bossData, error: bossError } = await supabase
        .from('bosses')
        .select(`
          *,
          profiles!bosses_nominator_id_fkey (
            first_name,
            last_name,
            linkedin_profile
          )
        `)
        .eq('slug', slug)
        .single();

      if (bossError) {
        console.error('Error fetching boss:', bossError);
        
        // If boss not found, try to get from nominations table using the slug pattern
        const slugParts = slug?.split('-') || [];
        if (slugParts.length >= 3) {
          const nominationId = slugParts[slugParts.length - 1];
          console.log('Trying to find nomination with ID:', nominationId);
          
          const { data: nominationData, error: nominationError } = await supabase
            .from('nominations')
            .select(`
              *,
              profiles!nominations_nominator_id_fkey (
                first_name,
                last_name,
                linkedin_profile
              )
            `)
            .eq('id', nominationId)
            .eq('status', 'approved')
            .single();

          if (nominationData && !nominationError) {
            console.log('Found nomination, creating boss object:', nominationData);
            
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
              profiles: nominationData.profiles || null
            };
            
            setBoss(bossFromNomination);
            return;
          }
        }
        
        // If we still can't find it, set boss to null
        setBoss(null);
        return;
      }
      
      setBoss(bossData);
    } catch (error) {
      console.error('Error fetching boss:', error);
      setBoss(null);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const currentUrl = window.location.href;
    const shareText = encodeURIComponent(`🏆 Congratulations to ${boss?.first_name} ${boss?.last_name} for being recognized as a Certified #BestBoss!\n\nWho's a manager who made a big difference in your career?\n\nGive 'em a little ❤️ today!\n\n${currentUrl}`);
    const shareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${shareText}`;
    window.open(shareUrl, '_blank');
  };

  const handleDownloadCertificate = () => {
    // Create a premium, luxury certificate
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 1000;
    const ctx = canvas.getContext('2d')!;
    
    // Premium gradient background (professional blue to purple)
    const gradient = ctx.createLinearGradient(0, 0, 1400, 1000);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(0.5, '#6366f1');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1400, 1000);
    
    // Luxury border with multiple layers
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.strokeRect(60, 60, 1280, 880);
    
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 6;
    ctx.strokeRect(80, 80, 1240, 840);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(100, 100, 1200, 800);
    
    // Premium title with shadow
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.fillText('CERTIFIED', 700, 240);
    
    // "Best Boss" with luxury styling
    ctx.font = 'bold 90px Georgia, serif';
    const bestBossGradient = ctx.createLinearGradient(0, 280, 0, 360);
    bestBossGradient.addColorStop(0, '#f97316');
    bestBossGradient.addColorStop(1, '#fb923c');
    ctx.fillStyle = bestBossGradient;
    ctx.fillText('BEST BOSS', 700, 340);
    
    // Elegant subtitle
    ctx.font = '36px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.shadowBlur = 4;
    ctx.fillText('This certificate is proudly presented to', 700, 420);
    
    // Boss name with premium styling
    ctx.font = 'bold 72px Georgia, serif';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = 'rgba(247, 147, 22, 0.5)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillText(`${boss?.first_name} ${boss?.last_name}`, 700, 540);
    
    // Recognition text
    ctx.font = '32px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.shadowColor = 'rgba(0,0,0,0.2)';
    ctx.shadowBlur = 4;
    ctx.fillText('in recognition of outstanding leadership', 700, 620);
    ctx.fillText('and exceptional management excellence', 700, 670);
    
    // VIP badge
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillStyle = '#f97316';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.fillText('★ VIP LEADER ★', 700, 730);
    
    // Premium footer
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 24px Georgia, serif';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.fillText('BESTBOSSES.ORG', 700, 800);
    
    ctx.font = '20px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Great Leaders, Verified.', 700, 830);
    
    // Elegant date
    ctx.font = '18px Georgia, serif';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    const today = new Date();
    ctx.fillText(`Certified: ${today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, 700, 880);
    
    // Download
    const link = document.createElement('a');
    link.download = `${boss?.first_name}-${boss?.last_name}-best-boss-certificate.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    link.click();
    
    toast({
      title: "Certificate Downloaded!",
      description: "Your premium Best Boss certificate has been saved to your downloads.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Show blurred content with access overlay for unauthorized users or when boss not found
  if (!user || !hasAccess || !boss) {
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
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-3xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                        {boss?.first_name || "Amazing"} {boss?.last_name || "Boss"}
                      </CardTitle>
                      <CardDescription className="text-lg mt-2">
                        {boss?.company || "Top Company"} • {boss?.location || "Great Location"}
                      </CardDescription>
                      <div className="flex gap-2 mt-4">
                        <Badge variant="secondary">{boss?.industry || "Technology"}</Badge>
                        <Badge variant="secondary">{boss?.function || "Leadership"}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Certificate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-8">
                  <div>
                    <a 
                      href={boss?.linkedin_profile || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1 text-lg"
                    >
                      View LinkedIn Profile <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-4">Why They're a Best Boss</h3>
                    <div className="bg-gradient-to-r from-primary/5 to-primary-glow/5 p-6 rounded-lg border border-primary/10">
                      <div className="text-lg leading-relaxed whitespace-pre-line">{boss?.review || "This incredible leader transformed our team culture and helped everyone grow..."}</div>
                      <div className="mt-4 pt-4 border-t border-primary/10">
                        <p className="text-sm text-muted-foreground">
                          Nominated by{" "}
                           <a 
                             href={boss?.profiles?.linkedin_profile || '#'} 
                             target="_blank" 
                             rel="noopener noreferrer"
                             className="text-primary hover:underline"
                           >
                             {boss?.profiles?.first_name || "Amazing"} {boss?.profiles?.last_name || "Employee"}
                           </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Full access - show complete profile
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
                <a 
                  href={boss.linkedin_profile} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline inline-flex items-center gap-1 text-lg"
                >
                  View LinkedIn Profile <ExternalLink className="w-5 h-5" />
                </a>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Why They're a Best Boss</h3>
                <div className="bg-gradient-to-r from-primary/5 to-primary-glow/5 p-6 rounded-lg border border-primary/10">
                  <div className="text-lg leading-relaxed whitespace-pre-line">{boss.review}</div>
                  <div className="mt-4 pt-4 border-t border-primary/10">
                    <p className="text-sm text-muted-foreground">
                      Nominated by{" "}
                       <a 
                         href={boss.profiles?.linkedin_profile || '#'} 
                         target="_blank" 
                         rel="noopener noreferrer"
                         className="text-primary hover:underline"
                       >
                         {boss.profiles?.first_name || 'Unknown'} {boss.profiles?.last_name || 'User'}
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
