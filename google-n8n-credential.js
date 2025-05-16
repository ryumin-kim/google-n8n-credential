const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

// n8n의 크레덴셜 생성 API 호출
async function createCredential(n8nUrl, apiKey, credentialName, credentialType, apiKeyDetails) {
  try {
    const cleanedUrl = n8nUrl.replace(/\/+$/, "");  // n8n URL 정리
    const response = await fetch(`${cleanedUrl}/api/v1/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': apiKey,
      },
      body: JSON.stringify({
        name: credentialName,
        type: credentialType,
        nodesAccess: [],
        data: apiKeyDetails, // 구글 OAuth 2.0을 통해 받은 데이터 (예: Access Token)
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Credential created successfully:', data);
    } else {
      console.error('Error creating credential:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

// 예시로 사용할 데이터 (실제 데이터로 바꿔야 함)
const n8nUrl = 'https://your-n8n-instance-url.com';
const apiKey = 'your-n8n-api-key';
const credentialName = 'Google API Credential';
const credentialType = 'OAuth2';
const apiKeyDetails = {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  accessToken: 'your-access-token',
  refreshToken: 'your-refresh-token',
};

createCredential(n8nUrl, apiKey, credentialName, credentialType, apiKeyDetails);
