const Modal = {
  open() {
    document.querySelector(".modal-overlay").classList.add("active");
  },
  close() {
    document.querySelector(".modal-overlay").classList.remove("active");
  },
};

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
    return this.incomeProps + this.expenseProps;
  }
}

const trans = new Transaction();

const DOM = {
  Conteiner: document.querySelector("#data-table tbody"),

  addTransaction(ind, transaction) {
    const index = trans.transactions.length - 1; // Índice da transação na lista
    const tr = document.createElement("tr");
    tr.setAttribute('data-index', index);
    tr.innerHTML = DOM.innerHTMLTransaction(transaction);
    DOM.Conteiner.appendChild(tr);

    const removeButton = tr.querySelector('img');
    removeButton.addEventListener('click', (event) => {
    const row = event.target.closest('tr');
    const index = parseInt(row.getAttribute('data-index'));

    // Chame o método para remover a transação e atualizar a tabela e os saldos
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

const url = "http://localhost:3333/";



function executarFetch() {


  const addTransactionForm = document.getElementById('addTransactionForm');
  addTransactionForm.addEventListener('submit', (event) => {
  event.preventDefault(); // Evita o comportamento padrão de recarregar a página

  // Obter os valores dos campos do formulário
  const description = document.getElementById('description').value;
  const amount = parseFloat(document.getElementById('amount').value) * 100;
  const date = document.getElementById('date').value;

  // Criar um objeto de transação com os valores
  const newTransaction = {
    description: description,
    amount: amount,
    date: date,
  };

  // Enviar a nova transação para a API usando o fetch
  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTransaction),
  })
    .then((response) => response.json())
    .then((data) => {
      // Limpar o formulário após a adição bem-sucedida
      addTransactionForm.reset();

      // Adicionar a nova transação à lista e atualizar a tabela e os saldos
      trans.transactions.push(data);
      DOM.addTransaction(null, data);
      DOM.updateBalance();
    })
    .catch((error) => {
      console.log('Ocorreu um erro:', error);
    });
});


  // listagem de dados
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





function removeTransaction(index) {
  const transactionId = trans.transactions[index].id;

  // Remova a transação da lista usando o índice fornecido
  trans.transactions.splice(index, 1);

  // Remova o registro da API usando o fetch
  fetch(`${url}${transactionId}`, {
    method: 'DELETE',
  })
    .then((response) => {
      if (response.ok) {
        // Limpe a tabela e atualize-a novamente
        DOM.Conteiner.innerHTML = '';
        trans.transactions.forEach((transaction, newIndex) => {
          DOM.addTransaction(newIndex, transaction);
        });

        // Atualize os saldos
        DOM.updateBalance();
      } else {
        console.log('Ocorreu um erro ao excluir o registro.');
      }
    })
    .catch((error) => {
      console.log('Ocorreu um erro:', error);
    });
}


executarFetch();


// Dentro da função executarFetch(), adicione o ouvinte de evento ao formulário
