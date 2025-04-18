// src/components/UnderConstruction.tsx
import { FaTools } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";

import { useNavigate } from "react-router-dom";

const UnderConstruction = () => {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <div
        style={{
          position: "fixed",
          top: "1rem",
          right: "1rem",
          cursor: "pointer",
          zIndex: 1200,
        }}
        onClick={() => navigate(-1)}
      >
        <IoIosArrowForward size={24} color="black" />
      </div>
      <FaTools size={64} color="#888" />
      <h2>This feature is under construction 🚧</h2>
      <p>Please check back soon!</p>
    </div>
  );
};

export default UnderConstruction;
