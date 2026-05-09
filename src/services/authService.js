import emailjs from '@emailjs/browser';

// Mocked DB helpers
const getDb = () => {
  const db = localStorage.getItem('dit_users_db');
  return db ? JSON.parse(db) : [];
};

const saveDb = (users) => {
  localStorage.setItem('dit_users_db', JSON.stringify(users));
};

// Token duration: 1 hour for demo purposes
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export const authService = {
  // Send OTP for Signup
  sendOTP: async (email) => {
    try {
      // Check if email already registered
      const users = getDb();
      if (users.find(u => u.personalEmail === email)) {
        throw new Error('Email is already registered. Please login.');
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('dit_pending_otp', otp);
      sessionStorage.setItem('dit_pending_email', email);

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || serviceId === 'your_service_id_here') {
        console.warn('EmailJS keys not found in .env! Falling back to mock OTP: 123456');
        sessionStorage.setItem('dit_pending_otp', '123456');
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
      }

      const templateParams = { to_email: email, otp: otp };
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('OTP Error:', error);
      throw new Error(error.message || 'Failed to send OTP email.');
    }
  },

  // Verify OTP and Complete Signup
  verifySignup: async (email, otp, username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedOtp = sessionStorage.getItem('dit_pending_otp');
        const storedEmail = sessionStorage.getItem('dit_pending_email');

        if (otp === storedOtp && email === storedEmail) {
          const users = getDb();
          
          // Ensure username ends with @dit.com
          const ditUsername = username.includes('@dit.com') ? username : `${username}@dit.com`;

          if (users.find(u => u.username === ditUsername)) {
            return reject(new Error('Username already taken.'));
          }

          const newUser = {
            id: `u_${Date.now()}`,
            personalEmail: email,
            username: ditUsername,
            password: password, // Stored in plain text ONLY for MVP simulation
            name: ditUsername.split('@')[0],
            skillsTeaching: [],
            skillsLearning: [],
            bio: 'Hi, I am new to DIT!',
            rating: 5.0,
            role: ditUsername.includes('admin') ? 'admin' : 'user'
          };

          users.push(newUser);
          saveDb(users);

          sessionStorage.removeItem('dit_pending_otp');
          sessionStorage.removeItem('dit_pending_email');

          // Log them in immediately after signup
          const sessionUser = { ...newUser, tokenExpiry: Date.now() + TOKEN_EXPIRY_MS };
          delete sessionUser.password; // Don't keep password in active session
          localStorage.setItem('dit_session', JSON.stringify(sessionUser));
          
          resolve({ success: true, user: sessionUser });
        } else {
          reject(new Error('Invalid or expired OTP'));
        }
      }, 800);
    });
  },

  // Send OTP for Forgot Password using username
  sendForgotPasswordOTP: async (username) => {
    try {
      const users = getDb();
      const ditUsername = username.includes('@dit.com') ? username : `${username}@dit.com`;
      const user = users.find(u => u.username === ditUsername);

      if (!user) {
        throw new Error('No account found with this username.');
      }

      const email = user.personalEmail;
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      sessionStorage.setItem('dit_pending_otp', otp);
      sessionStorage.setItem('dit_reset_username', ditUsername);

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      if (!serviceId || serviceId === 'your_service_id_here') {
        console.warn('EmailJS keys not found in .env! Falling back to mock OTP: 123456');
        sessionStorage.setItem('dit_pending_otp', '123456');
        return new Promise(resolve => setTimeout(() => resolve({ success: true, email }), 1000));
      }

      const templateParams = { to_email: email, otp: otp };
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      return { success: true, message: 'OTP sent successfully', email };
    } catch (error) {
      console.error('OTP Error:', error);
      throw new Error(error.message || 'Failed to send OTP email.');
    }
  },

  // Reset Password
  resetPassword: async (username, otp, newPassword) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedOtp = sessionStorage.getItem('dit_pending_otp');
        const storedUsername = sessionStorage.getItem('dit_reset_username');
        const ditUsername = username.includes('@dit.com') ? username : `${username}@dit.com`;

        if (otp === storedOtp && ditUsername === storedUsername) {
          const users = getDb();
          const userIndex = users.findIndex(u => u.username === ditUsername);
          
          if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            saveDb(users);
            sessionStorage.removeItem('dit_pending_otp');
            sessionStorage.removeItem('dit_reset_username');
            resolve({ success: true, message: 'Password reset successful!' });
          } else {
            reject(new Error('User not found.'));
          }
        } else {
          reject(new Error('Invalid or expired OTP.'));
        }
      }, 800);
    });
  },

  // Login with Username and Password
  loginWithPassword: async (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getDb();
        const ditUsername = username.includes('@dit.com') ? username : `${username}@dit.com`;
        
        const user = users.find(u => u.username === ditUsername && u.password === password);

        if (user) {
          const sessionUser = { ...user, tokenExpiry: Date.now() + TOKEN_EXPIRY_MS };
          delete sessionUser.password;
          localStorage.setItem('dit_session', JSON.stringify(sessionUser));
          resolve({ success: true, user: sessionUser });
        } else {
          reject(new Error('Invalid username or password'));
        }
      }, 800);
    });
  },

  // Get current session user, verifying token expiry
  getCurrentUser: () => {
    const sessionStr = localStorage.getItem('dit_session');
    if (sessionStr) {
      const sessionUser = JSON.parse(sessionStr);
      if (Date.now() > sessionUser.tokenExpiry) {
        localStorage.removeItem('dit_session'); // Token expired
        return null;
      }
      return sessionUser;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem('dit_session');
  }
};
