import emailjs from '@emailjs/browser';

// Seed users for a realistic presentation environment
const initialUsers = [
  {
    id: 'u_seed1',
    personalEmail: 'rahul.sharma@gmail.com',
    username: 'rahul@dit.com',
    password: 'password123',
    name: 'Rahul Sharma',
    skillsTeaching: ['React', 'Node.js', 'JavaScript'],
    skillsLearning: ['Photoshop', 'UI/UX Design'],
    bio: 'Full stack developer who wants to learn creative designing and UI design patterns.',
    rating: 4.8,
    role: 'user'
  },
  {
    id: 'u_seed2',
    personalEmail: 'sneha.reddy@gmail.com',
    username: 'sneha@dit.com',
    password: 'password123',
    name: 'Sneha Reddy',
    skillsTeaching: ['UI/UX Design', 'Figma', 'Graphic Design'],
    skillsLearning: ['React', 'HTML/CSS'],
    bio: 'Product Designer looking to bridge the gap with frontend development.',
    rating: 4.9,
    role: 'user'
  },
  {
    id: 'u_seed3',
    personalEmail: 'amit.patel@gmail.com',
    username: 'amit@dit.com',
    password: 'password123',
    name: 'Amit Patel',
    skillsTeaching: ['Python', 'Data Science', 'Django'],
    skillsLearning: ['JavaScript', 'React'],
    bio: 'Data engineer wanting to learn modern web development frameworks.',
    rating: 4.5,
    role: 'user'
  },
  {
    id: 'u_seed4',
    personalEmail: 'priya.sen@gmail.com',
    username: 'priya@dit.com',
    password: 'password123',
    name: 'Priya Sen',
    skillsTeaching: ['Photoshop', 'Illustrator', 'Video Editing'],
    skillsLearning: ['UI/UX Design', 'Figma'],
    bio: 'Creative visual designer expanding into interactive design products.',
    rating: 4.7,
    role: 'user'
  },
  {
    id: 'u_seed_admin',
    personalEmail: 'admin@gmail.com',
    username: 'admin@dit.com',
    password: 'password123',
    name: 'Platform Admin',
    skillsTeaching: ['Safety', 'Moderation'],
    skillsLearning: [],
    bio: 'Platform Administrator for DIT.',
    rating: 5.0,
    role: 'admin'
  }
];

// Mocked DB helpers
const getDb = () => {
  const db = localStorage.getItem('dit_users_db');
  if (!db) {
    localStorage.setItem('dit_users_db', JSON.stringify(initialUsers));
    return initialUsers;
  }
  
  try {
    let parsed = JSON.parse(db);
    let updated = false;
    
    // Automatically migrate legacy flat 5.0 ratings to realistic decimals
    parsed = parsed.map((u, index) => {
      if ((!u.rating || u.rating === 5.0) && u.role !== 'admin') {
        // Deterministic but varied ratings between 4.5 and 4.9 so they look highly realistic
        const newRating = parseFloat((4.5 + ((index * 0.13) % 0.4)).toFixed(1));
        updated = true;
        return { ...u, rating: newRating };
      }
      return u;
    });

    // Make sure our default admin@dit.com is always injected
    if (!parsed.some(u => u.username === 'admin@dit.com')) {
      const adminUser = initialUsers.find(u => u.username === 'admin@dit.com');
      if (adminUser) {
        parsed.push(adminUser);
        updated = true;
      }
    }
    
    if (updated) {
      localStorage.setItem('dit_users_db', JSON.stringify(parsed));
    }
    return parsed;
  } catch (e) {
    localStorage.setItem('dit_users_db', JSON.stringify(initialUsers));
    return initialUsers;
  }
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
            rating: parseFloat((4.5 + Math.random() * 0.4).toFixed(1)),
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

  // Get current session user, verifying token expiry and live database status (banned/warned)
  getCurrentUser: () => {
    const sessionStr = localStorage.getItem('dit_session');
    if (sessionStr) {
      const sessionUser = JSON.parse(sessionStr);
      if (Date.now() > sessionUser.tokenExpiry) {
        localStorage.removeItem('dit_session'); // Token expired
        return null;
      }
      
      // Live database validation
      const users = getDb();
      const liveUser = users.find(u => u.username === sessionUser.username);
      if (!liveUser) {
        localStorage.removeItem('dit_session'); // User banned/deleted by admin
        return null;
      }
      
      // Return merged session with updated live flags
      return { ...sessionUser, ...liveUser };
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem('dit_session');
  },

  updateProfile: async (username, profileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const users = getDb();
        const userIndex = users.findIndex(u => u.username === username);
        
        if (userIndex !== -1) {
          // Update DB
          users[userIndex] = { ...users[userIndex], ...profileData };
          saveDb(users);

          // Update current session if it's the active user
          const sessionStr = localStorage.getItem('dit_session');
          if (sessionStr) {
            let sessionUser = JSON.parse(sessionStr);
            if (sessionUser.username === username) {
              sessionUser = { ...sessionUser, ...profileData };
              localStorage.setItem('dit_session', JSON.stringify(sessionUser));
              resolve({ success: true, user: sessionUser });
              return;
            }
          }
          resolve({ success: true, user: users[userIndex] });
        } else {
          resolve({ success: false, error: 'User not found' });
        }
      }, 500);
    });
  }
};
