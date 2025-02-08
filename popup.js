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
    };
  }).catch(() => ({
    name: site.name,
    mobileScore: "Error",
    desktopScore: "Error",
  }));
}

function displayResults(results) {
  const resultContainer = document.getElementById("results");
  resultContainer.innerHTML = "";  // Clear previous results
  document.getElementById("loadingSpinner").style.display = "none";  // Hide loading spinner

  // Add header row
  const headerRow = `
    <div class="result-row">
      <div><strong>Site Name</strong></div>
      <div><i class="fas fa-mobile-alt mobile-icon"></i></div>
      <div><i class="fas fa-laptop desktop-icon"></i></div>
    </div>
  `;
  resultContainer.innerHTML += headerRow;

  results.forEach(result => {
    const mobileClass = result.mobileScore < 60 ? "red" : "green";
    const desktopClass = result.desktopScore < 80 ? "red" : "green";

    const resultItem = `
      <div class="result-row">
        <div class="site-name">${result.name}</div>
        <div class="score ${mobileClass}">${result.mobileScore}</div>
        <div class="score ${desktopClass}">${result.desktopScore}</div>
      </div>
    `;

    resultContainer.innerHTML += resultItem;
  });
}
