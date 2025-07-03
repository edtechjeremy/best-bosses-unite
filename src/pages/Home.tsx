import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Users, Award } from "lucide-react";

export const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary-glow/5 to-accent/5">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent mb-6">
              Find Verified Reviews of the World's Best Bosses
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              <strong>Job seekers:</strong> Discover amazing managers <em>before</em> you apply.<br />
              <strong>Hiring managers:</strong> Showcase your leadership to attract top talent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" asChild>
                <Link to="/nominate">Nominate a Best Boss</Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/directory">Browse Directory</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Simple, verified, and focused on celebrating great leadership
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Nominate</h3>
                <p className="text-muted-foreground">
                  Share your experience with an outstanding manager who made a difference in your career
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-r from-accent to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Verify</h3>
                <p className="text-muted-foreground">
                  Our team reviews nominations to ensure authenticity and quality
                </p>
              </CardContent>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gradient-to-r from-success to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-success-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Celebrate</h3>
                <p className="text-muted-foreground">
                  Great bosses get recognized and can share their certification with the world
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-muted/30 to-muted/10">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Why Best Bosses Matters
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">For Job Seekers</h3>
                    <p className="text-muted-foreground">Find managers who invest in their team's growth before you apply</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">For Hiring Managers</h3>
                    <p className="text-muted-foreground">
                      Showcase your leadership style to attract top talent
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-success mt-0.5" />
                  <div>
                    <h3 className="font-semibold mb-1">For Everyone</h3>
                    <p className="text-muted-foreground">
                      Create a culture where great leadership is recognized and rewarded
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
                <p className="text-muted-foreground mb-6">
                  Join our community and help recognize outstanding leadership
                </p>
                <Button variant="hero" size="lg" asChild>
                  <Link to="/register">Get Started Today</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Best Bosses, 2025<br />
            Great Leaders, Verified.
          </p>
        </div>
      </footer>
    </div>
  );
};
