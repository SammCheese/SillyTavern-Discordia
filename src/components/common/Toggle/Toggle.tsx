import React from "react";

const Toggle = ({ isOn, handleToggle, onColor = "#06D6A0" }: { isOn: boolean; handleToggle: () => void; onColor?: string }) => {

  return (
    <div
      onClick={handleToggle}
      style={{
        cursor: "pointer",
        width: "50px",
        height: "25px",
        borderRadius: "15px",
        backgroundColor: isOn ? onColor : "#ccc",
        position: "relative",
        transition: "background-color 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "2.5px",
          left: isOn ? "27.5px" : "2.5px",
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
          boxShadow: "0 0 2px rgba(0, 0, 0, 0.2)",
        }}
      ></div>
    </div>
  );
};

export default Toggle;
