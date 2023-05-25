const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

class Transaction {
  transactions = [];
  incomeProps = 0;
  expenseProps = 0;

  calculateSums() {
    this.incomeProps = this.transactions.reduce((total, transaction) => {
      return transaction.amount > 0 ? total + transaction.amount : total;
    }, 0);

    this.expenseProps = this.transactions.reduce((total, transaction) => {
      return transaction.amount < 0 ? total + transaction.amount : total;
    }, 0);
  }

  total() {
    return this.incomeProps + this.expenseProps;
  }
}

const trans = new Transaction();

const DOM = {
  Container: document.querySelector("#data-table tbody"),

  addTransaction(index, transaction) {
    const tr = document.createElement("tr");
    tr.setAttribute("data-index", index);
    tr.innerHTML = DOM.innerHTMLTransaction(transaction);
    DOM.Container.appendChild(tr);

    const removeButton = tr.querySelector("img");
    removeButton.addEventListener("click", (event) => {
      const row = event.target.closest("tr");
      const index = parseInt(row.getAttribute("data-index"));

      removeTransaction(index);
    });
  },

  innerHTMLTransaction(transaction) {
    const CSSClass = transaction.amount > 0 ? "income" : "expense";
    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
    <tr>
      <td class="description">${transaction.description}</td>
      <td class=${CSSClass}>${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
          <img src="./assets/minus.svg" data-index="${transaction.id}" alt="Remover Transação" />
      </td>
    </tr>
    `;
    return html;
  },

  updateBalance() {
    document.getElementById("IncomeDisplay").innerHTML = Utils.formatCurrency(
      trans.incomeProps
    );

    document.getElementById("ExpenseDisplay").innerHTML = Utils.formatCurrency(
      trans.expenseProps
    );

    document.getElementById("TotalDisplay").innerHTML = Utils.formatCurrency(
      trans.total()
    );
  },
};

const Utils = {
  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";
    value = String(value).replace(/\D/g, "");
    value = Number(value) / 100;
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return signal + value;
  },
};

const url = "https://devfinance.onrender.com/";

function removeTransaction(index) {
  const transactionId = trans.transactions[index].id;

  trans.transactions.splice(index, 1);

  fetch(`${url}${transactionId}`, {
    method: "DELETE",
  })
    .then((response) => {
      if (response.ok) {
        DOM.Container.innerHTML = "";
        trans.transactions.forEach((transaction, newIndex) => {
          DOM.addTransaction(newIndex, transaction);
        });
        DOM.updateBalance();
      } else {console.log("Ocorreu um erro ao excluir o registro.");
    }
  })
  .catch((error) => {
    console.log("Ocorreu um erro:", error);
  });
}
function executarFetch() {
  const addTransactionForm = document.getElementById("addTransactionForm");
  addTransactionForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Evita o comportamento padrão de recarregar a página

    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value) * 100;
    const date = document.getElementById("date").value;

    const newTransaction = {
      description: description,
      amount: amount,
      date: date,
    };

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTransaction),
    })
      .then((response) => response.json())
      .then((data) => {
        // Limpar o formulário após a adição bem-sucedida
        addTransactionForm.reset();

        trans.transactions.push(data);
        DOM.addTransaction(trans.transactions.length - 1, data); // Usando o índice correto
        DOM.updateBalance();
      })
      .catch((error) => {
        console.log("Ocorreu um erro:", error);
      });
  });

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      trans.transactions = data; // Substituir a lista de transações

      trans.transactions.forEach((transaction, index) => {
        DOM.addTransaction(index, transaction); // Usando o índice correto
      });

      trans.calculateSums(); // Recalcular as somas
      DOM.updateBalance();
    })
    .catch((error) => {
      console.log("Ocorreu um erro:", error);
    });
}

executarFetch();