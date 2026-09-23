// Supabase-native social login. Replaces the old Lovable Cloud OAuth broker.
// Each provider must be enabled in Supabase → Authentication → Sign In / Providers
// with its client id/secret:
//   • Google   — free (Google Cloud OAuth client)
//   • Facebook — free (Meta app)
//   • Apple    — requires a paid Apple Developer Program account ($99/yr)
// The browser is redirected to the provider by supabase-js; on return the session
// is picked up automatically (detectSessionInUrl) and /auth finishes the login.

import { supabase } from "../supabase/client";

export type OAuthProvider = "google" | "apple" | "facebook";
type SignInOptions = { redirect_uri?: string };
type Result = { redirected?: boolean; error?: Error };

export const oauth = {
  auth: {
    signInWithOAuth: async (provider: OAuthProvider, opts?: SignInOptions): Promise<Result> => {
      const redirectTo =
        opts?.redirect_uri ??
        (typeof window !== "undefined" ? `${window.location.origin}/auth` : undefined);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: redirectTo ? { redirectTo } : {},
      });
      if (error) return { error };
      // supabase-js navigates the browser to the provider; nothing after this runs.
      return { redirected: true };
    },
  },
};
