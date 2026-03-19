function scrapeJobData() {
  const url = window.location.href;
  let company = '', position = '', location = '', site = '';

  // LinkedIn
 if (url.includes('linkedin.com')) {
  site = 'LinkedIn';

  const allP = Array.from(document.querySelectorAll('p'))
    .map(el => el.innerText.trim())
    .filter(text => text.length > 1 && text.length < 120);

  // Company is the p tag with aria-label starting with "Company,"
  const companyEl = document.querySelector('[aria-label^="Company,"]');
  company = companyEl?.querySelector('a')?.innerText?.trim()
    || companyEl?.querySelector('p')?.innerText?.trim() || '';

  // Position is the p tag immediately after company in allP
  const companyIndex = allP.findIndex(t => t === company);
  position = companyIndex >= 0 ? allP[companyIndex + 1] || '' : '';

  // Check for LinkedIn "Remote" badge first
  const remoteSpans = Array.from(document.querySelectorAll('span'))
    .filter(el => el.innerText.trim() === 'Remote' && el.children.length === 0);
  if (remoteSpans.length > 0) {
    location = 'Remote';
  } else {
    // Location is the next p tag after position, trimmed to just location
    const rawLocation = companyIndex >= 0 ? allP[companyIndex + 2] || '' : '';
    location = rawLocation.split('·')[0].trim();
  }
}

  // Greenhouse
  else if (url.includes('greenhouse.io')) {
    site = 'Greenhouse';
    position = document.querySelector('h1.app-title')?.innerText?.trim()
      || document.querySelector('h1')?.innerText?.trim() || '';
    company = document.querySelector('#header .company-name')?.innerText?.trim()
      || document.querySelector('.company-name')?.innerText?.trim() || '';
    location = document.querySelector('.location')?.innerText?.trim() || '';
  }

  // Lever
  else if (url.includes('lever.co')) {
    site = 'Lever';
    position = document.querySelector('.posting-headline h2')?.innerText?.trim()
      || document.querySelector('h2')?.innerText?.trim() || '';
    company = document.querySelector('.main-header-logo img')?.alt?.trim()
      || document.title.split('·')[1]?.trim() || '';
    location = document.querySelector('.sort-by-time.posting-category')?.innerText?.trim()
      || document.querySelector('.posting-category')?.innerText?.trim() || '';
  }

  // Wellfound / AngelList
  else if (url.includes('wellfound.com') || url.includes('angel.co')) {
    site = 'Wellfound';
    position = document.querySelector('h1')?.innerText?.trim() || '';
    company = document.querySelector('[class*="startupName"]')?.innerText?.trim()
      || document.querySelector('[class*="company-name"]')?.innerText?.trim() || '';
    location = document.querySelector('[class*="location"]')?.innerText?.trim() || '';
  }

  // Ashby
  else if (url.includes('ashby') || url.includes('jobs.ashbyhq.com')) {
    site = 'Ashby';
    position = document.querySelector('h1')?.innerText?.trim() || '';
    company = document.querySelector('[class*="company"]')?.innerText?.trim()
      || document.title.split('-')[1]?.trim() || '';
    location = document.querySelector('[class*="location"]')?.innerText?.trim()
      || document.querySelector('[class*="LocationPill"]')?.innerText?.trim() || '';
  }

  return {
    company: company.trim(),
    position: position.trim(),
    location: location.trim(),
    link: url,
    site
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    sendResponse(scrapeJobData());
  }
});