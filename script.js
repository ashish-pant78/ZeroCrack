/* =============================================
   CipherX - Main JavaScript
   Author: Ashish Pant
   ============================================= */

// ---- Matrix Rain Animation ----
function initMatrix() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ0110ABCDEF';
  const charArr = chars.split('');
  const fontSize = 14;
  let columns;
  let drops;

  function initDrops() {
    columns = Math.floor(canvas.width / fontSize);
    drops   = Array(columns).fill(1);
  }
  initDrops();
  window.addEventListener('resize', initDrops);

  function draw() {
    ctx.fillStyle = 'rgba(10,10,10,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff88';
    ctx.font      = fontSize + 'px monospace';
    drops.forEach((y, i) => {
      const char = charArr[Math.floor(Math.random() * charArr.length)];
      ctx.fillText(char, i * fontSize, y * fontSize);
      if (y * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
    });
  }

  setInterval(draw, 50);
}

// ---- Navbar scroll effect ----
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ---- Mobile nav toggle ----
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links  = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => links.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
    }
  });
}

// ---- Scroll Reveal ----
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  els.forEach(el => observer.observe(el));
}

// ---- Active nav link ----
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (
      (href === 'index.html'    && (path.endsWith('/') || path.endsWith('index.html'))) ||
      (href === 'analyzer.html' && path.endsWith('analyzer.html')) ||
      (href === 'about.html'    && path.endsWith('about.html')) ||
      (href === 'contact.html'  && path.endsWith('contact.html'))
    ) {
      a.classList.add('active');
    }
  });
}

// ============================================
//   ANALYZER LOGIC
// ============================================

/**
 * Calculate password entropy
 * Formula: entropy = length × log2(charset_size)
 */
function calcEntropy(password) {
  let charset = 0;
  if (/[a-z]/.test(password)) charset += 26;
  if (/[A-Z]/.test(password)) charset += 26;
  if (/[0-9]/.test(password)) charset += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charset += 32;
  if (charset === 0) return 0;
  return Math.floor(password.length * Math.log2(charset));
}

/**
 * Estimate crack time based on entropy
 * Assumption: 10 billion guesses/second (modern GPU cluster)
 */
function estimateCrackTime(entropy) {
  if (entropy === 0) return '< 1 second';
  const guessesPerSec = 1e10;
  const combinations  = Math.pow(2, entropy);
  const seconds       = combinations / guessesPerSec / 2; // average half

  if (seconds < 1)         return '< 1 second';
  if (seconds < 60)        return Math.round(seconds) + ' seconds';
  if (seconds < 3600)      return Math.round(seconds / 60) + ' minutes';
  if (seconds < 86400)     return Math.round(seconds / 3600) + ' hours';
  if (seconds < 2592000)   return Math.round(seconds / 86400) + ' days';
  if (seconds < 31536000)  return Math.round(seconds / 2592000) + ' months';
  if (seconds < 3.154e9)   return Math.round(seconds / 31536000) + ' years';
  if (seconds < 3.154e12)  return Math.round(seconds / 3.154e9)  + ' thousand years';
  return 'Millions of years';
}

/** Get strength level (0–4) */
function getStrength(password) {
  const checks = {
    length:   password.length >= 8,
    upper:    /[A-Z]/.test(password),
    lower:    /[a-z]/.test(password),
    number:   /[0-9]/.test(password),
    special:  /[^a-zA-Z0-9]/.test(password),
  };
  const passed = Object.values(checks).filter(Boolean).length;

  if (password.length === 0) return { level: 0, label: '—', className: '' };
  if (password.length < 6 || passed <= 1) return { level: 1, label: 'WEAK',        className: 'weak',    color: '#ff3860' };
  if (passed === 2 || passed === 3)       return { level: 2, label: 'MEDIUM',      className: 'medium',  color: '#ff9f43' };
  if (passed === 4)                       return { level: 3, label: 'STRONG',      className: 'strong',  color: '#ffd32a' };
  return                                         { level: 4, label: 'VERY STRONG', className: 'vstrong', color: '#00ff88' };
}

/** Generate AI-style suggestions */
function getSuggestions(password) {
  const tips = [];
  if (password.length < 12)            tips.push('Increase length to at least 12 characters.');
  if (!/[A-Z]/.test(password))         tips.push('Add uppercase letters (A–Z) for complexity.');
  if (!/[a-z]/.test(password))         tips.push('Include lowercase letters (a–z).');
  if (!/[0-9]/.test(password))         tips.push('Insert numbers (0–9) to boost entropy.');
  if (!/[^a-zA-Z0-9]/.test(password))  tips.push('Add special characters (!@#$%^&*) for max security.');
  if (/(.)\1{2,}/.test(password))      tips.push('Avoid repeated characters (e.g., "aaa").');
  if (/(?:abc|123|qwerty|password)/i.test(password)) tips.push('Avoid common sequences like "123" or "password".');
  if (tips.length === 0)               tips.push('Excellent! Your password meets all security criteria.');
  return tips;
}

/** Generate a secure random password */
function generatePassword(length = 16) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+';
  let pw = '';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  arr.forEach(b => pw += charset[b % charset.length]);
  return pw;
}

