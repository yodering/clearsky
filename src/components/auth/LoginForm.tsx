import React from 'react';
import { motion } from 'framer-motion';
import { useLoginForm } from '../../hooks/useLoginForm';
import { InputField } from '../ui/InputField';
import { ErrorMessage } from '../ui/ErrorMessage';

export const LoginForm: React.FC = () => {
  const {
    identifier,
    password,
    error,
    isLoading,
    handleIdentifierChange,
    handlePasswordChange,
    handleSubmit,
  } = useLoginForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        label="Handle or Email"
        type="text"
        value={identifier}
        onChange={handleIdentifierChange}
        placeholder="username.bsky.social"
        autoComplete="username"
        required
        pattern="^[a-zA-Z0-9_.]+(@[a-zA-Z0-9]+\.[a-zA-Z0-9]+)?$"
        title="Enter a valid Bluesky handle or email"
      />
      <InputField
        label="App Password"
        type="password"
        value={password}
        onChange={handlePasswordChange}
        placeholder="Enter your app password"
        autoComplete="current-password"
        required
        minLength={8}
      />
      {error && <ErrorMessage message={error} />}
      <div className="mt-2 text-xs text-gray-500">
        <p>⚠️ For enhanced security, please use an app-specific password.</p>
        <a
          href="https://bsky.app/settings/app-passwords"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 underline"
        >
          Generate an app password →
        </a>
      </div>
      <motion.button
        type="submit"
        className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isLoading}
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </motion.button>
    </form>
  );
};