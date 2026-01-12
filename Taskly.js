/* ================== PAGE HISTORY STACK ================== */
let pageHistory = [];

/* ================== LOADING OVERLAY ================== */
const loadingOverlay = document.getElementById('loadingOverlay');

function showLoading() {
  loadingOverlay.classList.add('show');
}

function hideLoading() {
  loadingOverlay.classList.remove('show');
}

/* ================== USER-SPECIFIC TASK STORAGE ================== */
function getCurrentUserEmail() {
  const user = JSON.parse(localStorage.getItem('tasklyUser') || '{}');
  return user.email || '';
}

function getUserTasksKey() {
  const email = getCurrentUserEmail();
  return email ? `tasklyTasks_${email.replace(/[@.]/g, '_')}` : 'tasklyTasks_guest';
}

function getUserRemindersKey() {
  const email = getCurrentUserEmail();
  return email ? `tasklyReminders_${email.replace(/[@.]/g, '_')}` : 'tasklyReminders_guest';
}

function getUserTrashKey() {
  const email = getCurrentUserEmail();
  return email ? `tasklyTrash_${email.replace(/[@.]/g, '_')}` : 'tasklyTrash_guest';
}

function getUserProfileImgKey() {
  const email = getCurrentUserEmail();
  return email ? `tasklyProfileImg_${email.replace(/[@.]/g, '_')}` : 'tasklyProfileImg_guest';
}

function getUserThemeKey() {
  const email = getCurrentUserEmail();
  return email ? `tasklyTheme_${email.replace(/[@.]/g, '_')}` : 'tasklyTheme_guest';
}

/* ================== PAGE SWITCHER ================== */
function showPage(id) {
  // Don't add login/register pages to history (they're starting points)
  if (!['loginPage', 'registerPage', 'forgotPasswordPage', 'changePasswordPage'].includes(id)) {
    // Remove any existing same page from history
    pageHistory = pageHistory.filter(page => page !== id);
    // Add to history
    pageHistory.push(id);
  }

  const pages = [
    'loginPage', 'registerPage', 'dashboardPage', 'forgotPasswordPage',
    'aboutPage', 'privacyPage', 'settingsPage', 'editProfilePage', 'profilePage',
    'changePasswordPage', 'trashPage'
  ];
  pages.forEach(p => {
    const el = document.getElementById(p);
    if (!el) return;

    if (['loginPage', 'registerPage', 'dashboardPage', 'editProfilePage', 'forgotPasswordPage', 'profilePage', 'changePasswordPage'].includes(p)) {
      el.classList.toggle('hidden', p !== id);
    } else {
      el.classList.toggle('show', p === id);
    }
    el.setAttribute('aria-hidden', p !== id ? 'true' : 'false');
  });

  // Load data when showing specific pages
  if (id === 'profilePage') {
    loadProfilePage();
  } else if (id === 'editProfilePage') {
    loadEditProfile();
  } else if (id === 'trashPage') {
    loadTrashPage();
  }

  // Apply theme - but check if we're on an auth page
  const isAuthPage = ['loginPage', 'registerPage', 'forgotPasswordPage', 'changePasswordPage'].includes(id);
  
  if (isAuthPage) {
    // Force light theme for auth pages by resetting ALL CSS variables
    forceLightTheme();
  } else {
    // Apply saved theme for non-auth pages
    applyTheme();
    updateThemeHeaders();
  }
}
showPage('loginPage');

/* ================== FORCE LIGHT THEME FOR AUTH PAGES ================== */
function forceLightTheme() {
  const root = document.documentElement;
  
  // Reset ALL CSS variables to light theme values
  root.style.setProperty('--bg-primary', '#F8F4E5');
  root.style.setProperty('--bg-secondary', '#FFFFFF');
  root.style.setProperty('--text-primary', '#2C1810');
  root.style.setProperty('--text-secondary', '#8B7355');
  root.style.setProperty('--accent-color', '#FFC107');
  root.style.setProperty('--accent-secondary', '#FFB300');
  root.style.setProperty('--border-color', '#E6D7C4');
  root.style.setProperty('--card-bg', '#FFFFFF');
  root.style.setProperty('--shadow-color', 'rgba(77, 53, 32, 0.08)');
  root.style.setProperty('--glow-color', 'rgba(255, 193, 7, 0.6)');
  root.style.setProperty('--danger-color', '#f44336');
  root.style.setProperty('--success-color', '#4caf50');
  
  // Also set body and frame background
  document.body.style.background = '#F8F4E5';
  const frame = document.getElementById('frame');
  if (frame) {
    frame.style.background = '#F8F4E5';
  }
  
  // Update headers for auth pages (if they exist)
  const headers = document.querySelectorAll('.profile-header, .edit-header, .settings-header, .about-header, .privacy-header, .trash-header');
  headers.forEach(header => {
    header.style.background = '#2C1810';
    header.style.color = 'white';
  });
}

/* ================== GO BACK FUNCTION ================== */
function goBack() {
  if (pageHistory.length <= 1) {
    // If no history or only one page, go to dashboard
    showPage('dashboardPage');
    pageHistory = ['dashboardPage'];
    return;
  }

  // Remove current page
  pageHistory.pop();

  // Get previous page
  const previousPage = pageHistory[pageHistory.length - 1];

  if (previousPage) {
    showPage(previousPage);
  } else {
    showPage('dashboardPage');
    pageHistory = ['dashboardPage'];
  }
}

/* ---------- AUTH NAVIGATION ---------- */
document.getElementById('goRegister').addEventListener('click', () => showPage('registerPage'));
document.getElementById('goLogin').addEventListener('click', () => showPage('loginPage'));
document.getElementById('forgotPassword').addEventListener('click', () => showPage('forgotPasswordPage'));
document.getElementById('backToLogin').addEventListener('click', () => showPage('loginPage'));

/* ---------- PASSWORD TOGGLES ---------- */
function togglePassword(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  if (!input || !toggle) return;
  toggle.addEventListener('click', () => {
    if (input.type === 'password') { input.type = 'text'; toggle.textContent = '🙈'; }
    else { input.type = 'password'; toggle.textContent = '👁️‍🗨️'; }
  });
}
togglePassword('loginPass', 'toggleLoginPass');
togglePassword('registerPass', 'toggleRegisterPass');
togglePassword('registerConfirm', 'toggleRegisterConfirm');

/* ================== THEME MANAGEMENT ================== */
function getTheme() {
  const userThemeKey = getUserThemeKey();
  return localStorage.getItem(userThemeKey) || 'light';
}

function saveTheme(theme) {
  const userThemeKey = getUserThemeKey();
  localStorage.setItem(userThemeKey, theme);
}

function applyTheme() {
  const theme = getTheme();
  const root = document.documentElement;

  // Apply theme based on selection
  if (theme === 'dark') {
    // Dark theme
    root.style.setProperty('--bg-primary', '#121212');
    root.style.setProperty('--bg-secondary', '#1e1e1e');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', '#b0b0b0');
    root.style.setProperty('--accent-color', '#bb86fc');
    root.style.setProperty('--accent-secondary', '#9c64f7');
    root.style.setProperty('--border-color', '#333333');
    root.style.setProperty('--card-bg', '#1e1e1e');
    root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.4)');
    root.style.setProperty('--glow-color', 'rgba(187, 134, 252, 0.6)');
  } else if (theme === 'blue') {
    // Blue theme
    root.style.setProperty('--bg-primary', '#e3f2fd');
    root.style.setProperty('--bg-secondary', '#bbdefb');
    root.style.setProperty('--text-primary', '#0a2942');
    root.style.setProperty('--text-secondary', '#2c3e50');
    root.style.setProperty('--accent-color', '#2196f3');
    root.style.setProperty('--accent-secondary', '#1976d2');
    root.style.setProperty('--border-color', '#90caf9');
    root.style.setProperty('--card-bg', '#bbdefb');
    root.style.setProperty('--shadow-color', 'rgba(33, 150, 243, 0.15)');
    root.style.setProperty('--glow-color', 'rgba(33, 150, 243, 0.6)');
  } else if (theme === 'green') {
    // Green theme
    root.style.setProperty('--bg-primary', '#e8f5e9');
    root.style.setProperty('--bg-secondary', '#c8e6c9');
    root.style.setProperty('--text-primary', '#1a331a');
    root.style.setProperty('--text-secondary', '#2d4d2d');
    root.style.setProperty('--accent-color', '#4caf50');
    root.style.setProperty('--accent-secondary', '#388e3c');
    root.style.setProperty('--border-color', '#a5d6a7');
    root.style.setProperty('--card-bg', '#c8e6c9');
    root.style.setProperty('--shadow-color', 'rgba(76, 175, 80, 0.15)');
    root.style.setProperty('--glow-color', 'rgba(76, 175, 80, 0.6)');
  } else { // light theme (default)
    root.style.setProperty('--bg-primary', '#F8F4E5');
    root.style.setProperty('--bg-secondary', '#FFFFFF');
    root.style.setProperty('--text-primary', '#2C1810');
    root.style.setProperty('--text-secondary', '#8B7355');
    root.style.setProperty('--accent-color', '#FFC107');
    root.style.setProperty('--accent-secondary', '#FFB300');
    root.style.setProperty('--border-color', '#E6D7C4');
    root.style.setProperty('--card-bg', '#FFFFFF');
    root.style.setProperty('--shadow-color', 'rgba(77, 53, 32, 0.08)');
    root.style.setProperty('--glow-color', 'rgba(255, 193, 7, 0.6)');
  }

  // Update active theme preview
  document.querySelectorAll('.theme-preview').forEach(preview => {
    preview.classList.remove('active');
    if (preview.dataset.theme === theme) {
      preview.classList.add('active');
    }
  });
}

