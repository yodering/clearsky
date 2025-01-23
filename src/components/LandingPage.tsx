import { useState } from "react";
import { LoginModal } from "./LoginModal";
import { Trash2, Heart, Repeat2, Search, Zap, Lock } from "lucide-react";

export const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const features = [
    {
      icon: <Trash2 className="w-10 h-10 text-red-500 mb-4" />,
      title: "Mass Post Delete",
      description: "Delete multiple posts with a single click. Experience simple bulk post deletion.",
    },
    {
      icon: <Heart className="w-10 h-10 text-pink-500 mb-4" />,
      title: "Manage Likes",
      description: "Coming Soon!",
    },
    {
      icon: <Repeat2 className="w-10 h-10 text-green-500 mb-4" />,
      title: "Repost Control",
      description: "Coming Soon!",
    },
    {
      icon: <Search className="w-10 h-10 text-blue-500 mb-4" />,
      title: "Smart Filtering",
      description: "Filter by date, content, and media type. Find exactly what you want to manage.",
    },
    {
      icon: <Zap className="w-10 h-10 text-yellow-500 mb-4" />,
      title: "Batch Actions",
      description: "Select multiple items and perform actions in bulk. Save time with efficient content management.",
    },
    {
      icon: <Lock className="w-10 h-10 text-purple-500 mb-4" />,
      title: "Secure & Private",
      description: "Your data stays private with secure authentication and no storage of credentials.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-400 to-blue-500">
      <div className="w-full max-w-4xl px-4 py-8">
        <div className="bg-white/80 backdrop-blur-md shadow-xl rounded-lg p-6">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-sky-900 mb-4">ClearSky</h1>
            <p className="text-xl text-sky-700 max-w-2xl mx-auto">
              A powerful tool for managing your Bluesky content. Clean up your timeline with ease.
            </p>
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setIsLoginOpen(true)}
              className="px-8 py-2 bg-sky-600 text-white font-semibold rounded-full shadow-lg hover:bg-sky-700 transform transition duration-300 hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow hover:shadow-lg transition duration-300"
            >
              <div className="flex items-center justify-center mb-4">{feature.icon}</div>
              <h2 className="text-xl text-sky-900 font-semibold">{feature.title}</h2>
              <p className="text-sky-700 mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};