/** Update the full analyzer UI */
function updateAnalyzer(password) {
  // --- Strength ---
  const strength = getStrength(password);
  const pct      = password.length === 0 ? 0 : Math.min(100, strength.level * 25);
  const bar      = document.getElementById('strength-bar');
  const strengthText = document.getElementById('strength-text');
  const strengthPct  = document.getElementById('strength-pct');

  if (bar) {
    bar.style.width = pct + '%';
    bar.className   = 'strength-bar ' + (strength.className || '');
  }
  if (strengthText) {
    strengthText.textContent  = strength.label;
    strengthText.style.color  = strength.color || 'var(--text-muted)';
  }
  if (strengthPct) strengthPct.textContent = password.length ? pct + '%' : '';

  // --- Checklist ---
  const rules = {
    'check-length':  password.length >= 8,
    'check-upper':   /[A-Z]/.test(password),
    'check-lower':   /[a-z]/.test(password),
    'check-number':  /[0-9]/.test(password),
    'check-special': /[^a-zA-Z0-9]/.test(password),
  };
  Object.entries(rules).forEach(([id, pass]) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('pass', pass);
    el.querySelector('.icon').textContent = pass ? '✔' : '✖';
  });

  // --- Entropy & crack time ---
  const entropy  = password.length ? calcEntropy(password) : 0;
  const crackEl  = document.getElementById('crack-time');
  const entropyEl = document.getElementById('entropy-val');
  if (crackEl)   crackEl.textContent   = password.length ? estimateCrackTime(entropy) : '—';
  if (entropyEl) entropyEl.textContent = password.length ? entropy + ' bits' : '—';

  // --- Suggestions ---
  const suggList = document.getElementById('suggestions-list');
  if (suggList && password.length > 0) {
    const items = getSuggestions(password);
    suggList.innerHTML = items.map(t => `<div class="suggestion-item">${t}</div>`).join('');
  } else if (suggList) {
    suggList.innerHTML = '<div class="suggestion-item" style="color:var(--text-muted)">Enter a password to get AI suggestions.</div>';
  }

  // --- Show results panel ---
  const results = document.getElementById('results-panel');
  if (results && password.length > 0) {
    setTimeout(() => results.classList.add('visible'), 50);
  } else if (results) {
    results.classList.remove('visible');
  }
}

/** Init analyzer page */
function initAnalyzer() {
  const input = document.getElementById('password-input');
  if (!input) return;

  const toggleBtn = document.getElementById('toggle-btn');
  const genBtn    = document.getElementById('gen-btn');
  const copyBtn   = document.getElementById('copy-btn');

  // Show / Hide
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggleBtn.textContent = show ? '🙈' : '👁';
    });
  }

  // Live analysis
  input.addEventListener('input', () => updateAnalyzer(input.value));

  // Generator
  if (genBtn) {
    genBtn.addEventListener('click', () => {
      const pw = generatePassword(16);
      input.value = pw;
      input.type  = 'text';
      if (toggleBtn) toggleBtn.textContent = '🙈';
      updateAnalyzer(pw);
      genBtn.textContent = '✅ Generated!';
      setTimeout(() => { genBtn.textContent = '⚡ Generate'; }, 1500);
    });
  }

  // Copy
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      if (!input.value) return;
      navigator.clipboard.writeText(input.value).then(() => {
        copyBtn.textContent = '✅ Copied!';
        setTimeout(() => { copyBtn.textContent = '📋 Copy'; }, 1500);
      });
    });
  }
}

// ---- Contact Form ----
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  function showError(id, show) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('show', show);
  }

  function markError(id, has) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('error', has);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;

    const name    = document.getElementById('name');
    const email   = document.getElementById('email');
    const message = document.getElementById('message');

    // Validate name
    const noName = !name.value.trim();
    markError('name', noName);
    showError('name-err', noName);
    if (noName) valid = false;

    // Validate email
    const noEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    markError('email', noEmail);
    showError('email-err', noEmail);
    if (noEmail) valid = false;

    // Validate message
    const noMsg = message.value.trim().length < 10;
    markError('message', noMsg);
    showError('msg-err', noMsg);
    if (noMsg) valid = false;

    if (valid) {
      document.getElementById('popup').classList.add('active');
      form.reset();
    }
  });

  const closePopup = document.getElementById('close-popup');
  if (closePopup) {
    closePopup.addEventListener('click', () => {
      document.getElementById('popup').classList.remove('active');
    });
  }
}

// ---- Animated number counter ----
function animateCounters() {
  const counters = document.querySelectorAll('[data-count]');
  counters.forEach(el => {
    const target = parseInt(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    let cur = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur.toLocaleString() + suffix;
      if (cur >= target) clearInterval(timer);
    }, 25);
  });
}

// ---- Init all ----
document.addEventListener('DOMContentLoaded', () => {
  initMatrix();
  initNavbar();
  initMobileNav();
  initScrollReveal();
  setActiveNav();
  initAnalyzer();
  initContactForm();

  // Trigger counters when stats section is visible
  const statsSection = document.querySelector('.stats-grid');
  if (statsSection) {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(statsSection);
  }
});
