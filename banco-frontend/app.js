document.addEventListener('DOMContentLoaded', () => {
  const apiBaseInput = document.getElementById('api-base');

  function apiBase() {
    return (apiBaseInput?.value || 'http://localhost:8080').replace(/\/$/, '');
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(value);
  }

  function formatDate(isoString) {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(apiBase() + path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json') ? await response.json() : await response.text();

    if (!response.ok) {
      const message = typeof body === 'string' ? body : (body.message || 'Error en la solicitud.');
      throw new Error(message);
    }

    return body;
  }

  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      navItems.forEach((n) => n.classList.remove('is-active'));
      views.forEach((v) => v.classList.remove('is-active'));
      item.classList.add('is-active');
      const target = document.getElementById('view-' + item.dataset.view);
      if (target) target.classList.add('is-active');
    });
  });

  const customersBody = document.getElementById('customers-body');
  const customersStatus = document.getElementById('customers-status');
  const historyBody = document.getElementById('history-body');

  function renderCustomers(customers) {
    if (!customersBody) return;
    if (!customers.length) {
      customersBody.innerHTML = '<tr class="empty-row"><td colspan="4">No hay clientes registrados.</td></tr>';
      return;
    }

    customersBody.innerHTML = customers.map((c) => `
      <tr>
        <td>${c.id}</td>
        <td>${c.firstName} ${c.lastName}</td>
        <td>${c.accountNumber}</td>
        <td class="num">${formatMoney(c.balance)}</td>
      </tr>
    `).join('');
  }

  async function loadCustomers() {
    if (!customersStatus) return;
    customersStatus.textContent = 'Cargando...';
    customersStatus.classList.remove('is-error');
    try {
      const customers = await apiRequest('/api/customers');
      renderCustomers(customers);
      customersStatus.textContent = `${customers.length} cliente(s)`;
    } catch (err) {
      customersStatus.textContent = err.message;
      customersStatus.classList.add('is-error');
    }
  }

  const refreshButton = document.getElementById('btn-refresh-customers');
  if (refreshButton) {
    refreshButton.addEventListener('click', loadCustomers);
  }

  const findForm = document.getElementById('form-find-customer');
  if (findForm) {
    findForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const id = document.getElementById('find-customer-id')?.value;
      const result = document.getElementById('find-customer-result');
      if (!result || !id) return;

      result.classList.remove('is-error', 'is-success');
      result.textContent = 'Buscando...';
      try {
        const customer = await apiRequest(`/api/customers/${id}`);
        result.textContent = `${customer.firstName} ${customer.lastName} — cuenta ${customer.accountNumber} — saldo ${formatMoney(customer.balance)}`;
        result.classList.add('is-success');
      } catch (err) {
        result.textContent = err.message;
        result.classList.add('is-error');
      }
    });
  }

  const createForm = document.getElementById('form-create-customer');
  if (createForm) {
    createForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const result = document.getElementById('create-customer-result');
      if (!result) return;

      result.classList.remove('is-error', 'is-success');
      const payload = {
        firstName: document.getElementById('new-first-name')?.value,
        lastName: document.getElementById('new-last-name')?.value,
        accountNumber: document.getElementById('new-account-number')?.value,
        balance: Number(document.getElementById('new-balance')?.value),
      };

      try {
        const customer = await apiRequest('/api/customers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        result.textContent = `Cliente creado con ID ${customer.id}.`;
        result.classList.add('is-success');
        event.target.reset();
        loadCustomers();
      } catch (err) {
        result.textContent = err.message;
        result.classList.add('is-error');
      }
    });
  }

  const transferForm = document.getElementById('form-transfer');
  if (transferForm) {
    transferForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const resultBox = document.getElementById('transfer-result');
      if (!resultBox) return;

      resultBox.classList.remove('is-error', 'is-success');
      const payload = {
        senderAccountNumber: document.getElementById('t-sender')?.value,
        receiverAccountNumber: document.getElementById('t-receiver')?.value,
        amount: Number(document.getElementById('t-amount')?.value),
      };

      resultBox.textContent = 'Procesando transferencia...';
      try {
        const transaction = await apiRequest('/api/transactions', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        resultBox.textContent = `Transferencia realizada. ${formatMoney(transaction.amount)} de ${transaction.senderAccountNumber} a ${transaction.receiverAccountNumber}.`;
        resultBox.classList.add('is-success');
        event.target.reset();
      } catch (err) {
        resultBox.textContent = err.message;
        resultBox.classList.add('is-error');
      }
    });
  }

  const historyForm = document.getElementById('form-history');
  if (historyForm) {
    historyForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const account = document.getElementById('h-account')?.value;
      if (!historyBody || !account) return;

      historyBody.innerHTML = '<tr class="empty-row"><td colspan="4">Cargando...</td></tr>';
      try {
        const transactions = await apiRequest(`/api/transactions/${account}`);
        if (!transactions.length) {
          historyBody.innerHTML = '<tr class="empty-row"><td colspan="4">Esta cuenta no tiene transacciones.</td></tr>';
          return;
        }

        const sorted = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        historyBody.innerHTML = sorted.map((t) => {
          const isOutgoing = t.senderAccountNumber === account;
          const counterparty = isOutgoing ? t.receiverAccountNumber : t.senderAccountNumber;
          const sign = isOutgoing ? '-' : '+';
          const cssClass = isOutgoing ? 'amount-out' : 'amount-in';
          return `
            <tr>
              <td>${formatDate(t.timestamp)}</td>
              <td>${isOutgoing ? 'Enviada' : 'Recibida'}</td>
              <td>${counterparty}</td>
              <td class="num ${cssClass}">${sign} ${formatMoney(t.amount)}</td>
            </tr>
          `;
        }).join('');
      } catch (err) {
        historyBody.innerHTML = `<tr class="empty-row"><td colspan="4">${err.message}</td></tr>`;
      }
    });
  }

  loadCustomers();
});
