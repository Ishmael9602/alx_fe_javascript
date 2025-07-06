// Initial quotes array (load from localStorage if exists)
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to predict the future is to invent it.", category: "Motivation" },
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Programming" },
  { text: "Simplicity is the soul of efficiency.", category: "Wisdom" },
];

let filteredQuotes = [...quotes]; // To hold filtered quotes
let currentCategory = localStorage.getItem("selectedCategory") || "all";

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote from filteredQuotes
function showRandomQuote() {
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const index = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[index];
  quoteDisplay.textContent = `"${quote.text}" — Category: ${quote.category}`;
  // Save last quote to sessionStorage
  sessionStorage.setItem("lastQuoteIndex", index);
}

// Create the add quote form dynamically
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

  formDiv.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
    <br/><br/>
    <button id="exportBtn">Export Quotes</button>
    <input type="file" id="importFile" accept=".json" />
  `;

  document.body.appendChild(formDiv);

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportQuotes);
  document.getElementById("importFile").addEventListener("change", importFromJsonFile);
}

// Add new quote to array and update display/storage
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");
  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (!newText || !newCategory) {
    alert("Please enter both quote text and category.");
    return;
  }

  quotes.push({ text: newText, category: newCategory });
  saveQuotes();
  populateCategories();
  filterQuotes();
  textInput.value = "";
  categoryInput.value = "";
  alert("Quote added!");
}

// Populate category filter dropdown dynamically
function populateCategories() {
  const categories = ["all", ...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    categoryFilter.appendChild(option);
  });
  categoryFilter.value = currentCategory;
}

// Filter quotes based on selected category
function filterQuotes() {
  currentCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", currentCategory);
  if (currentCategory === "all") {
    filteredQuotes = [...quotes];
  } else {
    filteredQuotes = quotes.filter(q => q.category === currentCategory);
  }
  showRandomQuote();
}

// Export quotes array to JSON file
function exportQuotes() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Failed to parse JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Simulate fetching quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    if (!response.ok) throw new Error("Network response was not ok");
    const data = await response.json();
    const serverQuotes = data.slice(0, 10).map(item => ({
      text: item.title || item.body || "No quote text",
      category: "server"
    }));
    quotes = serverQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes synced from server successfully!");
  } catch (error) {
    console.error("Failed to fetch quotes from server:", error);
    alert("Could not sync with server.");
  }
}

// Initialize app
function init() {
  createAddQuoteForm();
  populateCategories();

  // Load last selected category
  categoryFilter.value = currentCategory;
  filterQuotes();

  // If sessionStorage has last quote, show it
  const lastIndex = sessionStorage.getItem("lastQuoteIndex");
  if (lastIndex !== null && filteredQuotes.length > 0) {
    const quote = filteredQuotes[lastIndex] || filteredQuotes[0];
    quoteDisplay.textContent = `"${quote.text}" — Category: ${quote.category}`;
  }

  // Set event listener for category filter
  categoryFilter.addEventListener("change", filterQuotes);

  // Initial random quote display
  showRandomQuote();

  // Example: auto-sync with server every 1 minute
  setInterval(fetchQuotesFromServer, 60000);
}

// Run init after DOM loads
document.addEventListener("DOMContentLoaded", init);
