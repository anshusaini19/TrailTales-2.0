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

const profileBtn = document.getElementById("profileBtn");
const profileDropdown = document.getElementById("profileDropdown");

if(profileBtn){

profileBtn.addEventListener("click", ()=>{

profileDropdown.style.display =
profileDropdown.style.display === "block"
? "none"
: "block";

});

window.addEventListener("click",(e)=>{

if(!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)){
profileDropdown.style.display="none";
}

});

}