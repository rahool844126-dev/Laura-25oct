import React, { useState, useEffect } from 'react';

const funnyComments = [
  "वाह! क्या सवाल पूछा है, दिमाग की बत्ती जलानी पड़ेगी।",
  "रुको ज़रा, सब्र करो... सोच रही हूँ।",
  "Hmm, इसका जवाब तो देना पड़ेगा... थोड़ा स्टाइलिश अंदाज़ में।",
  "एक मिनट... गूगल नहीं कर रही, बस याद कर रही हूँ।",
  "ये तो बड़ा टेढ़ा सवाल है, पर मैं भी कहाँ सीधी हूँ!",
  "ज़रा सोचने दो, एक धमाकेदार जवाब तैयार कर रही हूँ।",
];

interface TypingIndicatorProps {
  hasCustomBackground?: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ hasCustomBackground }) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    // Select a random comment when the component mounts
    const randomIndex = Math.floor(Math.random() * funnyComments.length);
    setComment(funnyComments[randomIndex]);
  }, []);

  const textColorClass = hasCustomBackground ? 'text-white' : 'text-gray-500';
  const textShadowStyle = hasCustomBackground ? { textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' } : {};
  const dotColorClass = hasCustomBackground ? 'bg-white' : 'bg-gray-500';

  return (
    <div className="flex justify-start">
      <div className="px-4 py-3">
        <p className={`text-sm italic mb-1 ${textColorClass}`} style={textShadowStyle}>{comment}</p>
        <div className="flex items-center space-x-1">
          <span className={`w-2 h-2 rounded-full animate-bounce ${dotColorClass}`} style={{ animationDelay: '0s' }}></span>
          <span className={`w-2 h-2 rounded-full animate-bounce ${dotColorClass}`} style={{ animationDelay: '0.2s' }}></span>
          <span className={`w-2 h-2 rounded-full animate-bounce ${dotColorClass}`} style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
