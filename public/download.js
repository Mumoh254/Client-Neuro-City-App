document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".download-btn");
    if (btn) {
      btn.addEventListener("click", () => {
        console.log("Download initiated...");
      });
    }
  });
  