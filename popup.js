function getTodayFormatted() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const year = String(now.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

document.getElementById('todayDate').textContent = getTodayFormatted();

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  const url = tab.url || '';

  let site = 'Unknown';
  if (url.includes('linkedin.com')) site = 'LinkedIn';
  else if (url.includes('greenhouse.io')) site = 'Greenhouse';
  else if (url.includes('lever.co')) site = 'Lever';
  else if (url.includes('wellfound.com') || url.includes('angel.co')) site = 'Wellfound';
  else if (url.includes('ashby')) site = 'Ashby';

  document.getElementById('siteBadge').textContent = site;
  document.getElementById('link').value = url;

  const panelJobId = url.match(/currentJobId=(\d+)/)?.[1];

  function fillFields(response) {
    if (response.company) document.getElementById('company').value = response.company;
    if (response.position) document.getElementById('position').value = response.position;
    if (response.location) document.getElementById('location').value = response.location;
    if (response.link) document.getElementById('link').value = response.link;
  }

  function scrapePanelDirect(retriesLeft) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      world: 'MAIN',
      func: (jobId) => {
        const panelTitle = document.querySelector('h1 a[href*="/jobs/view/"]');
        const panelCompany = document.querySelector('.job-details-jobs-unified-top-card__company-name');
        if (!panelTitle && !panelCompany) return null;
        const position = panelTitle?.innerText?.trim() || '';
        const company = panelCompany?.innerText?.trim() || '';
        const link = jobId ? `https://www.linkedin.com/jobs/view/${jobId}/` : window.location.href;
        const panelRemote = Array.from(document.querySelectorAll('button span.tvm__text'))
          .find(el => el.innerText.includes('Remote'));
        const location = panelRemote
          ? 'Remote'
          : Array.from(document.querySelectorAll('span.tvm__text--low-emphasis'))
              .map(el => el.innerText.trim())
              .find(text => text.length > 1 && text !== '·') || '';
        return { company, position, location, link, site: 'LinkedIn' };
      },
      args: [panelJobId]
    }, (results) => {
      const data = results?.find(r => r.result?.position)?.result;
      if (data?.position) {
        fillFields(data);
      } else if (retriesLeft > 0) {
        setTimeout(() => scrapePanelDirect(retriesLeft - 1), 500);
      }
    });
  }

  function scrapeStandard() {
    chrome.scripting.executeScript(
      { target: { tabId: tab.id }, files: ['content.js'] },
      () => {
        chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, (response) => {
          if (response) fillFields(response);
        });
      }
    );
  }

  if (panelJobId) {
    scrapePanelDirect(10);
  } else {
    scrapeStandard();
  }
});

document.getElementById('catchBtn').addEventListener('click', () => {
  const data = {
    company: document.getElementById('company').value.trim(),
    position: document.getElementById('position').value.trim(),
    location: document.getElementById('location').value.trim(),
    link: document.getElementById('link').value.trim()
  };

  if (!data.company && !data.position) {
    alert('Please fill in at least Company and Position.');
    return;
  }

  const btn = document.getElementById('catchBtn');
  btn.disabled = true;
  btn.textContent = 'Logging...';

  chrome.runtime.sendMessage({ action: 'appendToSheet', data }, (response) => {
    if (response?.success) {
      document.getElementById('successSub').textContent =
        `${data.company} → ${data.position}`;
      document.getElementById('mainView').style.display = 'none';
      document.getElementById('successView').style.display = 'flex';
    } else {
      alert('Something went wrong: ' + (response?.error || 'Unknown error'));
      btn.disabled = false;
      btn.textContent = 'Catch It';
    }
  });
});