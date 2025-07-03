
export function hasProfile(obj: unknown): obj is { 
  first_name: string; 
  last_name: string; 
  email?: string;
  linkedin_profile?: string; 
} {
  return typeof obj === 'object' && 
         obj !== null &&
         'first_name' in (obj as Record<string, unknown>);
}
