const API_BASE_URL = "http://api.rozana-projects.online";

// ---------- REGISTER ----------
async function register() {
  const name = regName.value;
  const email = regEmail.value;
  const password = regPassword.value;

  if (!name || !email || !password) {
    registerMsg.innerText = "All fields required";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password })
    });

    const data = await res.json();
    registerMsg.innerText = data.message || data.error;
  } catch (err) {
    registerMsg.innerText = "Server error";
  }
}

// ---------- LOGIN ----------
async function login() {
  const email = loginEmail.value;
  const password = loginPassword.value;

  if (!email || !password) {
    loginMsg.innerText = "Email and password required";
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.error) {
      loginMsg.innerText = data.error;
    } else {
      loginMsg.innerText = "Login successful ✅";

      // store user data (we’ll use this later)
      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    }
  } catch (err) {
    loginMsg.innerText = "Server error";
  }
}
