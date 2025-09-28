public/script.js
async function loadTickers() {
  const res = await fetch("/api/tickers");
  const data = await res.json();

  const list = document.getElementById("ticker-list");
  list.innerHTML = "";

  data.forEach(item => {
    const div = document.createElement("div");
    div.className = "ticker";
    div.innerHTML = `<span>${item.ticker}</span><span>${item.count}</span>`;
    list.appendChild(div);
  });
}

loadTickers();
setInterval(loadTickers, 60000); // refresh every 60s