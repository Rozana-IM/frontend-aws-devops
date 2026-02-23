const API_BASE_URL = "https://api.rozana-projects.online";

// ====== LOCAL STORAGE HELPERS ======
function getUser() {
  return JSON.parse(localStorage.getItem("user"));
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function requireLogin() {
  if (!getUser()) {
    alert("Please login first");
    window.location.href = "profile.html";
    return false;
  }
  return true;
}
