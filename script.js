let leaderboardData = [];
let originalData = [];
let previousData = [];
let currentPage = 1;
let rowsPerPage = 10;
 
// Fetch leaderboard data and handle caching
async function fetchLeaderboardData() {
  try {
    const cachedData = JSON.parse(localStorage.getItem('leaderboardData'));
    const cachedTimestamp = localStorage.getItem('leaderboardTimestamp');
    const now = Date.now();

    // Use cached data if within 5 minutes
    if (cachedData && cachedTimestamp && now - cachedTimestamp < 300000) {
      console.log('Using cached data');
      leaderboardData = cachedData;
      originalData = [...leaderboardData];
      previousData = leaderboardData;
      displayTable();
      return;
    }

    // Fetch new data
    const response = await fetch('https://script.google.com/macros/s/YOUR_URL/exec');
    leaderboardData = await response.json();
    originalData = [...leaderboardData];
    previousData = leaderboardData;

    displayTable();
    localStorage.setItem('leaderboardData', JSON.stringify(leaderboardData));
    localStorage.setItem('leaderboardTimestamp', Date.now());
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);

    if (previousData.length > 0) {
      console.warn('Using fallback data');
      leaderboardData = previousData;
      originalData = [...leaderboardData];
      displayTable();
    } else {
      console.warn('Using cached data as fallback');
      const fallbackData = JSON.parse(localStorage.getItem('leaderboardData'));
      if (fallbackData) {
        leaderboardData = fallbackData;
        originalData = [...leaderboardData];
        displayTable();
      }
    }
  }
}

// Display table content
function displayTable() {
  const tableBody = document.getElementById('leaderboard').querySelector('tbody');
  tableBody.innerHTML = '';

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const dataToDisplay = leaderboardData.slice(startIndex, endIndex);

  dataToDisplay.forEach(row => {
    if (row[0].toLowerCase() === 'name') return;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td>${row[3]}</td>
      <td>${row[4]}</td>
      <td>${row[5]}</td>
    `;
    tableBody.appendChild(tr);
  });

  updatePagination();
}

// Pagination controls
function changePage(direction) {
  currentPage += direction;
  displayTable();
}

function goToFirstPage() {
  currentPage = 1;
  displayTable();
}

function goToLastPage() {
  currentPage = Math.ceil(leaderboardData.length / rowsPerPage);
  displayTable();
}

function updateRowsPerPage() {
  rowsPerPage = parseInt(document.getElementById('entries-per-page').value);
  currentPage = 1;
  displayTable();
}

function filterTable() {
  const searchValue = document.getElementById('search-bar').value.toLowerCase();

  if (!searchValue) {
    leaderboardData = [...originalData];
  } else {
    leaderboardData = originalData.filter(row => row[0].toLowerCase().includes(searchValue));
  }

  currentPage = 1;
  displayTable();
}

// Add page numbers for navigation
function updatePagination() {
  const totalPages = Math.ceil(leaderboardData.length / rowsPerPage);
  const pageNumbersContainer = document.getElementById('page-numbers');
  pageNumbersContainer.innerHTML = '';

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.innerText = i;
    pageButton.classList.add('page-btn');
    if (i === currentPage) {
      pageButton.disabled = true;
      pageButton.classList.add('active');
    }
    pageButton.onclick = () => {
      currentPage = i;
      displayTable();
    };
    pageNumbersContainer.appendChild(pageButton);
  }

  document.getElementById('prev-btn').disabled = currentPage === 1;
  document.getElementById('next-btn').disabled = currentPage === totalPages;
  document.getElementById('first-btn').disabled = currentPage === 1;
  document.getElementById('last-btn').disabled = currentPage === totalPages;

  document.getElementById('page-info').innerText = `Page ${currentPage} of ${totalPages}`;
  document.getElementById('total-entries').innerText = `Total Entries: ${leaderboardData.length}`;
}

fetchLeaderboardData();
setInterval(fetchLeaderboardData, 300000);
