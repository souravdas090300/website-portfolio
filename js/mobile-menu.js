// Mobile Menu Toggle Functionality
document.addEventListener("DOMContentLoaded", function () {
  const hamburgerMenu = document.querySelector(".hamburger-menu");
  const mainNavigation = document.querySelector(".main-navigation");

  if (hamburgerMenu && mainNavigation) {
    hamburgerMenu.addEventListener("click", function () {
      // Toggle hamburger animation
      this.classList.toggle("active");

      // Toggle navigation visibility
      mainNavigation.classList.toggle("nav-open");
    });

    // Close menu when clicking on navigation links
    const navLinks = document.querySelectorAll(".navigation-list__item");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburgerMenu.classList.remove("active");
        mainNavigation.classList.remove("nav-open");
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", function (event) {
      const isClickInsideNav = mainNavigation.contains(event.target);
      const isClickOnHamburger = hamburgerMenu.contains(event.target);

      if (
        !isClickInsideNav &&
        !isClickOnHamburger &&
        mainNavigation.classList.contains("nav-open")
      ) {
        hamburgerMenu.classList.remove("active");
        mainNavigation.classList.remove("nav-open");
      }
    });
  }
});
