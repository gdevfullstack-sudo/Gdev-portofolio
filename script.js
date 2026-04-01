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
    mobileDarkToggle.firstChild.textContent = isDark ? 'Thème clair' : 'Thème sombre';
    mobileDarkToggle.lastChild.textContent = isDark ? 'light_mode' : 'bedtime';
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.classList.contains('dark');
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', (!isDark).toString());
  
  if (darkToggle) {
    darkToggle.querySelector('.material-symbols-outlined').textContent = isDark ? 'bedtime' : 'light_mode';
  }
  if (mobileDarkToggle) {
    mobileDarkToggle.firstChild.textContent = isDark ? 'Thème sombre' : 'Thème clair';
    mobileDarkToggle.lastChild.textContent = isDark ? 'light_mode' : 'bedtime';
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
