document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll(".animated");
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.style.animationDelay = `${index * 200}ms`;
      el.classList.add("visible");
    }, index * 200);
  });
});

function goToPokedex() {
  window.location.href = "pages/pokedex.html";
}

function goToPokedleClasico() {
  window.location.href = "pages/juego-clasico.html";
}

function goHome() {
  window.location.href = "/";
}
