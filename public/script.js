let bookData = [];
let sortDirection = { title: 1, year: 1 };

document.getElementById('search-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = document.getElementById('search-query').value.trim();
  const type = document.getElementById('search-type').value;
  const errorMessage = document.getElementById('error-message');

  if (!query) {
    errorMessage.textContent = 'Please enter a search term';
    return;
  }

  try {
    const response = await fetch(`/search/${encodeURIComponent(query)}/${type}`);
    const data = await response.json();

    if (response.ok) {
      errorMessage.textContent = '';
      bookData = data;
      renderTable();
    } else {
      errorMessage.textContent = data.error || 'Failed to fetch book data';
    }
  } catch (error) {
    errorMessage.textContent = 'Network error occurred';
  }
});

function renderTable(filteredData = bookData) {
  const tbody = document.getElementById('book-data');
  tbody.innerHTML = '';

  filteredData.forEach(book => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${book.title}</td>
      <td>${book.year}</td>
      <td>${book.author}</td>
      <td>${book.cover ? `<img src="${book.cover}" alt="Cover">` : 'No cover'}</td>
    `;
    tbody.appendChild(row);
  });
}

function sortTable(key) {
  sortDirection[key] = -sortDirection[key];
  bookData.sort((a, b) => {
    const valueA = a[key] === 'N/A' ? (key === 'year' ? -Infinity : a[key]) : a[key];
    const valueB = b[key] === 'N/A' ? (key === 'year' ? -Infinity : b[key]) : b[key];
    if (key === 'title') {
      return sortDirection[key] * valueA.localeCompare(valueB);
    }
    return sortDirection[key] * (valueA - valueB);
  });
  renderTable();
}

function applyFilter() {
  const minYear = parseInt(document.getElementById('year-filter-min').value) || -Infinity;
  const maxYear = parseInt(document.getElementById('year-filter-max').value) || Infinity;
  const filteredData = bookData.filter(book => {
    const year = book.year === 'N/A' ? null : parseInt(book.year);
    return year && year >= minYear && year <= maxYear;
  });
  renderTable(filteredData);
}
