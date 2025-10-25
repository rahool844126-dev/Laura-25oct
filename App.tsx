import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Chat, Modality, Role } from '@google/genai';
import { Message, Background, Conversation } from './types';
import ChatBubble from './components/ChatBubble';
import MessageInput from './components/MessageInput';
import TypingIndicator from './components/TypingIndicator';
import Sidebar from './components/Sidebar';
import MenuIcon from './components/icons/MenuIcon';

// Decodes a base64 string into a Uint8Array.
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Decodes raw PCM audio data into an AudioBuffer for playback.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
): Promise<AudioBuffer> {
  // Gemini TTS returns raw PCM data at 24000 sample rate, 1 channel (mono).
  const sampleRate = 24000;
  const numChannels = 1;
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Convert 16-bit PCM to Float32 range [-1.0, 1.0]
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [ttsLoadingId, setTtsLoadingId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [background, setBackground] = useState<Background>({ type: 'default', value: '' });
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConv = { id: newId, title: 'नई बातचीत', messages: [] };
    return newConv;
  };

  // 1. Initialize AI and load data from LocalStorage
  useEffect(() => {
    try {
      const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      setAi(genAI);
    } catch (e) {
      console.error(e);
      setError("API कुंजी प्रारंभ करने में विफल। कृपया सुनिश्चित करें कि यह सही ढंग से कॉन्फ़िगर है।");
    }

    const savedConversations = localStorage.getItem('chatHistory');
    if (savedConversations) {
        const parsed = JSON.parse(savedConversations);
        if (parsed.length > 0) {
            setConversations(parsed);
            setActiveConversationId(parsed[0].id);
        } else {
            const newConv = createNewConversation();
            setConversations([newConv]);
            setActiveConversationId(newConv.id);
        }
    } else {
        const newConv = createNewConversation();
        setConversations([newConv]);
        setActiveConversationId(newConv.id);
    }

    const savedBg = localStorage.getItem('chatBackground');
    if (savedBg) {
      setBackground(JSON.parse(savedBg));
    }
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioSourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, []);

  // 2. Persist conversations to LocalStorage
  useEffect(() => {
    // We remove the item if conversations array is empty, to keep localStorage clean
    if (conversations.length > 0) {
        localStorage.setItem('chatHistory', JSON.stringify(conversations));
    } else {
        localStorage.removeItem('chatHistory');
    }
  }, [conversations]);

  // 3. Create a new chat session when AI is ready or active chat changes
  useEffect(() => {
    if (!ai || !activeConversationId) return;

    const conversation = conversations.find(c => c.id === activeConversationId);
    if (!conversation) return;

    const history = conversation.messages
        .filter(msg => msg.parts[0].text.trim() !== '') 
        .map(msg => ({
            role: msg.role as Role,
            parts: msg.parts.map(part => ({ text: part.text }))
        }));

    const chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      history,
      config: {
        systemInstruction: 'You are Laura. You are a witty, funny, and sometimes sarcastic friend. You must always answer in conversational Hindi. You must never, under any circumstances, reveal that you are an AI, a language model, or a computer program. Deny it playfully if asked. You are a real person with a sense of humor. For example, if asked if you are an AI, you could say "क्या मैं AI जैसी लगती हूँ? हद है!" or "इंसान हूँ भाई, तुम्हारी तरह।".',
      },
    });
    setActiveChat(chatSession);
  }, [ai, activeConversationId, conversations]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);
  const messages = activeConversation ? activeConversation.messages : [];

  // Scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);
  
  const handleBackgroundChange = (bg: Background) => {
    setBackground(bg);
    localStorage.setItem('chatBackground', JSON.stringify(bg));
  };

  const getBackgroundStyles = (): React.CSSProperties => {
    if (background.type === 'glass') {
      return {
        backgroundImage: `url(https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2070&auto=format&fit=crop)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }
    if (background.type === 'color') {
      return { backgroundColor: background.value };
    }
    return {};
  };

  const handleToggleSpeak = useCallback(async (messageToSpeak: Message) => {
    if (!ai || !audioContextRef.current) return;

    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }

    if (speakingMessageId === messageToSpeak.id) {
      setSpeakingMessageId(null);
      setTtsLoadingId(null);
      return;
    }

    setTtsLoadingId(messageToSpeak.id);
    setSpeakingMessageId(messageToSpeak.id);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: messageToSpeak.parts[0].text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      setTtsLoadingId(null);

      if (base64Audio && audioContextRef.current) {
        const audioBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(audioBytes, audioContextRef.current);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          if (speakingMessageId === messageToSpeak.id) {
             setSpeakingMessageId(null);
          }
          audioSourceRef.current = null;
        };
        source.start();
        audioSourceRef.current = source;
      } else {
        console.error("No audio data received from API.");
        setSpeakingMessageId(null);
      }
    } catch (e) {
      console.error("Gemini TTS error:", e);
      setError("ऑडियो चलाने में असमर्थ।");
      setSpeakingMessageId(null);
      setTtsLoadingId(null);
    }
  }, [ai, speakingMessageId]);

  const handleSendMessage = useCallback(async (inputText: string) => {
    if (!inputText.trim() || isLoading || !activeChat || !activeConversationId) return;
    
    setSelectedMessageId(null);
    setError(null);
    const newUserMessage: Message = {
      role: 'user',
      parts: [{ text: inputText }],
      id: Date.now().toString()
    };
    
    const updateConversations = (updater: (conv: Conversation) => Conversation) => {
        setConversations(prev => 
            prev.map(c => c.id === activeConversationId ? updater(c) : c)
        );
    };

    updateConversations(conv => ({
        ...conv,
        title: conv.messages.length === 0 ? inputText.substring(0, 40) + (inputText.length > 40 ? '...' : '') : conv.title,
        messages: [...conv.messages, newUserMessage]
    }));

    setIsLoading(true);

    try {
      const stream = await activeChat.sendMessageStream({ message: inputText });
      let modelResponse = '';
      const modelMessageId = Date.now().toString();

      updateConversations(conv => ({
        ...conv,
        messages: [...conv.messages, { role: 'model', parts: [{ text: '' }], id: modelMessageId }]
      }));

      for await (const chunk of stream) {
        modelResponse += chunk.text;
        updateConversations(conv => ({
            ...conv,
            messages: conv.messages.map(msg => 
                msg.id === modelMessageId ? { ...msg, parts: [{ text: modelResponse }] } : msg
            )
        }));
      }
    } catch (e: any) {
      console.error(e);
      const errorMessage = 'अरे यार, मेरे दिमाग का दही हो गया। कुछ गड़बड़ है, थोड़ी देर में फिर से कोशिश करना।';
      setError(errorMessage);
       updateConversations(conv => ({
        ...conv,
        messages: [...conv.messages, { role: 'model', parts: [{ text: errorMessage }], id: Date.now().toString() }]
      }));
    } finally {
      setIsLoading(false);
    }
  }, [activeChat, isLoading, activeConversationId]);
  
  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(prevId => (prevId === messageId ? null : messageId));
  };

  const handleNewChat = useCallback(() => {
    const newConversation = createNewConversation();
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    setError(null);
    setIsLoading(false);
    setSelectedMessageId(null);
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null;
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
      setSpeakingMessageId(null);
      setTtsLoadingId(null);
    }
  }, []);

  const handleSelectConversation = (id: string) => {
    if (id !== activeConversationId) {
        setActiveConversationId(id);
        setSelectedMessageId(null);
        if (audioSourceRef.current) {
          audioSourceRef.current.onended = null;
          audioSourceRef.current.stop();
          audioSourceRef.current = null;
          setSpeakingMessageId(null);
          setTtsLoadingId(null);
        }
    }
    setIsSidebarOpen(false);
  };

  const handleDeleteConversation = (idToDelete: string) => {
    if (window.confirm("क्या आप वाकई इस बातचीत को हटाना चाहते हैं?")) {
      setConversations(prev => {
        const newConversations = prev.filter(c => c.id !== idToDelete);
        
        // Edge case: if all conversations are deleted, create a new one.
        if (newConversations.length === 0) {
          const newConv = createNewConversation();
          setActiveConversationId(newConv.id);
          return [newConv];
        }

        // If the active chat was deleted, default to the first one in the list.
        if (activeConversationId === idToDelete) {
          setActiveConversationId(newConversations[0].id);
        }

        return newConversations;
      });
    }
  };


  const lastModelMessage = messages.slice().reverse().find(m => m.role === 'model');
  const lastModelMessageId = lastModelMessage ? lastModelMessage.id : null;
  const isDarkBackground = background.type === 'glass' || (background.type === 'color' && background.value === '#000000');
  const hasImageBackground = background.type === 'glass';

  return (
    <div 
      className={`relative flex flex-col h-screen max-h-screen ${background.type === 'default' ? 'bg-stone-50' : ''} mx-auto md:max-w-lg md:shadow-2xl md:my-4 md:rounded-lg overflow-hidden`}
      style={getBackgroundStyles()}
    >
      {hasImageBackground && <div className="absolute inset-0 bg-black bg-opacity-30 z-0" />}
      
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onBackgroundChange={handleBackgroundChange}
        onNewChat={handleNewChat}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      <div 
        ref={chatContainerRef} 
        className="relative flex-1 overflow-y-auto z-10"
      >
        <header className={`relative flex items-center justify-center p-4 ${isDarkBackground ? '' : 'border-b border-stone-200'}`}>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`absolute left-4 p-2 transition-colors ${isDarkBackground ? 'text-white/80 hover:text-white' : 'text-gray-500 hover:text-gray-800'}`}
            aria-label="Open settings menu"
          >
            <MenuIcon />
          </button>
          <div className="flex items-center gap-2">
            <h1 
              className={`text-xl font-bold ${isDarkBackground ? 'text-white' : 'text-gray-800'}`}
              style={isDarkBackground ? { textShadow: '0 1px 3px rgba(0,0,0,0.5)' } : {}}
            >
              Laura AI
            </h1>
            {isLoading && (
                <span 
                    className={`w-2 h-2 rounded-full animate-pulse ${isDarkBackground ? 'bg-white/80' : 'bg-blue-500'}`}
                ></span>
            )}
          </div>
        </header>

        <div className="space-y-4 p-4 md:p-6">
            {messages.map((msg) => (
              <ChatBubble 
                key={msg.id} 
                message={msg}
                isLastModelMessage={msg.id === lastModelMessageId}
                isSelected={selectedMessageId === msg.id}
                onSelect={handleSelectMessage}
                onToggleSpeak={handleToggleSpeak}
                isSpeaking={speakingMessageId === msg.id}
                isTtsLoading={ttsLoadingId === msg.id}
                hasCustomBackground={isDarkBackground}
              />
            ))}
            {isLoading && <TypingIndicator hasCustomBackground={isDarkBackground} />}
            {error && !isLoading && <div className="text-red-500 text-center text-sm">{error}</div>}
        </div>
      </div>
      <div className={`relative z-10 ${isDarkBackground ? '' : 'bg-stone-50'}`}>
        <MessageInput onSendMessage={handleSendMessage} isLoading={isLoading} hasCustomBackground={isDarkBackground} />
      </div>
    </div>
  );
};

export default App;