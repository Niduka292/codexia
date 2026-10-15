# Google Spreadsheet & Judge Leaderboard Setup Guide

Follow these steps to connect team registrations AND live judge scoring from a Google Spreadsheet to your CODEXIA website.

---

### Step 1: Create a Google Spreadsheet with 2 Tabs
Open [Google Sheets](https://sheets.new) and create two tabs at the bottom:

1. **Tab 1 Name**: `Registrations`
   - Headers (Row 1): `Timestamp` | `Team Name` | `Leader Name` | `Leader Email` | `Leader Student ID` | `Academic Year` | `Programming Languages` | `Team Members`

2. **Tab 2 Name**: `Leaderboard` (Used by Judges for marking)
   - Headers (Row 1): `Team Name` | `Data Structures Points` | `Security Points` | `Systems Points` | `Latest Solve`

---

### Step 2: Add Google Apps Script
1. Click **Extensions** > **Apps Script**.
2. Replace all code in `Code.gs` with this script:

```javascript
var REGISTRATION_SHEET_NAME = "Registrations";
var LEADERBOARD_SHEET_NAME = "Leaderboard";

// doGet returns live Leaderboard scores for the website
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(LEADERBOARD_SHEET_NAME);
    if (!sheet) {
      sheet = ss.getSheets()[0];
    }

    var data = sheet.getDataRange().getValues();
    var result = [];

    // Skip header row
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0] || String(row[0]).trim() === "") continue;

      var teamName = String(row[0]);
      var dsa = Number(row[1]) || 0;
      var sec = Number(row[2]) || 0;
      var sys = Number(row[3]) || 0;
      var latestSolve = String(row[4] || "PROTOCOL ACTIVE");

      result.push({
        name: teamName,
        dsa_points: dsa,
        security_points: sec,
        systems_points: sys,
        total_score: dsa + sec + sys,
        latest_solve: latestSolve
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// doPost records new Team Registrations into "Registrations" tab
function norm_(v) {
  return String(v || "").trim().replace(/\s+/g, " ").toLowerCase();
}

// Extracts student IDs from text like "Name (ID: AS2023659); Name2 (AS2023111)"
function idsFromMembers_(text) {
  var ids = [];
  var re = /\((?:ID:\s*)?([^)]+)\)/gi;
  var m;
  while ((m = re.exec(String(text || ""))) !== null) ids.push(norm_(m[1]));
  return ids;
}

// Returns a duplicate message if the submission clashes with an existing row, else null
function findDuplicate_(sheet, data) {
  var rows = sheet.getDataRange().getValues();
  var team = norm_(data.team_name);
  var email = norm_(data.email);
  var submitted = [norm_(data.student_id)].concat(idsFromMembers_(data.team_members)).filter(Boolean);

  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (team && norm_(r[1]) === team) return "That team name is already registered.";
    if (email && norm_(r[3]) === email) return "A registration already exists for this email address.";
    var existing = [norm_(r[4])].concat(idsFromMembers_(r[7])).filter(Boolean);
    for (var j = 0; j < existing.length; j++) {
      if (submitted.indexOf(existing[j]) !== -1) return "One or more student IDs have already been registered.";
    }
  }
  return null;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(REGISTRATION_SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(REGISTRATION_SHEET_NAME);
      sheet.appendRow([
        "Timestamp",
        "Team Name",
        "Leader Name",
        "Leader Email",
        "Leader Student ID",
        "Academic Year",
        "Programming Languages",
        "Team Members"
      ]);
    }

    var data = {};
    if (e && e.parameter && Object.keys(e.parameter).length > 0) {
      data = e.parameter;
    } else if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    }

    var membersStr = data.team_members || '';

    var dupMessage = findDuplicate_(sheet, data);
    if (dupMessage) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "duplicate", message: dupMessage }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([
      data.submitted_at || new Date().toISOString(),
      data.team_name || '',
      data.full_name || '',
      data.email || '',
      data.student_id || '',
      data.academic_year || '',
      data.programming_languages || '',
      membersStr
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Registration recorded successfully." }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}
```

---

### Step 3: Deploy Web App
1. Click **Deploy** > **New deployment**.
2. Select type **Web app**.
3. Set **Execute as**: `Me`, and **Who has access**: **`Anyone`**.
4. Click **Deploy** (or **Deploy -> Manage deployments -> Edit -> New version -> Deploy** if updating).
5. Copy the Web App URL (`https://script.google.com/macros/s/.../exec`).

---

### Step 4: Configure `.env.local`
In `codefest/.env.local`:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_SHEETS_LEADERBOARD_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

Now, when users register on the website:
1. Registrations are automatically saved locally and appear in the **Admin Dashboard ("Teams Data" tab)**.
2. Registrations are automatically appended to the **"Registrations"** tab in your Google Spreadsheet.
3. When judges enter marks in the **"Leaderboard"** tab in Google Sheets, the website's `/leaderboard` page automatically fetches and displays the live scores!
