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

// ✅ credentialType도 매개변수로 받음
const getGoogleOAuthTokens = async (code, user_id, credentialType) => {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log('✅ Google Tokens:', tokens);

    // Supabase에 저장
    const { error } = await supabase.from('auth_logs').insert([{
      credential_type: credentialType,  // 사용자가 선택한 것
      method: 'oauth',
      user_id: user_id,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      scope: tokens.scope,
      token_type: tokens.token_type,
      timestamp: new Date().toISOString()
    }]);

    if (error) {
      console.error('❌ Supabase insert error:', error);
      return { success: false, error };
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Token fetch failed:', error);
    return { success: false, error };
  }
};

module.exports = { getGoogleOAuthTokens };
