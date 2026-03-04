// HEART SAVE FEATURE
document.querySelectorAll(".heart-btn").forEach(btn => {

  btn.addEventListener("click", async function () {

    const packageId = this.dataset.id;
    const heartIcon = this.querySelector(".heart-icon");

    const isLoggedIn = document.body.dataset.user === "true";

    // If user not logged in -> show modal
    if (!isLoggedIn) {
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


// SHOW SIDE PANEL
function showSidePanel(message) {

  const panel = document.getElementById("sidePanel");
  const savedItem = document.getElementById("savedItem");

  savedItem.innerHTML = `<p>${message}</p>`;

  panel.classList.add("active");

}


// CLOSE SIDE PANEL
const closePanelBtn = document.getElementById("closePanel");

if (closePanelBtn) {
  closePanelBtn.addEventListener("click", () => {
    document.getElementById("sidePanel").classList.remove("active");
  });
}


// MODAL CLOSE BUTTON
const loginModal = document.getElementById("loginModal");
const closeModalBtn = document.querySelector(".close-modal");

if (closeModalBtn) {

  closeModalBtn.addEventListener("click", () => {
    loginModal.style.display = "none";
  });

}


// CLOSE MODAL IF CLICK OUTSIDE
window.addEventListener("click", (event) => {

  if (event.target === loginModal) {
    loginModal.style.display = "none";
  }

});