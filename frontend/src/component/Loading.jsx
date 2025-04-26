import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="text-center">
        <div className="loader mb-4 w-16 h-16 border-4 border-white border-dashed rounded-full animate-spin mx-auto"></div>
        <p className="text-white text-xl font-semibold tracking-widest">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default Loading;
