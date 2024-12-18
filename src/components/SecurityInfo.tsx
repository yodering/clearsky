import React from 'react';
import { motion } from 'framer-motion';

export const SecurityInfo: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6">Security & Privacy Information</h2>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-lg font-semibold mb-2">How We Handle Your Login</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your credentials are never stored on our servers</li>
            <li>We use the official Bluesky API (@atproto/api) for authentication</li>
            <li>All communication happens directly between your browser and Bluesky's servers</li>
            <li>Your session is stored locally and cleared on logout</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Recommended Security Practices</h3>
          <ul className="list-disc pl-5 space-y-2">
            <li>Use an app-specific password instead of your main account password</li>
            <li>Regularly rotate your app-specific passwords</li>
            <li>Always check for HTTPS in your browser's address bar</li>
            <li>Log out when you're done using the application</li>
          </ul>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-2">Open Source Transparency</h3>
          <p className="mb-4">
            Our code is open source and can be audited. We use these trusted libraries:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>@atproto/api - Official Bluesky API client</li>
            <li>React - For building user interface</li>
            <li>Zustand - For state management</li>
          </ul>
        </section>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            💡 Tip: Generate an app-specific password from your{' '}
            <a
              href="https://bsky.app/settings/app-passwords"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-blue-600"
            >
              Bluesky Settings
            </a>
            . This is more secure than using your main password.
          </p>
        </div>
      </div>
    </motion.div>
  );
};