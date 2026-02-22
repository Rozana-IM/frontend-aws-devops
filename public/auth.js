const API_BASE_URL = "http://api.rozana-projects.online";

async function loginUser() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  if (!email || !password) {
    alert("Email and password required");
    return;
  }

  const res = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (data.error) {
    alert(data.error);
  } else {
    localStorage.setItem("user", JSON.stringify(data.user));
    location.reload(); // refresh navbar state
  }
}
