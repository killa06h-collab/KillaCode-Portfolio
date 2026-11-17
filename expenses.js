
const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderExpenses() {
  list.innerHTML = "";

  let total = 0;

  expenses.forEach((expense) => {
    total += expense.amount;

    const item = document.createElement("li");
    const details = document.createElement("span");
    const deleteButton = document.createElement("button");

    details.textContent =
      `${expense.description} (${expense.category}) — $${expense.amount.toFixed(2)}`;

    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";

    deleteButton.addEventListener("click", () => {
      expenses = expenses.filter((entry) => entry.id !== expense.id);
      saveExpenses();
      renderExpenses();
    });

    item.append(details, deleteButton);
    list.appendChild(item);
  });

  document.getElementById("total").textContent = `$${total.toFixed(2)}`;
  document.getElementById("count").textContent = expenses.length;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = document.getElementById("description").value.trim();
  const amount = Number(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (!description || !Number.isFinite(amount) || amount <= 0) return;

  expenses.push({
    id: crypto.randomUUID(),
    description,
    amount,
    category
  });

  saveExpenses();
  renderExpenses();
  form.reset();
});

renderExpenses();
