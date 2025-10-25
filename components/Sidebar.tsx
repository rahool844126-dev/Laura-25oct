import React from 'react';
import { Background, Conversation } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onBackgroundChange: (background: Background) => void;
  onNewChat: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
}

const colorOptions = ['#FFFFFF', '#F5F5F4', '#000000'];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onBackgroundChange, onNewChat, conversations, activeConversationId, onSelectConversation, onDeleteConversation }) => {

  const handleNewChatClick = () => {
    onNewChat();
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-full bg-white w-64 md:w-80 shadow-xl z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Settings</h2>
            <button onClick={onClose} className="p-2 -mr-2" aria-label="Close menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 p-4 space-y-6 overflow-y-auto">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Chat History</h3>
               <button
                  onClick={handleNewChatClick}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-blue-600 font-semibold bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>New Chat</span>
                </button>
              <div className="mt-4 space-y-1">
                {conversations.length > 0 ? (
                  conversations.map(conv => (
                    <div key={conv.id} className="flex items-center group">
                      <button
                        onClick={() => onSelectConversation(conv.id)}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors truncate ${
                          conv.id === activeConversationId
                            ? 'bg-blue-100 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {conv.title}
                      </button>
                      {conv.id !== activeConversationId && (
                        <button
                          onClick={() => onDeleteConversation(conv.id)}
                          className="ml-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete conversation"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 mt-4 text-center">No history yet.</p>
                )}
              </div>
            </div>
             <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Chat Background</h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {colorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => onBackgroundChange({ type: 'color', value: color })}
                    className="w-full h-10 rounded border border-gray-200"
                    style={{ backgroundColor: color }}
                    aria-label={`Set background color to ${color}`}
                  />
                ))}
                <button
                    onClick={() => onBackgroundChange({ type: 'glass', value: 'glass' })}
                    className="w-full h-10 rounded border border-gray-200 flex items-center justify-center bg-gradient-to-br from-purple-400 via-blue-400 to-indigo-500"
                    aria-label="Set glass design background"
                >
                    <span className="text-white text-xs font-semibold" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.4)'}}>Glass</span>
                </button>
              </div>
               <button
                onClick={() => onBackgroundChange({ type: 'default', value: '' })}
                className="w-full text-center mt-2 px-3 py-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md transition-colors"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;