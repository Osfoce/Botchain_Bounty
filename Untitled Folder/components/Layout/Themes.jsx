import { FiMoon, FiSun } from "react-icons/fi";

export default function Theme({ dark, setDark }) {
  return (
    <button
      onClick={() => setDark((prev) => !prev)}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={`
        flex h-10 w-10 items-center justify-center
        rounded-full border
        transition-all duration-300 ease-out
        ${
          dark
            ? "border-[#00D6A0]/30 bg-[#121212] text-[#00D6A0] shadow-[0_0_18px_rgba(212,175,55,0.12)] hover:bg-[#1a1a1a]"
            : "border-black/10 bg-white text-[#00D6A0] shadow-[0_4px_15px_rgba(0,0,0,0.06)] hover:bg-[#faf9f4]"
        }
      `}
    >
      {dark ? (
        <FiSun className="text-lg transition-transform duration-300" />
      ) : (
        <FiMoon className="text-lg transition-transform duration-300" />
      )}
    </button>
  );
}