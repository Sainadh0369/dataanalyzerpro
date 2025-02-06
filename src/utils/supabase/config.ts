export const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  storage: {
    maxUploadFileSize: 500 * 1024 * 1024 // 500MB
  }
};