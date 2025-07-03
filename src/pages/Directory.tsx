import { useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Building, Users, AlertCircle } from "lucide-react";

// Mock data for demonstration
const mockBosses = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    company: "Tech Innovators Inc",
    location: "San Francisco, CA",
    industry: "Technology",
    function: "Engineering",
    review: "Sarah is an exceptional leader who truly cares about her team's growth. She provides clear direction while giving us the autonomy to innovate...",
    nominatorLinkedIn: "https://linkedin.com/in/nominator1"
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Chen",
    company: "Growth Marketing Co",
    location: "Austin, TX",
    industry: "Marketing",
    function: "Marketing",
    review: "Michael has an incredible ability to see the big picture while supporting each team member's individual development. His feedback is always constructive...",
    nominatorLinkedIn: "https://linkedin.com/in/nominator2"
  },
  {
    id: 3,
    firstName: "Emily",
    lastName: "Rodriguez",
    company: "Financial Solutions LLC",
    location: "New York, NY",
    industry: "Finance",
    function: "Finance",
    review: "Emily creates a culture of transparency and trust. She's always available when we need guidance and celebrates our wins as much as her own...",
    nominatorLinkedIn: "https://linkedin.com/in/nominator3"
  }
];

export const Directory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hasAccess, setHasAccess] = useState(false); // This will be managed by actual auth later

  const filteredBosses = mockBosses.filter(boss =>
    boss.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    boss.function.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  {mockBosses.map(boss => (
                    <Card key={boss.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-semibold mb-2">
                          {boss.firstName} {boss.lastName}
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

          {/* Results */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBosses.map(boss => (
              <Card key={boss.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link to={`/boss/${boss.id}`}>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {boss.firstName} {boss.lastName}
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

          {filteredBosses.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No bosses found matching your search.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};