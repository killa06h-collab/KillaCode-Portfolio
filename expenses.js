
// ===================================
// KILLACODE FINANCE DASHBOARD
// ===================================

// HTML elements
const expenseForm = document.getElementById("expense-form");
const incomeForm = document.getElementById("income-form");

const expenseList = document.getElementById("expense-list");
const incomeList = document.getElementById("income-list");

const search = document.getElementById("search");
const filter = document.getElementById("filter");

// Categories
const categories = [
  "Food",
  "Bills",
  "Transportation",
  "Shopping",
  "Other"
];

// Load saved information
function loadRecords(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

let expenses = loadRecords("expenses");
let incomes = loadRecords("incomes");

let expenseChart = null;


// ===================================
// SAVE DATA
// ===================================

function saveData() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
  localStorage.setItem("incomes", JSON.stringify(incomes));
}


// ===================================
// DASHBOARD TOTALS
// ===================================

function updateDashboard() {
  const totalExpenses = expenses.reduce(
    (sum, item) => sum + Number(item.amount), 0
  );

  const totalIncome = incomes.reduce(
    (sum, item) => sum + Number(item.amount), 0
  );

  const balance = totalIncome - totalExpenses;

  document.getElementById("total").textContent =
    `$${totalExpenses.toFixed(2)}`;

  document.getElementById("income-total").textContent =
    `$${totalIncome.toFixed(2)}`;

  document.getElementById("balance").textContent =
    `$${balance.toFixed(2)}`;

  document.getElementById("count").textContent =
    expenses.length + incomes.length;
}


// ===================================
// ADD INCOME
// ===================================

incomeForm.addEventListener("submit", event => {
  event.preventDefault();

  const description = document
    .getElementById("income-description")
    .value.trim();

  const amount = Number(
    document.getElementById("income-amount").value
  );

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    alert("Enter a valid income description and amount.");
    return;
  }

  incomes.push({
    id: crypto.randomUUID(),
    description,
    amount
  });

  saveData();
  incomeForm.reset();
  renderAll();
});


// ===================================
// DISPLAY INCOME
// ===================================

function renderIncome() {
  incomeList.innerHTML = "";

  if (incomes.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = "No income recorded yet.";
    incomeList.appendChild(empty);
    return;
  }

  incomes.forEach(income => {
    const item = document.createElement("li");

    const details = document.createElement("div");
    details.className = "transaction-details";

    const title = document.createElement("strong");
    title.textContent = income.description;

    const amount = document.createElement("small");
    amount.textContent = `Income: $${Number(income.amount).toFixed(2)}`;

    const actions = document.createElement("div");
    actions.className = "transaction-actions";

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";

    deleteButton.addEventListener("click", () => {
      incomes = incomes.filter(entry => entry.id !== income.id);
      saveData();
      renderAll();
    });

    details.append(title, amount);
    actions.appendChild(deleteButton);
    item.append(details, actions);
    incomeList.appendChild(item);
  });
}


// ===================================
// ADD EXPENSE
// ===================================

expenseForm.addEventListener("submit", event => {
  event.preventDefault();

  const description = document
    .getElementById("description")
    .value.trim();

  const amount = Number(
    document.getElementById("amount").value
  );

  const category = document.getElementById("category").value;

  if (!description || !Number.isFinite(amount) || amount <= 0) {
    alert("Enter a valid expense description and amount.");
    return;
  }

  expenses.push({
    id: crypto.randomUUID(),
    description,
    amount,
    category
  });

  saveData();
  expenseForm.reset();
  renderAll();
});


// ===================================
// DISPLAY EXPENSES
// ===================================

function renderExpenses() {
  expenseList.innerHTML = "";

  const searchTerm = search.value.toLowerCase().trim();
  const selectedCategory = filter.value;

  const filtered = expenses.filter(expense => {
    const matchesSearch = expense.description
      .toLowerCase()
      .includes(searchTerm);

    const matchesCategory =
      selectedCategory === "All" ||
      expense.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (filtered.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty-message";
    empty.textContent = expenses.length === 0
      ? "No expenses recorded yet."
      : "No matching expenses found.";

    expenseList.appendChild(empty);
    return;
  }

  filtered.forEach(expense => {
    const item = document.createElement("li");

    const details = document.createElement("div");
    details.className = "transaction-details";

    const title = document.createElement("strong");
    title.textContent = expense.description;

    const info = document.createElement("small");
    info.textContent =
      `${expense.category} — $${Number(expense.amount).toFixed(2)}`;

    const actions = document.createElement("div");
    actions.className = "transaction-actions";

    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.className = "edit-btn";

    editButton.addEventListener("click", () => {
      editExpense(expense.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    deleteButton.className = "delete-btn";

    deleteButton.addEventListener("click", () => {
      deleteExpense(expense.id);
    });

    details.append(title, info);
    actions.append(editButton, deleteButton);
    item.append(details, actions);

    expenseList.appendChild(item);
  });
}


// ===================================
// EDIT EXPENSE
// ===================================

function editExpense(id) {
  const expense = expenses.find(entry => entry.id === id);

  if (!expense) return;

  const newDescription = prompt(
    "Edit description:",
    expense.description
  );

  if (newDescription === null) return;

  const newAmount = prompt(
    "Edit amount:",
    expense.amount
  );

  if (newAmount === null) return;

  const newCategory = prompt(
    "Enter category: Food, Bills, Transportation, Shopping, or Other",
    expense.category
  );

  if (newCategory === null) return;

  const amount = Number(newAmount);
  const category = categories.find(
    item => item.toLowerCase() === newCategory.trim().toLowerCase()
  );

  if (
    !newDescription.trim() ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !category
  ) {
    alert("Please enter a valid description, amount, and category.");
    return;
  }

  expense.description = newDescription.trim();
  expense.amount = amount;
  expense.category = category;

  saveData();
  renderAll();
}


// ===================================
// DELETE EXPENSE
// ===================================

function deleteExpense(id) {
  expenses = expenses.filter(expense => expense.id !== id);

  saveData();
  renderAll();
}


// ===================================
// SPENDING CHART
// ===================================

function updateChart() {
  const canvas = document.getElementById("expense-chart");

  if (!canvas || typeof Chart === "undefined") {
    console.error("Chart.js or the chart canvas could not be found.");
    return;
  }

  const totals = categories.map(category => {
    return expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  });

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(canvas, {
    type: "doughnut",

    data: {
      labels: categories,

      datasets: [{
        label: "Spending",
        data: totals,

        backgroundColor: [
          "#c4a5ff",
          "#ff8fab",
          "#8ecae6",
          "#ffd166",
          "#a8dadc"
        ],

        borderColor: "#292435",
        borderWidth: 3
      }]
    },

    options: {
      responsive: true,
      maintainAspectRatio: true,

      plugins: {
        legend: {
          position: "bottom",

          labels: {
            color: "#ffffff",
            padding: 18
          }
        },

        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: $${context.parsed.toFixed(2)}`;
            }
          }
        }
      }
    }
  });
}


// ===================================
// UPDATE EVERYTHING
// ===================================

function renderAll() {
  renderIncome();
  renderExpenses();
  updateDashboard();
  updateChart();
}


// ===================================
// SEARCH AND FILTER
// ===================================

search.addEventListener("input", renderExpenses);
filter.addEventListener("change", renderExpenses);


// ===================================
// START THE APP
// ===================================

renderAll();
