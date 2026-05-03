import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Package, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { loginSchema, LoginFormData } from '../../schemas/auth.schema';
import { APP_NAME } from '../../utils/constants';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const res = await authApi.login(data);
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);

      toast.success('Welcome back!');

      const from = (location.state as any)?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.role === 'CUSTOMER') {
        navigate('/customer-portal', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 bg-[#F4F5F7] dark:bg-[#080C14]">
      {/* Premium Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-400/20 blur-[100px]" />
        <div className="absolute top-[20%] right-[10%] w-[25%] h-[25%] rounded-full bg-gradient-to-br from-rose-400/10 to-orange-400/10 blur-[80px]" />
        
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
          style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} 
        />
      </div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="v2-glass p-8 md:p-12 !rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] border-white/40 dark:border-white/10">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-[#6366F1] to-[#4F46E5] flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/25 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
              <Package className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
              Welcome to <span className="text-indigo-600 dark:text-indigo-400">{APP_NAME}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed">
              Enter your credentials to access your unified logistics dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  placeholder="e.g. admin@swiftship.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs font-medium text-rose-500 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Password</label>
                <a href="#" className="text-[12px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="block w-full pl-12 pr-4 py-3.5 border border-slate-200 dark:border-slate-700/50 rounded-2xl bg-white/50 dark:bg-slate-900/40 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="mt-1 text-xs font-medium text-rose-500 ml-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="v2-btn-primary w-full h-14 !rounded-2xl text-[16px] shadow-indigo-500/30 flex items-center justify-center gap-2 group"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[13px] text-slate-500 dark:text-slate-500">
              New to the platform? <span className="text-indigo-600 dark:text-indigo-400 font-semibold cursor-pointer hover:underline">Contact system administrator</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
