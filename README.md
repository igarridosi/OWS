# Open Workout Spots (OWS)

A modern, community-driven platform for discovering, sharing, and reviewing calisthenics and outdoor fitness locations worldwide. Built with React (Vite), Node.js/Express, and MariaDB.

---

## 🌟 Features

- **Interactive Map Explorer**: Find and review calisthenics spots worldwide, powered by OpenStreetMap and community submissions.
- **Authentication & Profiles**: Secure signup/login, JWT-based auth, profile management, and account deletion.
- **Community System**: Join country-based communities, browse channels, post messages, and interact with members.
- **Spot Submission & Moderation**: Submit new workout spots (with image upload), pending admin approval before appearing on the map.
- **Admin Moderation**: Admin-only inbox for reviewing/approving/rejecting spot submissions and moderating community content/users.
- **Spot Reviews**: Leave one review per spot, with name/visibility controls.
- **User Blocking**: Robust user blocking and moderation tools.
- **Responsive UI/UX**: Mobile-friendly, modern design with modals, tooltips, and smooth interactions.
- **About Page**: Professional mission statement, contact, and contribution info.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Backend API (Node.js/Express/MariaDB) running at `http://localhost:3001/api` (see [Backend Repo](https://github.com/igarridosi/OWS))

### Installation
```powershell
# Clone the repository
git clone https://github.com/igarridosi/OWS.git
cd calisthenics_frontend

# Install dependencies
npm install
# or
yarn install
```

### Development
```powershell
# Start the development server
npm run dev
# or
yarn dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production
```powershell
npm run build
# or
yarn build
```

---

## 🗺️ Project Structure

- `src/pages/` — Main pages (MapExplorer, Community, About)
- `src/components/` — Reusable UI components (map, modals, forms)
- `src/services/` — API and utility services
- `src/assets/` — Images, icons, and static assets
- `public/` — Static files and fonts

---

## 🛡️ Authentication & Security
- JWT-based authentication (tokens stored securely)
- Protected routes and login-required gating for sensitive actions
- Admin-only moderation features

---

## 👥 Community & Moderation
- Country-based communities with channels and messaging
- Admins can moderate content, approve/reject spot submissions, and block/unblock users
- User blocking prevents access to community features

---

## 🏋️ Spot Submission & Review
- Users can submit new spots (with image upload to Cloudinary)
- Submissions go to an admin inbox for review before appearing on the map
- Each spot supports one review per user, with name/visibility options

---

## 📄 About & Contributing

- **Mission**: Make calisthenics and outdoor fitness accessible to everyone, everywhere.
- **Contact**: [openworkoutspots@gmail.com](mailto:openworkoutspots@gmail.com)
- **Contribute**: [github.com/igarridosi/OWS](https://github.com/igarridosi/OWS)

### How to Contribute
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to your fork and open a Pull Request

---

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Leaflet, emoji-picker-react
- **Backend**: Node.js, Express, MariaDB (see backend repo)
- **Other**: Cloudinary (image upload), JWT, Axios

---

## 📦 Deployment
- Build with `npm run build` and deploy the `dist/` folder to your preferred static hosting
- Ensure the backend API is accessible and CORS is configured

---

## 📢 License
MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgements
- OpenStreetMap contributors
- Community testers and contributors

---

*Open Workout Spots — Find your next workout, anywhere.*
