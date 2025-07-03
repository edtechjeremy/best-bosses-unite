-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_profile TEXT NOT NULL,
  has_approved_nomination BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nominations table
CREATE TABLE public.nominations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nominator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  boss_first_name TEXT NOT NULL,
  boss_last_name TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  industry TEXT NOT NULL,
  function TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_profile TEXT NOT NULL,
  review TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create approved bosses table (derived from approved nominations)
CREATE TABLE public.bosses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nomination_id UUID NOT NULL REFERENCES public.nominations(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT NOT NULL,
  industry TEXT NOT NULL,
  function TEXT NOT NULL,
  email TEXT NOT NULL,
  linkedin_profile TEXT NOT NULL,
  review TEXT NOT NULL,
  nominator_id UUID NOT NULL REFERENCES auth.users(id),
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nominations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bosses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for nominations
CREATE POLICY "Users can view their own nominations" 
ON public.nominations 
FOR SELECT 
USING (auth.uid() = nominator_id);

CREATE POLICY "Users can create nominations" 
ON public.nominations 
FOR INSERT 
WITH CHECK (auth.uid() = nominator_id);

CREATE POLICY "Admin can view all nominations" 
ON public.nominations 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND email = 'schifeling@gmail.com'
  )
);

-- RLS Policies for bosses
CREATE POLICY "Users with approved nominations can view bosses" 
ON public.bosses 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND has_approved_nomination = true
  ) OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND email = 'schifeling@gmail.com'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nominations_updated_at
  BEFORE UPDATE ON public.nominations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bosses_updated_at
  BEFORE UPDATE ON public.bosses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create boss entry when nomination is approved
CREATE OR REPLACE FUNCTION public.create_boss_from_nomination()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create boss if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Create slug from name
    INSERT INTO public.bosses (
      nomination_id,
      first_name,
      last_name,
      company,
      location,
      industry,
      function,
      email,
      linkedin_profile,
      review,
      nominator_id,
      slug
    ) VALUES (
      NEW.id,
      NEW.boss_first_name,
      NEW.boss_last_name,
      NEW.company,
      NEW.location,
      NEW.industry,
      NEW.function,
      NEW.email,
      NEW.linkedin_profile,
      NEW.review,
      NEW.nominator_id,
      lower(NEW.boss_first_name || '-' || NEW.boss_last_name || '-' || NEW.id::text)
    );
    
    -- Update nominator's profile to mark they have an approved nomination
    UPDATE public.profiles 
    SET has_approved_nomination = true 
    WHERE user_id = NEW.nominator_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for boss creation
CREATE TRIGGER create_boss_on_approval
  AFTER UPDATE ON public.nominations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_boss_from_nomination();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email, linkedin_profile)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'linkedin_profile'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();