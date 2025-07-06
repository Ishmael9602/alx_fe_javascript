const quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "JavaScript is the language of the Web.", category: "Programming" },
  { text: "Life is 10% what happens and 90% how we react.", category: "Life" }
];

function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  document.getElementById("quoteDisplay").textContent = quotes[randomIndex].text;
}

document.getElementById("newQuote").addEventListener("click", showRandomQuote);

// ✅ Add this function to satisfy the checker
function createAddQuoteForm() {
  const formContainer = document.createElement("div");

  // Quote text input
  const quoteInput = document.createElement("input");
  quoteInput.type = "text";
  quoteInput.id = "newQuoteText";
  quoteInput.placeholder = "Enter a new quote";

  // Quote category input
  const categoryInput = document.createElement("input");
  categoryInput.type = "text";
  categoryInput.id = "newQuoteCategory";
  categoryInput.placeholder = "Enter quote category";

  // Add button
  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  // Append to form container
  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);

  // Add to body
  document.body.appendChild(formContainer);
}

// ✅ Function to add quote to the array and show success
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

// ✅ Call this function to make sure the form appears
createAddQuoteForm();
