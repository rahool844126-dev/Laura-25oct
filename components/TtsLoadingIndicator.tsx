import React, { useState, useEffect } from 'react';

const funnyComments = [
  "गला साफ़ कर रही हूँ, एक सेकंड...",
  "आवाज़ को थोड़ा मक्खन जैसा बना रही हूँ।",
  "बोलने से पहले थोड़ा वार्म-अप तो बनता है!",
  "सांस तो लेने दो, फिर बोलती हूँ।",
  "Hmm, इसे कैसे बोला जाए... रुको बताती हूँ।",
];

interface TtsLoadingIndicatorProps {
  hasCustomBackground?: boolean;
}

const TtsLoadingIndicator: React.FC<TtsLoadingIndicatorProps> = ({ hasCustomBackground }) => {
  const [comment, setComment] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * funnyComments.length);
    setComment(funnyComments[randomIndex]);
  }, []);

  const textColorClass = hasCustomBackground ? 'text-white' : 'text-gray-500';
  const textShadowStyle = hasCustomBackground ? { textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)' } : {};
  const dotColorClass = hasCustomBackground ? 'bg-white' : 'bg-gray-400';

  return (
    <div className="inline-flex items-center text-left">
      <p className={`text-xs italic mr-2 ${textColorClass}`} style={textShadowStyle}>{comment}</p>
        <div className="flex items-center space-x-1">
          <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${dotColorClass}`} style={{ animationDelay: '0s' }}></span>
          <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${dotColorClass}`} style={{ animationDelay: '0.1s' }}></span>
          <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${dotColorClass}`} style={{ animationDelay: '0.2s' }}></span>
        </div>
    </div>
  );
};

export default TtsLoadingIndicator;
