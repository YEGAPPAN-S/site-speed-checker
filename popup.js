const apiKey = "AIzaSyDxD0xaFGrV83gsNaYaMQLLIvtCZOdXHrs";  // Replace with your actual API key

const sites = [
  { name: "Flycart", url: "https://www.flycart.org/" },
  { name: "Retainful", url: "https://retainful.com" },
  { name: "WPLoyalty", url: "https://wployalty.net" },
  { name: "UpsellWP", url: "https://upsellwp.com" },
  { name: "Afflr", url: "https://afflr.io" },
  { name: "WPBundle", url: "https://wpbundle.net" },
  { name: "WPRelay", url: "https://wprelay.com" },
  { name: "SparkEditor", url: "https://sparkeditor.com" }
];

document.getElementById("checkSpeedButton").addEventListener("click", function () {
  // Show loading spinner when button is clicked
  document.getElementById("loadingSpinner").style.display = "block";
  document.getElementById("results").innerHTML = ""; // Clear previous results

  // Fetch performance data after the button click
  let promises = sites.map(site => getPerformance(site));
  Promise.all(promises).then(results => {
    displayResults(results);
  }).catch(err => {
    document.getElementById("loadingSpinner").style.display = "none";
    document.getElementById("results").innerHTML = "<div class='result-item'>Error checking performance.</div>";
  });
});

function getPerformance(site) {
  const mobileApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${site.url}&key=${apiKey}&strategy=mobile`;
  const desktopApiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${site.url}&key=${apiKey}&strategy=desktop`;

  return Promise.all([fetch(mobileApiUrl), fetch(desktopApiUrl)]).then(responses => {
    return Promise.all(responses.map(response => response.json()));
  }).then(data => {
    return {
      name: site.name,
      mobileScore: Math.round(data[0].lighthouseResult.categories.performance.score * 100),
      desktopScore: Math.round(data[1].lighthouseResult.categories.performance.score * 100),
      mobileMetrics: extractMetrics(data[0].lighthouseResult),
      desktopMetrics: extractMetrics(data[1].lighthouseResult),
    };
  }).catch(() => ({
    name: site.name,
    mobileScore: "Error",
    desktopScore: "Error",
    mobileMetrics: {},
    desktopMetrics: {},
  }));
}

function extractMetrics(data) {
  return {
    FCP: data.audits['first-contentful-paint'].displayValue,
    LCP: data.audits['largest-contentful-paint'].displayValue,
    TBT: data.audits['total-blocking-time'].displayValue,
    CLS: data.audits['cumulative-layout-shift'].displayValue,
    SpeedIndex: data.audits['speed-index'].displayValue
  };
}

function displayResults(results) {
  const resultContainer = document.getElementById("results");
  resultContainer.innerHTML = "";  // Clear previous results
  document.getElementById("loadingSpinner").style.display = "none";  // Hide loading spinner

  results.forEach(result => {
    const mobileClass = result.mobileScore < 60 ? "red" : "green";
    const desktopClass = result.desktopScore < 80 ? "red" : "green";

    const resultItem = `
      <div class="result-row">
        <div class="site-name">${result.name}</div>
        <table class="metrics-table">
          <thead>
            <tr>
              <th>Metrics</th>
              <th>Mobile Value</th>
              <th>Desktop Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Performance</td>
              <td class="${mobileClass}">${result.mobileScore}</td>
              <td class="${desktopClass}">${result.desktopScore}</td>
            </tr>
            <tr>
              <td>First Contentful Paint</td>
              <td>${result.mobileMetrics.FCP}</td>
              <td>${result.desktopMetrics.FCP}</td>
            </tr>
            <tr>
              <td>Largest Contentful Paint</td>
              <td>${result.mobileMetrics.LCP}</td>
              <td>${result.desktopMetrics.LCP}</td>
            </tr>
            <tr>
              <td>Total Blocking Time</td>
              <td>${result.mobileMetrics.TBT}</td>
              <td>${result.desktopMetrics.TBT}</td>
            </tr>
            <tr>
              <td>Cumulative Layout Shift</td>
              <td>${result.mobileMetrics.CLS}</td>
              <td>${result.desktopMetrics.CLS}</td>
            </tr>
            <tr>
              <td>Speed Index</td>
              <td>${result.mobileMetrics.SpeedIndex}</td>
              <td>${result.desktopMetrics.SpeedIndex}</td>
            </tr>
          </tbody>
        </table>
        
        </div>
      </div>
    `;
    resultContainer.innerHTML += resultItem;

    
  });
}
