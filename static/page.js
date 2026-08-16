document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("a").forEach(link => {
    const url = new URL(link.href, document.baseURI);

    if (url.origin === window.location.origin) {
      return;
    }

    link.target ||= "_blank";
    link.rel = "noopener noreferrer";
  });
});
