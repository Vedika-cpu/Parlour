// Load bookings on startup
document.addEventListener("DOMContentLoaded", () => {
  loadBookings();
  loadCalendar(currentMonth, currentYear);
});

// Booking Form
const bookingForm = document.getElementById("bookingForm");
const bookingList = document.getElementById("bookingList");
const filterService = document.getElementById("filterService");
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phoneError");

// Sanitize digits only
function sanitizeDigits(str) {
  return str.replace(/\D/g, "");
}

// Prevent non-digit input
phoneInput.addEventListener("input", () => {
  const cleaned = sanitizeDigits(phoneInput.value).slice(0, 10);
  if (phoneInput.value !== cleaned) phoneInput.value = cleaned;
  phoneError.style.display = "none";
  phoneError.textContent = "";
});

// Prevent pasting non-digits
phoneInput.addEventListener("paste", (e) => {
  e.preventDefault();
  const text = (e.clipboardData || window.clipboardData).getData("text");
  const cleaned = sanitizeDigits(text).slice(0, 10);
  const start = phoneInput.selectionStart;
  const end = phoneInput.selectionEnd;
  phoneInput.value = (
    phoneInput.value.slice(0, start) +
    cleaned +
    phoneInput.value.slice(end)
  ).slice(0, 10);
});

// Save booking
function saveBooking(booking) {
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings.push(booking);
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

// Load bookings
function loadBookings() {
  bookingList.innerHTML = "";
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const filter = filterService.value;

  bookings
    .filter((b) => filter === "all" || b.service === filter)
    .forEach(displayBooking);
}

// Display booking card
function displayBooking(booking) {
  const card = document.createElement("div");
  card.classList.add("booking-card");
  card.setAttribute("data-id", booking.id);
  card.innerHTML = `
    <button onclick="deleteBooking(${booking.id})" aria-label="Delete booking">×</button>
    <h3>${booking.service}</h3>
    <p><strong>Name:</strong> ${booking.name}</p>
    <p><strong>Phone:</strong> ${booking.phone}</p>
    <p><strong>Date:</strong> ${booking.date}</p>
    <p><strong>Time:</strong> ${booking.time}</p>
  `;
  bookingList.appendChild(card);
}

// Delete booking
function deleteBooking(id) {
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  bookings = bookings.filter((b) => b.id !== id);
  localStorage.setItem("bookings", JSON.stringify(bookings));
  loadBookings();
  refreshCalendar();
}

// Form submit
bookingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const service = document.getElementById("service").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  // Phone validation
  if (!/^\d{10}$/.test(phone)) {
    phoneError.style.display = "block";
    phoneError.textContent = "Please enter a valid 10-digit phone number.";
    phoneInput.focus();
    return;
  }

  if (!name || !service || !date || !time) {
    alert("Please fill in all fields.");
    return;
  }

  const booking = {
    id: Date.now(),
    name,
    phone,
    service,
    date,
    time,
  };

  saveBooking(booking);
  loadBookings();
  refreshCalendar();
  bookingForm.reset();
  phoneError.style.display = "none";
});

// ========== Calendar ==========
const calendarDiv = document.getElementById("calendar");
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function loadCalendar(month, year) {
  calendarDiv.innerHTML = "";

  const header = document.createElement("div");
  header.classList.add("calendar-header");
  header.innerHTML = `
    <button onclick="prevMonth()">◀</button>
    <h3>${new Date(year, month).toLocaleString("default", {
      month: "long",
    })} ${year}</h3>
    <button onclick="nextMonth()">▶</button>
  `;
  calendarDiv.appendChild(header);

  const grid = document.createElement("div");
  grid.classList.add("calendar-grid");

  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].forEach((d) => {
    const dayName = document.createElement("div");
    dayName.style.fontWeight = "bold";
    dayName.style.textAlign = "center";
    dayName.innerText = d;
    grid.appendChild(dayName);
  });

  const firstDay = new Date(year, month).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let bookings = JSON.parse(localStorage.getItem("bookings")) || [];
  const filter = filterService.value;

  for (let i = 0; i < firstDay; i++)
    grid.appendChild(document.createElement("div"));

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.classList.add("calendar-day");
    cell.innerText = day;

    let dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    let dayBookings = bookings.filter(
      (b) => b.date === dateStr && (filter === "all" || b.service === filter)
    );

    if (dayBookings.length > 0) {
      cell.classList.add("booked");
      cell.title = dayBookings
        .map((b) => `${b.service} (${b.time})`)
        .join(", ");
    }

    grid.appendChild(cell);
  }

  calendarDiv.appendChild(grid);
}

function prevMonth() {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  loadCalendar(currentMonth, currentYear);
}
function nextMonth() {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  loadCalendar(currentMonth, currentYear);
}
function refreshCalendar() {
  loadCalendar(currentMonth, currentYear);
}

// Filter change
filterService.addEventListener("change", () => {
  loadBookings();
  refreshCalendar();
});
