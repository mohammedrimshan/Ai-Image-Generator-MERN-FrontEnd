import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'react-hot-toast';
import { setUser } from '../redux/slice/authSlice';

const OTPVerification = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const email = location.state?.email;

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Handle countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3008/auth/login/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        // Update Redux store with user data
        dispatch(setUser(data.user));
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'OTP verification failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendDisabled) return;
    
    setResendDisabled(true);
    try {
      const response = await fetch('http://localhost:3008/auth/login/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      
      if (response.ok) {
        toast.success('New OTP sent successfully');
        setCountdown(30); // Start 30-second countdown
      } else {
        toast.error(data.message || 'Failed to resend OTP');
        setResendDisabled(false);
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
      setResendDisabled(false);
    }
  };

  // If no email in state, return null (useEffect will handle redirect)
  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md p-8 space-y-6 bg-card rounded-lg shadow-lg"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-center">OTP Verification</h2>
        <p className="text-center text-muted-foreground">
          Please enter the OTP sent to {email}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter the OTP sent to your email"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
              maxLength={6}
              className="text-center text-lg tracking-wider"
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </Button>
        </form>
        <Button 
          variant="ghost" 
          onClick={handleResendOTP} 
          className="w-full mt-4"
          disabled={resendDisabled}
        >
          {resendDisabled 
            ? `Resend OTP (${countdown}s)` 
            : 'Resend OTP'}
        </Button>
      </motion.div>
    </div>
  );
};

export default OTPVerification;