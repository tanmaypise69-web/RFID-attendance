// =====================================
// RFID ATTENDANCE SYSTEM
// =====================================

// Master Card
const MASTER_UID = "96EC5107";

// Registered Users
const users = {
    "BB582707": "Bhavishya",
    "EAD01D07": "Tushar"
};

// Attendance closing time
const CLOSING_HOUR = 9;

// Storage keys
const ATTENDANCE_KEY = "rfidAttendance";
const STATUS_KEY = "attendanceStatus";

// =====================================
// INITIALIZATION
// =====================================

let attendance = JSON.parse(
    localStorage.getItem(ATTENDANCE_KEY)
) || [];

let attendanceClosed =
    localStorage.getItem(STATUS_KEY) === "CLOSED";


// =====================================
// DATE
// =====================================

function updateDateTime() {

    const now = new Date();

    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    document.getElementById("date").innerText =
        `${day}/${month}/${year}`;

    let hours = now.getHours();
    let minutes = String(now.getMinutes()).padStart(2, "0");
    let seconds = String(now.getSeconds()).padStart(2, "0");

    let ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    hours = String(hours).padStart(2, "0");

    document.getElementById("time").innerText =
        `${hours}:${minutes}:${seconds} ${ampm}`;

    checkClosingTime(now);

    updateStatus();
}


// =====================================
// 9 AM AUTOMATIC STATUS
// =====================================

function checkClosingTime(now) {

    const hour = now.getHours();

    if (hour >= CLOSING_HOUR && !attendanceClosed) {

        // IMPORTANT:
        // Website does NOT automatically close attendance.
        // Master card must close it.

        updateStatus();
    }
}


// =====================================
// STATUS DISPLAY
// =====================================

function updateStatus() {

    const status =
        document.getElementById("systemStatus");

    const button =
        document.getElementById("closeBtn");

    if (attendanceClosed) {

        status.innerText = "CLOSED";
        status.style.color = "#dc2626";

        button.disabled = true;
        button.innerText = "ATTENDANCE CLOSED";

    } else {

        status.innerText = "OPEN";
        status.style.color = "#16a34a";

        button.disabled = false;
        button.innerText = "CLOSE ATTENDANCE";
    }
}


// =====================================
// MASTER CARD
// =====================================

function closeAttendance() {

    if (attendanceClosed) {
        return;
    }

    const confirmClose =
        confirm(
            "Are you sure you want to close today's attendance?"
        );

    if (!confirmClose) {
        return;
    }

    attendanceClosed = true;

    localStorage.setItem(
        STATUS_KEY,
        "CLOSED"
    );

    updateStatus();

    alert(
        "Attendance Closed Successfully!"
    );
}


// =====================================
// RFID PUNCH FUNCTION
// =====================================

function punchCard(uid) {

    uid = uid
        .replace(/\s/g, "")
        .toUpperCase();

    // -------------------------------
    // Check Master
    // -------------------------------

    if (uid === MASTER_UID) {

        if (attendanceClosed) {

            return {
                success: false,
                message: "Attendance already closed."
            };

        }

        attendanceClosed = true;

        localStorage.setItem(
            STATUS_KEY,
            "CLOSED"
        );

        updateStatus();

        return {
            success: true,
            name: "Tanmay",
            message: "Attendance Closed"
        };
    }


    // -------------------------------
    // Attendance already closed
    // -------------------------------

    if (attendanceClosed) {

        return {
            success: false,
            message: "Attendance is CLOSED."
        };
    }


    // -------------------------------
    // Check User
    // -------------------------------

    if (!users[uid]) {

        return {
            success: false,
            message: "Unknown RFID Card."
        };
    }


    // -------------------------------
    // Duplicate check
    // -------------------------------

    const alreadyPresent =
        attendance.some(
            record => record.uid === uid
        );

    if (alreadyPresent) {

        return {
            success: false,
            message: `${users[uid]} already punched.`
        };
    }


    // -------------------------------
    // Save attendance
    // -------------------------------

    const now = new Date();

    const record = {

        name: users[uid],

        uid: uid,

        time: now.toLocaleTimeString(),

        date: now.toLocaleDateString(),

        status: "PRESENT"
    };

    attendance.push(record);

    localStorage.setItem(
        ATTENDANCE_KEY,
        JSON.stringify(attendance)
    );

    displayAttendance();

    return {
        success: true,
        name: users[uid],
        message: "Attendance Marked"
    };
}


// =====================================
// DISPLAY ATTENDANCE
// =====================================

function displayAttendance() {

    const table =
        document.getElementById("attendanceTable");

    const noData =
        document.getElementById("noData");

    table.innerHTML = "";

    if (attendance.length === 0) {

        noData.style.display = "block";

        return;
    }

    noData.style.display = "none";


    attendance.forEach(
        (record, index) => {

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>${index + 1}</td>

                <td>
                    <b>${record.name}</b>
                </td>

                <td>
                    ${formatUID(record.uid)}
                </td>

                <td>
                    ${record.time}
                </td>

                <td class="present">
                    ✓ ${record.status}
                </td>

            `;

            table.appendChild(row);
        }
    );
}


// =====================================
// FORMAT UID
// =====================================

function formatUID(uid) {

    return uid
        .match(/.{1,2}/g)
        .join(" ");
}


// =====================================
// CLEAR ATTENDANCE
// =====================================

function clearAttendance() {

    const confirmClear =
        confirm(
            "Delete today's attendance?"
        );

    if (!confirmClear) {
        return;
    }

    attendance = [];

    attendanceClosed = false;

    localStorage.removeItem(
        ATTENDANCE_KEY
    );

    localStorage.removeItem(
        STATUS_KEY
    );

    displayAttendance();

    updateStatus();
}


// =====================================
// TEST RFID CARDS
// =====================================

// Browser console se test kar sakte ho:
//
// punchCard("BB582707")
// punchCard("EAD01D07")
// punchCard("96EC5107")


// =====================================
// START
// =====================================

displayAttendance();

updateStatus();

setInterval(
    updateDateTime,
    1000
);
