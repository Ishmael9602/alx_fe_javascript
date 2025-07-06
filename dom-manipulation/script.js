// ======== QUOTE DATA ========
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
  { text: "It’s not whether you get knocked down, it’s whether you get up.", category: "Perseverance" }
];

// ======== DOM ELEMENTS ========
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncNotification = document.getElementById("syncNotification");

// ======== DISPLAY A RANDOM QUOTE ========
function showRandomQuote() {
  const selectedCategory = localStorage.getItem("selectedCategory") || "all";
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const randomQuote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
  quoteDisplay.innerHTML = randomQuote
    ? `<p>"${randomQuote.text}"</p><small>- ${randomQuote.category}</small>`
    : "<p>No quote found in this category.</p>";
}

// ======== SAVE QUOTES TO LOCAL STORAGE ========
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
  populateCategories();
}

// ======== ADD QUOTE ========
function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (text && category) {
    quotes.push({ text, category });
    saveQuotes();
    showRandomQuote();
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill both fields.");
  }
}

// ======== CREATE ADD QUOTE FORM ========
function createAddQuoteForm() {
  return `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

// ======== POPULATE CATEGORIES IN FILTER ========
function populateCategories() {
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = '<option value="all">All Categories</option>' +
    categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");

  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  categoryFilter.value = savedFilter;
}

// ======== FILTER QUOTES BY CATEGORY ========
function filterQuotes() {
  const selected = categoryFilter.value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

// ======== EXPORT TO JSON FILE ========
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// ======== IMPORT FROM JSON FILE ========
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    showRandomQuote();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// ======== SERVER SYNC SIMULATION ========
const serverUrl = "https://jsonplaceholder.typicode.com/posts";

async function fetchFromServer() {
  try {
    const response = await fetch(serverUrl);
    const data = await response.json();
    const serverQuotes = data.slice(0, 5).map((item, index) => ({
      text: item.title,
      category: `ServerCategory${index + 1}`
    }));
    handleServerSync(serverQuotes);
  } catch (err) {
    console.error("Failed to fetch server data:", err);
  }
}

function handleServerSync(serverQuotes) {
  const mergedQuotes = [
    ...serverQuotes,
    ...quotes.filter(lq => !serverQuotes.some(sq => sq.text === lq.text))
  ];
  quotes = mergedQuotes;
  saveQuotes();
  notifyUser("✔ Synced with server: Server quotes prioritized.");
}

function notifyUser(message) {
  syncNotification.innerText = message;
  setTimeout(() => syncNotification.innerText = "", 5000);
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("formContainer").innerHTML = createAddQuoteForm();
  populateCategories();
  showRandomQuote();
  setInterval(fetchFromServer, 30000); // Sync every 30 seconds
});
