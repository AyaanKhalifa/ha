# ✈️ Habibi Airways — Full-Stack React Web App

> Premium airline booking website with Firebase Authentication, Anime.js animations, and a complete admin panel.

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase (Required for real auth)

1. Go to [https://console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project → "habibi-airways"
3. Add a **Web App** → Copy the config
4. Open `src/firebase.js` and replace the config:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. In Firebase Console → **Authentication** → Enable:
   - Email/Password
   - Google Sign-In

6. In Firebase Console → **Firestore Database** → Create in test mode

### 3. Run the App

```bash
npm start
```

App opens at **http://localhost:3000**

---

## 🧪 Demo Mode (No Firebase Setup Needed)

On the Login page, click:
- **"Demo User"** → Log in as a regular passenger
- **"Demo Admin"** → Log in as admin, redirects to Admin Panel

---

## 📁 Project Structure

```
habibi-airways/
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   ├── AuthContext.jsx       # Firebase auth + demo login
│   │   └── BookingContext.jsx    # Flight booking state
│   ├── pages/
│   │   ├── Home.jsx              # Hero + search + destinations
│   │   ├── Login.jsx             # Firebase login + Google OAuth
│   │   ├── Register.jsx          # Firebase registration
│   │   ├── ForgotPassword.jsx    # Password reset email
│   │   ├── ResetPassword.jsx     # Password reset form
│   │   ├── AdvancedSearch.jsx    # Multi-city, return, promo codes
│   │   ├── Book.jsx              # Flight results + fare selection
│   │   ├── Summary.jsx           # Booking summary
│   │   ├── Passenger.jsx         # Passenger details form
│   │   ├── AddOns.jsx            # Seats, baggage, extras
│   │   ├── Payment.jsx           # UPI/Card/Wallet payment
│   │   ├── Confirmation.jsx      # Booking confirmation + e-ticket
│   │   ├── MyTrips.jsx           # User's bookings
│   │   ├── Manage.jsx            # Modify/check-in/cancel
│   │   ├── Hotels.jsx            # Hotel search & booking
│   │   ├── Contact.jsx           # Contact form
│   │   └── Admin.jsx             # Admin dashboard
│   ├── components/
│   │   ├── Navbar.jsx            # Responsive navigation
│   │   └── Footer.jsx            # Footer with newsletter
│   ├── utils/
│   │   ├── flightUtils.js        # Airports, currencies, fare data
│   │   └── animations.js        # Anime.js animation helpers
│   ├── firebase.js               # Firebase configuration
│   ├── App.jsx                   # Routes + layouts
│   └── index.js                  # Entry point
└── package.json
```

---

## 🔑 Pages & Features

| Page | URL | Description |
|------|-----|-------------|
| Home | `/` | Hero with animated search, destinations, stats |
| Login | `/login` | Email/Password + Google OAuth + Demo |
| Register | `/register` | Full registration with password strength |
| Forgot Password | `/forgot-password` | Send reset email via Firebase |
| Reset Password | `/reset-password?oobCode=...` | New password form |
| Advanced Search | `/advanced-search` | Multi-city, return, pax picker, promo |
| Book | `/book` | Flight results with fare tiers |
| Summary | `/summary` | Booking review |
| Passenger | `/passenger` | Passenger & passport details |
| Add-ons | `/addons` | Seats, baggage, insurance |
| Payment | `/payment` | UPI, cards, wallets with QR code |
| Confirmation | `/confirmation` | E-ticket with download |
| My Trips | `/my-trips` | Protected — user's bookings |
| Manage | `/manage` | Modify/cancel bookings |
| Hotels | `/hotels` | Hotel search with filters |
| Contact | `/contact` | Support form |
| Admin | `/admin` | **Protected admin-only panel** |

---

## ⚙️ Admin Access

- Demo: Click "Demo Admin" on login page
- Real: Set `is_admin: true` in Firestore for a user:
  ```
  users/{uid} → { is_admin: true }
  ```

Admin Panel includes:
- 📊 Overview with stats (bookings, revenue, flights)
- 🎫 Booking management (search, view, cancel)
- ✈ Flight management (status, occupancy)
- 👥 User management (tiers, miles)
- 💰 Revenue analytics by route

---

## 🎨 Animations (Anime.js)

Used throughout the app:
- **Page entrance**: `opacity + translateY` on mount
- **Staggered cards**: Destination cards, admin stats
- **Hero text**: Fade-in with delay
- **Plane animation**: CSS transform across hero section
- **Hover effects**: CSS transitions on cards

The app includes a CSS fallback if `animejs` isn't installed. To enable full animations:

```bash
npm install animejs
```

---

## 🔧 Tech Stack

| Library | Purpose |
|---------|---------|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| Firebase 10 | Authentication + Firestore |
| Anime.js 3 | Smooth animations |
| html2canvas | E-ticket screenshot download |
| Google Fonts | Playfair Display + DM Sans |

---

## 💳 Payment (Demo)

The payment page supports:
- **UPI** — QR code display (habibiairways@axisbank)
- **Credit/Debit Card** — Form with validation
- **Net Banking** — Bank selector
- **Digital Wallets** — Paytm, PhonePe, GPay, Amazon Pay

All payments are **simulated** (no real gateway). To add real payments, integrate Razorpay or Stripe.

---

## 🌐 Deployment

### Firebase Hosting (Recommended)

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# Deploy the /build folder to Netlify
```

---

## 📝 Environment Variables (Optional)

Create `.env` in root:

```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Then update `src/firebase.js` to use `process.env.REACT_APP_*`.

---

## 📞 Support

- Email: support@habibi-airways.com
- Phone: +971 600 555 555

---

*Built with ❤️ for Habibi Airways — Fly with love, arrive with joy ✈️*
