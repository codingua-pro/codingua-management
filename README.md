# 🎓 Codingua Management System

A complete Academy Management Web App built with HTML, CSS, JavaScript, and Firebase Firestore.

---

## 📁 Folder Structure

```
codingua-management/
├── index.html          # Dashboard
├── courses.html        # Courses management
├── students.html       # Students management
├── groups.html         # Groups management
├── sessions.html       # Sessions management
├── payments.html       # Payments management
├── firebase.js         # Firebase config + all CRUD helpers
├── css/
│   └── main.css        # Complete design system
└── js/
    ├── utils.js        # Shared UI utilities (toast, modal, etc.)
    ├── layout.js       # Sidebar + topbar injection
    ├── dashboard.js    # Dashboard logic
    ├── courses.js      # Courses CRUD
    ├── students.js     # Students CRUD
    ├── groups.js       # Groups CRUD + student assignment
    ├── sessions.js     # Sessions CRUD
    └── payments.js     # Payments CRUD + revenue tracking
```

---

## 🔥 Firebase Setup (Step-by-Step)

### 1. Create a Firebase Project
1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → name it `codingua-management`
3. Disable Google Analytics (optional) → **Create project**

### 2. Enable Firestore
1. In the left sidebar → **Build → Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
4. Select your region → **Enable**

### 3. Get Your Config
1. In Firebase console → ⚙️ Project Settings → **General**
2. Scroll to **Your apps** → Click **</>** (Web app)
3. Register app as `codingua-web`
4. Copy the `firebaseConfig` object

### 4. Update `firebase.js`
Open `firebase.js` and replace the placeholder config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijk"
};
```

### 5. Firestore Collections (Auto-created on first write)

| Collection       | Description                          |
|-----------------|--------------------------------------|
| `courses`       | Academy courses with price & duration|
| `students`      | Student profiles + parent contacts   |
| `groups`        | Class groups linked to courses       |
| `sessions`      | Individual class sessions            |
| `payments`      | Payment records per student          |
| `studentGroups` | Many-to-many: students ↔ groups      |

---

## 🚀 Running the App

Since the app uses ES modules (`type="module"`), you **cannot** open HTML files directly with `file://`.

### Option A — VS Code Live Server (Recommended)
1. Install the **Live Server** extension in VS Code
2. Right-click `index.html` → **Open with Live Server**

### Option B — Python HTTP Server
```bash
cd codingua-management
python3 -m http.server 8080
# Open: http://localhost:8080
```

### Option C — Node.js
```bash
cd codingua-management
npx serve .
# Open the URL shown in terminal
```

---

## ✨ Features

### Dashboard
- Real-time stats: courses, students, groups, sessions, revenue, pending payments
- Recent students & payment activity
- Quick navigation links

### Courses
- Add/Edit/Delete courses
- Fields: Name, Code, Description, Price (EGP), Duration, Status

### Students
- Add/Edit/Delete students
- Fields: Name, Phone, Email, Parent Phone, Age, Notes

### Groups
- Create/Edit/Delete groups
- Assign a course to each group
- Set start date, days, and time
- Add/Remove students from groups

### Sessions
- Log class sessions with topic and notes
- Filter sessions by group
- Track status: Scheduled / Completed / Cancelled

### Payments
- Record payments per student per group
- Track: Amount, Date, Method, Status (Paid / Pending)
- One-click "Mark as Paid" 
- Revenue summary cards
- Filter by status

---

## 🔒 Security (Before Going Live)

In the Firebase console → Firestore → Rules, replace test rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Then add Firebase Authentication to protect the app.

---

## 🎨 Design System

- **Font**: Syne (UI) + JetBrains Mono (code/data)
- **Theme**: Dark mode with electric blue accents
- **Colors**: CSS variables for easy theming
- **Responsive**: Mobile-first with hamburger sidebar

---

## 📞 Support

Built for Codingua Academy. Customize `firebase.js` config and you're ready to go!
