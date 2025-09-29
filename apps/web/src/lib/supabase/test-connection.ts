import { createClient } from './client';

export async function testDatabaseConnection(): Promise<{
  success: boolean;
  message: string;
  error?: any;
}> {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return {
        success: false,
        message: 'Database connection not configured. Please set up your .env.local file with Supabase credentials.',
      };
    }

    // Create client
    const supabase = createClient();

    // Try to make a simple query
    const { error } = await supabase.from('_test_connection').select('count').single();

    if (error && error.code === '42P01') {
      // Table doesn't exist - this is expected for a new setup
      return {
        success: true,
        message: 'Successfully connected to Supabase (database is empty, ready for migrations).',
      };
    } else if (error) {
      return {
        success: false,
        message: 'Failed to connect to database.',
        error: error.message,
      };
    }

    return {
      success: true,
      message: 'Successfully connected to Supabase database.',
    };
  } catch (error: any) {
    return {
      success: false,
      message: 'Failed to test database connection.',
      error: error.message,
    };
  }
}