import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export default function useAuth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let savedUser = Cookies.get("user");

    if (!savedUser) {
      savedUser = localStorage.getItem("user");
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
  }, []);

  return user;
}
