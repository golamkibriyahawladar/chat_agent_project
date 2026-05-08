"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useChatStore } from "@/store/useChatStore";
import { UserRole } from "@/types";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

const supabase = createClient();

// Admin emails - add your admin emails here
const ADMIN_EMAILS = ["mariyahawladar123@gmail.com"];

export function useAuthStoreSync() {
  const { setUserId, setUserRole, setCompanyId } = useChatStore();

  useEffect(() => {
    const syncAuth = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        console.log("[AuthSync] User:", user?.email, "Error:", userError?.message);

        if (!user) {
          console.log("[AuthSync] No user found, skipping sync");
          return;
        }

        setUserId(user.id);

        // Determine role: check email first as a reliable fallback
        const isAdmin = ADMIN_EMAILS.includes(user.email || "");

        // Try to fetch profile from database
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, company_id, full_name")
          .eq("id", user.id)
          .single();

        console.log("[AuthSync] Profile:", profile, "Profile Error:", profileError?.message);

        if (profile && !profileError) {
          // Profile exists - use its data
          setUserRole(profile.role as UserRole);
          useChatStore.setState({ userName: profile.full_name || user.email?.split("@")[0] || "User" });

          if (profile.company_id) {
            setCompanyId(profile.company_id);
          } else if (profile.role === "super_admin") {
            await fetchAndSetFirstCompany();
          }
        } else {
          // Profile doesn't exist or RLS blocked the read
          // Use email-based role detection as fallback
          console.warn("[AuthSync] Could not read profile. Using email-based detection.");

          const role: UserRole = isAdmin ? "super_admin" : "client";
          setUserRole(role);
          useChatStore.setState({ userName: user.email?.split("@")[0] || "User" });

          // Try to create profile (may fail due to RLS, that's OK)
          const { error: insertErr } = await supabase
            .from("profiles")
            .insert([{
              id: user.id,
              role: role,
              full_name: user.email?.split("@")[0] || "User",
              email: user.email
            }]);

          console.log("[AuthSync] Profile insert result:", insertErr ? insertErr.message : "Success");

          if (role === "super_admin") {
            await fetchAndSetFirstCompany();
          }
        }
      } catch (err) {
        console.error("[AuthSync] Unexpected error:", err);
      }
    };

    const fetchAndSetFirstCompany = async () => {
      try {
        const { data: firstCompany } = await supabase
          .from("companies")
          .select("id")
          .limit(1)
          .single();
        if (firstCompany) {
          useChatStore.getState().setCompanyId(firstCompany.id);
        }
      } catch (e) {
        console.log("[AuthSync] Could not fetch first company");
      }
    };

    syncAuth();

    // Listen for auth state changes
    if (supabase && supabase.auth) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event: AuthChangeEvent, session: Session | null) => {
          if (session?.user) {
            setUserId(session.user.id);
            syncAuth();
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [setUserId, setUserRole, setCompanyId]);
}
