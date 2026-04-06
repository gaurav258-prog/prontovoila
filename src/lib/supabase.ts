import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://thdoawdiwgplsxhwgpjx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZG9hd2Rpd2dwbHN4aHdncGp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NTczNzIsImV4cCI6MjA5MTAzMzM3Mn0.ojLlV3A-Pgmi3rMnH0CnXaw6NXc8zxihEWpQaKpFAZI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
