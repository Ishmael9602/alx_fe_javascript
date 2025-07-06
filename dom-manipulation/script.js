let quotes = [
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Humor" },
  { text: "First, solve the problem. Then, write the code.", category: "Advice" },
  { text: "Experience is the name everyone gives to their mistakes.", category: "Wisdom" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteText = document.getElementById('newQuoteText');
const newQuoteCategory = document.getElementById('newQuoteCategory');
const categoryFilter = document.getElementById('categoryFilter');

function loadQuotes() {
  const stored = localStorage.getItem('quotes');
  if (stored) quotes = JSON.parse(stored);
}

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value || 'all';
  const filteredQuotes = selectedCategory === 'all' ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" — (${quote.category})`;
  sessionStorage.setItem('lastQuote', JSON.stringify(quote));
}

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

function filterQuotes() {
  localStorage.setItem('lastCategoryFilter', categoryFilter.value);
  showRandomQuote();
}

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
  postQuoteToServer(newQuote); // sync new quote to server
  newQuoteText.value = '';
  newQuoteCategory.value = '';
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
}

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

// This is the syncQuotes function you want
async function syncQuotes() {
  try {
    // Fetch server data
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) throw new Error('Network error during fetch');
    const serverData = await response.json();

    // Map server data to quote format (take first 5 posts)
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title + " " + post.body,
      category: "Server"
    }));

    // Merge server quotes into local quotes, server wins conflicts
    serverQuotes.forEach(sq => {
      const index = quotes.findIndex(q => q.text === sq.text);
      if (index !== -1) {
        quotes[index] = sq; // overwrite with server quote
      } else {
        quotes.push(sq);
      }
    });

    saveQuotes();
    populateCategories();
    filterQuotes();
    notifyUser('Quotes synchronized with server.');
  } catch (error) {
    console.error('Sync error:', error);
    notifyUser('Failed to sync quotes with server.');
  }
}

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
    console.error('Post error:', error);
  }
}

function notifyUser(message) {
  alert(message);
}

// Periodic sync every 60 seconds
setInterval(syncQuotes, 60000);

// Initialization
loadQuotes();
populateCategories();
filterQuotes();

document.getElementById('newQuoteBtn').addEventListener('click', addQuote);
document.getElementById('newQuote').addEventListener('click', showRandomQuote);
document.getElementById('categoryFilter').addEventListener('change', filterQuotes);
document.getElementById('exportBtn').addEventListener('click', exportQuotes);
document.getElementById('importFile').addEventListener('change', importFromJsonFile);
