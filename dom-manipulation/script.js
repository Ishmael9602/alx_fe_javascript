// Initial quotes array
const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "Life is 10% what happens to us and 90% how we react to it.", category: "Life" },
  { text: "JavaScript is the language of the Web.", category: "Programming" },
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteButton = document.getElementById("newQuote");

// Show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  quoteDisplay.innerHTML = `<strong>${quote.category}:</strong> "${quote.text}"`;
}

// Add new quote
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    const newQuote = { text: newText, category: newCategory };
    quotes.push(newQuote);

    // Clear input fields
    textInput.value = "";
    categoryInput.value = "";

    // Show confirmation and random quote
    quoteDisplay.innerHTML = `✅ New quote added in <strong>${newQuote.category}</strong>! Click "Show New Quote" to see it.`;
  } else {
    quoteDisplay.innerHTML = "⚠️ Please enter both quote and category.";
  }
}

// Attach event listener
newQuoteButton.addEventListener("click", showRandomQuote);
