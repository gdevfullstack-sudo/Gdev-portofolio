// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') {
            return;
        }

        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

const navbar = document.querySelector('nav');
const menuButton = document.querySelector('.mobile-menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const menuIcon = menuButton?.querySelector('.material-symbols-outlined');

function setMobileMenuState(isOpen) {
    if (!menuButton || !mobileMenu || !menuIcon) {
        return;
    }

    mobileMenu.classList.toggle('hidden', !isOpen);
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
    menuIcon.textContent = isOpen ? 'close' : 'menu';
}

menuButton?.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    setMobileMenuState(!isOpen);
});

document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        setMobileMenuState(false);
    });
});

// Navbar glass effect on scroll
window.addEventListener('scroll', () => {
    if (!navbar) {
        return;
    }

    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
        setMobileMenuState(false);
    }
});


// Stagger scroll animations (Animation 1)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            entry.target.style.animationDelay = `${index * 0.1}s`;
        }
    });
}, observerOptions);

document.querySelectorAll('.glass, .glass-strong, section > div, .stats-grid > div').forEach((el, index) => {
    observer.observe(el);
});

// Typewriter effect for hero title (Animation 2)
function initTypewriter() {
    const title = document.querySelector('h1');
    if (!title) return;

    const text = title.innerHTML;
    title.innerHTML = '';
    
    let i = 0;
    function type() {
        if (i < text.length) {
            title.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, 50);
        }
    }
    setTimeout(type, 500);
}


// Pas d'animation gradient qui casse le texte



// Dark mode toggle - Étape 4
const darkToggle = document.getElementById('dark-toggle');
const mobileDarkToggle = document.getElementById('mobile-dark-toggle');

function initDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true' || (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
  
  if (darkToggle) {
    darkToggle.querySelector('.material-symbols-outlined').textContent = isDark ? 'light_mode' : 'bedtime';
  }
  if (mobileDarkToggle) {
    mobileDarkToggle.firstElementChild.textContent = isDark ? 'Thème clair' : 'Thème sombre';
    mobileDarkToggle.lastElementChild.textContent = isDark ? 'light_mode' : 'bedtime';
  }
}

function toggleDarkMode() {
  const wasDark = document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark');
  const isDarkNow = !wasDark;
  localStorage.setItem('darkMode', isDarkNow.toString());
  
  if (darkToggle) {
    darkToggle.querySelector('.material-symbols-outlined').textContent = isDarkNow ? 'light_mode' : 'bedtime';
  }
  if (mobileDarkToggle) {
    mobileDarkToggle.firstElementChild.textContent = isDarkNow ? 'Thème clair' : 'Thème sombre';
    mobileDarkToggle.lastElementChild.textContent = isDarkNow ? 'light_mode' : 'bedtime';
  }
}

darkToggle?.addEventListener('click', toggleDarkMode);
mobileDarkToggle?.addEventListener('click', toggleDarkMode);

if (darkToggle || mobileDarkToggle) {
  initDarkMode();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', initDarkMode);
}

// Étape 3: Form validation
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const inputs = form.querySelectorAll('input, textarea');
  const submitBtn = form.querySelector('button[type="submit"]');

  inputs.forEach(input => {
    input.addEventListener('blur', validateInput);
    input.addEventListener('input', clearError);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Envoi...';
      
      const formData = new FormData(form);
      
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          form.innerHTML = '<div class="text-green-400 text-center p-8 font-bold text-lg animate-in">Merci ! Message envoyé. Je réponds sous 24h.</div>';
        } else {
          throw new Error('Erreur envoi');
        }
      } catch (error) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Envoyer le message';
        showError(submitBtn, 'Erreur envoi. Réessayez.');
      }
    }
  });

  function validateInput(e) {
    const input = e.target;
    clearError(input);
    
    let isValid = true;
    let errorMsg = '';

    switch (input.name) {
      case 'name':
        if (input.value.trim().length < 2) {
          isValid = false;
          errorMsg = 'Nom trop court (2+ chars)';
        }
        break;
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value)) {
          isValid = false;
          errorMsg = 'Email invalide';
        }
        break;
      case 'message':
        if (input.value.trim().length < 10) {
          isValid = false;
          errorMsg = 'Message trop court (10+ chars)';
        }
        break;
    }

    if (!isValid) {
      showError(input, errorMsg);
    }

    return isValid;
  }

  function validateForm() {
    let isValid = true;
    inputs.forEach(input => {
      isValid = validateInput({ target: input }) && isValid;
    });
    return isValid;
  }

  function showError(input, msg) {
    input.classList.add('border-red-500', 'bg-red-500/10');
    input.style.borderColor = '#ef4444';
    
    let errorEl = input.parentNode.querySelector('.error-msg');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'error-msg text-red-400 text-xs mt-1 font-medium';
      input.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = msg;
  }

  function clearError(e) {
    const input = e.target;
    input.classList.remove('border-red-500', 'bg-red-500/10');
    const errorEl = input.parentNode.querySelector('.error-msg');
    if (errorEl) errorEl.remove();
  }
});

// --- Particle Animation System ---
const canvas = document.getElementById('particles-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    // Mouse interactivity
    const mouse = { x: null, y: null, radius: 150 };
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });
    
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.vx = (Math.random() - 0.5) * 0.4; // Slower, elegant movement
            this.vy = (Math.random() - 0.5) * 0.4;
        }

        draw() {
            // Determine if we are in dark or light mode based on html class
            const isDark = document.documentElement.classList.contains('dark');
            ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(13, 127, 242, 0.4)'; 
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }

        update() {
            // Movement
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            // Mouse interaction
            if (mouse.x != null && mouse.y != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * this.density;
                    let directionY = forceDirectionY * force * this.density;
                    
                    this.x -= directionX;
                    this.y -= directionY;
                }
            }
        }
    }

    function initParticles() {
        particles = [];
        // Number of particles depends on screen size (responsive)
        let numberOfParticles = (width * height) / 12000;
        // Cap the max particles for performance
        if (numberOfParticles > 120) numberOfParticles = 120;
        
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        let opacityValue = 1;
        const isDark = document.documentElement.classList.contains('dark');
        
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;

                if (distance < 15000) {
                    opacityValue = 1 - (distance / 15000);
                    // Light mode uses primary color, dark mode uses white
                    const color = isDark 
                        ? `rgba(255, 255, 255, ${opacityValue * 0.15})` 
                        : `rgba(13, 127, 242, ${opacityValue * 0.2})`;
                    
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        connectParticles();
    }

    window.addEventListener('resize', resize);
    
    // Initial setup
    resize();
    animateParticles();
}
