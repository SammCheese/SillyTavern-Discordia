import React from "react";

export const Divider = ({ width = "w-full", className = "" }) => {
  return (
    <>
      <div style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)"
    }} className={`${width} h-px my-2 ml-auto mr-auto ${className}`}></div>
    </>
  );
}
