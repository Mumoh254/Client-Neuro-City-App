// utils/getUserFromToken.js
import jwtDecode from "jwt-decode";  // Default import

export const getUserIdFromToken = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);  // Use jwtDecode here
    return decoded.id || decoded.userId; // depending on your token's structure
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


