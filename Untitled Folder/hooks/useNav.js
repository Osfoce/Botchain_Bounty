import { useAccount } from "wagmi";
import {showToast} from "../components/UI/Toast"
import { useNavigate } from "react-router-dom";

export const useNav = () => {
  const navigate = useNavigate();
  const { address: account } = useAccount();

  const handleNavigate = (path) => {
    if (!account) {
      showToast.error("Please sign in to continue");
      return;
    }
    navigate(path);
  };
  return { handleNavigate };
};
