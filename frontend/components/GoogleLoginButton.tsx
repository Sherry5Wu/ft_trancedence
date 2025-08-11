import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const GoogleLoginButton = () => {
  const handleSuccess = (response: any) => {
    console.log("Login Success:", response);
    if (response.credential) {
      const decoded: any = jwtDecode(response.credential);
      console.log("Decoded user info:", decoded);
    }
  };

  const handleError = () => {
    console.error("Login Failed");
  };

  return (
    <div className="flex justify-center">
      <GoogleLogin onSuccess={handleSuccess} onError={handleError} />
    </div>
  );
};

export default GoogleLoginButton;