function updateThemeHeaders() {
  const theme = getTheme();
  const headers = document.querySelectorAll('.profile-header, .edit-header, .settings-header, .about-header, .privacy-header, .trash-header');

  headers.forEach(header => {
    if (theme === 'dark') {
      header.style.background = '#1a1a2e';
      header.style.color = 'white';
    } else if (theme === 'blue') {
      header.style.background = '#0d47a1';
      header.style.color = 'white';
    } else if (theme === 'green') {
      header.style.background = '#1b5e20';
      header.style.color = 'white';
    } else {
      header.style.background = '#2C1810';
      header.style.color = 'white';
    }
  });
}

function toggleTheme(theme) {
  // Save the theme preference
  saveTheme(theme);
  
  // Only apply theme if we're on the settings page or dashboard (not auth pages)
  const currentPage = pageHistory[pageHistory.length - 1] || 'dashboardPage';
  const isAuthPage = ['loginPage', 'registerPage', 'forgotPasswordPage', 'changePasswordPage'].includes(currentPage);
  
  if (!isAuthPage) {
    applyTheme();
    updateThemeHeaders();
  }
}

/* ================== PASSWORD VALIDATION ================== */
function validatePasswordStrength(password) {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push('Password must contain at least one special character (e.g., !@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    strength: calculatePasswordStrength(password)
  };
}

function calculatePasswordStrength(password) {
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // Character variety checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  
  if (score >= 5) return 'strong';
  if (score >= 3) return 'medium';
  return 'weak';
}

function getPasswordStrengthColor(strength) {
  switch (strength) {
    case 'strong': return '#4caf50';
    case 'medium': return '#ff9800';
    case 'weak': return '#f44336';
    default: return '#757575';
  }
}

