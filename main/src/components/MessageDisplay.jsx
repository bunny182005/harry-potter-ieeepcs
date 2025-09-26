import React from 'react';

const MessageDisplay = ({ message }) => {
  if (!message) return null;

  const getMessageStyles = () => {
    if (message.includes('successfully') || message.includes('successful')) {
      return 'bg-green-500/20 text-green-300';
    }
    return 'bg-red-500/20 text-red-300';
  };

  return (
    <div className={`p-3 rounded-xl text-center font-medium ${getMessageStyles()}`}>
      {message}
    </div>
  );
};

export default MessageDisplay;