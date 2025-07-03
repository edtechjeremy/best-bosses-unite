
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const industries = [
  "Consulting", "Education", "Finance", "Government", "Healthcare", "Human Resources", 
  "Legal", "Manufacturing", "Marketing", "Non-profit", "Operations", "Real Estate", 
  "Retail", "Sales", "Technology", "Other"
].sort();

const functions = [
  "Business Development", "Customer Success", "Data Science", "Design", "Engineering", 
  "Finance", "Human Resources", "IT", "Legal", "Marketing", "Operations", 
  "Product Management", "Quality Assurance", "Sales", "Strategy", "Other"
].sort();

export const Nominate = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    location: "",
    industry: "",
    function: "",
    email: "",
    linkedinProfile: "",
    review: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewCharCount, setReviewCharCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Login Required",
        description: "Please log in to nominate a boss.",
        variant: "destructive",
      });
      navigate("/login");
    }
  }, [user, isLoading, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (reviewCharCount < 100) {
      toast({
        title: "Review too short",
        description: "Please provide at least 100 characters explaining why you'd recommend this person.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a nomination.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      navigate("/login");
      return;
    }

    try {
      const { error } = await supabase
        .from('nominations')
        .insert({
          nominator_id: user.id,
          boss_first_name: formData.firstName,
          boss_last_name: formData.lastName,
          company: formData.company,
          location: formData.location,
          industry: formData.industry,
          function: formData.function,
          email: formData.email,
          linkedin_profile: formData.linkedinProfile,
          review: formData.review,
        });

      if (error) throw error;

      // Send notification email to nominator
      try {
        const { data: nominatorProfile } = await supabase
          .from('profiles')
          .select('first_name')
          .eq('user_id', user.id)
          .single();

        await supabase.functions.invoke('send-email', {
          body: {
            type: 'nomination_submitted',
            to: user.email,
            data: {
              nominatorFirstName: nominatorProfile?.first_name || '',
              bossName: `${formData.firstName} ${formData.lastName}`,
            }
          }
        });
      } catch (emailError) {
        console.warn("Email sending failed:", emailError);
      }

      toast({
        title: "Nomination Submitted!",
        description: "Thank you for your nomination. We'll review it and notify you once it's approved.",
      });
      navigate("/directory");
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === "review") {
      setReviewCharCount(value.length);
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render the form if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Nominate a Best Boss
              </CardTitle>
              <CardDescription>
                Help others find great managers by sharing your positive experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Current Company *</Label>
                    <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      name="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="industry">Industry *</Label>
                    <Select value={formData.industry} onValueChange={(value) => handleSelectChange("industry", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(industry => (
                          <SelectItem key={industry} value={industry}>
                            {industry}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="function">Function *</Label>
                    <Select value={formData.function} onValueChange={(value) => handleSelectChange("function", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select function" />
                      </SelectTrigger>
                      <SelectContent>
                        {functions.map(func => (
                          <SelectItem key={func} value={func}>
                            {func}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkedinProfile">LinkedIn Profile *</Label>
                    <Input
                      id="linkedinProfile"
                      name="linkedinProfile"
                      placeholder="https://linkedin.com/in/their-profile"
                      value={formData.linkedinProfile}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="review">
                    Why would you recommend this person as a Best Boss? *
                    <span className="text-sm text-muted-foreground ml-2">
                      ({reviewCharCount}/100 characters minimum)
                    </span>
                  </Label>
                  <Textarea
                    id="review"
                    name="review"
                    placeholder="Share specific examples of what makes this person an exceptional manager..."
                    value={formData.review}
                    onChange={handleChange}
                    className="min-h-32"
                    required
                  />
                  {reviewCharCount < 100 && reviewCharCount > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Need {100 - reviewCharCount} more characters
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting || reviewCharCount < 100}
                  variant="hero"
                  size="lg"
                >
                  {isSubmitting ? "Submitting Nomination..." : "Submit Nomination"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
