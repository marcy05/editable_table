document.addEventListener('DOMContentLoaded', () => {
  loadTable();

  document.getElementById('addRowBtn').addEventListener('click', addRow);
  document.getElementById('addColumnBtn').addEventListener('click', addColumn);
  document.getElementById('factoryResetBtn').addEventListener('click', factoryReset);

  function loadTable() {
    fetch('/data')
      .then(response => response.json())
      .then(({ rows, columns }) => {
        const table = document.getElementById('data-table');
        const thead = table.querySelector('thead');
        const tbody = table.querySelector('tbody');

        thead.innerHTML = '';
        tbody.innerHTML = '';

        // Create header row
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
          const th = document.createElement('th');
          th.textContent = col.name;
          headerRow.appendChild(th);
        });
        const actionHeader = document.createElement('th');
        actionHeader.textContent = 'Actions';
        headerRow.appendChild(actionHeader);
        thead.appendChild(headerRow);

        // Create data rows
        rows.forEach(row => {
          const tr = document.createElement('tr');
          columns.forEach(col => {
            const td = document.createElement('td');
            td.textContent = row[col.name];
            td.contentEditable = true;
            td.dataset.column = col.name;
            td.dataset.id = row.id;
            tr.appendChild(td);
          });
          const actionCell = document.createElement('td');
          const removeButton = document.createElement('button');
          removeButton.textContent = 'Remove';
          removeButton.addEventListener('click', () => removeRow(row.id, removeButton));
          actionCell.appendChild(removeButton);
          tr.appendChild(actionCell);
          tbody.appendChild(tr);
        });

        observeChanges();
      });
  }

  function addRow() {
    fetch('/add-row', { method: 'POST' })
      .then(response => response.json())
      .then(({ id }) => {
        const tbody = document.getElementById('data-table').querySelector('tbody');
        const tr = document.createElement('tr');
        for (let i = 0; i < 6; i++) {
          const td = document.createElement('td');
          td.contentEditable = true;
          td.dataset.column = `col${i + 1}`;
          td.dataset.id = id;
          tr.appendChild(td);
        }
        const actionCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => removeRow(id, removeButton));
        actionCell.appendChild(removeButton);
        tr.appendChild(actionCell);
        tbody.appendChild(tr);
        observeChanges();
      });
  }

  function addColumn() {
    const columnName = prompt('Enter column name:');
    if (!columnName) return;

    fetch('/add-column', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnName })
    })
    .then(() => loadTable());
  }

  function removeColumn(columnName) {
    fetch('/remove-column', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ columnName })
    })
    .then(() => loadTable());
  }

  function removeRow(id, button) {
    fetch('/remove-row', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    .then(() => {
      const row = button.closest('tr');
      row.remove();
    });
  }

  function factoryReset() {
    fetch('/factory-reset', { method: 'POST' })
      .then(() => loadTable());
  }

  function observeChanges() {
    const cells = document.querySelectorAll('td[contenteditable]');
    cells.forEach(cell => {
      cell.removeEventListener('blur', onCellBlur);
      cell.addEventListener('blur', onCellBlur);
    });
  }

  function onCellBlur(event) {
    const cell = event.target;
    const { id, column } = cell.dataset;
    const value = cell.textContent;

    fetch('/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [column]: value })
    });
  }

  // Enable removing columns by clicking on the header
  document.getElementById('data-table').addEventListener('click', (event) => {
    if (event.target.tagName === 'TH' && event.target.textContent !== 'Actions') {
      const columnName = event.target.textContent;
      if (confirm(`Do you want to remove the column "${columnName}"?`)) {
        removeColumn(columnName);
      }
    }
  });
});
