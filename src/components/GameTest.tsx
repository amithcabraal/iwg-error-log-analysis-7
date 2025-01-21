import React from 'react';

const GameTest: React.FC = () => {
  return (
    <div className="w-full h-[calc(100vh-4rem)] bg-gray-900">
      <iframe
        src="https://dev.instantrgs.com/irgs/QA/allwyn/"
        className="w-full h-full border-0"
        allow="fullscreen"
        title="Game Test"
      />
    </div>
  );
};

export default GameTest;