/* ================== SETUP PASSWORD VALIDATION UI ================== */
function setupPasswordValidation() {
  const registerPassInput = document.getElementById('registerPass');
  const registerConfirmInput = document.getElementById('registerConfirm');
  
  if (registerPassInput) {
    // Inject CSS styles for password validation
    const style = document.createElement('style');
    style.textContent = `
      /* Fix for password input containers */
      .register-page .input-group {
        position: relative !important;
        margin-bottom: 15px !important;
      }
      
      /* Password inputs with right padding for eye icons */
      #registerPass, 
      #registerConfirm {
        padding-right: 40px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      /* Eye icons positioning */
      #toggleRegisterPass, 
      #toggleRegisterConfirm {
        position: absolute !important;
        right: 12px !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        background: transparent !important;
        border: none !important;
        cursor: pointer !important;
        font-size: 18px !important;
        z-index: 100 !important;
        padding: 4px 6px !important;
        margin: 0 !important;
        line-height: 1 !important;
        height: auto !important;
      }
      
      /* Password indicators styling */
      .password-indicator {
        font-size: 12px !important;
        margin-top: 5px !important;
        margin-bottom: 10px !important;
        padding: 6px 10px !important;
        border-radius: 4px !important;
        width: 100% !important;
        box-sizing: border-box !important;
        font-weight: bold !important;
        display: none;
      }
      
      /* Remove any existing margins that might cause issues */
      #registerPass + br,
      #registerConfirm + br {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    // Create password strength indicator
    const strengthIndicator = document.createElement('div');
    strengthIndicator.id = 'passwordStrengthIndicator';
    strengthIndicator.className = 'password-indicator';
    
    // Create password match indicator  
    const matchIndicator = document.createElement('div');
    matchIndicator.id = 'passwordMatchIndicator';
    matchIndicator.className = 'password-indicator';
    
    // Find where to insert the indicators
    // Insert strength indicator after password input container
    const passContainer = registerPassInput.closest('.input-group') || registerPassInput.parentNode;
    if (passContainer.nextSibling) {
      passContainer.parentNode.insertBefore(strengthIndicator, passContainer.nextSibling);
    } else {
      passContainer.parentNode.appendChild(strengthIndicator);
    }
    
    // Insert match indicator after confirm password input container
    const confirmContainer = registerConfirmInput.closest('.input-group') || registerConfirmInput.parentNode;
    if (confirmContainer.nextSibling) {
      confirmContainer.parentNode.insertBefore(matchIndicator, confirmContainer.nextSibling);
    } else {
      confirmContainer.parentNode.appendChild(matchIndicator);
    }
    
    // Fix the toggle button positioning by ensuring containers have proper styling
    const passToggle = document.getElementById('toggleRegisterPass');
    const confirmToggle = document.getElementById('toggleRegisterConfirm');
    
    // Make sure containers have position relative
    if (passContainer.style.position !== 'relative') {
      passContainer.style.position = 'relative';
    }
    if (confirmContainer.style.position !== 'relative') {
      confirmContainer.style.position = 'relative';
    }
    
    // Add real-time validation
    registerPassInput.addEventListener('input', function() {
      const password = this.value;
      if (password.length > 0) {
        const validation = validatePasswordStrength(password);
        strengthIndicator.textContent = `Password strength: ${validation.strength.toUpperCase()}`;
        strengthIndicator.style.backgroundColor = getPasswordStrengthColor(validation.strength);
        strengthIndicator.style.color = 'white';
        strengthIndicator.style.display = 'block';
      } else {
        strengthIndicator.style.display = 'none';
      }
      
      // Update match indicator
      if (registerConfirmInput.value.length > 0) {
        updatePasswordMatchIndicator();
      }
    });
    
    registerConfirmInput.addEventListener('input', updatePasswordMatchIndicator);
    
    function updatePasswordMatchIndicator() {
      const password = registerPassInput.value;
      const confirm = registerConfirmInput.value;
      
      if (confirm.length > 0) {
        if (password === confirm) {
          matchIndicator.textContent = '✓ Passwords match';
          matchIndicator.style.backgroundColor = '#4caf50';
          matchIndicator.style.color = 'white';
          matchIndicator.style.display = 'block';
        } else {
          matchIndicator.textContent = '✗ Passwords do not match';
          matchIndicator.style.backgroundColor = '#f44336';
          matchIndicator.style.color = 'white';
          matchIndicator.style.display = 'block';
        }
      } else {
        matchIndicator.style.display = 'none';
      }
    }
    
    // Also fix for login page password toggle if needed
    const loginPassInput = document.getElementById('loginPass');
    const loginToggle = document.getElementById('toggleLoginPass');
    const loginContainer = loginPassInput ? (loginPassInput.closest('.input-group') || loginPassInput.parentNode) : null;
    
    if (loginContainer && loginToggle) {
      loginContainer.style.position = 'relative';
      loginPassInput.style.paddingRight = '40px';
      loginToggle.style.position = 'absolute';
      loginToggle.style.right = '12px';
      loginToggle.style.top = '50%';
      loginToggle.style.transform = 'translateY(-50%)';
      loginToggle.style.background = 'transparent';
      loginToggle.style.border = 'none';
      loginToggle.style.cursor = 'pointer';
      loginToggle.style.fontSize = '18px';
      loginToggle.style.zIndex = '100';
    }
  }
}

/* ================== CHANGE PASSWORD FUNCTION ================== */
function openChangePasswordPage() {
  showPage('changePasswordPage');
}

function changePassword() {
  const currentPass = document.getElementById('currentPassword').value.trim();
  const newPass = document.getElementById('newPassword').value.trim();
  const confirmPass = document.getElementById('confirmPassword').value.trim();

  const user = JSON.parse(localStorage.getItem('tasklyUser') || '{}');

  if (!currentPass || !newPass || !confirmPass) {
    alert('Please fill all fields');
    return;
  }

  if (currentPass !== user.pass) {
    alert('Current password is incorrect');
    return;
  }

  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPass);
  if (!passwordValidation.isValid) {
    alert('New password requirements:\n' + passwordValidation.errors.join('\n'));
    return;
  }

  if (newPass !== confirmPass) {
    alert('New passwords do not match');
    return;
  }

  user.pass = newPass;
  localStorage.setItem('tasklyUser', JSON.stringify(user));

  const users = JSON.parse(localStorage.getItem('tasklyUsers') || '[]');
  const index = users.findIndex(u => u.email === user.email);
  if (index !== -1) {
    users[index].pass = newPass;
    localStorage.setItem('tasklyUsers', JSON.stringify(users));
  }

  alert('Password changed successfully!');
  showPage('settingsPage');
}

/* ================== EMAIL VALIDATION ================== */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateEmail(email) {
  const emailLower = email.toLowerCase().trim();

  if (!emailLower) {
    return { isValid: false, message: 'Email is required' };
  }

  if (!isValidEmail(emailLower)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }

  return { isValid: true, message: 'Valid email' };
}

/* ================== USER DATABASE (LOCAL) ================== */
function getAllUsers() {
  const usersStr = localStorage.getItem('tasklyUsers');
  return usersStr ? JSON.parse(usersStr) : [];
}

function saveUser(user) {
  const users = getAllUsers();
  users.push(user);
  localStorage.setItem('tasklyUsers', JSON.stringify(users));
  localStorage.setItem('tasklyUser', JSON.stringify(user));
}

function findUserByEmail(email) {
  const users = getAllUsers();
  return users.find(user => user.email === email);
}

function updateUser(email, updatedUser) {
  const users = getAllUsers();
  const index = users.findIndex(user => user.email === email);
  if (index !== -1) {
    users[index] = { ...users[index], ...updatedUser };
    localStorage.setItem('tasklyUsers', JSON.stringify(users));

    const currentUser = JSON.parse(localStorage.getItem('tasklyUser') || '{}');
    if (currentUser.email === email) {
      localStorage.setItem('tasklyUser', JSON.stringify(users[index]));
    }
    return true;
  }
  return false;
}

/* ---------- REGISTER ---------- */
document.getElementById('registerBtn').addEventListener('click', () => {
  const fName = document.getElementById('registerFirstName').value.trim();
  const lName = document.getElementById('registerLastName').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const pass = document.getElementById('registerPass').value.trim();
  const conf = document.getElementById('registerConfirm').value.trim();

  if (!fName || !lName || !email || !pass || !conf) {
    alert('Please fill all fields');
    return;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    alert(emailValidation.message);
    return;
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(pass);
  if (!passwordValidation.isValid) {
    alert('Password requirements:\n' + passwordValidation.errors.join('\n'));
    return;
  }

  if (pass !== conf) {
    alert('Passwords do not match');
    return;
  }

  const emailLower = email.toLowerCase();

  if (findUserByEmail(emailLower)) {
    alert('An account with this email already exists. Please sign in instead.');
    return;
  }

  const user = {
    fName,
    lName,
    email: emailLower,
    pass,
    bio: `Hello! I'm ${fName} ${lName}. I'm using Taskly to organize my tasks.`,
    isGoogleUser: false,
    createdAt: new Date().toISOString()
  };

  saveUser(user);

  // Set default profile image for this user
  const userProfileImgKey = getUserProfileImgKey();
  const defaultProfileImg = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName + ' ' + lName) + '&background=FFC107&color=2C1810&size=200';
  localStorage.setItem(userProfileImgKey, defaultProfileImg);

  // Initialize empty task storage for this user
  const tasksKey = `tasklyTasks_${emailLower.replace(/[@.]/g, '_')}`;
  const remindersKey = `tasklyReminders_${emailLower.replace(/[@.]/g, '_')}`;
  const trashKey = `tasklyTrash_${emailLower.replace(/[@.]/g, '_')}`;
  const themeKey = `tasklyTheme_${emailLower.replace(/[@.]/g, '_')}`;

  localStorage.setItem(tasksKey, JSON.stringify([]));
  localStorage.setItem(remindersKey, JSON.stringify([]));
  localStorage.setItem(trashKey, JSON.stringify([]));
  localStorage.setItem(themeKey, 'light');

  alert('Registration successful! Please sign in.');
  showPage('loginPage');
});

/* ---------- LOGIN ---------- */
document.getElementById('loginBtn').addEventListener('click', () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  if (!email || !pass) {
    alert('Please enter email and password');
    return;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    alert(emailValidation.message);
    return;
  }

  const emailLower = email.toLowerCase();
  const user = findUserByEmail(emailLower);

  if (!user) {
    alert('No account found with this email. Please register first.');
    return;
  }

  // Google users can login with their password
  if (user.isGoogleUser) {
    // Google users should use the password they created during Google signup
    if (user.pass !== pass) {
      alert('Incorrect password. Google account users must use the password they created during signup.');
      return;
    }
  } else if (user.pass !== pass) {
    // Non-Google users
    alert('Incorrect password. Please try again.');
    return;
  }

  showLoading();
  
  setTimeout(() => {
    localStorage.setItem('tasklyUser', JSON.stringify(user));

    // Initialize user-specific storage if not exists
    const tasksKey = `tasklyTasks_${emailLower.replace(/[@.]/g, '_')}`;
    const remindersKey = `tasklyReminders_${emailLower.replace(/[@.]/g, '_')}`;
    const trashKey = `tasklyTrash_${emailLower.replace(/[@.]/g, '_')}`;
    const themeKey = `tasklyTheme_${emailLower.replace(/[@.]/g, '_')}`;

    if (!localStorage.getItem(tasksKey)) {
      localStorage.setItem(tasksKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(remindersKey)) {
      localStorage.setItem(remindersKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(trashKey)) {
      localStorage.setItem(trashKey, JSON.stringify([]));
    }
    if (!localStorage.getItem(themeKey)) {
      localStorage.setItem(themeKey, 'light');
    }

    hideLoading();
    showPage('dashboardPage');
    loadTasks();
    loadProfilePreview();
    startReminderTimers();
    startTutorial();
  }, 1500);
});

/* ---------- FORGOT PASSWORD ---------- */
document.getElementById('resetPasswordBtn').addEventListener('click', () => {
  const email = document.getElementById('forgotEmail').value.trim();

  if (!email) {
    alert('Please enter your email address');
    return;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    alert(emailValidation.message);
    return;
  }

  const emailLower = email.toLowerCase();
  const user = findUserByEmail(emailLower);

  if (!user) {
    alert('No account found with this email. Please check and try again.');
    return;
  }

  // Google users can still reset their password
  if (user.isGoogleUser) {
    alert(`Password reset instructions have been sent to ${emailLower}\n\n(In a real app, this would send an email with reset link)`);
  } else {
    alert(`Password reset instructions have been sent to ${emailLower}\n\n(In a real app, this would send an email with reset link)`);
  }

  showPage('loginPage');
});

/* ================== GOOGLE SIGN-IN SIMULATION ================== */
function simulateGoogleSignInFlow(isRegister = false) {
  const googleModal = document.createElement('div');
  googleModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  const googleContent = document.createElement('div');
  googleContent.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  `;

  const isLoginPage = !document.getElementById('loginPage').classList.contains('hidden');

  if (isLoginPage) {
    googleContent.innerHTML = `
      <h3 style="margin-bottom: 20px; color: #333;">Google Sign-In</h3>
      <p style="color: #666; margin-bottom: 20px;">Enter your Google email to sign in</p>
      <input type="email" id="googleEmailInput" placeholder="yourname@gmail.com" 
        style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
      <div id="emailValidationMessage" style="color: #e74c3c; font-size: 14px; margin-bottom: 10px; min-height: 20px;"></div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="googleCancel" style="padding: 12px 24px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Cancel
        </button>
        <button id="googleContinue" style="padding: 12px 24px; background: #4285F4; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Continue
        </button>
      </div>
    `;
  } else {
    googleContent.innerHTML = `
      <h3 style="margin-bottom: 20px; color: #333;">Google Sign-Up</h3>
      <p style="color: #666; margin-bottom: 20px;">Enter your Google email to create account</p>
      <input type="email" id="googleEmailInput" placeholder="yourname@gmail.com" 
        style="width: 100%; padding: 12px; margin-bottom: 15px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
      <div id="emailValidationMessage" style="color: #e74c3c; font-size: 14px; margin-bottom: 10px; min-height: 20px;"></div>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="googleCancel" style="padding: 12px 24px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Cancel
        </button>
        <button id="googleContinue" style="padding: 12px 24px; background: #4285F4; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
          Continue
        </button>
      </div>
    `;
  }

  googleModal.appendChild(googleContent);
  document.body.appendChild(googleModal);

  setTimeout(() => {
    document.getElementById('googleEmailInput').focus();
  }, 100);

  const emailInput = document.getElementById('googleEmailInput');
  const validationMessage = document.getElementById('emailValidationMessage');

  emailInput.addEventListener('input', () => {
    const email = emailInput.value.trim();
    if (!email) {
      validationMessage.textContent = '';
      return;
    }

    const validation = validateEmail(email);
    if (!validation.isValid) {
      validationMessage.textContent = validation.message;
      validationMessage.style.color = '#e74c3c';
    } else {
      validationMessage.textContent = '✓ Valid email format';
      validationMessage.style.color = '#27ae60';
    }
  });

  document.getElementById('googleCancel').addEventListener('click', () => {
    document.body.removeChild(googleModal);
  });

  document.getElementById('googleContinue').addEventListener('click', () => {
    const googleEmail = emailInput.value.trim();

    if (!googleEmail) {
      alert('Please enter an email address');
      return;
    }

    const emailValidation = validateEmail(googleEmail);
    if (!emailValidation.isValid) {
      alert(emailValidation.message);
      return;
    }

    const emailLower = googleEmail.toLowerCase();
    const existingUser = findUserByEmail(emailLower);

    if (existingUser) {
      showLoading();
      
      setTimeout(() => {
        localStorage.setItem('tasklyUser', JSON.stringify(existingUser));

        // Initialize user-specific storage if not exists
        const tasksKey = `tasklyTasks_${emailLower.replace(/[@.]/g, '_')}`;
        const remindersKey = `tasklyReminders_${emailLower.replace(/[@.]/g, '_')}`;
        const trashKey = `tasklyTrash_${emailLower.replace(/[@.]/g, '_')}`;
        const themeKey = `tasklyTheme_${emailLower.replace(/[@.]/g, '_')}`;

        if (!localStorage.getItem(tasksKey)) {
          localStorage.setItem(tasksKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(remindersKey)) {
          localStorage.setItem(remindersKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(trashKey)) {
          localStorage.setItem(trashKey, JSON.stringify([]));
        }
        if (!localStorage.getItem(themeKey)) {
          localStorage.setItem(themeKey, 'light');
        }

        document.body.removeChild(googleModal);
        hideLoading();
        showPage('dashboardPage');
        loadTasks();
        loadProfilePreview();
        startReminderTimers();
        startTutorial();
        alert(`Welcome back ${existingUser.fName}!`);
      }, 1500);
    } else {
      document.body.removeChild(googleModal);
      createGoogleAccountWithPassword(emailLower);
    }
  });

  emailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('googleContinue').click();
    }
  });

  googleModal.addEventListener('click', (e) => {
    if (e.target === googleModal) {
      document.body.removeChild(googleModal);
    }
  });
}

