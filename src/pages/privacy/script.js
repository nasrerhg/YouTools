document.addEventListener("DOMContentLoaded", function () {
    const backButton = document.querySelector(".back");
    backButton.addEventListener("click", function () {
        window.history.back();
    });
});