/// <reference types="bun" />
import { describe, it, expect } from "bun:test";
import { demoteUserToMember, getOrCreateUser, promoteUserToAdmin } from "../database/user.js";
import { mockSupabase } from "../database/__mocks__/supabaseClient.js";
import { SupabaseClient } from "@supabase/supabase-js";

const testUserUUID = "2cbe9567-afd4-4ab5-91cd-9043cf03f13e";

describe("User Management Tests", () => {
    it("should return an existing user ID", async () => {
        const userId = await getOrCreateUser(mockSupabase as unknown as SupabaseClient, "123456789", "testUser");
        expect(userId).toBe("test-user-id");
    });

    it("should create a new user if not found", async () => {
        const newUserId = await getOrCreateUser(mockSupabase as unknown as SupabaseClient, "987654321", "newUser");
        expect(newUserId).not.toBeNull;
    });

    it("should promote a user to admin", async () => {
        const updatedUser = await promoteUserToAdmin(mockSupabase as unknown as SupabaseClient, "123456789");
        expect(updatedUser?.role).toBe("admin");
    });

    it("should demote a user from admin to member", async () => {
        // Modify mockSupabase to return 'admin' before demotion
        (mockSupabase as any).from = () => ({
            select: () => ({
                eq: () => ({
                    single: async () => Promise.resolve({ data: { id: "test-user-id", role: "admin" }, error: null })
                })
            }),
            update: () => ({
                eq: () => ({
                    eq: () => ({
                        select: () => ({
                            single: async () => Promise.resolve({ data: { id: "test-user-id", role: "member" }, error: null })
                        })
                    })
                })
            })
        });

        const updatedUser = await demoteUserToMember(mockSupabase as unknown as SupabaseClient, "123456789");
        expect(updatedUser?.role).toBe("member");
    });
});