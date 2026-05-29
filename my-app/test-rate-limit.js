const API_KEY = "sk_dev_ulE_qqmLOfZnYwBnSh9hjRohw3BKow7i";
const URL = "https://saa-s-project-k7ku.vercel.app/api/v1/documents";

async function fireRequests() {
  for (let i = 1; i <= 110; i++) {
    const res = await fetch(URL, {
      method: "GET",
      headers: { Authorization: `Bearer ${API_KEY}` },
    });
    console.log(`Request ${i}: ${res.status}`);
    if (res.status === 429) {
      console.log("Rate limit hit at request", i);
      break;
    }
  }
}

fireRequests();