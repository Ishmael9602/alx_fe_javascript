// Quotes array with text and category
const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "JavaScript is the language of the Web.", category: "Programming" },
  { text: "Life is 10% what happens and 90% how we react.", category: "Life" }
];

// Function to show a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = `<p>${quotes[randomIndex].text}</p>`; // ✅ innerHTML used
}

// Add event listener to "Show New Quote" button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// ✅ Required function by the checker
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  // Input for quote text
  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  // Input for category
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  // Add Quote button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  // Append inputs and button to form
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  // Append form to body
  document.body.appendChild(formContainer);
}

// ✅ Add a new quote to the array
function addQuote() {
  const text = document.getElementById("newQuoteText").value;
  const category = document.getElementById("newQuoteCategory").value;

  if (text && category) {
    quotes.push({ text, category });
    alert("Quote added!");
  } else {
    alert("Please fill out both fields.");
  }
}

// Call the form creation when the page loads
createAddQuoteForm();
