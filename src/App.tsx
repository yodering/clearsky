import { useAuthStore } from './store/authStore';
import { LandingPage } from './components/LandingPage';
import { ContentManager } from './components/ContentManager';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-sky-900">ClearSky</h1>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ContentManager />
      </main>
    </div>
  );
}

export default App;