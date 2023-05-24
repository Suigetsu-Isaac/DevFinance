const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

const url = "http://localhost:3333/";


function executarFetch() {
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      // Adicione os dados à lista de transações
      data.forEach((transaction) => {
        trans.transactions.push(transaction);
      });

      // Atualize a tabela e os saldos
      trans.transactions.forEach((transaction) => {
        DOM.addTransaction(null, transaction);
      });

      DOM.updateBalance();
    })
    .catch((error) => {
      console.log("Ocorreu um erro:", error);
    });
} 



class Transaction {
  transactions = []
  incomeProps = 0
  expenseProps = 0

  income() {
    this.transactions.forEach((transaction) => {
      if (transaction.amount > 0) this.incomeProps += transaction.amount;
    });
    return this.incomeProps;
  }
  
  expense() {   
    this.transactions.forEach((transaction) => {
      if (transaction.amount < 0) this.expenseProps += transaction.amount;
    });
    return this.expenseProps;
  }
  
  total() {
    return this.income() + this.expense();
  }
}

const trans = new Transaction();

const DOM = {
  Conteiner: document.querySelector("#data-table tbody"),

  addTransaction(index, transaction) {
    const tr = document.createElement("tr");
    tr.innerHTML = DOM.innerHTMLTransaction(transaction);
    DOM.Conteiner.appendChild(tr);
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
          <img src="./assets/minus.svg" alt="Remover Transação" />
      </td>
    </tr>
    `;
    return html;
  },

  updateBalance () {
    document.getElementById("IncomeDisplay").innerHTML = Utils.formatCurrency(
       trans.income()
    );

    document.getElementById("ExpenseDisplay").innerHTML = Utils.formatCurrency(
       trans.expense()
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

executarFetch();