function createGoogleAccountWithPassword(googleEmail) {
  const passwordModal = document.createElement('div');
  passwordModal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  const passwordContent = document.createElement('div');
  passwordContent.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  `;

  // Better last name extraction from email
  const emailName = googleEmail.split('@')[0];
  let suggestedFirstName = 'User';
  let suggestedLastName = '';

  // Try to extract name parts from common email patterns
  if (emailName.includes('.')) {
    const parts = emailName.split('.');
    suggestedFirstName = parts[0] || 'User';
    suggestedLastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  } else if (emailName.includes('_')) {
    const parts = emailName.split('_');
    suggestedFirstName = parts[0] || 'User';
    suggestedLastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
  } else if (emailName.length > 1) {
    suggestedFirstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
    suggestedLastName = '';
  }

  // Capitalize first letters
  suggestedFirstName = suggestedFirstName.charAt(0).toUpperCase() + suggestedFirstName.slice(1).toLowerCase();
  if (suggestedLastName && suggestedLastName.trim() !== '') {
    suggestedLastName = suggestedLastName.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  } else {
    suggestedLastName = '';
  }

  passwordContent.innerHTML = `
    <h3 style="margin-bottom: 20px; color: #333;">Create Account</h3>
    <p style="color: #666; margin-bottom: 10px;">Email: <strong>${googleEmail}</strong></p>
    <p style="color: #666; margin-bottom: 20px;">Create a password for your account</p>
    
    <div style="margin-bottom: 15px; text-align: left;">
      <label style="display: block; margin-bottom: 5px; font-weight: 600;">First Name</label>
      <input type="text" id="googleFirstName" value="${suggestedFirstName}" placeholder="First name" 
        style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
    </div>
    
    <div style="margin-bottom: 15px; text-align: left;">
      <label style="display: block; margin-bottom: 5px; font-weight: 600;">Last Name</label>
      <input type="text" id="googleLastName" value="${suggestedLastName}" placeholder="Last name (optional)" 
        style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
    </div>
    
    <div style="margin-bottom: 15px; text-align: left;">
      <label style="display: block; margin-bottom: 5px; font-weight: 600;">Password</label>
      <input type="password" id="googlePassword" placeholder="Password (min 8 characters)" 
        style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
      <div id="passwordStrength" style="font-size: 12px; margin-top: 5px;"></div>
    </div>
    
    <div style="margin-bottom: 20px; text-align: left;">
      <label style="display: block; margin-bottom: 5px; font-weight: 600;">Confirm Password</label>
      <input type="password" id="googleConfirmPassword" placeholder="Confirm password" 
        style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
      <div id="passwordMatch" style="font-size: 12px; margin-top: 5px;"></div>
      <div id="passwordRequirements" style="font-size: 11px; margin-top: 5px; color: #666;">
        Password must contain: 8+ characters, uppercase, lowercase, number, special character
      </div>
    </div>
    
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="googleCreateCancel" style="padding: 12px 24px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
        Cancel
      </button>
      <button id="googleCreateAccount" style="padding: 12px 24px; background: #4285F4; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
        Create Account
      </button>
    </div>
  `;

  passwordModal.appendChild(passwordContent);
  document.body.appendChild(passwordModal);

  setTimeout(() => {
    document.getElementById('googleFirstName').focus();
  }, 100);

  const passwordInput = document.getElementById('googlePassword');
  const confirmInput = document.getElementById('googleConfirmPassword');
  const passwordStrength = document.getElementById('passwordStrength');
  const passwordMatch = document.getElementById('passwordMatch');

  passwordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const validation = validatePasswordStrength(password);
    const strength = validation.strength;
    const color = getPasswordStrengthColor(strength);

    passwordStrength.textContent = `Strength: ${strength.toUpperCase()}`;
    passwordStrength.style.color = color;
    passwordStrength.style.fontWeight = 'bold';
  });

  confirmInput.addEventListener('input', () => {
    if (passwordInput.value && confirmInput.value) {
      if (passwordInput.value === confirmInput.value) {
        passwordMatch.textContent = '✓ Passwords match';
        passwordMatch.style.color = '#27ae60';
      } else {
        passwordMatch.textContent = '✗ Passwords do not match';
        passwordMatch.style.color = '#e74c3c';
      }
    } else {
      passwordMatch.textContent = '';
    }
  });

  document.getElementById('googleCreateCancel').addEventListener('click', () => {
    document.body.removeChild(passwordModal);
  });

  document.getElementById('googleCreateAccount').addEventListener('click', () => {
    const fName = document.getElementById('googleFirstName').value.trim();
    const lName = document.getElementById('googleLastName').value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!fName) {
      alert('First name is required');
      return;
    }

    // Last name is optional
    const lastName = lName || '';

    if (!password || !confirmPassword) {
      alert('Please fill all password fields');
      return;
    }

    // Validate password strength for Google sign-up
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      alert('Password requirements:\n' + passwordValidation.errors.join('\n'));
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    const googleUser = {
      fName,
      lName: lastName,
      email: googleEmail,
      pass: password,
      bio: `Hello! I'm ${fName} ${lastName}. I'm using Taskly to organize my tasks.`,
      isGoogleUser: true,
      createdAt: new Date().toISOString()
    };

    saveUser(googleUser);

    // Set profile image for this user
    const userProfileImgKey = `tasklyProfileImg_${googleEmail.replace(/[@.]/g, '_')}`;
    const googleProfileImg = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(fName + ' ' + lastName) + '&background=FFC107&color=2C1810&size=200';
    localStorage.setItem(userProfileImgKey, googleProfileImg);

    // Initialize empty task storage for this user
    const tasksKey = `tasklyTasks_${googleEmail.replace(/[@.]/g, '_')}`;
    const remindersKey = `tasklyReminders_${googleEmail.replace(/[@.]/g, '_')}`;
    const trashKey = `tasklyTrash_${googleEmail.replace(/[@.]/g, '_')}`;
    const themeKey = `tasklyTheme_${googleEmail.replace(/[@.]/g, '_')}`;

    localStorage.setItem(tasksKey, JSON.stringify([]));
    localStorage.setItem(remindersKey, JSON.stringify([]));
    localStorage.setItem(trashKey, JSON.stringify([]));
    localStorage.setItem(themeKey, 'light');

    document.body.removeChild(passwordModal);
    showLoading();
    
    setTimeout(() => {
      hideLoading();
      showPage('dashboardPage');
      loadTasks();
      loadProfilePreview();
      loadProfilePage();
      startReminderTimers();
      startTutorial();
      alert(`Welcome ${fName}! Your account has been created.`);
    }, 1500);
  });

  const inputs = ['googleFirstName', 'googleLastName', 'googlePassword', 'googleConfirmPassword'];
  inputs.forEach(inputId => {
    document.getElementById(inputId).addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        document.getElementById('googleCreateAccount').click();
      }
    });
  });

  passwordModal.addEventListener('click', (e) => {
    if (e.target === passwordModal) {
      document.body.removeChild(passwordModal);
    }
  });
}

document.getElementById('googleSign').addEventListener('click', () => simulateGoogleSignInFlow(false));
document.getElementById('googleRegister').addEventListener('click', () => simulateGoogleSignInFlow(true));

/* ================== SIDEBAR ================== */
const hamburger = document.getElementById('hamburger');
const sidebar = document.getElementById('sidebar');
let hambOpen = false;

hamburger.addEventListener('click', () => {
  hambOpen = true;
  sidebar.classList.add('show');
  hamburger.classList.toggle('open', true);
  hamburger.querySelector('.line').textContent = '✖';
});
document.getElementById('closeSidebarBtn').addEventListener('click', () => {
  hambOpen = false;
  sidebar.classList.remove('show');
  hamburger.classList.toggle('open', false);
  hamburger.querySelector('.line').textContent = '☰';
});
function closeSidebar() {
  hambOpen = false;
  sidebar.classList.remove('show');
  hamburger.classList.toggle('open', false);
  hamburger.querySelector('.line').textContent = '☰';
}

/* ---------- SIDEBAR NAV ---------- */
document.getElementById('navAbout').addEventListener('click', () => { closeSidebar(); showPage('aboutPage'); });
document.getElementById('navPrivacy').addEventListener('click', () => { closeSidebar(); showPage('privacyPage'); });
document.getElementById('navSettings').addEventListener('click', () => { closeSidebar(); showPage('settingsPage'); });
document.getElementById('navProfile').addEventListener('click', () => { closeSidebar(); loadProfilePage(); showPage('profilePage'); });
document.getElementById('navTrash').addEventListener('click', () => { closeSidebar(); showPage('trashPage'); });
document.getElementById('navTutorial').addEventListener('click', () => { closeSidebar(); showTutorialStep(0); tutorialOverlay.classList.add('show'); });

/* ================== PROFILE PANEL ================== */
const profileIcon = document.getElementById('profileIcon');
const profilePanel = document.getElementById('profilePanel');

function loadProfilePreview() {
  const user = JSON.parse(localStorage.getItem('tasklyUser') || '{}');
  
  if (user.fName) {
    document.getElementById('profileNameText').textContent = `${user.fName || ''} ${user.lName || ''}`;
    document.getElementById('profileEmailText').textContent = user.email || '';
  } else {
    document.getElementById('profileNameText').textContent = 'Guest';
    document.getElementById('profileEmailText').textContent = '';
  }
}

function updateProfilePanel() {
  // Force refresh from localStorage
  const user = JSON.parse(localStorage.getItem('tasklyUser') || '{}');
  
  if (user.fName) {
    document.getElementById('profileNameText').textContent = `${user.fName || ''} ${user.lName || ''}`;
    document.getElementById('profileEmailText').textContent = user.email || '';
  } else {
    document.getElementById('profileNameText').textContent = 'Guest';
    document.getElementById('profileEmailText').textContent = '';
  }
}

// Update profile icon to toggle profile popup
profileIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  notifyPanelClose();
  
  // Force refresh of profile panel data
  updateProfilePanel();
  
  profilePanel.classList.toggle('show');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
  profilePanel.classList.remove('show');
  // Force light theme before going to login page
  forceLightTheme();
  showPage('loginPage');
});

// Update the "View Profile" button in profile popup
document.getElementById('openEditProfileFromPopup').addEventListener('click', () => {
  profilePanel.classList.remove('show');
  loadProfilePage(); // Load data into profile page
  showPage('profilePage');
});

/* ================== PROFILE PAGE ================== */
function loadProfilePage() {
  const user = JSON.parse(localStorage.getItem('tasklyUser') || '{}');
  const userProfileImgKey = getUserProfileImgKey();
  const img = localStorage.getItem(userProfileImgKey) || 'https://via.placeholder.com/200';

  if (user.fName) {
    document.getElementById('profilePageName').textContent = `${user.fName || ''} ${user.lName || ''}`;
    document.getElementById('profilePageEmail').textContent = user.email || '';
    document.getElementById('profilePageBio').textContent = user.bio || 'No bio yet. Click "Edit Profile" to add one!';
    document.getElementById('profilePageImg').src = img;

    if (user.createdAt) {
      const joinDate = new Date(user.createdAt);
      document.getElementById('profilePageJoinDate').textContent = `Joined ${joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
    } else {
      document.getElementById('profilePageJoinDate').textContent = 'Member since recently';
    }

    const tasksKey = getUserTasksKey();
    const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
    document.getElementById('profileTaskStats').textContent = `${tasks.length} tasks`;
  }
}

