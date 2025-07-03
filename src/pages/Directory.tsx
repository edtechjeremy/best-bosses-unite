
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Building, Users, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Sample reviews to show what users are missing
const sampleReviews = [
  {
    id: "sample-1",
    first_name: "Sarah",
    last_name: "Chen",
    company: "Tech Innovations Inc",
    location: "San Francisco, CA",
    industry: "Technology",
    function: "Engineering Manager",
    review: "Sarah transformed our engineering culture by implementing mentorship programs and creating a psychologically safe environment where everyone could contribute their best ideas. She consistently advocated for her team's professional development and career growth."
  },
  {
    id: "sample-2", 
    first_name: "Michael",
    last_name: "Rodriguez",
    company: "Global Marketing Solutions",
    location: "New York, NY",
    industry: "Marketing",
    function: "Creative Director",
    review: "Michael has an incredible ability to balance creative vision with practical business needs. He empowers his team to take creative risks while providing the support and guidance needed to deliver exceptional results. His leadership style brings out the best in everyone."
  },
  {
    id: "sample-3",
    first_name: "Jennifer",
    last_name: "Thompson",
    company: "Healthcare Partners",
    location: "Chicago, IL", 
    industry: "Healthcare",
    function: "Operations Manager",
    review: "Jennifer leads with empathy and strategic thinking. During challenging times, she maintained team morale while driving operational excellence. She's the kind of manager who remembers your personal goals and actively helps you achieve them."
  },
  {
    id: "sample-4",
    first_name: "David",
    last_name: "Park",
    company: "Financial Advisors Group",
    location: "Boston, MA",
    industry: "Finance", 
    function: "Senior Director",
    review: "David's approach to leadership is both inspiring and practical. He sets clear expectations while giving his team the autonomy to innovate. His door is always open, and he genuinely cares about both professional development and work-life balance."
  },
  {
    id: "sample-5",
    first_name: "Lisa",
    last_name: "Williams",
    company: "Education Excellence",
    location: "Austin, TX",
    industry: "Education",
    function: "Program Manager",
    review: "Lisa has a unique talent for seeing potential in people and helping them realize it. She creates opportunities for growth, provides constructive feedback, and celebrates team achievements. Working for her was a career-defining experience."
  },
  {
    id: "sample-6",
    first_name: "Robert",
    last_name: "Johnson",
    company: "Manufacturing Solutions",
    location: "Detroit, MI",
    industry: "Manufacturing",
    function: "Plant Manager", 
    review: "Robert combines strong operational leadership with genuine care for his people. He implemented safety improvements, streamlined processes, and created a culture where everyone felt valued and heard. His leadership style is both effective and inspiring."
  }
];

export const Directory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user, isLoading: authLoading } = useAuth();

  // Check if user has approved nomination
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('has_approved_nomination')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch approved bosses
  const { data: bosses = [], isLoading: bossesLoading } = useQuery({
    queryKey: ['bosses'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bosses')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching bosses:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!userProfile?.has_approved_nomination || !!user?.email && user.email === 'schifeling@gmail.com',
  });

  const filteredBosses = bosses.filter(boss =>
    boss.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.function.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasAccess = userProfile?.has_approved_nomination || (user?.email === 'schifeling@gmail.com');
  const isLoading = authLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-center mb-8">Best Bosses Directory</h1>
            
            {/* Search Bar */}
            <div className="relative mb-8">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name, company, location, industry, or function..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled
              />
            </div>

            {/* Blurred Results with Overlay */}
            <div className="relative">
              <div className="filter blur-sm pointer-events-none">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sampleReviews.map(boss => (
                    <Card key={boss.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">
                          {boss.first_name} {boss.last_name}
                        </h3>
                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4" />
                            <span>{boss.company}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4" />
                            <span>{boss.location}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4" />
                            <span>{boss.industry} • {boss.function}</span>
                          </div>
                        </div>
                        <p className="text-sm line-clamp-3">
                          {boss.review}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Access Required Overlay */}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Card className="max-w-md mx-4">
                  <CardContent className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-4">
                      Access Required
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      To view our directory of verified best bosses, you need to contribute by nominating an outstanding manager from your experience.
                    </p>
                    <div className="space-y-3">
                      <Button variant="hero" size="lg" asChild className="w-full">
                        <Link to="/nominate">Nominate a Best Boss</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full">
                        <Link to="/register">Create Account</Link>
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-4">
                      Just like Glassdoor, our directory is free for contributors
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">Best Bosses Directory</h1>
          
          {/* Search Bar */}
          <div className="relative mb-8 max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search by name, company, location, industry, or function..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Loading state */}
          {bossesLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading directory...</p>
            </div>
          )}

          {/* Results */}
          {!bossesLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBosses.map(boss => (
                <Card key={boss.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <Link to={`/boss/${boss.slug}`}>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-2">
                        {boss.first_name} {boss.last_name}
                      </h3>
                      <div className="space-y-2 text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>{boss.company}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{boss.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{boss.industry} • {boss.function}</span>
                        </div>
                      </div>
                      <p className="text-sm line-clamp-3">
                        {boss.review}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}

          {!bossesLoading && filteredBosses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bosses found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
