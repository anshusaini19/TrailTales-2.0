// ===============================
// HEART SAVE FEATURE
// ===============================

document.querySelectorAll(".heart-btn").forEach(btn => {

  btn.addEventListener("click", async function () {

    const packageId = this.dataset.id;
    const heartIcon = this.querySelector(".heart-icon");

    const isLoggedIn = document.body.dataset.user === "true";

    // If user not logged in -> show modal
    if (!isLoggedIn) {

      // store package user tried to save
      localStorage.setItem("pendingSave", packageId);

      document.getElementById("loginModal").style.display = "flex";
      return;
    }

    try {

      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packageId
        })
      });

      const data = await res.json();

      if (data.saved) {

        heartIcon.textContent = "♥";
        heartIcon.style.color = "red";

        showSidePanel("Trip saved successfully!");

      } else {

        heartIcon.textContent = "♡";
        heartIcon.style.color = "black";

      }

    } catch (err) {
      console.error("Wishlist error:", err);
    }

  });

});


// ===============================
// AUTO SAVE AFTER LOGIN
// ===============================

window.addEventListener("load", async () => {

  const pendingSave = localStorage.getItem("pendingSave");

  const isLoggedIn = document.body.dataset.user === "true";

  if (pendingSave && isLoggedIn) {

    try {

      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          packageId: pendingSave
        })
      });

      const data = await res.json();

      if (data.saved) {

        // turn correct heart red
        document.querySelectorAll(".heart-btn").forEach(btn => {

          if (btn.dataset.id === pendingSave) {

            const heartIcon = btn.querySelector(".heart-icon");

            heartIcon.textContent = "♥";
            heartIcon.style.color = "red";

          }

        });

        showSidePanel("Trip saved successfully!");

      }

      // clear storage
      localStorage.removeItem("pendingSave");

    } catch (err) {

      console.error("Auto save error:", err);

    }

  }

});

// ===============================
// LOAD SAVED HEARTS FROM DATABASE
// ===============================

window.addEventListener("load", async () => {

  const isLoggedIn = document.body.dataset.user === "true";

  if (!isLoggedIn) return;

  try {

    const res = await fetch('/api/wishlist');

    const data = await res.json();

    const savedIds = data.savedIds || [];

    document.querySelectorAll(".heart-btn").forEach(btn => {

      const packageId = btn.dataset.id;

      if (savedIds.includes(packageId)) {

        const heartIcon = btn.querySelector(".heart-icon");

        heartIcon.textContent = "♥";
        heartIcon.style.color = "red";

      }

    });

  } catch (err) {

    console.error("Load wishlist error:", err);

  }

});


// ===============================
// SHOW SIDE PANEL
// ===============================

function showSidePanel(message) {

  const panel = document.getElementById("sidePanel");
  const savedItem = document.getElementById("savedItem");

  savedItem.innerHTML = `<p>${message}</p>`;

  panel.classList.add("active");

}


// ===============================
// CLOSE SIDE PANEL
// ===============================

const closePanelBtn = document.getElementById("closePanel");

if (closePanelBtn) {
  closePanelBtn.addEventListener("click", () => {
    document.getElementById("sidePanel").classList.remove("active");
  });
}


// ===============================
// LOGIN MODAL LOGIC
// ===============================

const loginModal = document.getElementById("loginModal");
const closeModalBtn = document.querySelector(".close-modal");

const authOptions = document.getElementById("authOptions");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");


// NAVBAR SIGN IN BUTTON
const openLoginBtn = document.getElementById("openLoginModal");

if (openLoginBtn) {

  openLoginBtn.addEventListener("click", () => {

    loginModal.style.display = "flex";

  });

}


// CLOSE BUTTON
if (closeModalBtn) {

  closeModalBtn.addEventListener("click", () => {

    loginModal.style.display = "none";

    authOptions.classList.remove("hidden");
    registerForm.classList.add("hidden");
    loginForm.classList.add("hidden");

  });

}


// CLICK OUTSIDE MODAL
window.addEventListener("click", (event) => {

  if (event.target === loginModal) {

    loginModal.style.display = "none";

    authOptions.classList.remove("hidden");
    registerForm.classList.add("hidden");
    loginForm.classList.add("hidden");

  }

});


// ===============================
// CONTINUE WITH EMAIL -> REGISTER
// ===============================

const openRegister = document.getElementById("openRegister");

if (openRegister) {

  openRegister.addEventListener("click", () => {

    authOptions.classList.add("hidden");
    registerForm.classList.remove("hidden");

  });

}


// ===============================
// SWITCH REGISTER -> LOGIN
// ===============================

const switchLogin = document.getElementById("switchLogin");

if (switchLogin) {

  switchLogin.addEventListener("click", (e) => {

    e.preventDefault();

    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");

  });

}


// ===============================
// SWITCH LOGIN -> REGISTER
// ===============================

const switchRegister = document.getElementById("switchRegister");

if (switchRegister) {

  switchRegister.addEventListener("click", (e) => {

    e.preventDefault();

    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");

  });

}