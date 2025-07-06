// Initial quotes
let quotes = [
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Humor" },
  { text: "First, solve the problem. Then, write the code.", category: "Advice" },
  { text: "Experience is the name everyone gives to their mistakes.", category: "Wisdom" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteFormContainer = document.getElementById('addQuoteForm');
const syncMessageDiv = document.getElementById('syncMessage');  // UI sync message div

// Load quotes from localStorage
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) quotes = JSON.parse(stored);
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show a random quote (filtered by category)
function showRandomQuote() {
  const selectedCategory = categoryFilter.value || 'all';
  const filtered = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

// Populate category dropdown dynamically
function populateCategories() {
  const categories = Array.from(new Set(quotes.map(q => q.category)));
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  const lastFilter = localStorage.getItem('lastCategoryFilter') || 'all';
  categoryFilter.value = lastFilter;
}

// Filter quotes based on category selection
function filterQuotes() {
  localStorage.setItem('lastCategoryFilter', categoryFilter.value);
  showRandomQuote();
}

// Create the form to add new quotes dynamically
function createAddQuoteForm() {
  addQuoteFormContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="newQuoteBtn">Add Quote</button>
  `;

  document.getElementById('newQuoteBtn').addEventListener('click', addQuote);
}

// Add a new quote to the list and sync storage & server
function addQuote() {
  const textInput = document.getElementById('newQuoteText');
  const categoryInput = document.getElementById('newQuoteCategory');
  const text = textInput.value.trim();
  const category = categoryInput.value.trim();
  if (!text || !category) {
    alert('Please enter both quote text and category.');
    return;
  }
  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  postQuoteToServer(newQuote); // Sync to server
  textInput.value = '';
  categoryInput.value = '';
}

// Export quotes to JSON file
function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file input
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes = quotes.concat(importedQuotes);
        saveQuotes();
        populateCategories();
        filterQuotes();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid file format');
      }
    } catch {
      alert('Failed to read JSON file');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Fetch quotes from server simulation
async function fetchQuotesFromServer() {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!res.ok) throw new Error('Fetch failed');
    const data = await res.json();
    // Map server data to quote objects (limit 5)
    return data.slice(0, 5).map(post => ({
      text: post.title + " - " + post.body,
      category: "Server"
    }));
  } catch (error) {
    console.error('Fetch error:', error);
    return [];
  }
}

// Post new quote to server simulation
async function postQuoteToServer(quote) {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
    if (!res.ok) throw new Error('Post failed');
    const data = await res.json();
    console.log('Posted quote:', data);
  } catch (error) {
    console.error('Post error:', error);
  }
}

// Sync local quotes with server data, server takes precedence
async function syncQuotes() {
  try {
    const serverQuotes = await fetchQuotesFromServer();
    serverQuotes.forEach(sq => {
      const index = quotes.findIndex(q => q.text === sq.text);
      if (index !== -1) {
        quotes[index] = sq; // overwrite with server data
      } else {
        quotes.push(sq);
      }
    });
    saveQuotes();
    populateCategories();
    filterQuotes();

    // Show UI sync message instead of alert
    if (syncMessageDiv) {
      syncMessageDiv.textContent = "Quotes synced with server!";
      setTimeout(() => { syncMessageDiv.textContent = ""; }, 3000);
    } else {
      alert('Quotes synchronized with server.');
    }

  } catch (error) {
    console.error('Sync error:', error);
    alert('Failed to sync quotes with server.');
  }
}

// Initialization
loadQuotes();
populateCategories();
filterQuotes();
createAddQuoteForm();

// Event listeners
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', filterQuotes);
document.getElementById('exportBtn').addEventListener('click', exportQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);

// Optional: Sync every 60 seconds
setInterval(syncQuotes, 60000);
