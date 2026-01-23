# Lula | Career Simplicity

**Lula** is a streamlined job search application designed to bridge the gap between talent and opportunity in the South African market. Built with simplicity in mind, it offers a modern, responsive interface for job seekers to discover, analyze, and save career opportunities.

## 🚀 How It Works

Lula aggregates job listings in real-time using the **Adzuna API**, providing users with up-to-date opportunities across various industries.

### Core Features

- **Authenticated Experience**: Securely creates a personalized session using local storage, allowing users to register, log in, and maintain their own profile and saved jobs.
- **Smart Search**: Filter jobs by **Role**, **Location**, **Experience**, and **Minimum Salary**.
- **Market Insights**: Automatically generates a market health report for your search, displaying the **Average Annual Salary** and demand density for key regions (e.g., Gauteng, Western Cape).
- **Match Score**: A dynamic scoring system that estimates how well a job listing matches your search keywords.
- **Private Vault**: Save interesting jobs to your personal vault for later review.
- **Quick View**: Preview job details in a sleek side-drawer without losing your search position.



## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript
- **Styling**: Tailwind CSS (via CDN) for a glassmorphism-inspired UI
- **Data Source**: Adzuna API (South Africa endpoint)
- **State Management**: Browser `localStorage` for user sessions and data persistence

## 📦 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ngwanatiyani/Lula_JobSearchApp.git
   ```
2. **Open the application**:
   Simply open the `index.html` file in any modern web browser. No build step or server is required.

3. **Create an account**:
   Register with your details to access the dashboard and start searching.

## 🔑 Key Files

- `index.html`: The main structure containing the authentication wrapper, dashboard, and all UI panels.
- `app.js`: Contains all application logic, including API integration, authentication handling, and UI rendering.
- `main.css` & `styles/`: Custom styles complementing the Tailwind framework.
