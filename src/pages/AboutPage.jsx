import React from 'react';
import OWSLogo from '../assets/OWS-logo.png';

const team = [
  {
    name: 'Open Workout Spots Team',
    role: 'Product & Community',
    avatar: OWSLogo,
    bio: 'We are passionate about making calisthenics and outdoor fitness accessible to everyone, everywhere. Our mission is to connect athletes, trainers, and enthusiasts through a global map of workout spots and a vibrant community.'
  },
  // Add more team members here if needed
];

export default function AboutPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 animate-fade-in-up">
      <div className=" w-full bg-green-200 rounded-3xl shadow-2xl p-8 border border-white/60 backdrop-blur-md">
        <div className="flex flex-col items-center mb-8">
          <img src={OWSLogo} alt="Open Workout Spots Logo" className="h-20 md:h-26 object-contain max-w-[100px] md:max-w-[120px] p-1 mt-2" />
          <h1 className="text-4xl font-extrabold text-darkblue mt-8 mb-4">About Open Workout Spots</h1>
          <p className="text-lg text-gray-700 text-start max-w-2xl">
            Open Workout Spots (OWS) is a community-driven platform dedicated to helping you discover, share, and review the best calisthenics and outdoor fitness locations worldwide. Whether you are a beginner or a seasoned athlete, OWS empowers you to find new places to train, connect with like-minded people, and contribute to a growing global movement.
          </p>
        </div>
        <div className="my-8 border-t border-darkblue"></div>
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-darkblue mb-4">Our Mission</h2>
          <p className="text-gray-700 text-lg md:text-lg">
            We believe that fitness should be accessible, social, and fun. Our mission is to:
          </p>
          <ul className="list-disc list-inside text-gray-700 mt-4 space-y-2 text-lg">
            <li>Map and maintain a comprehensive, up-to-date database of outdoor workout spots and calisthenics parks.</li>
            <li>Foster a supportive and inclusive community for athletes of all levels and backgrounds.</li>
            <li>Enable users to share reviews, tips, and photos to help others get the most out of every spot.</li>
            <li>Promote healthy, active lifestyles and the spirit of open, public fitness.</li>
          </ul>
        </section>
        <div className="my-8 border-t border-darkblue"></div>
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-darkblue mb-4">Contact & Contribute</h2>
          <p className="text-gray-700 text-lg md:text-lg mb-2">
            Want to get involved, suggest a feature, or report an issue? We welcome your feedback and contributions!
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-lg">
            <li>Email us: <a href="mailto:openworkoutspots@gmail.com" className="text-accent underline">openworkoutspots@gmail.com</a></li>
            <li>Contribute on GitHub: <a href="https://github.com/igarridosi/OWS" target="_blank" rel="noopener noreferrer" className="text-accent underline">github.com/igarridosi/OWS</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
}
