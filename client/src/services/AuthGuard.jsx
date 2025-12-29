import { Navigate } from "react-router-dom";

const AuthGuard = (Component) => {
  return function GuardedComponent(props) {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.access) {
      return <Navigate to="/login" replace />;
    }

    return <Component {...props} />;
  };
};

export default AuthGuard;
