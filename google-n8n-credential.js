const { google } = require('googleapis');
const fetch = require('node-fetch');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const generateCredentialForN8n = async (token) => {
  try {
    // Supabase에 OAuth 토큰 저장
    const { data, error } = await supabase.from('auth_logs').insert([
      {
        credential_type: 'google',
        method: 'oauth',
        user_id: 'manual-insert-or-from-session', // 나중에 실제 사용자 ID 사용
        access_token: token.tokens.access_token,
        refresh_token: token.tokens.refresh_token,
        scope: token.tokens.scope,
        token_type: token.tokens.token_type,
        timestamp: new Date().toISOString()
      }
    ]);
    if (error) console.error('🔴 Supabase insert error:', error);

    return {
      success: true,
      message: 'Token stored successfully.'
    };
  } catch (err) {
    console.error('🔴 Error saving to Supabase:', err);
    return { success: false };
  }
};

const getGoogleOAuthTokens = async (code) => {
  try {
    const token = await oauth2Client.getToken(code);
    return await generateCredentialForN8n(token);
  } catch (error) {
    console.error('❌ Error in token generation:', error);
    return { success: false, error };
  }
};

module.exports = { getGoogleOAuthTokens };
