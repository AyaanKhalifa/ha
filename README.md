# Habibi Airways ✈

Full-stack React airline booking platform — Emirates quality, Firebase backend, Anime.js animations.

## Quick Start (Windows)

```
Double-click setup.bat
```

Or manually:

```bash
# Remove old installs first (IMPORTANT)
rmdir /s /q node_modules
del package-lock.json

# Install
npm install

# Run
npm start
```

## Firebase Setup (optional)

The app works fully without Firebase using Demo mode.

To enable real auth + database:

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a project → Add Web App → Copy config
3. Paste into `src/firebase.js` replacing the placeholder values
4. Enable **Email/Password** and **Google** auth in Firebase console
5. Enable **Firestore** database

## Demo Mode

No Firebase needed. On the login page click:

- **Demo User** — regular traveler account
- **Demo Admin** — full admin panel access (`/admin`)

## Pages

| Route | Description |
|---|---|
| `/` | Home with hero, search, offers |
| `/book` | Flight search results |
| `/summary` | Booking summary |
| `/passenger` | Passenger details form |
| `/addons` | Seats, baggage, extras |
| `/payment` | Payment (Card/UPI/Net Banking/EMI) |
| `/confirmation` | Booking confirmed + boarding pass |
| `/my-trips` | User's trip history |
| `/admin` | Admin panel (admin only) |
| `/hotels` | Hotel listings |
| `/manage` | Manage existing bookings |
| `/contact` | Help & FAQ |

## Tech Stack

- **React 18** (Create React App — no Vite)
- **Firebase 10** — Auth, Firestore
- **Anime.js 3.2.1** — All animations
- **React Router 6** — Navigation
- **react-hot-toast** — Notifications

## Admin Features

The `/admin` page includes:
- **Overview** — Live stat counters with anime.js count-up
- **Bookings** — Search, filter, cancel bookings
- **Flights** — Today's flights with load factor bars
- **Users** — Grant/revoke admin access
- **Revenue** — Revenue charts by route and cabin

Admin access: use **Demo Admin** button on login page, or set `is_admin: true` on a user document in Firestore.
