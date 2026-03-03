window.addEventListener("scroll", function() {
    const navbar = document.querySelector(".navbar");

    if (window.scrollY > 50) {
        navbar.style.padding = "12px 60px";
        navbar.style.boxShadow = "0 6px 25px rgba(0,0,0,0.15)";
    } else {
        navbar.style.padding = "20px 60px";
        navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
    }
});