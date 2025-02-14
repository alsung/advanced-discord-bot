import "dotenv/config";
import { createClient } from '@supabase/supabase-js';

console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_KEY:', process.env.SUPABASE_KEY);

const SUPABASE_URL = process.env.SUPABASE_URL ?? (() => {
    throw new Error('SUPABASE_URL is not defined in environment variables');
})();

const SUPABASE_KEY = process.env.SUPABASE_KEY ?? (() => {
    throw new Error('SUPABASE_KEY is not defined in environment variables');
})();

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
