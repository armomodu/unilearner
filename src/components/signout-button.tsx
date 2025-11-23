'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh(); // Force a refresh to clear any cached session data
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, try to redirect to clear the UI
      router.push('/');
      router.refresh();
    }
  };

  return (
    <Button 
      variant="outline" 
      className="w-full justify-start gap-2 text-destructive hover:text-destructive"
      onClick={handleSignOut}
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </Button>
  );
}