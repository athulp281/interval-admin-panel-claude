import { useNavigate } from "react-router";

const useGoBack = () => {
  const navigate = useNavigate();

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return goBack;
};

export default useGoBack;
