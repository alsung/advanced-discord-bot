import { SupabaseClient } from "@supabase/supabase-js";

export const mockSupabase: Partial<SupabaseClient> = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => Promise.resolve({ data: { id: "test-user-id", role: "member" }, error: null })
        })
      }),
      insert: () => ({
        select: () => ({
          single: async () => Promise.resolve({ data: { id: "new-user-id" }, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          eq: () => ({
            select: () => ({
              single: async () => Promise.resolve({ data: { id: "test-user-id", role: "admin" }, error: null })
            })
          })
        })
      }) // ✅ Ensures `.update().eq().eq()` works
    }) as any, // TypeScript workaround for SupabaseClient structure
  } as Partial<SupabaseClient>;
  