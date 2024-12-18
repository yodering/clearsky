import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { LoginForm } from './auth/LoginForm';
import { SecurityInfo } from './SecurityInfo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  // Reset security info state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setShowSecurityInfo(false);
    }
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${
                  showSecurityInfo ? 'max-w-3xl' : 'max-w-md'
                } transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all`}
              >
                {/* Conditionally Render Content */}
                {showSecurityInfo ? (
                  <>
                    <SecurityInfo />
                    <button
                      onClick={() => setShowSecurityInfo(false)}
                      className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                    >
                      ← Back to Login
                    </button>
                  </>
                ) : (
                  <>
                    <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900 mb-4">
                      Login with Bluesky
                    </Dialog.Title>
                    <LoginForm />
                    <button
                      onClick={() => setShowSecurityInfo(true)}
                      className="mt-4 text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      How is my login information handled?
                    </button>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
