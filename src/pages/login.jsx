import { useEffect, useState } from 'react'
import LoginForm from '../components/auth/login-form'
import pageIcon from '../assets/fluent-mdl2_page-solid.png'

// Message bubbles content for animation
const messageBubbleContents = [
  "Hello! Welcome to LinkedAI!",
  "Generate personalized messages",
  "Connect with professionals",
  "Optimize your outreach",
  "AI-powered networking",
  "Smart templates for messaging",
  "Build meaningful connections",
  "Craft perfect introductions",
  "Save time with AI assistance",
  "Personalize at scale",
  "Increase your response rate",
  "Professional communication made easy"
];

function MessageBubble({ content, position, delay }) {
  return (
    <div
      className="fixed p-3 shadow-md text-white text-sm font-medium animate-float"
      style={{
        left: `${position.x}%`,
        bottom: `-5px`, // Start just below the viewport
        animationDelay: `${delay}s`,
        animationDuration: `20s`, // Fixed duration for consistency
        opacity: 0,
        maxWidth: '200px',
        background: 'rgba(59, 130, 246, 0.75)', // More transparent blue
        borderRadius: '18px 18px 18px 4px',
        zIndex: Math.floor(Math.random() * 10),
        willChange: 'transform, opacity'
      }}
    >
      {content}
      <div className="w-2 h-2 bg-[#3b82f6] absolute -bottom-1 left-0.5 rotate-45 opacity-75"></div>
    </div>
  );
}

function LoginPage() {
  const [bubbles, setBubbles] = useState([]);
  
  // Animation setup for bubbles
  useEffect(() => {
    // Create initial set of bubbles with staggered delays
    const createInitialBubbles = () => {
      return Array.from({ length: 15 }, (_, i) => ({
        id: `initial-${i}`,
        content: messageBubbleContents[Math.floor(Math.random() * messageBubbleContents.length)],
        position: { 
          x: 2 + Math.random() * 96,
        },
        // Stagger the initial delays to create a continuous effect
        delay: (i / 15) * 15
      }));
    };

    // Create a new bubble
    const createNewBubble = () => ({
      id: `bubble-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      content: messageBubbleContents[Math.floor(Math.random() * messageBubbleContents.length)],
      position: { 
        x: 2 + Math.random() * 96,
      },
      delay: 0
    });
    
    // Set initial bubbles
    setBubbles(createInitialBubbles());
    
    // Add new bubbles at a consistent rate
    const addBubbleAtInterval = () => {
      setBubbles(prev => {
        // Keep only the most recent 30 bubbles to reduce density
        const filtered = prev.slice(-29);
        return [...filtered, createNewBubble()];
      });
    };
    
    // Set up continuous bubble addition at fixed interval
    const intervalTime = 1200; // Add a bubble every 1.2 seconds for less frequency
    const interval = setInterval(addBubbleAtInterval, intervalTime);
    
    // Clean up on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col justify-center overflow-hidden relative">
      {/* Animated bubbles */}
      {bubbles.map(bubble => (
        <div 
          key={bubble.id} 
          id={bubble.id}
        >
          <MessageBubble
            content={bubble.content}
            position={bubble.position}
            delay={bubble.delay}
          />
        </div>
      ))}
      
      <div className="container mx-auto px-4 py-16 z-10 relative">
        <div className="flex flex-col items-center">
          {/* Logo and title container */}
          <div className="flex items-center justify-center mb-6">
            {/* Document Icon */}
            <img 
              src={pageIcon} 
              alt="Document icon" 
              className="w-16 h-16 mr-4 object-contain"
            />
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-blue-800">LinkedAI</h1>
              <p className="text-lg text-blue-600">Sign in to access your AI solutions</p>
            </div>
          </div>
        </div>
        
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <LoginForm />
          </div>
          
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>Use your email and password to sign in or create a new account.</p>
            <p>The auth token will be stored in your browser automatically.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage 