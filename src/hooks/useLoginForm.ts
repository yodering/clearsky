import { useState, ChangeEvent, FormEvent } from 'react';
import { useAuthStore } from '../store/authStore';
import { validateIdentifier } from '../utils/validation';

export const useLoginForm = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleIdentifierChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIdentifier(e.target.value);
    setError('');
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateIdentifier(identifier)) {
      setError('Please enter a valid Bluesky handle or email');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Invalid credentials. Please check your handle/email and password.');
      } else {
        setError('An error occurred. Please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    identifier,
    password,
    error,
    isLoading,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
  };
};