
const form = document.getElementById("expense-form");
const list = document.getElementById("expense-list");
const search = document.getElementById("search");
const filter = document.getElementById("filter");

let expenseChart;
let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function updateChart() {
  const categories = ["Food", "Bills", "Transportation", "Shopping", "Other"];

  const totals = categories.map(category => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0);
  });

  const ctx = document.getElementById("expense-chart");

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: categories,
      datasets: [{
        data: totals,
        backgroundColor: [
          "#c4a5ff",
          "#ff8fab",
          "#8ecae6",
          "#ffd166",
          "#a8dadc"
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: "#ffffff"
          }
        }
      }
    }
  });
}


function renderExpenses() {
  list.innerHTML = "";

  const searchTerm = search.value.toLowerCase();
  const selectedCategory = filter.value;

  
const filtered = expenses.filter(expense => {
  const matchesSearch =
    expense.description.toLowerCase().includes(searchTerm);

  const matchesCategory =
    selectedCategory === "All" ||
    expense.category === selectedCategory;

  return matchesSearch && matchesCategory;
});

  });

  filtered.forEach(expense => {
    const item = document.createElement("li");
    const details = document.createElement("span");
    const actions = document.createElement("div");
    const editButton = document.createElement("button");
    const deleteButton = document.createElement("button");

    details.textContent =
      `${expense.description} (${expense.category}) — $${expense.amount.toFixed(2)}`;

    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editExpense(expense.id));

    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";
    deleteButton.addEventListener("click", () => deleteExpense(expense.id));

    actions.append(editButton, deleteButton);
    item.append(details, actions);
    list.appendChild(item);
  });

  const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  document.getElementById("total").textContent = `$${total.toFixed(2)}`;
  document.getElementById("count").textContent = expenses.length;

  updateChart();
}

function editExpense(id) {
  const expense = expenses.find(entry => entry.id === id);
  if (!expense) return;

  const newDescription = prompt("Edit description:", expense.description);
  if (newDescription === null) return;

  const newAmount = prompt("Edit amount:", expense.amount);
  if (newAmount === null) return;

  const amount = Number(newAmount);

  if (!newDescription.trim() || !Number.isFinite(amount) || amount <= 0) {
    alert("Please enter a valid description and amount.");
    return;
  }

  expense.description = newDescription.trim();
  expense.amount = amount;

  saveExpenses();
  renderExpenses();
}

function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);
  saveExpenses();
  renderExpenses();
}

form.addEventListener("submit", event => {
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

search.addEventListener("input", renderExpenses);
filter.addEventListener("change", renderExpenses);

renderExpenses();
