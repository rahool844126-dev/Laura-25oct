import React, { useState } from 'react';
import { Message } from '../types';
import SpeakerIcon from './icons/SpeakerIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import CheckIcon from './icons/CheckIcon';
import TtsLoadingIndicator from './TtsLoadingIndicator';
import BlurText from './BlurText';

interface ChatBubbleProps {
  message: Message;
  isLastModelMessage?: boolean;
  isSelected?: boolean;
  onSelect?: (messageId: string) => void;
  onToggleSpeak?: (message: Message) => void;
  isSpeaking?: boolean;
  isTtsLoading?: boolean;
  hasCustomBackground?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isLastModelMessage, isSelected, onSelect, onToggleSpeak, isSpeaking, isTtsLoading, hasCustomBackground }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    if (navigator.clipboard && message.parts[0].text) {
      navigator.clipboard.writeText(message.parts[0].text).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Reset icon after 2 seconds
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  const showButtons = (isLastModelMessage || isSelected) && message.parts[0].text.trim();

  if (isUser) {
    return (
      <div className="flex justify-end animate-slide-in-right">
        <div className="max-w-xs md:max-w-md px-5 py-2 bg-gray-200 text-gray-800 self-end rounded-full">
          <p className="text-base" style={{ whiteSpace: 'pre-wrap' }}>{message.parts[0].text}</p>
        </div>
      </div>
    );
  }

  const textColorClass = hasCustomBackground ? 'text-white' : 'text-gray-800';
  const textShadowStyle = hasCustomBackground ? { textShadow: '0 1px 3px rgba(0, 0, 0, 0.6)' } : {};

  return (
    <div className="flex justify-start animate-slide-in-left">
      <div 
        className="max-w-xs md:max-w-md py-3 cursor-pointer"
        onClick={() => onSelect && !isLastModelMessage && onSelect(message.id)}
      >
        <div className={`text-lg font-medium ${textColorClass}`} style={{ whiteSpace: 'pre-wrap', ...textShadowStyle }}>
          <BlurText text={message.parts[0].text} />
          {showButtons && (
            <span className="inline-flex align-middle ml-1.5 space-x-2">
              {isTtsLoading ? (
                <TtsLoadingIndicator hasCustomBackground={hasCustomBackground} />
              ) : (
                <>
                  {onToggleSpeak && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent re-triggering the select
                        onToggleSpeak(message)
                      }}
                      className="focus:outline-none"
                      aria-label={isSpeaking ? "Stop speaking" : "Speak message"}
                    >
                      <SpeakerIcon isSpeaking={isSpeaking ?? false} hasCustomBackground={hasCustomBackground} />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent re-triggering the select
                      handleCopy();
                    }}
                    className="focus:outline-none"
                    aria-label={isCopied ? "Copied" : "Copy message"}
                  >
                    {isCopied ? <CheckIcon /> : <ClipboardIcon hasCustomBackground={hasCustomBackground} />}
                  </button>
                </>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;