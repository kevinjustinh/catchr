const SHEET_ID = '1ZsE2s1vtNqw2-X23oWCdUc5ceTJeS1p-SoZq2pbDvIE';
const SHEET_TAB = 'Sheet1';

function getFormattedDate() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = String(now.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

async function getAuthToken() {
  console.log('Step 1: getting auth token...');
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error('Auth error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
      } else {
        console.log('Step 1 complete: got token');
        resolve(token);
      }
    });
  });
}

async function getNextEmptyRow(token) {
  console.log('Step 2: finding next empty row...');
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(SHEET_TAB + '!A:A')}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  const data = await response.json();
  console.log('Step 2 response:', JSON.stringify(data).slice(0, 200));
  const rows = data.values || [];
  const nextRow = Math.max(rows.length + 1, 5);
  console.log('Next empty row:', nextRow);
  return nextRow;
}

async function appendToSheet(data) {
  console.log('appendToSheet called with:', data);
  const token = await getAuthToken();
  const date = getFormattedDate();
  const nextRow = await getNextEmptyRow(token);
  const range = `${SHEET_TAB}!A${nextRow}:I${nextRow}`;
  console.log('Step 3: writing to range', range);

  const values = [[
    data.company,
    data.location,
    data.position,
    data.link,
    'yes',
    date,
    '', // G
    '', // H
    'Unresponsive' // I - Outcome
  ]];

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values })
    }
  );

  const result = await response.json();
  console.log('Step 3 result:', JSON.stringify(result));

  if (!response.ok) {
    throw new Error(result.error?.message || 'Sheets API error');
  }

  return result;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'appendToSheet') {
    console.log('Message received: appendToSheet');
    appendToSheet(request.data)
      .then(() => {
        console.log('Success!');
        sendResponse({ success: true });
      })
      .catch((err) => {
        console.error('Failed:', err.message);
        sendResponse({ success: false, error: err.message });
      });
    return true;
  }
});