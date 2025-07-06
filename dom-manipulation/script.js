let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "Code is like humor. When you have to explain it, it’s bad.", category: "Humor" },
  { text: "In order to be irreplaceable, one must always be different.", category: "Inspiration" }
];

let lastCategory = localStorage.getItem('selectedCategory') || "all";

function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

function showRandomQuote() {
  const category = document.getElementById("categoryFilter").value;
  const filtered = category === "all" ? quotes : quotes.filter(q => q.category === category);
  if (filtered.length === 0) {
    document.getElementById("quoteDisplay").innerText = "No quotes in this category.";
    return;
  }
  const randomQuote = filtered[Math.floor(Math.random() * filtered.length)];
  document.getElementById("quoteDisplay").innerText = `"${randomQuote.text}" - [${randomQuote.category}]`;
  sessionStorage.setItem("lastQuote", randomQuote.text);
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both quote and category.");
    return;
  }

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  showRandomQuote();
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const categories = Array.from(new Set(quotes.map(q => q.category)));

  // Store current selected value
  const current = select.value;

  // Clear existing options
  select.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });

  // Restore selection
  select.value = current;
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem('selectedCategory', selected);
  showRandomQuote();
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

window.onload = function () {
  populateCategories();
  document.getElementById("categoryFilter").value = lastCategory;
  showRandomQuote();
};
