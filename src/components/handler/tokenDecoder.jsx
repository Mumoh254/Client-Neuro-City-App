// utils/getUserFromToken.js
import jwtDecode from "jwt-decode";  

export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);  
    return decoded.id || decoded.userId; 
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};


export const getUserNameFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
  
    return {
      id: decoded.id, 
      name: decoded.name,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
};


