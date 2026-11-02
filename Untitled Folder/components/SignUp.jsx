// SignUp.jsx
import AuthModal from "./AuthModal";
import { useState } from "react";

function SignUp() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAuthModal(true)}
        className="
          rounded-lg
          border border-[#00D6A0]
          bg-[#00D6A0]
          px-5 py-2
          text-sm font-semibold
          text-white
          shadow-[0_4px_16px_rgba(0, 214, 160,0.18)]
          transition-all duration-200
          hover:bg-[#00d6a088]
          hover:shadow-[0_6px_22px_rgba(0, 214, 160,0.28)]
          active:scale-[0.98]
        "
      >
        Sign Up
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
}

export default SignUp;