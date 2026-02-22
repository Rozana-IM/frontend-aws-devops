const API_BASE_URL = "https://api.rozana-projects.online";

// LOGIN USER
async function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    // User not found / wrong credentials
    if (!res.ok || data.error) {
      alert("Create an account first");
      return;
    }

    // Login success
    localStorage.setItem("user", JSON.stringify(data.user));

    // Redirect user back to home
    window.location.href = "index.html";

  } catch (error) {
    console.error(error);
    alert("Server error. Please try again later.");
  }
}

// LOGOUT USER
function logoutUser() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}
