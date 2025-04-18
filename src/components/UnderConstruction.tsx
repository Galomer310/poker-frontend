// src/components/UnderConstruction.tsx
import { FaTools } from "react-icons/fa";

const UnderConstruction = () => {
  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <FaTools size={64} color="#888" />
      <h2>This feature is under construction 🚧</h2>
      <p>Please check back soon!</p>
    </div>
  );
};

export default UnderConstruction;
