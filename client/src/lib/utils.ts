import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import axios from "axios";
import { User } from "./types";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchUser = async (
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>,
  setUser: React.Dispatch<React.SetStateAction<User | null>>
) => {
  try {
    const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/user");
    if (response.data) {
      setIsLoggedIn(true);
      setUser(response.data);
      console.log(response.data);
    }
  } catch (error) {
    console.error("User is not authenticated", error);
  }
};  