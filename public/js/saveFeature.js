document.querySelectorAll(".heart-btn").forEach(btn => {
    btn.addEventListener("click", function() {

        const heartIcon = this.querySelector(".heart-icon");
        const isLoggedIn = document.body.dataset.user === "true";

        if (!isLoggedIn) {
            document.getElementById("loginModal").style.display = "flex";
            return;
        }

        // Toggle UI
        this.classList.toggle("active");

        if (this.classList.contains("active")) {
            heartIcon.textContent = "♥";
            heartIcon.style.color = "red";
        } else {
            heartIcon.textContent = "♡";
            heartIcon.style.color = "black";
        }

        // Optional: Show side panel
        const packageId = this.dataset.id;
        const panel = document.getElementById("sidePanel");
        const savedItem = document.getElementById("savedItem");

        savedItem.innerHTML = `
            <p>Trip saved successfully!</p>
            <small>Package ID: ${packageId}</small>
        `;

        panel.classList.add("active");
    });
});