document.getElementById('profilePageEditBtn').addEventListener('click', () => {
  loadEditProfile(); // Load data into edit form
  showPage('editProfilePage');
});

document.getElementById('closeProfilePage').addEventListener('click', () => {
  goBack();
});

/* ================== FULL PAGE EDIT PROFILE ================== */
const editFirstFull = document.getElementById('editFirstFull');
const editLastFull = document.getElementById('editLastFull');
const editBioFull = document.getElementById('editBioFull');
const editProfilePreviewFull = document.getElementById('editProfilePreviewFull');
const editImageInputFull = document.getElementById('editImageInputFull');
const saveEditFull = document.getElementById('saveEditFull');

function loadEditProfile() {
  const user = JSON.parse(localStorage.getItem('tasklyUser') || '{}');
  editFirstFull.value = user.fName || '';
  editLastFull.value = user.lName || '';
  editBioFull.value = user.bio || '';
  const userProfileImgKey = getUserProfileImgKey();
  const img = localStorage.getItem(userProfileImgKey) || 'https://via.placeholder.com/200';
  editProfilePreviewFull.src = img;
}

document.getElementById('closeEditPage').addEventListener('click', () => {
  goBack();
});

/* save */
saveEditFull.addEventListener('click', () => {
  const fName = editFirstFull.value.trim();
  const lName = editLastFull.value.trim();
  const bio = editBioFull.value.trim();

  if (!fName || !lName) {
    alert('First name and last name are required');
    return;
  }

  const user = JSON.parse(localStorage.getItem('tasklyUser') || '{}');
  const updatedUser = { ...user, fName, lName, bio };

  // Save updated user
  localStorage.setItem('tasklyUser', JSON.stringify(updatedUser));

  // Update in users array
  updateUser(user.email, updatedUser);

  // Save profile image for this user
  const userProfileImgKey = getUserProfileImgKey();
  localStorage.setItem(userProfileImgKey, editProfilePreviewFull.src);

  alert('Profile updated successfully!');

  // Refresh all profile displays
  loadProfilePreview(); // Update dashboard popup
  loadProfilePage();    // Update profile page
  pageHistory.push('dashboardPage');
  showPage('profilePage');// Go back to profile page
});

/* image upload */
editImageInputFull.addEventListener('change', (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => editProfilePreviewFull.src = r.result;
  r.readAsDataURL(f);
});

/* ================== EDIT EMAIL FUNCTIONALITY ================== */
function openEditEmailModal() {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    padding: 30px;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  `;

  const currentUser = JSON.parse(localStorage.getItem('tasklyUser') || '{}');

  content.innerHTML = `
    <h3 style="margin-bottom: 20px; color: #333;">Change Email Address</h3>
    <p style="color: #666; margin-bottom: 10px;">Current email: <strong>${currentUser.email}</strong></p>
    
    <div style="margin-bottom: 15px; text-align: left;">
      <label style="display: block; margin-bottom: 5px; font-weight: 600;">New Email</label>
      <input type="email" id="newEmailInput" placeholder="new@example.com" 
        style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
    </div>
    
    <div style="margin-bottom: 15px; text-align: left;">
      <label style="display: block; margin-bottom: 5px; font-weight: 600;">Confirm Password</label>
      <input type="password" id="confirmPasswordForEmail" placeholder="Enter your password" 
        style="width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-size: 16px;">
    </div>
    
    <div id="emailChangeMessage" style="color: #e74c3c; font-size: 14px; margin-bottom: 10px; min-height: 20px;"></div>
    
    <div style="display: flex; gap: 10px; justify-content: center;">
      <button id="cancelEmailChange" style="padding: 12px 24px; background: #f0f0f0; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
        Cancel
      </button>
      <button id="saveEmailChange" style="padding: 12px 24px; background: #4285F4; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
        Update Email
      </button>
    </div>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  setTimeout(() => {
    document.getElementById('newEmailInput').focus();
  }, 100);

  document.getElementById('cancelEmailChange').addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  document.getElementById('saveEmailChange').addEventListener('click', () => {
    const newEmail = document.getElementById('newEmailInput').value.trim().toLowerCase();
    const password = document.getElementById('confirmPasswordForEmail').value.trim();
    const messageEl = document.getElementById('emailChangeMessage');

    if (!newEmail || !password) {
      messageEl.textContent = 'Please fill all fields';
      return;
    }

    if (newEmail === currentUser.email) {
      messageEl.textContent = 'New email is the same as current email';
      return;
    }

    const emailValidation = validateEmail(newEmail);
    if (!emailValidation.isValid) {
      messageEl.textContent = emailValidation.message;
      return;
    }

    if (password !== currentUser.pass) {
      messageEl.textContent = 'Incorrect password';
      return;
    }

    const existingUser = findUserByEmail(newEmail);
    if (existingUser) {
      messageEl.textContent = 'This email is already registered';
      return;
    }

    // Migrate user data from old email to new email
    const oldEmailKey = currentUser.email.replace(/[@.]/g, '_');
    const newEmailKey = newEmail.replace(/[@.]/g, '_');

    // Migrate tasks
    const oldTasksKey = `tasklyTasks_${oldEmailKey}`;
    const newTasksKey = `tasklyTasks_${newEmailKey}`;
    const tasks = localStorage.getItem(oldTasksKey);
    if (tasks) {
      localStorage.setItem(newTasksKey, tasks);
      localStorage.removeItem(oldTasksKey);
    }

    // Migrate reminders
    const oldRemindersKey = `tasklyReminders_${oldEmailKey}`;
    const newRemindersKey = `tasklyReminders_${newEmailKey}`;
    const reminders = localStorage.getItem(oldRemindersKey);
    if (reminders) {
      localStorage.setItem(newRemindersKey, reminders);
      localStorage.removeItem(oldRemindersKey);
    }

    // Migrate trash
    const oldTrashKey = `tasklyTrash_${oldEmailKey}`;
    const newTrashKey = `tasklyTrash_${newEmailKey}`;
    const trash = localStorage.getItem(oldTrashKey);
    if (trash) {
      localStorage.setItem(newTrashKey, trash);
      localStorage.removeItem(oldTrashKey);
    }

    // Migrate profile image
    const oldProfileImgKey = `tasklyProfileImg_${oldEmailKey}`;
    const newProfileImgKey = `tasklyProfileImg_${newEmailKey}`;
    const profileImg = localStorage.getItem(oldProfileImgKey);
    if (profileImg) {
      localStorage.setItem(newProfileImgKey, profileImg);
      localStorage.removeItem(oldProfileImgKey);
    }

    // Migrate theme
    const oldThemeKey = `tasklyTheme_${oldEmailKey}`;
    const newThemeKey = `tasklyTheme_${newEmailKey}`;
    const theme = localStorage.getItem(oldThemeKey);
    if (theme) {
      localStorage.setItem(newThemeKey, theme);
      localStorage.removeItem(oldThemeKey);
    }

    updateUser(currentUser.email, {
      ...currentUser,
      email: newEmail
    });

    document.body.removeChild(modal);
    alert('Email updated successfully! All your data has been migrated.');
    loadProfilePage();
  });
}

/* ================== NOTIFICATIONS ================== */
const notifyIcon = document.getElementById('notifyIcon');
const notifyPanel = document.getElementById('notifyPanel');
function notifyPanelOpen() {
  const list = document.getElementById('notifyList');
  const remindersKey = getUserRemindersKey();
  const rems = JSON.parse(localStorage.getItem(remindersKey) || '[]');
  list.innerHTML = rems.length ? rems.slice().reverse().map(r => `
    <div class="pop-item">${r.title} — ${new Date(r.reminderAt).toLocaleString()}</div>
  `).join('') : '<div style="color:#666">No reminders</div>';
  notifyPanel.classList.add('show');
}
function notifyPanelClose() { notifyPanel.classList.remove('show'); }
notifyIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  profilePanel.classList.remove('show');
  notifyPanel.classList.contains('show') ? notifyPanelClose() : notifyPanelOpen();
});
document.getElementById('clearNotifications').addEventListener('click', () => {
  const remindersKey = getUserRemindersKey();
  localStorage.setItem(remindersKey, JSON.stringify([]));
  document.getElementById('notifyList').innerHTML = '<div style="color:#666">All reminders cleared</div>';
});

/* close panels on outside click */
document.addEventListener('click', (e) => {
  if (!e.target.closest('#profilePanel') && !e.target.closest('#profileIcon')) profilePanel.classList.remove('show');
  if (!e.target.closest('#notifyPanel') && !e.target.closest('#notifyIcon')) notifyPanelClose();
});

/* ================== SEARCH ================== */
const searchIcon = document.getElementById('searchIcon');
const searchInput = document.getElementById('searchInput');
searchIcon.addEventListener('click', (e) => {
  e.stopPropagation();
  if (searchInput.classList.contains('show')) {
    searchInput.classList.remove('show');
    searchInput.value = '';
    loadTasks();
  } else {
    searchInput.classList.add('show');
    searchInput.focus();
  }
});
searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const tasksKey = getUserTasksKey();
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
  renderTasksList(tasks.filter(t => (t.title + ' ' + t.desc).toLowerCase().includes(q)));
});

