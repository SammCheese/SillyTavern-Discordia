import React, { type JSX } from "react";
import ReactDOM from "react-dom";


const OpenPage = ({ children }: { children: React.ReactNode }) => {
  return (
      <div id="open-page-container" className="w-dvw h-dvh absolute z-50 top-0 start-0 flex flex-col justify-center items-center bg-opacity-90 text-white">
        {children}
      </div>
  );
};


export default OpenPage;
