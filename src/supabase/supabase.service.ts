import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private supabaseAdmin: SupabaseClient;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error(
        'Missing Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)',
      );
    }

    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  }

  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }
}