/* ================== BACKDROP ================== */
const backdrop = document.getElementById('backdrop');
const frame = document.getElementById('frame');
function showBackdrop() { backdrop.classList.add('show'); frame.classList.add('scaled'); }
function hideBackdrop() { backdrop.classList.remove('show'); frame.classList.remove('scaled'); }
backdrop.addEventListener('click', () => { hideAddCard(); hideBackdrop(); });

/* ================== TASK CRUD & REMINDERS ================== */
const tasksContainer = document.getElementById('tasksContainer');
const openAddTaskBtn = document.getElementById('openAddTask');
const addTaskCard = document.getElementById('addTaskCard');
const closeTaskCard = document.getElementById('closeTaskCard');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const taskReminderSelect = document.getElementById('taskReminder');
const taskReminderCustom = document.getElementById('taskReminderCustom');

let editingIndex = null;
let reminderTimers = [];

openAddTaskBtn.addEventListener('click', () => openAddCard());
closeTaskCard.addEventListener('click', hideAddCard);
cancelAddBtn.addEventListener('click', hideAddCard);

function openAddCard(editIndex = null, taskObj = null) {
  editingIndex = editIndex;
  document.getElementById('addCardTitle').textContent = editIndex === null ? 'Add New Task' : 'Edit Task';
  if (taskObj) {
    document.getElementById('taskTitle').value = taskObj.title;
    document.getElementById('taskDescription').value = taskObj.desc;
    document.getElementById('taskDate').value = taskObj.date;
    document.getElementById('taskTime').value = taskObj.time;
    document.getElementById('taskPriority').value = taskObj.priority || '';
    document.getElementById('taskStatus').value = taskObj.status || 'pending';
    document.getElementById('taskCategory').value = taskObj.category || '';
    
    if (taskObj.reminder && taskObj.reminder.offsetMin != null) {
      const off = taskObj.reminder.offsetMin;
      if ([5, 10, 30].includes(off)) {
        taskReminderSelect.value = String(off);
        taskReminderCustom.style.display = 'none';
      } else {
        taskReminderSelect.value = 'custom';
        taskReminderCustom.style.display = 'inline-block';
        taskReminderCustom.value = off;
      }
    } else {
      taskReminderSelect.value = 'none';
      taskReminderCustom.style.display = 'none';
      taskReminderCustom.value = '';
    }
  } else resetAddForm();
  addTaskCard.classList.add('show');
  addTaskCard.setAttribute('aria-hidden', 'false');
  showBackdrop();
  addTaskCard.scrollTop = 0;
}

function hideAddCard() {
  addTaskCard.classList.remove('show');
  addTaskCard.setAttribute('aria-hidden', 'true');
  resetAddForm();
  hideBackdrop();
}

function resetAddForm() {
  ['taskTitle', 'taskDescription', 'taskDate', 'taskTime'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('taskPriority').selectedIndex = 0;
  document.getElementById('taskStatus').value = 'pending';
  document.getElementById('taskCategory').selectedIndex = 0;
  taskReminderSelect.value = 'none';
  taskReminderCustom.style.display = 'none';
  taskReminderCustom.value = '';
  editingIndex = null;
}

taskReminderSelect.addEventListener('change', (e) => {
  taskReminderCustom.style.display = e.target.value === 'custom' ? 'inline-block' : 'none';
});

saveTaskBtn.addEventListener('click', () => {
  const title = document.getElementById('taskTitle').value.trim();
  const desc = document.getElementById('taskDescription').value.trim();
  const date = document.getElementById('taskDate').value;
  const time = document.getElementById('taskTime').value;
  const priority = document.getElementById('taskPriority').value;
  const status = document.getElementById('taskStatus').value;
  const category = document.getElementById('taskCategory').value;
  const remind = taskReminderSelect.value;
  const customMin = taskReminderCustom.value ? parseInt(taskReminderCustom.value, 10) : null;

  if (!title || !desc || !date || !time || !priority || !category) {
    alert('Please fill all fields');
    return;
  }

  let offsetMin = null;
  if (remind === '5') offsetMin = 5;
  else if (remind === '10') offsetMin = 10;
  else if (remind === '30') offsetMin = 30;
  else if (remind === 'custom' && customMin && !isNaN(customMin)) offsetMin = customMin;

  const taskDateTime = new Date(date + 'T' + time);
  let reminderAt = null;
  if (offsetMin !== null) reminderAt = new Date(taskDateTime.getTime() - offsetMin * 60 * 1000);

  const taskObj = {
    title,
    desc,
    date,
    time,
    priority,
    status,
    category,
    reminder: reminderAt ? {
      reminderAt: reminderAt.getTime(),
      reminderAtHuman: reminderAt.toLocaleString(),
      offsetMin
    } : null
  };

  const tasksKey = getUserTasksKey();
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
  editingIndex === null ? tasks.push(taskObj) : tasks[editingIndex] = taskObj;
  localStorage.setItem(tasksKey, JSON.stringify(tasks));
  persistReminders();
  scheduleAllReminders();
  hideAddCard();
  renderTasksList(tasks);
  updateDashboardStats();
});

function persistReminders() {
  const tasksKey = getUserTasksKey();
  const remindersKey = getUserRemindersKey();
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
  const rems = [];

  tasks.forEach((t, idx) => {
    if (t.reminder && t.reminder.reminderAt) rems.push({
      index: idx,
      title: t.title,
      reminderAt: t.reminder.reminderAt
    });
  });
  localStorage.setItem(remindersKey, JSON.stringify(rems));
}

function clearAllTimers() {
  reminderTimers.forEach(t => clearTimeout(t.id));
  reminderTimers = [];
}

function scheduleAllReminders() {
  clearAllTimers();
  const tasksKey = getUserTasksKey();
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');

  tasks.forEach((t, idx) => {
    if (t.reminder && t.reminder.reminderAt) {
      const ms = t.reminder.reminderAt - Date.now();
      if (ms > 0) {
        const id = setTimeout(() => {
          alert('Reminder — ' + t.title + ' at ' + new Date(t.reminder.reminderAt).toLocaleString());
          notifyPanelOpen();
          reminderTimers = reminderTimers.filter(x => x.id !== id);
        }, ms);
        reminderTimers.push({ id, index: idx });
      }
    }
  });
}

function startReminderTimers() { scheduleAllReminders(); }

/* ================== TASK FILTERING ================== */
let currentFilter = 'all';
let currentPriority = 'all';
let currentCategory = 'all';

function setupFilters() {
  // Filter tabs
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.filter;
      applyFilters();
    });
  });

  // Priority filter
  document.getElementById('filterPriority').addEventListener('change', (e) => {
    currentPriority = e.target.value;
    applyFilters();
  });

  // Category filter
  document.getElementById('filterCategory').addEventListener('change', (e) => {
    currentCategory = e.target.value;
    applyFilters();
  });
}

function applyFilters() {
  const tasksKey = getUserTasksKey();
  let tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');

  // Apply status filter
  if (currentFilter === 'pending') {
    tasks = tasks.filter(task => task.status === 'pending');
  } else if (currentFilter === 'completed') {
    tasks = tasks.filter(task => task.status === 'completed');
  }

  // Apply priority filter
  if (currentPriority !== 'all') {
    tasks = tasks.filter(task => task.priority === currentPriority);
  }

  // Apply category filter
  if (currentCategory !== 'all') {
    tasks = tasks.filter(task => task.category === currentCategory);
  }

  renderTasksList(tasks);
}

/* ================== UPDATE DASHBOARD STATS ================== */
function updateDashboardStats() {
  const tasksKey = getUserTasksKey();
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
  
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(task => task.status === 'pending').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  
  document.getElementById('totalTasks').textContent = totalTasks;
  document.getElementById('pendingTasks').textContent = pendingTasks;
  document.getElementById('completedTasks').textContent = completedTasks;
}

/* ================== SWIPE HANDLERS ================== */
function doDeleteTask(index) {
  const tasksKey = getUserTasksKey();
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
  const taskToDelete = tasks[index];

  if (!taskToDelete) return;

  // Remove from active tasks
  tasks.splice(index, 1);
  localStorage.setItem(tasksKey, JSON.stringify(tasks));

  persistReminders();
  scheduleAllReminders();
  loadTasks();
  updateDashboardStats();

  // Show notification
  alert(`Task "${taskToDelete.title}" deleted permanently.`);
}

function archiveTask(index) {
  const tasksKey = getUserTasksKey();
  const trashKey = getUserTrashKey();
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
  const taskToArchive = tasks[index];

  if (!taskToArchive) return;

  // Mark as archived
  taskToArchive.archivedAt = new Date().toISOString();
  taskToArchive.archived = true;

  // Add to trash (archive)
  const trash = JSON.parse(localStorage.getItem(trashKey) || '[]');
  trash.push(taskToArchive);
  localStorage.setItem(trashKey, JSON.stringify(trash));

  // Remove from active tasks
  tasks.splice(index, 1);
  localStorage.setItem(tasksKey, JSON.stringify(tasks));

  persistReminders();
  scheduleAllReminders();
  loadTasks();
  updateDashboardStats();

  // Show notification
  alert(`Task "${taskToArchive.title}" archived. You can restore it from the Archive page.`);
}

/* ================== TASK CHECKBOX HANDLER ================== */
function toggleTaskStatus(index) {
  const tasksKey = getUserTasksKey();
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');
  
  if (tasks[index]) {
    tasks[index].status = tasks[index].status === 'completed' ? 'pending' : 'completed';
    localStorage.setItem(tasksKey, JSON.stringify(tasks));
    
    // Add completion animation class
    const taskSurface = document.querySelector(`.swipe-wrap[data-index="${index}"] .task-surface`);
    if (taskSurface) {
      taskSurface.classList.add('task-completed');
      setTimeout(() => {
        taskSurface.classList.remove('task-completed');
      }, 1000);
    }
    
    renderTasksList(tasks);
    updateDashboardStats();
  }
}

