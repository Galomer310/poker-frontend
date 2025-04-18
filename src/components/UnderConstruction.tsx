import { FaTools } from "react-icons/fa";
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from "react-router-dom";

const UnderConstruction = () => {
  const nav = useNavigate();

  return (
    <div className="under-wrapper">
      {/* back arrow */}
      <div className="back-btn" onClick={() => nav(-1)}>
        <IoIosArrowForward size={24} color="black" />
      </div>

      <FaTools size={64} color="#888" />
      <h2>This feature is under construction 🚧</h2>
      <p>Please check back soon!</p>
    </div>
  );
};

export default UnderConstruction;
