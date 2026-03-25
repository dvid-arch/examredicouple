import React from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/auth-context';

export type AuthMode = 'login' | 'register';

export function useAuthForm() {
  const router = useRouter();
  const { login, register, isLoading } = useAuth();

  const [mode, setMode] = React.useState<AuthMode>('login');
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    setMode(next);
    setErrorMsg('');
    setFullName('');
    setEmail('');
    setPassword('');
  };

  const validate = (): string | null => {
    if (mode === 'register' && !fullName.trim()) return 'Full name is required.';
    if (!email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    if (mode === 'register' && password.length < 6) return 'Password must be at least 6 characters.';
    return null;
  };

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setErrorMsg(err);
      return;
    }
    setErrorMsg('');

    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
        });
      }
      router.replace('/(tabs)');
    } catch (e: any) {
      setErrorMsg(e?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return {
    mode,
    fullName,
    email,
    password,
    errorMsg,
    isLoading,
    setFullName,
    setEmail,
    setPassword,
    setErrorMsg,
    switchMode,
    handleSubmit,
  };
}