function attachSwipeHandlers(surface, archiveBg, delBg, index) {
  let startX = 0, currentX = 0, touching = false;
  const threshold = 80;

  function unify(e) { return e.changedTouches ? e.changedTouches[0] : e; }

  function onStart(e) {
    const ev = unify(e);
    startX = ev.clientX;
    currentX = 0;
    touching = true;
    surface.style.transition = 'none';

    // Reset backgrounds
    archiveBg.classList.remove('archive-active');
    delBg.classList.remove('delete-active');

    if (e.type === 'mousedown') {
      document.addEventListener('mousemove', onMove);
    }
  }

  function onMove(e) {
    if (!touching) return;
    const ev = unify(e);
    currentX = ev.clientX - startX;

    if (currentX < -20) { // Swiping left (archive)
      const tx = Math.max(currentX, -120);
      surface.style.transform = `translateX(${tx}px)`;
      const ratio = Math.min(Math.abs(tx) / threshold, 1);

      // Show archive background with animation
      archiveBg.style.opacity = ratio;
      delBg.style.opacity = 0;

      if (Math.abs(currentX) > threshold / 2) {
        archiveBg.classList.add('archive-active');
      } else {
        archiveBg.classList.remove('archive-active');
      }

    } else if (currentX > 20) { // Swiping right (delete)
      const tx = Math.min(currentX, 120);
      surface.style.transform = `translateX(${tx}px)`;
      const ratio = Math.min(Math.abs(tx) / threshold, 1);

      // Show delete background with animation
      delBg.style.opacity = ratio;
      archiveBg.style.opacity = 0;

      if (Math.abs(currentX) > threshold / 2) {
        delBg.classList.add('delete-active');
      } else {
        delBg.classList.remove('delete-active');
      }
    } else { // Very small movement
      archiveBg.style.opacity = 0;
      delBg.style.opacity = 0;
      archiveBg.classList.remove('archive-active');
      delBg.classList.remove('delete-active');
    }
  }

  function onEnd(e) {
    touching = false;
    surface.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';

    if (Math.abs(currentX) > threshold) {
      if (currentX < 0) { // Left swipe - Archive
        surface.style.transform = 'translateX(-100%)';
        setTimeout(() => archiveTask(index), 300);
      } else { // Right swipe - Delete (permanent)
        surface.style.transform = 'translateX(100%)';
        setTimeout(() => doDeleteTask(index), 300);
      }
    } else {
      surface.style.transform = '';
      archiveBg.style.opacity = 0;
      delBg.style.opacity = 0;
      archiveBg.classList.remove('archive-active');
      delBg.classList.remove('delete-active');
    }

    if (e.type === 'mouseup') {
      document.removeEventListener('mousemove', onMove);
    }
  }

  // Touch events
  surface.addEventListener('touchstart', onStart, { passive: true });
  surface.addEventListener('touchmove', onMove, { passive: true });
  surface.addEventListener('touchend', onEnd, { passive: true });

  // Mouse events
  surface.addEventListener('mousedown', onStart);
  surface.addEventListener('mouseup', onEnd);
  surface.addEventListener('mouseleave', () => {
    if (touching) onEnd({ type: 'mouseup' });
  });

  // Background click events
  archiveBg.addEventListener('click', () => {
    archiveBg.classList.add('archive-active');
    surface.style.transform = 'translateX(-100%)';
    setTimeout(() => archiveTask(index), 300);
  });

  delBg.addEventListener('click', () => {
    delBg.classList.add('delete-active');
    surface.style.transform = 'translateX(100%)';
    setTimeout(() => doDeleteTask(index), 300);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"]/g, s => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;'
  }[s]));
}

function renderTasksList(tasks) {
  tasksContainer.innerHTML = '';

  if (!tasks || !tasks.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-state-icon">📝</div>
      <h3>Welcome to a fresh start!</h3>
      <p>
        Your task list is empty and waiting for your amazing ideas.<br>
        Tap the <strong style="color: var(--accent-color);">+</strong> button below to add your first task!
      </p>
    `;

    tasksContainer.appendChild(empty);
    return;
  }

  tasks.forEach((t, idx) => {
    const wrap = document.createElement('div');
    wrap.className = 'swipe-wrap';
    wrap.dataset.index = idx;

    // Archive background (green for archive) - LEFT SIDE
    const archiveBg = document.createElement('div');
    archiveBg.className = 'archive-bg';
    archiveBg.innerHTML = '<span>📁</span>';

    // Delete background (orange for delete) - RIGHT SIDE
    const delBg = document.createElement('div');
    delBg.className = 'delete-bg';
    delBg.innerHTML = '<span>🗑</span>';

    const surface = document.createElement('div');
    surface.className = `task-surface ${t.status === 'completed' ? 'completed' : ''}`;
    surface.innerHTML = `
      <div class="task-checkbox ${t.status === 'completed' ? 'checked' : ''}" onclick="event.stopPropagation(); toggleTaskStatus(${idx})"></div>
      <div class="task-content">
        <div class="task-header">
          <strong>${escapeHtml(t.title)}</strong>
          <div class="priority-badge ${t.priority}">${t.priority}</div>
        </div>
        <p>${escapeHtml(t.desc)}</p>
        <div class="task-meta">
          <div class="task-meta-item task-category">${t.category}</div>
          <div class="task-meta-item task-status ${t.status}">${t.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</div>
          <div class="task-meta-item">${t.date} ${t.time}</div>
        </div>
      </div>`;
    
    surface.addEventListener('click', (e) => {
      if (!e.target.classList.contains('task-checkbox')) {
        openAddCard(idx, t);
      }
    });

    // Attach swipe handlers for both directions
    attachSwipeHandlers(surface, archiveBg, delBg, idx);

    wrap.appendChild(archiveBg); // Left side - Archive
    wrap.appendChild(delBg);     // Right side - Delete
    wrap.appendChild(surface);
    tasksContainer.appendChild(wrap);
  });
}

function loadTasks() {
  const tasksKey = getUserTasksKey();
  renderTasksList(JSON.parse(localStorage.getItem(tasksKey) || '[]'));
  persistReminders();
  updateDashboardStats();
}
window.loadTasks = loadTasks;

/* ================== TRASH/ARCHIVE FUNCTIONS ================== */
function loadTrashPage() {
  const trashKey = getUserTrashKey();
  const trash = JSON.parse(localStorage.getItem(trashKey) || '[]');
  const container = document.getElementById('trashContainer');

  // Update stats
  document.getElementById('trashCount').textContent = `${trash.length} tasks`;

  // Calculate storage size (approximate)
  const trashJSON = JSON.stringify(trash);
  const sizeKB = Math.round((trashJSON.length * 2) / 1024); // Approximate size in KB
  document.getElementById('trashSize').textContent = `${sizeKB} KB`;

  // Render trash items
  container.innerHTML = '';

  if (!trash || !trash.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-state-icon">📂</div>
      <h3>Archive is empty</h3>
      <p>
        Swipe tasks <strong style="color: var(--accent-color);">left</strong> to archive them.<br>
        Archived tasks are kept here for 30 days.
      </p>
    `;

    container.appendChild(empty);
    return;
  }

  // Sort by archive date (newest first)
  const sortedTrash = [...trash].sort((a, b) => {
    return new Date(b.archivedAt || 0) - new Date(a.archivedAt || 0);
  });

  sortedTrash.forEach((task, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'swipe-wrap';

    const surface = document.createElement('div');
    surface.className = 'task-surface task-archived';
    surface.innerHTML = `
      <div style="position:relative;">
        <div class="priority ${task.priority}">${task.priority}</div>
        <strong>${escapeHtml(task.title)}</strong>
        <p>${escapeHtml(task.desc)}</p>
        <div class="task-meta">
          <div class="task-meta-item task-category">${task.category}</div>
          <div class="task-meta-item task-status ${task.status}">${task.status === 'completed' ? '✅ Completed' : '⏳ Pending'}</div>
        </div>
        <small>${task.date} ${task.time}</small>
        <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
          Archived: ${task.archivedAt ? new Date(task.archivedAt).toLocaleDateString() : 'Unknown'}
        </div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 12px;">
        <button class="restore-btn" data-index="${index}" style="
          background: var(--success-color); 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 6px; 
          font-size: 14px;
          cursor: pointer;
        ">Restore</button>
        <button class="delete-permanent-btn" data-index="${index}" style="
          background: var(--danger-color); 
          color: white; 
          border: none; 
          padding: 8px 16px; 
          border-radius: 6px; 
          font-size: 14px;
          cursor: pointer;
        ">Delete</button>
      </div>
    `;

    wrap.appendChild(surface);
    container.appendChild(wrap);
  });

  // Add event listeners to buttons using event delegation
  container.addEventListener('click', (e) => {
    if (e.target.classList.contains('restore-btn')) {
      e.stopPropagation();
      const index = parseInt(e.target.dataset.index);
      restoreFromTrash(index);
    } else if (e.target.classList.contains('delete-permanent-btn')) {
      e.stopPropagation();
      const index = parseInt(e.target.dataset.index);
      deletePermanently(index);
    }
  });
}

function restoreFromTrash(index) {
  const trashKey = getUserTrashKey();
  const tasksKey = getUserTasksKey();

  const trash = JSON.parse(localStorage.getItem(trashKey) || '[]');
  const taskToRestore = trash[index];

  if (!taskToRestore) return;

  // Remove from trash
  trash.splice(index, 1);
  localStorage.setItem(trashKey, JSON.stringify(trash));

  // Add back to active tasks
  const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');

  // Remove archive properties
  delete taskToRestore.archivedAt;
  delete taskToRestore.archived;

  tasks.push(taskToRestore);
  localStorage.setItem(tasksKey, JSON.stringify(tasks));

  // Update displays
  loadTrashPage();
  loadTasks();
  persistReminders();
  scheduleAllReminders();

  alert(`Task "${taskToRestore.title}" restored successfully!`);
}

function deletePermanently(index) {
  if (!confirm('Are you sure you want to permanently delete this task? This action cannot be undone.')) {
    return;
  }

  const trashKey = getUserTrashKey();
  const trash = JSON.parse(localStorage.getItem(trashKey) || '[]');
  const taskToDelete = trash[index];

  if (!taskToDelete) return;

  // Remove from trash
  trash.splice(index, 1);
  localStorage.setItem(trashKey, JSON.stringify(trash));

  // Update display
  loadTrashPage();

  alert(`Task "${taskToDelete.title}" permanently deleted.`);
}

// Initialize trash buttons when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Restore all button
  const restoreAllBtn = document.getElementById('restoreAllBtn');
  if (restoreAllBtn) {
    restoreAllBtn.addEventListener('click', () => {
      const trashKey = getUserTrashKey();
      const trash = JSON.parse(localStorage.getItem(trashKey) || '[]');

      if (!trash.length) {
        alert('No tasks to restore.');
        return;
      }

      if (!confirm(`Restore all ${trash.length} archived tasks?`)) {
        return;
      }

      const tasksKey = getUserTasksKey();
      const tasks = JSON.parse(localStorage.getItem(tasksKey) || '[]');

      // Restore all tasks
      trash.forEach(task => {
        delete task.archivedAt;
        delete task.archived;
        tasks.push(task);
      });

      // Clear trash
      localStorage.setItem(trashKey, JSON.stringify([]));
      localStorage.setItem(tasksKey, JSON.stringify(tasks));

      // Update displays
      loadTrashPage();
      loadTasks();
      persistReminders();
      scheduleAllReminders();

      alert(`All ${trash.length} tasks restored successfully!`);
    });
  }

  // Empty trash button
  const emptyTrashBtn = document.getElementById('emptyTrashBtn');
  if (emptyTrashBtn) {
    emptyTrashBtn.addEventListener('click', () => {
      const trashKey = getUserTrashKey();
      const trash = JSON.parse(localStorage.getItem(trashKey) || '[]');

      if (!trash.length) {
        alert('Trash is already empty.');
        return;
      }

      if (!confirm(`Permanently delete all ${trash.length} archived tasks? This action cannot be undone.`)) {
        return;
      }

      // Clear trash
      localStorage.setItem(trashKey, JSON.stringify([]));

      // Update display
      loadTrashPage();

      alert(`All ${trash.length} tasks permanently deleted.`);
    });
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    hideAddCard();
    hideBackdrop();
  }
});

