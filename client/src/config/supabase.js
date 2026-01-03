
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxylxmxocipxevvltnee.supabase.co';
const supabaseKey = 'sb_publishable_QImAL-Z6fxxHusAjeX7h0w_A9_6r8W_';

export const supabase = createClient(supabaseUrl, supabaseKey);
