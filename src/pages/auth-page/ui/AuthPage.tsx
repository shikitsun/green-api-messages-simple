import { useNavigate } from "react-router-dom";
import { AuthForm } from "../../../features/auth-api/ui/AuthForm";

export default function Page() {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate("/chat");
  };

  return <AuthForm onSuccess={handleLoginSuccess} />;
}
