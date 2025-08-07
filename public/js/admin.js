/**
 * Admin Panel JavaScript
 * Handles authentication, dashboard, and lead management
 */

class AdminPanel {
  constructor() {
    this.apiBase = "/api/v1";
    this.authToken = localStorage.getItem("adminToken");
    this.currentUser = JSON.parse(localStorage.getItem("adminUser") || "null");

    this.init();
  }

  init() {
    // Check if already logged in
    if (this.authToken && this.currentUser) {
      this.showDashboard();
      this.loadDashboardData();
    } else {
      this.showLogin();
    }

    // Bind event listeners
    this.bindEvents();
  }

  bindEvents() {
    // Login form
    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", (e) => this.handleLogin(e));
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => this.handleLogout());
    }

    // Refresh leads button
    const refreshLeads = document.getElementById("refreshLeads");
    if (refreshLeads) {
      refreshLeads.addEventListener("click", () => this.loadDashboardData());
    }
  }

  async handleLogin(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const loginBtn = document.getElementById("loginBtn");
    const loginBtnText = document.getElementById("loginBtnText");
    const loginSpinner = document.getElementById("loginSpinner");
    const loginError = document.getElementById("loginError");
    const loginErrorMessage = document.getElementById("loginErrorMessage");

    // Reset error state
    loginError.classList.add("hidden");

    // Validation
    if (!username || !password) {
      this.showLoginError("Please enter both username and password");
      return;
    }

    // Show loading state
    loginBtn.disabled = true;
    loginBtnText.textContent = "Signing In...";
    loginSpinner.classList.remove("hidden");

    try {
      const response = await fetch(`${this.apiBase}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store auth data
        this.authToken = data.token;
        this.currentUser = data.user;
        localStorage.setItem("adminToken", this.authToken);
        localStorage.setItem("adminUser", JSON.stringify(this.currentUser));

        console.log("✅ Admin login successful");

        // Show dashboard
        this.showDashboard();
        this.loadDashboardData();
      } else {
        this.showLoginError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      this.showLoginError("Network error. Please try again.");
    } finally {
      // Reset loading state
      loginBtn.disabled = false;
      loginBtnText.textContent = "Sign In";
      loginSpinner.classList.add("hidden");
    }
  }

  showLoginError(message) {
    const loginError = document.getElementById("loginError");
    const loginErrorMessage = document.getElementById("loginErrorMessage");

    loginErrorMessage.textContent = message;
    loginError.classList.remove("hidden");
  }

  handleLogout() {
    // Clear auth data
    this.authToken = null;
    this.currentUser = null;
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    console.log("👋 Admin logged out");

    // Show login screen
    this.showLogin();
  }

  showLogin() {
    document.getElementById("loginScreen").classList.remove("hide");
    document.getElementById("adminDashboard").classList.add("hide");
  }

  showDashboard() {
    document.getElementById("loginScreen").classList.add("hide");
    document.getElementById("adminDashboard").classList.remove("hide");

    // Update admin username in header
    if (this.currentUser) {
      document.getElementById("adminUsername").textContent =
        this.currentUser.username;
    }
  }

  async loadDashboardData() {
    try {
      console.log("📊 Loading dashboard data...");

      // Show loading state
      this.showLoadingState();

      // Fetch dashboard data
      const response = await fetch(`${this.apiBase}/admin/dashboard`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          this.handleLogout();
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        this.updateDashboardStats(data.data.overview);
        this.updateRecentLeads(data.data.recentActivity);
        console.log("✅ Dashboard data loaded successfully");
      } else {
        throw new Error(data.error || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("❌ Error loading dashboard data:", error);
      this.showError("Failed to load dashboard data");
    }
  }

  updateDashboardStats(stats) {
    // Update stats cards
    document.getElementById("totalLeads").textContent = stats.totalLeads || 0;
    document.getElementById("todayLeads").textContent = stats.todayLeads || 0;
    document.getElementById("totalDownloads").textContent =
      stats.totalDownloads || 0;
    document.getElementById("conversionRate").textContent =
      stats.conversionRate || "0%";
  }

  updateRecentLeads(leads) {
    const tableBody = document.getElementById("leadsTableBody");
    const leadsLoading = document.getElementById("leadsLoading");
    const leadsEmpty = document.getElementById("leadsEmpty");

    // Hide loading state
    leadsLoading.classList.add("hidden");

    if (!leads || leads.length === 0) {
      // Show empty state
      leadsEmpty.classList.remove("hidden");
      tableBody.innerHTML = "";
      return;
    }

    // Hide empty state
    leadsEmpty.classList.add("hidden");

    // Populate table
    tableBody.innerHTML = leads
      .map(
        (lead) => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span class="material-icons text-blue-600 text-sm">person</span>
                        </div>
                        <div>
                            <div class="text-sm font-medium text-gray-900">${this.escapeHtml(
                              lead.email
                            )}</div>
                            <div class="text-xs text-gray-500">ID: ${
                              lead.id
                            }</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${
                      this.escapeHtml(lead.organizationName) || "-"
                    }</div>
                </td>
                <td class="px-6 py-4">
                    ${
                      lead.websiteUrl
                        ? `<a href="${this.escapeHtml(
                            lead.websiteUrl
                          )}" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 underline">${this.truncateUrl(
                            lead.websiteUrl
                          )}</a>`
                        : '<span class="text-sm text-gray-400">-</span>'
                    }
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-900">${
                          lead.downloadCount
                        }</span>
                        ${
                          lead.downloadCount > 0
                            ? '<span class="ml-1 material-icons text-green-500 text-sm">check_circle</span>'
                            : '<span class="ml-1 material-icons text-gray-400 text-sm">schedule</span>'
                        }
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div class="text-sm text-gray-900">${this.formatDate(
                      lead.createdAt
                    )}</div>
                    <div class="text-xs text-gray-500">${this.formatTime(
                      lead.createdAt
                    )}</div>
                </td>
                <td class="px-6 py-4">
                    ${
                      lead.lastDownload
                        ? `<div class="text-sm text-gray-900">${this.formatDate(
                            lead.lastDownload
                          )}</div>
                         <div class="text-xs text-gray-500">${this.formatTime(
                           lead.lastDownload
                         )}</div>`
                        : '<span class="text-sm text-gray-400">Never</span>'
                    }
                </td>
            </tr>
        `
      )
      .join("");
  }

  showLoadingState() {
    const leadsLoading = document.getElementById("leadsLoading");
    const leadsEmpty = document.getElementById("leadsEmpty");

    leadsLoading.classList.remove("hidden");
    leadsEmpty.classList.add("hidden");
  }

  showError(message) {
    // Simple error display - you could make this more sophisticated
    console.error("Error:", message);

    // Update UI to show error state
    const tableBody = document.getElementById("leadsTableBody");
    const leadsLoading = document.getElementById("leadsLoading");

    leadsLoading.classList.add("hidden");
    tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center">
                    <div class="flex flex-col items-center space-y-2">
                        <span class="material-icons text-4xl text-red-300">error</span>
                        <p class="text-gray-500">${this.escapeHtml(message)}</p>
                        <button onclick="adminPanel.loadDashboardData()" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Try Again
                        </button>
                    </div>
                </td>
            </tr>
        `;
  }

  // Utility functions
  escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  truncateUrl(url, maxLength = 30) {
    if (!url || url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  }

  formatDate(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  formatTime(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

// Initialize admin panel when DOM is loaded
let adminPanel;

document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Admin Panel initializing...");
  adminPanel = new AdminPanel();
});

// Auto-refresh dashboard data every 30 seconds when dashboard is visible
setInterval(() => {
  if (
    adminPanel &&
    adminPanel.authToken &&
    !document.getElementById("adminDashboard").classList.contains("hide")
  ) {
    console.log("🔄 Auto-refreshing dashboard data...");
    adminPanel.loadDashboardData();
  }
}, 30000);
