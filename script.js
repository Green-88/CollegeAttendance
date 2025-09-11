// Helper function: Generate 75 dummy students
function generateStudents() {
  const arr = [];
  for (let i = 1; i <= 75; i++) {
    arr.push("ROLL NO." + i);
  }
  return arr;
}

// Teacher accounts with 75 students each
const teachers = [
  { username: "SOHIT", password: "SOHIT", subject: "Software Project Management", students: generateStudents() },
  { username: "SONAM", password: "SONAM", subject: "Software Engineering", students: generateStudents() },
  { username: "GARIMA", password: "GARIMA", subject: "AI", students: generateStudents() },
  { username: "RAJNEESH", password: "RAJNEESH", subject: "Python Programming", students: generateStudents() },
  { username: "BABURAM", password: "BABURAM", subject: "Computer Networks", students: generateStudents() },
  { username: "user", password: "user", subject: "subject", students: generateStudents() }

];

// Globals
let currentTeacher = null;
let students = [];
const today = new Date();
const todayKey = today.toLocaleDateString();

// Attendance key for each teacher
function getStorageKey() {
  return "attendance_" + currentTeacher.username;
}

// Login
function login() {
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();
  const teacher = teachers.find(t => t.username === user && t.password === pass);
  if(teacher){
    currentTeacher = teacher;
    students = [...teacher.students];
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("attendanceSection").style.display = "block";
    initTodayAttendance();
    loadStudents();
    alert("Welcome " + teacher.username + " ("+teacher.subject+")");
  } else {
    alert("Invalid credentials");
  }
}

// Logout
function logout(){
  currentTeacher = null;
  students = [];
  document.getElementById("attendanceSection").style.display = "none";
  document.getElementById("loginForm").style.display = "block";
}

// Init attendance
function initTodayAttendance() {
  let key = getStorageKey();
  let allRecords = JSON.parse(localStorage.getItem(key)) || {};
  if (!allRecords[todayKey]) { allRecords[todayKey] = {}; }
  students.forEach(s => {
    if(!allRecords[todayKey][s]) allRecords[todayKey][s] = "Absent";
  });
  localStorage.setItem(key, JSON.stringify(allRecords));
}

// Load student table
function loadStudents() {
  const tbody = document.getElementById("studentTable");
  tbody.innerHTML = "";
  let key = getStorageKey();
  const allRecords = JSON.parse(localStorage.getItem(key)) || {};

  students.forEach(name => {
    const todayStatus = (allRecords[todayKey] && allRecords[todayKey][name]) ? allRecords[todayKey][name] : "Absent";

    let totalPresent = 0, totalAbsent = 0;
    Object.keys(allRecords).forEach(date => {
      if(allRecords[date][name] === "Present") totalPresent++;
      else if(allRecords[date][name] === "Absent") totalAbsent++;
    });

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${name}</td>
      <td id="status-${name.replace(/\s+/g,'')}" class="status ${todayStatus.toLowerCase()}">${todayStatus}</td>
      <td>
        <button class="present-btn" onclick="mark('${name}','Present')">Present</button>
        <button class="absent-btn" onclick="mark('${name}','Absent')">Absent</button>
      </td>
      <td><button class="view-btn" onclick="viewStudent('${name}')">View</button></td>
      <td>${totalPresent}</td>
      <td>${totalAbsent}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Mark attendance
function mark(student, status) {
  let key = getStorageKey();
  const allRecords = JSON.parse(localStorage.getItem(key)) || {};
  if (!allRecords[todayKey]) allRecords[todayKey] = {};
  allRecords[todayKey][student] = status;
  localStorage.setItem(key, JSON.stringify(allRecords));
  loadStudents();
}

// Search
function filterStudents() {
  const term = document.getElementById('search').value.toLowerCase();
  const tbody = document.getElementById('studentTable');
  tbody.querySelectorAll('tr').forEach(tr => {
    tr.style.display = tr.cells[0].textContent.toLowerCase().includes(term) ? '' : 'none';
  });
}

// Calendar view
function viewStudent(name) {
  const detailDiv = document.getElementById("studentDetail");
  let key = getStorageKey();
  const allRecords = JSON.parse(localStorage.getItem(key)) || {};
  const currentDate = new Date();

  function renderCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });

    let html = `<h3>${name} - ${monthName}</h3>
                <div class="month-nav">
                  <button onclick="changeMonth('${name}', ${year}, ${month-1})">Prev</button>
                  <button onclick="changeMonth('${name}', ${year}, ${month+1})">Next</button>
                </div>
                <div class="calendar">
                  <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
                  <div>Thu</div><div>Fri</div><div>Sat</div>`;

    for(let i=0;i<firstDay;i++) html += `<div class="day empty"></div>`;

    for(let d=1; d<=daysInMonth; d++){
      const dateObj = new Date(year, month, d);
      const dayOfWeek = dateObj.getDay();
      const dateKey = dateObj.toLocaleDateString();

      let status = (allRecords[dateKey] && allRecords[dateKey][name]) ? allRecords[dateKey][name] : 
                   (dateObj > new Date() ? "" : "Absent");

      if(dayOfWeek === 0) { status = "Holiday"; }

      const todayClass = dateObj.toDateString() === new Date().toDateString() ? " today" : "";
      html += `<div class="day ${status.toLowerCase()}${todayClass}" 
                   data-date="${dateObj.toDateString()}" 
                   onclick="toggleStatus('${name}','${dateKey}', ${dayOfWeek}, this)">
                ${d}<br>${status}
               </div>`;
    }

    html += `</div>`;
    detailDiv.innerHTML = html;
    detailDiv.classList.add("active");
    detailDiv.scrollIntoView({behavior:"smooth"});
  }

  window.changeMonth = function(name, year, month){
    if(month < 0){ month = 11; year--; }
    if(month > 11){ month = 0; year++; }
    renderCalendar(year, month);
  }

  window.toggleStatus = function(student, dateKey, dayOfWeek, el) {
    if(dayOfWeek === 0) return; // Sunday fixed holiday

    let key = getStorageKey();
    const allRecords = JSON.parse(localStorage.getItem(key)) || {};
    if(!allRecords[dateKey]) allRecords[dateKey] = {};
    let currentStatus = allRecords[dateKey][student] || "Absent";

    let newStatus;
    if(currentStatus === "Present") newStatus = "Absent";
    else if(currentStatus === "Absent") newStatus = "Holiday";
    else newStatus = "Present";

    allRecords[dateKey][student] = newStatus;
    localStorage.setItem(key, JSON.stringify(allRecords));

    el.innerHTML = `${el.innerText.split("\n")[0]}<br>${newStatus}`;
    el.className = `day ${newStatus.toLowerCase()}` + (dateKey === new Date().toLocaleDateString() ? " today" : "");
    loadStudents();
  }

  renderCalendar(currentDate.getFullYear(), currentDate.getMonth());
}
