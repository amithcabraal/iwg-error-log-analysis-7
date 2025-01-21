import React from 'react';

const GameTest: React.FC = () => {
  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-gray-900">
      <iframe
        src="https://corsproxy.io/https://www.national-lottery.co.uk/iwgTry/loadHTML5Game?ticketId=3139517335&iwgSeoName=merge-meter"
        className="w-full h-full border-0"
        allow="fullscreen"
        title="Game Test"
      />
    </div>
  );
};

export default GameTest;