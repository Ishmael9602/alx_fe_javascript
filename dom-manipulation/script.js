// Initial quotes array (sample)
let quotes = [
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Humor" },
  { text: "First, solve the problem. Then, write the code.", category: "Advice" },
  { text: "Experience is the name everyone gives to their mistakes.", category: "Wisdom" }
];

// DOM Elements
const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const addQuoteBtn = document.getElementById('addQuoteBtn');
const categoryFilter = document.getElementById('categoryFilter');
const exportBtn = document.getElementById('exportBtn');
const importFileInput = document.getElementById('importFile');

// Load quotes from localStorage or use default
function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) {
    quotes = JSON.parse(stored);
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Show random quote (filtered by category)
function showRandomQuote() {
  const selectedCategory = categoryFilter.value || 'all';
  const filteredQuotes = selectedCategory === 'all' 
    ? quotes 
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote)); // Store last quote session
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

  // Restore last selected filter
  const lastFilter = localStorage.getItem('lastCategoryFilter') || 'all';
  categoryFilter.value = lastFilter;
}

// Filter quotes based on selected category
function filterQuotes() {
  localStorage.setItem('lastCategoryFilter', categoryFilter.value);
  showRandomQuote();
}

// Add new quote from user input
function addQuote() {
  const text = newQuoteText.value.trim();
  const category = newQuoteCategory.value.trim();

  if (!text || !category) {
    alert('Please enter both quote text and category.');
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();

  postQuoteToServer(newQuote); // sync to server

  // Clear inputs
  newQuoteText.value = '';
  newQuoteCategory.value = '';
}

// Export quotes as JSON file
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
  fileReader.onload = function (e) {
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

// Simulate fetching quotes from server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) throw new Error('Network error');
    const serverData = await response.json();

    // Assume serverData contains quote-like objects: {title: "...", body: "..."}
    // Map to our format: text = title + body, category = "Server"
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title + " " + post.body,
      category: "Server"
    }));

    // Merge with local quotes, server wins in conflicts (simple logic: replace duplicates)
    serverQuotes.forEach(sq => {
      const exists = quotes.find(q => q.text === sq.text);
      if (!exists) {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();

    notifyUser('Data synced with server');
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Post new quote to server (mock API)
async function postQuoteToServer(quote) {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });
    if (!response.ok) throw new Error('Failed to post quote');
    const data = await response.json();
    console.log('Quote posted:', data);
  } catch (error) {
    console.error(error);
  }
}

// Notify user of sync or conflict resolution
function notifyUser(message) {
  // Simple alert or improve with a UI element
  alert(message);
}

// Periodic sync every 60 seconds
setInterval(fetchQuotesFromServer, 60000);

// Initialization
loadQuotes();
populateCategories();
filterQuotes();

// Event Listeners (assuming buttons/inputs exist in your HTML)
document.getElementById('newQuoteBtn').addEventListener('click', addQuote);
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
document.getElementById('exportBtn').addEventListener('click', exportQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
