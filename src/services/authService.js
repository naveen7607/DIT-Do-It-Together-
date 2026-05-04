import emailjs from '@emailjs/browser';

// Mocked Auth Service for DIT
// Note: In a production app, OTP generation and verification should happen securely on the backend.
// Since we are building an MVP without a backend, we securely generate the OTP here and store it in sessionStorage.

export const authService = {
  // Send Real OTP via EmailJS
  sendOTP: async (email) => {
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP and email in sessionStorage for verification later
      sessionStorage.setItem('dit_pending_otp', otp);
      sessionStorage.setItem('dit_pending_email', email);

      const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      // If keys are missing, fallback to mock behavior (so it doesn't break if user hasn't set keys yet)
      if (!serviceId || serviceId === 'your_service_id_here') {
        console.warn('EmailJS keys not found in .env! Falling back to mock OTP: 123456');
        sessionStorage.setItem('dit_pending_otp', '123456');
        return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
      }

      const templateParams = {
        to_email: email,
        otp: otp
      };

      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      return { success: true, message: 'OTP sent successfully' };

    } catch (error) {
      console.error('EmailJS Error:', error);
      throw new Error('Failed to send OTP email.');
    }
  },

  // Verify OTP
  verifyOTP: async (email, otp) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const storedOtp = sessionStorage.getItem('dit_pending_otp');
        const storedEmail = sessionStorage.getItem('dit_pending_email');

        if (otp === storedOtp && email === storedEmail) {
          // Clear session storage
          sessionStorage.removeItem('dit_pending_otp');
          sessionStorage.removeItem('dit_pending_email');

          const mockUser = {
            id: 'u1',
            email,
            name: email.split('@')[0],
            skillsTeaching: ['React', 'JavaScript'],
            skillsLearning: ['UI/UX', 'Python'],
            bio: 'I love teaching frontend dev.',
            rating: 4.8,
            role: email.includes('admin') ? 'admin' : 'user' // Simple mock admin logic
          };
          
          localStorage.setItem('dit_user', JSON.stringify(mockUser));
          resolve({ success: true, user: mockUser });
        } else {
          reject(new Error('Invalid or expired OTP'));
        }
      }, 800);
    });
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('dit_user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem('dit_user');
  }
};
