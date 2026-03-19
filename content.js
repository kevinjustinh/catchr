function scrapeJobData() {
  const url = window.location.href;
  let company = '', position = '', location = '', site = '', link = url;

  // LinkedIn
  if (url.includes('linkedin.com')) {
    site = 'LinkedIn';

    // --- Split-panel view (search, collections, easy-apply) ---
    const panelTitle = document.querySelector('.job-details-jobs-unified-top-card__job-title h1 a, .job-details-jobs-unified-top-card__job-title a, .job-details-jobs-unified-top-card__job-title h1');
    const panelCompany = document.querySelector('.job-details-jobs-unified-top-card__company-name');
    const panelJobId = url.match(/currentJobId=(\d+)/)?.[1];

    if (panelTitle || panelCompany) {
      position = panelTitle?.innerText?.trim() || '';
      company = panelCompany?.innerText?.trim() || '';

      // Link: build clean /jobs/view/ URL from currentJobId
      link = panelJobId
        ? `https://www.linkedin.com/jobs/view/${panelJobId}/`
        : url;

      // Remote button in panel view
      const panelRemote = Array.from(document.querySelectorAll('button span.tvm__text'))
        .find(el => el.innerText.includes('Remote'));
      if (panelRemote) {
        location = 'Remote';
      } else {
        location = Array.from(document.querySelectorAll('span.tvm__text--low-emphasis'))
          .map(el => el.innerText.trim())
          .find(text => text.length > 1 && text !== '·') || '';
      }

    // --- Full job page view (/jobs/view/) ---
    } else {
      const allP = Array.from(document.querySelectorAll('p'))
        .map(el => el.innerText.trim())
        .filter(text => text.length > 1 && text.length < 120);

      const companyEl = document.querySelector('[aria-label^="Company,"]');
      company = companyEl?.querySelector('a')?.innerText?.trim()
        || companyEl?.querySelector('p')?.innerText?.trim() || '';

      const companyIndex = allP.findIndex(t => t === company);
      position = companyIndex >= 0 ? allP[companyIndex + 1] || '' : '';

      const remoteSpans = Array.from(document.querySelectorAll('span'))
        .filter(el => el.innerText.trim() === 'Remote' && el.children.length === 0);
      if (remoteSpans.length > 0) {
        location = 'Remote';
      } else {
        const rawLocation = companyIndex >= 0 ? allP[companyIndex + 2] || '' : '';
        location = rawLocation.split('·')[0].trim();
      }
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
    link,
    site
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrape') {
    sendResponse(scrapeJobData());
  }
});