
-- Fix the trigger function to handle duplicate slug creation
CREATE OR REPLACE FUNCTION public.create_boss_from_nomination()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create boss if status changed to approved
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Check if boss already exists for this nomination
    IF NOT EXISTS (SELECT 1 FROM public.bosses WHERE nomination_id = NEW.id) THEN
      -- Create slug from name with timestamp to ensure uniqueness
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
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