const rememberCk = document.getElementById('rememberMe');
const emailInput = document.getElementById('loginEmail');

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('rememberedEmail');
  if (saved) {
    emailInput.value = saved;
    rememberCk.checked = true;
  }

  // Set up password validation for register page
  setupPasswordValidation();

  // Start with light theme for auth pages
  forceLightTheme();
  setupFilters();
  updateDashboardStats();
  
  // Load initial data
  loadProfilePreview();
  loadTasks();
  startReminderTimers();
});

document.getElementById('loginBtn').addEventListener('click', () => {
  if (rememberCk.checked) {
    localStorage.setItem('rememberedEmail', emailInput.value.trim());
  } else {
    localStorage.removeItem('rememberedEmail');
  }
});

// Update back buttons for other pages to use goBack function
document.addEventListener('click', function (e) {
  // Settings page back button
  if (e.target.matches('.settings-page .back-btn')) {
    goBack();
  }
  // About page back button
  if (e.target.matches('.about-page .back-btn')) {
    goBack();
  }
  // Privacy page back button
  if (e.target.matches('.privacy-page .back-btn')) {
    goBack();
  }
  // Trash page back button
  if (e.target.matches('.trash-page .back-btn')) {
    goBack();
  }
});

// Fix for edit photo click
const editPhoto = document.querySelector('.edit-photo');
if (editPhoto) {
  editPhoto.addEventListener('click', e => {
    if (e.target.matches('.edit-photo') || e.offsetY > 130) {
      document.getElementById('editImageInputFull').click();
    }
  });
}

// Initialize global user database if not exists
if (!localStorage.getItem('tasklyUsers')) {
  localStorage.setItem('tasklyUsers', JSON.stringify([]));
}

window.openEditEmailModal = openEditEmailModal;
window.toggleTheme = toggleTheme;
window.openChangePasswordPage = openChangePasswordPage;
window.changePassword = changePassword;
window.loadEditProfile = loadEditProfile;
window.loadProfilePage = loadProfilePage;
window.goBack = goBack;
window.toggleTaskStatus = toggleTaskStatus;

/* ================== TUTORIAL SYSTEM ================== */
const tutorialOverlay = document.getElementById('tutorialOverlay');
const tutorialSteps = document.getElementById('tutorialSteps');
const tutorialProgress = document.getElementById('tutorialProgress');
const nextTutorialBtn = document.getElementById('nextTutorial');
const skipTutorialBtn = document.getElementById('skipTutorial');
const closeTutorialBtn = document.getElementById('closeTutorial');

let currentStep = 0;
const totalSteps = 5;

const tutorialData = [
  {
    title: "Add Tasks",
    description: "Tap the + button at the bottom right to add new tasks. You can set title, description, due date, time, priority, status, category, and reminders.",
    demo: `
      <div class="tutorial-demo">
        <div class="tutorial-icon">📝</div>
        <div class="tutorial-arrow">→</div>
        <div class="tutorial-icon">📅</div>
        <div class="tutorial-arrow">→</div>
        <div class="tutorial-icon">⏰</div>
        <div class="tutorial-arrow">→</div>
        <div class="tutorial-icon">💾</div>
      </div>
    `
  },
  {
    title: "Swipe to Archive",
    description: "Swipe tasks LEFT to archive them. Archived tasks are moved to the Archive page where you can restore them later.",
    demo: `
      <div class="tutorial-demo">
        <div class="tutorial-icon">📁</div>
        <div class="tutorial-arrow">←</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <div class="tutorial-icon">📝</div>
          <small style="color:var(--text-secondary);">Task</small>
        </div>
        <div class="tutorial-arrow" style="transform:rotate(180deg);">←</div>
        <div class="tutorial-icon">📂</div>
      </div>
    `
  },
  {
    title: "Swipe to Delete",
    description: "Swipe tasks RIGHT to permanently delete them. Be careful - deleted tasks cannot be recovered!",
    demo: `
      <div class="tutorial-demo">
        <div class="tutorial-icon">🗑️</div>
        <div class="tutorial-arrow">→</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <div class="tutorial-icon">📝</div>
          <small style="color:var(--text-secondary);">Task</small>
        </div>
        <div class="tutorial-arrow" style="transform:rotate(180deg);">→</div>
        <div class="tutorial-icon">❌</div>
      </div>
    `
  },
  {
    title: "Task Completion & Filters",
    description: "Click the checkbox to mark tasks as completed. Use the filter bar to sort by status, priority, and category.",
    demo: `
      <div class="tutorial-demo">
        <div class="tutorial-icon">✅</div>
        <div class="tutorial-arrow">→</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:5px;">
          <div class="tutorial-icon">📝</div>
          <small style="color:var(--text-secondary);">Task</small>
        </div>
        <div class="tutorial-arrow">→</div>
        <div class="tutorial-icon">🔍</div>
      </div>
    `
  },
  {
    title: "Access Archive & Settings",
    description: "Tap the ☰ menu button to access Archive, Settings, About, and Privacy pages. Archived tasks are kept for 30 days.",
    demo: `
      <div class="tutorial-demo">
        <div class="tutorial-icon">☰</div>
        <div class="tutorial-arrow">→</div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;">
          <div class="tutorial-icon">📂</div>
          <div class="tutorial-icon">⚙️</div>
          <div class="tutorial-icon">ℹ️</div>
          <small style="color:var(--text-secondary);">Menu</small>
        </div>
      </div>
    `
  }
];

function showTutorialStep(step) {
  currentStep = step;

  // Update step content
  tutorialSteps.innerHTML = `
    <div class="tutorial-step">
      <h3><span>${step + 1}</span> ${tutorialData[step].title}</h3>
      <p>${tutorialData[step].description}</p>
      ${tutorialData[step].demo}
    </div>
  `;

  // Update progress dots
  tutorialProgress.innerHTML = '';
  for (let i = 0; i < totalSteps; i++) {
    const dot = document.createElement('div');
    dot.className = `progress-dot ${i === step ? 'active' : ''}`;
    tutorialProgress.appendChild(dot);
  }

  // Update button text
  if (step === totalSteps - 1) {
    nextTutorialBtn.textContent = 'Finish Tutorial';
    nextTutorialBtn.className = 'tutorial-btn finish';
  } else {
    nextTutorialBtn.textContent = 'Next →';
    nextTutorialBtn.className = 'tutorial-btn next';
  }

  // Show/hide skip button
  skipTutorialBtn.style.display = step === totalSteps - 1 ? 'none' : 'block';
}

function startTutorial() {
  // Check if user has seen tutorial before
  const hasSeenTutorial = localStorage.getItem('tasklyTutorialSeen');

  if (!hasSeenTutorial) {
    // Wait a moment for dashboard to load, then show tutorial
    setTimeout(() => {
      showTutorialStep(0);
      tutorialOverlay.classList.add('show');
    }, 1000);
  }
}

function endTutorial() {
  tutorialOverlay.classList.remove('show');
  localStorage.setItem('tasklyTutorialSeen', 'true');
}

// Event listeners for tutorial
nextTutorialBtn.addEventListener('click', () => {
  if (currentStep < totalSteps - 1) {
    showTutorialStep(currentStep + 1);
  } else {
    endTutorial();
  }
});

skipTutorialBtn.addEventListener('click', endTutorial);
closeTutorialBtn.addEventListener('click', endTutorial);

// Close tutorial when clicking outside content
tutorialOverlay.addEventListener('click', (e) => {
  if (e.target === tutorialOverlay) {
    endTutorial();
  }
});