export async function onRequestGet(context) {
  try {
    const response = await fetch("https://www.reddit.com/r/ASX_Bets/new.json?limit=50");
    const data = await response.json();

    function extractTickersFromText(text) {
      if (!text) return [];
      const tickerSet = new Set();

      const dollarMatches = text.match(/\$[A-Z]{3,4}\b/g);
      if (dollarMatches) {
        dollarMatches.forEach(m => {
          const t = m.replace(/^\$/, "").toUpperCase();
          tickerSet.add(`${t}.ASX`);
        });
      }

      const plainMatches = text.match(/\b[A-Z]{3,4}\b/g);
      if (plainMatches) {
        plainMatches.forEach(m => {
          if (!["WITH","FROM","THIS","WHAT","WHEN","YOUR","GOOD","WILL"].includes(m)) {
            tickerSet.add(`${m}.ASX`);
          }
        });
      }

      const asxMatches = text.match(/\b[A-Z]{3,4}\.(ASX|AX)\b/g);
      if (asxMatches) {
        asxMatches.forEach(m => {
          const t = m.split(".")[0].toUpperCase();
          tickerSet.add(`${t}.ASX`);
        });
      }

      return Array.from(tickerSet);
    }

    const counts = {};
    data.data.children.forEach(post => {
      const text = post.data.title + " " + post.data.selftext;
      const tickers = extractTickersFromText(text);
      tickers.forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([ticker, count]) => ({ ticker, count }));

    return new Response(JSON.stringify(sorted), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
