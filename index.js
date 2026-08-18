document.addEventListener("DOMContentLoaded", () => {
  const projectsSwiper = new Swiper(".projectsSwiper", {
    effect: "coverflow",
    grabCursor: true,
    centeredSlides: true,
    slidesPerView: "auto",
    spaceBetween: 15,
    coverflowEffect: {
      rotate: 40,
      stretch: 0,
      depth: 120,
      modifier: 1,
      slideShadows: true,
    },
    pagination: {
      el: ".projectsSwiper .swiper-pagination",
      clickable: true, // <-- this was missing
    },
    on: {
      click: function (swiper, event) {
        const clickedSlide = swiper.clickedSlide;
        if (clickedSlide) {
          const link = clickedSlide.dataset.link;
          if (link) {
            window.open(link, "_blank", "noopener,noreferrer");
          }
        }
      },
    },
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".progress-bar-section");
  const bars = section.querySelectorAll(".progress-bar");
  bars.forEach((bar) => {
    const targetWidth = bar.style.width;
    bar.dataset.targetWidth = targetWidth;
    bar.style.width = "0%";
    bar.style.transition = "width 1.2s ease-out";
  });

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const barsToAnimate = entry.target.querySelectorAll(".progress-bar");
          barsToAnimate.forEach((bar, i) => {
            setTimeout(() => {
              bar.style.width = bar.dataset.targetWidth;
            }, i * 120);
          });

          obs.unobserve(entry.target); // only animate once
        }
      });
    },
    {
      threshold: 0.3,
    },
  );

  observer.observe(section);
});
document.addEventListener("DOMContentLoaded", () => {
  const stage = document.querySelector(".projects-stage");
  const curtainLeft = document.querySelector(".curtain-left");
  const curtainRight = document.querySelector(".curtain-right");

  if (!stage || !curtainLeft || !curtainRight) return;

  function updateCurtains() {
    const rect = stage.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const stageCenter = rect.top + rect.height / 2;
    const viewportCenter = viewportHeight / 2;

    // Start opening when stage top enters the bottom of viewport
    // Finish opening exactly when stage center reaches viewport center
    const startPoint = viewportHeight; // stage top at bottom edge of screen
    const endPoint = viewportCenter; // stage center at screen center

    // distance stage-center needs to travel from start to end
    const totalDistance = startPoint - endPoint;

    // how far it has already travelled
    const travelled = startPoint - stageCenter;

    let progress = totalDistance > 0 ? travelled / totalDistance : 0;
    progress = Math.max(0, Math.min(progress, 1)); // clamp 0–1

    const movePercent = progress * 100;

    curtainLeft.style.transform = `translateX(-${movePercent}%)`;
    curtainRight.style.transform = `scaleX(-1) translateX(-${movePercent}%)`;
  }

  window.addEventListener("scroll", updateCurtains, { passive: true });
  window.addEventListener("resize", updateCurtains);
  updateCurtains(); // run once on load in case it's already in view
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contactForm");
  const status = document.querySelector("#contactStatus");

  if (!form || !status) return;

  const button = form.querySelector(".contact-submit");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Prevent double submissions
    if (button.disabled) return;

    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    const website = form.website.value.trim();

    // Client-side validation
    if (!name || !email || !message) {
      status.textContent = "PLEASE FILL IN ALL FIELDS.";
      status.className = "contact-error";
      return;
    }

    if (name.length > 100) {
      status.textContent = "NAME IS TOO LONG.";
      status.className = "contact-error";
      return;
    }

    if (email.length > 254) {
      status.textContent = "EMAIL IS TOO LONG.";
      status.className = "contact-error";
      return;
    }

    if (message.length > 5000) {
      status.textContent = "MESSAGE IS TOO LONG.";
      status.className = "contact-error";
      return;
    }

    button.disabled = true;
    button.textContent = "SENDING...";
    status.textContent = "";
    status.className = "";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          message,
          website,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message.");
      }

      // Clear the form after successful submission
      form.reset();

      status.textContent = "MESSAGE SENT SUCCESSFULLY ✓";
      status.className = "contact-success";

      button.textContent = "SENT ✓";

      // Return button to normal after a short delay
      setTimeout(() => {
        button.textContent = "SEND MESSAGE";
      }, 2500);
    } catch (error) {
      console.error("Contact form error:", error);

      status.textContent = "COULDN'T SEND THE MESSAGE. PLEASE TRY AGAIN.";
      status.className = "contact-error";

      button.textContent = "SEND MESSAGE";
    } finally {
      button.disabled = false;
    }
  });
});
document.getElementById("currentYear").textContent = new Date().getFullYear();
