# Google Spreadsheet, Automated Confirmation Emails & Judge Leaderboard Setup Guide

Follow these steps to connect team registrations, **automated cyberpunk-themed confirmation emails for group leaders**, and live judge scoring from a Google Spreadsheet to your CODEXIA website.

---

### Step 1: Create a Google Spreadsheet with 2 Tabs
Open [Google Sheets](https://sheets.new) and create two tabs at the bottom:

1. **Tab 1 Name**: `Registrations`
   - Headers (Row 1): `Timestamp` | `Team Name` | `Leader Name` | `Leader Email` | `Leader Student ID` | `Academic Year` | `Programming Languages` | `Team Members`

2. **Tab 2 Name**: `Leaderboard` (Used by Judges for marking)
   - Headers (Row 1): `Team Name` | `Game 01` | `Game 02` | `Game 03` | `Game 04` | `Game 05` | `Latest Solve`

---

### Step 2: Add Google Apps Script
1. In your Google Spreadsheet, click **Extensions** > **Apps Script**.
2. Replace all code in `Code.gs` with the following complete script:

```javascript
var REGISTRATION_SHEET_NAME = "Registrations";
var LEADERBOARD_SHEET_NAME = "Leaderboard";
var WEBSITE_URL = "https://codexia-web.vercel.app"; // Update with your deployed website URL or leave default

// Helper to normalize strings for duplicate checking
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

// Extracts member objects for API list response
function parseMembersForList_(text) {
  if (!text) return [];
  var parts = String(text).split(";");
  var members = [];
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].trim();
    if (!p) continue;
    var match = p.match(/^(.*?)\s*\((?:ID:\s*)?([^)]+)\)$/);
    if (match) {
      members.push({ full_name: match[1].trim(), student_id: match[2].trim() });
    } else {
      members.push({ full_name: p, student_id: "" });
    }
  }
  return members;
}

// Check for duplicates
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

// ==========================================
// 1. doGet: Returns Leaderboard or Registrations
// ==========================================
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // If website calls ?action=list to get participant counts / records
    if (e && e.parameter && e.parameter.action === "list") {
      var regSheet = ss.getSheetByName(REGISTRATION_SHEET_NAME);
      var regData = regSheet ? regSheet.getDataRange().getValues() : [];
      var registrations = [];
      for (var k = 1; k < regData.length; k++) {
        var r = regData[k];
        if (!r[1]) continue;
        registrations.push({
          id: "reg-" + k,
          submitted_at: r[0] || "",
          team_name: r[1] || "",
          full_name: r[2] || "",
          email: r[3] || "",
          student_id: r[4] || "",
          academic_year: r[5] || "",
          programming_languages: String(r[6] || "").split(",").map(function(s){ return s.trim(); }).filter(Boolean),
          team_members: parseMembersForList_(r[7])
        });
      }
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", registrations: registrations }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default: Return live Leaderboard scores for judges/participants
    var leadSheet = ss.getSheetByName(LEADERBOARD_SHEET_NAME);
    if (!leadSheet) {
      leadSheet = ss.getSheets()[0];
    }

    var data = leadSheet.getDataRange().getValues();
    var result = [];

    // Skip header row
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0] || String(row[0]).trim() === "") continue;

      var teamName = String(row[0]);
      var g1 = Number(row[1]) || 0;
      var g2 = Number(row[2]) || 0;
      var g3 = Number(row[3]) || 0;
      var g4 = Number(row[4]) || 0;
      var g5 = Number(row[5]) || 0;
      var latestSolve = String(row[6] || "PROTOCOL ACTIVE");

      result.push({
        name: teamName,
        game1_points: g1,
        game2_points: g2,
        game3_points: g3,
        game4_points: g4,
        game5_points: g5,
        total_score: g1 + g2 + g3 + g4 + g5,
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

// ==========================================
// 2. doPost: Saves Registration & Sends Email
// ==========================================
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

  // Scan every cell so this works regardless of column order
  for (var i = 1; i < rows.length; i++) {
    var cells = [];
    var ids = [];
    for (var c = 0; c < rows[i].length; c++) {
      var cell = norm_(rows[i][c]);
      if (!cell) continue;
      cells.push(cell);
      ids.push(cell);
      ids = ids.concat(idsFromMembers_(rows[i][c]));
    }
    if (team && cells.indexOf(team) !== -1) return "That team name is already registered.";
    if (email && cells.indexOf(email) !== -1) return "A registration already exists for this email address.";
    for (var j = 0; j < submitted.length; j++) {
      if (ids.indexOf(submitted[j]) !== -1) return "One or more student IDs have already been registered.";
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

    var membersStr = data.team_members || "";

    var dupMessage = findDuplicate_(sheet, data);
    if (dupMessage) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "duplicate", version: 2, message: dupMessage }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([
      data.submitted_at || new Date().toISOString(),
      data.team_name || "",
      data.full_name || "",
      data.email || "",
      data.student_id || "",
      data.academic_year || "",
      data.programming_languages || "",
      membersStr
    ]);

    // Send the Cyberpunk-themed automated confirmation email to the Group Leader
    try {
      if (data.email && data.email.indexOf("@") !== -1) {
        sendLeaderConfirmationEmail_(data);
      }
    } catch (mailError) {
      Logger.log("Email dispatch failed: " + mailError.toString());
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", version: 2, message: "Registration recorded successfully." }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

// ==========================================
// 3. Spam-Proof Automated HTML Email Sender
// ==========================================
function sendLeaderConfirmationEmail_(data) {
  var leaderName = data.full_name || "Team Leader";
  var teamName = data.team_name || "Squad";
  var leaderId = data.student_id || "N/A";
  var academicYear = data.academic_year || "Undergraduate";
  var members = data.team_members || "Registered via Portal";

  var subject = "CODEXIA 2026: Registration Confirmed - Team " + teamName;

  // 1. Plain-text alternative (CRITICAL: Prevents Gmail spam classification!)
  var plainTextBody = 
    "CODEXIA 2026 - Registration Confirmation\n\n" +
    "Hello " + leaderName + ",\n\n" +
    "Your team (" + teamName + ") has been successfully registered for CODEXIA 2026.\n\n" +
    "=== Team Details ===\n" +
    "Team Name: " + teamName + "\n" +
    "Team Leader: " + leaderName + " (" + leaderId + ")\n" +
    "Academic Level: " + academicYear + "\n" +
    "Team Members: " + members + "\n" +
    "Event Date: 22 October 2026\n" +
    "Event Time: 3:00 PM (IST)\n\n" +
    "=== Important Guidelines ===\n" +
    "1. Strict Zero-AI Policy: Generative AI tools (ChatGPT, GitHub Copilot, Gemini, Claude, Cursor) are strictly prohibited.\n" +
    "2. Check-in: Report by 2:45 PM (15 minutes prior to launch).\n" +
    "3. Identification: Official university student IDs are mandatory for all members.\n\n" +
    "Rules & Regulations: " + WEBSITE_URL + "/rules\n\n" +
    "CODEXIA 2026 Organizing Committee\n" +
    "Department of Computer Science, Faculty of Applied Sciences\n" +
    "University of Sri Jayewardenepura";

  // 2. Beautiful Cyberpunk Dark HTML Email
  var htmlBody = '<!DOCTYPE html>' +
    '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>' +
    '<body style="margin: 0; padding: 0; background-color: #050811; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Arial, sans-serif; color: #e2e8f0;">' +
    '  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #050811; padding: 25px 12px;">' +
    '    <tr><td align="center">' +
    '      <table role="presentation" width="100%" style="max-width: 600px; background-color: #0b1120; border: 1px solid #00e5ff33; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 40px rgba(0, 229, 255, 0.15);">' +
    '        ' +
    '        <!-- HEADER -->' +
    '        <tr>' +
    '          <td style="padding: 30px 24px 22px 24px; background: linear-gradient(135deg, #091328 0%, #171638 100%); border-bottom: 1px solid #00e5ff44; text-align: center;">' +
    '            <div style="font-size: 11px; letter-spacing: 2.5px; font-weight: 800; color: #00e5ff; text-transform: uppercase; margin-bottom: 8px;">' +
    '              OFFICIAL REGISTRATION RECEIPT' +
    '            </div>' +
    '            <h1 style="margin: 0; font-size: 30px; font-weight: 900; letter-spacing: 2px; color: #ffffff; text-transform: uppercase;">' +
    '              CODEX<span style="color: #00e5ff;">IA</span> 2026' +
    '            </h1>' +
    '            <div style="display: inline-block; margin-top: 12px; padding: 5px 14px; background: rgba(0, 229, 255, 0.12); border: 1px solid #00e5ff; border-radius: 20px; font-size: 12px; font-weight: 700; color: #38bdf8; letter-spacing: 0.5px;">' +
    '              &#x2713; TEAM REGISTRATION CONFIRMED' +
    '            </div>' +
    '          </td>' +
    '        </tr>' +
    '        ' +
    '        <!-- BODY -->' +
    '        <tr>' +
    '          <td style="padding: 28px 24px;">' +
    '            <p style="margin-top: 0; font-size: 15px; line-height: 1.6; color: #cbd5e1;">' +
    '              Hello <strong style="color: #ffffff;">' + leaderName + '</strong>,' +
    '            </p>' +
    '            <p style="font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 22px;">' +
    '              Your team registration for <strong>CODEXIA 2026</strong> has been successfully received and confirmed. Below is your official squad summary.' +
    '            </p>' +
    '            ' +
    '            <!-- DETAILS TABLE -->' +
    '            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #070c18; border: 1px solid #1e293b; border-left: 4px solid #00e5ff; border-radius: 8px; margin-bottom: 22px;">' +
    '              <tr>' +
    '                <td style="padding: 16px;">' +
    '                  <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 10px;">' +
    '                    SQUAD SPECIFICATIONS' +
    '                  </div>' +
    '                  <table role="presentation" width="100%" cellpadding="4" cellspacing="0" style="font-size: 14px;">' +
    '                    <tr><td width="35%" style="color: #64748b; font-weight: 600;">Team Name:</td><td style="color: #00e5ff; font-weight: 700;">' + teamName + '</td></tr>' +
    '                    <tr><td style="color: #64748b; font-weight: 600;">Team Leader:</td><td style="color: #f1f5f9;">' + leaderName + ' (' + leaderId + ')</td></tr>' +
    '                    <tr><td style="color: #64748b; font-weight: 600;">Academic Level:</td><td style="color: #f1f5f9;">' + academicYear + '</td></tr>' +
    '                    <tr><td style="color: #64748b; font-weight: 600; vertical-align: top;">Members:</td><td style="color: #cbd5e1; line-height: 1.4;">' + members + '</td></tr>' +
    '                    <tr><td style="color: #64748b; font-weight: 600;">Date:</td><td style="color: #38bdf8; font-weight: 700;">22 October 2026</td></tr>' +
    '                    <tr><td style="color: #64748b; font-weight: 600;">Time:</td><td style="color: #38bdf8; font-weight: 700;">3:00 PM (IST)</td></tr>' +
    '                  </table>' +
    '                </td>' +
    '              </tr>' +
    '            </table>' +
    '            ' +
    '            <!-- GUIDELINES BOX -->' +
    '            <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 22px;">' +
    '              <div style="font-size: 12px; font-weight: 800; color: #f87171; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px;">' +
    '                &#x26A0; CRITICAL COMPETITION DIRECTIVES' +
    '              </div>' +
    '              <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #e2e8f0; line-height: 1.5;">' +
    '                <li><strong style="color: #fca5a5;">Strict Zero-AI Policy:</strong> Using generative AI assistants (ChatGPT, GitHub Copilot, Gemini, Claude, Cursor) is prohibited. Detection leads to instant disqualification.</li>' +
    '                <li><strong style="color: #ffffff;">Pre-Flight Check-in:</strong> Squads must report by <strong>2:45 PM</strong> (15 minutes prior).</li>' +
    '                <li><strong style="color: #ffffff;">Student Verification:</strong> Valid university student ID cards are mandatory for all 4 team members.</li>' +
    '              </ul>' +
    '            </div>' +
    '            ' +
    '            <!-- ACTION BUTTON -->' +
    '            <div style="text-align: center; margin: 26px 0 10px 0;">' +
    '              <a href="' + WEBSITE_URL + '/rules" style="display: inline-block; background: linear-gradient(90deg, #00e5ff 0%, #3b82f6 100%); color: #020617; font-weight: 800; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 6px; letter-spacing: 0.5px; text-transform: uppercase; box-shadow: 0 4px 18px rgba(0, 229, 255, 0.3);">' +
    '                Review Rules & Regulations &rarr;' +
    '              </a>' +
    '            </div>' +
    '          </td>' +
    '        </tr>' +
    '        ' +
    '        <!-- FOOTER -->' +
    '        <tr>' +
    '          <td style="background-color: #050811; border-top: 1px solid #1e293b; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b;">' +
    '            <div style="font-weight: 700; color: #94a3b8; margin-bottom: 4px;">CODEXIA 2026 ORGANIZING COMMITTEE</div>' +
    '            <div>Faculty of Applied Sciences &bull; Sabaragamuwa University of Sri Lanka</div>' +
    '            <div style="margin-top: 8px; font-size: 11px; color: #475569;">' +
    '              This email was sent to confirm your registration for CODEXIA 2026.' +
    '            </div>' +
    '          </td>' +
    '        </tr>' +
    '      </table>' +
    '    </td></tr>' +
    '  </table>' +
    '</body></html>';

  MailApp.sendEmail({
    to: data.email,
    name: "CODEXIA 2026",
    subject: subject,
    body: plainTextBody,
    htmlBody: htmlBody
  });
}

// ==========================================
// 4. One-Click Test & Authorize (Send to Last Row)
// ==========================================
// Run this function ONCE inside Apps Script to authorize email permissions
// and instantly dispatch the email to your most recent registration!
function sendConfirmationToLastRegistration() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(REGISTRATION_SHEET_NAME);
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    Logger.log("No registrations found.");
    return;
  }
  var row = sheet.getRange(lastRow, 1, 1, 8).getValues()[0];
  var data = {
    submitted_at: row[0],
    team_name: row[1],
    full_name: row[2],
    email: row[3],
    student_id: row[4],
    academic_year: row[5],
    programming_languages: row[6],
    team_members: row[7]
  };
  sendLeaderConfirmationEmail_(data);
  Logger.log("Confirmation email successfully sent to: " + data.email);
}
```

---

### Step 3: Deploy Web App (Crucial Steps!)
1. Click **Deploy** > **Manage deployments**.
2. Click the **Pencil (Edit)** icon next to the active deployment.
3. In the **Version** dropdown, select **New version**.
4. Make sure:
   - **Execute as**: `Me (your Google email)`
   - **Who has access**: **`Anyone`** *(Required so the Next.js server can submit registrations without login)*
5. Click **Deploy**.
6. When prompted for authorization:
   - Click **Authorize Access** and select your Google account.
   - Click **Advanced** > **Go to Untitled project (unsafe)**.
   - Click **Allow** (This grants the script permission to read/write the spreadsheet and send emails via `MailApp`).
7. Copy the Web App URL (`https://script.google.com/macros/s/.../exec`).

---

### Step 4: Configure `.env.local`
In your project `.env.local`:

```env
GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
GOOGLE_SHEETS_LEADERBOARD_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

### Verification
1. Submit a team registration on the `/register` page using your real email as Leader Email.
2. Check your inbox: You will receive the cyberpunk-themed **CODEXIA 2026 Registration Confirmation Email** within 5–10 seconds!
3. The row will be appended to the **Registrations** tab in your Google Sheet.
