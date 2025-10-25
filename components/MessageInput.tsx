import React, { useState, useEffect, useRef } from 'react';
import SendIcon from './icons/SendIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = SpeechRecognition != null;

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  hasCustomBackground?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, hasCustomBackground }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null); // SpeechRecognition instance

  useEffect(() => {
    if (!isSpeechRecognitionSupported) {
      console.warn('Speech recognition is not supported by this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'hi-IN';

    recognition.onresult = (event: any) => {
      let final_transcript = '';
      let interim_transcript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final_transcript += event.results[i][0].transcript;
        } else {
          interim_transcript += event.results[i][0].transcript;
        }
      }
      setInput(final_transcript + interim_transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const toggleListen = () => {
    if (!isSpeechRecognitionSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput(''); // Clear input before starting
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  return (
    <div className="p-3 md:p-4 sticky bottom-0">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isListening ? "हाँ हाँ, सुन रही हूँ..." : ""}
            className={`w-full px-4 py-3 pr-14 text-base rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 ${
              hasCustomBackground
                ? 'bg-white/20 border border-white/30 text-white placeholder-white/70 backdrop-blur-sm'
                : 'bg-white border border-gray-200 text-gray-700'
            }`}
            disabled={isLoading}
          />
          {isSpeechRecognitionSupported && (
            <button
              type="button"
              onClick={toggleListen}
              className="absolute inset-y-0 right-0 flex items-center pr-4 focus:outline-none"
              aria-label={isListening ? 'Stop listening' : 'Start voice input'}
            >
              <MicrophoneIcon className={`h-6 w-6 transition-colors ${
                  isListening
                    ? 'text-red-500 animate-pulse'
                    : (hasCustomBackground ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-700')
                }`} />
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-3 rounded-full text-white bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;