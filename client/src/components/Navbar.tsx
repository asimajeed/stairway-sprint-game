import { FaListUl } from "react-icons/fa6";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@/lib/types";
import { fetchUser } from "@/lib/utils";

axios.defaults.withCredentials = true; // Ensures cookies are sent with requests
const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function Navbar() {
  const isMobile = window.innerWidth <= 1000;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    fetchUser(setIsLoggedIn, setUser);
  }, []);

  const handleLogin = (userData: User) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = async () => {
    try {
      await axios.post(backendUrl + "/logout");
      setIsLoggedIn(false);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <nav
      style={{
        backgroundImage: `url(${isMobile ? "navbar-mobile.png" : "navbar.png"})`,
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
      }}
      className="flex justify-between pb-5 fixed top-0 left-0 z-10 w-screen h-24 bg-no-repeat"
    >
      <div className="flex justify-normal">
        <button className="text-black ml-8">
          <FaListUl size={32} />
        </button>
      </div>
      <div className="flex justify-center items-center">
        <p className="sm:text-3xl text-4xl mx-auto font-bold">Stairway Sprint</p>
      </div>
      <div className="flex justify-center items-center w-12 mr-8">
        {isLoggedIn && user ? (
          <div>
            <img
              src={user.profile_photo_url || "default-avatar.webp"}
              alt={user.username}
              className="rounded-full size-8 mx-auto"
            />
            <button onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Dialog>
            <DialogTrigger className="text-black">Login</DialogTrigger>
            <DialogContent>
              <DialogTitle>Login/Register</DialogTitle>
              <DialogDescription>
                <Tabs defaultValue="login" className="w-[400px]">
                  <TabsList>
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login">
                    <LoginForm onLogin={handleLogin} />
                  </TabsContent>
                  <TabsContent value="register">
                    <RegisterForm onLogin={handleLogin} />
                  </TabsContent>
                </Tabs>
              </DialogDescription>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </nav>
  );
}

const LoginForm = ({ onLogin }: { onLogin: (userData: User) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleGoogleLogin() {
    window.open(
      backendUrl + "/auth/google",
      "GoogleLogin",
      "width=600,height=400,menubar=no,toolbar=no"
    );

    window.addEventListener("message", (event) => {
      if (
        event.origin === import.meta.env.VITE_FRONTEND_URL &&
        event.data.status === "success"
      ) {
        console.log("Login successful");
      }
    });
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(backendUrl + "/login", { username, password });
      onLogin(response.data);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="border rounded px-4 py-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border rounded px-4 py-2"
      />
      <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">
        Login
      </button>
      <button onClick={handleGoogleLogin} className="bg-red-500 text-white rounded px-4 py-2">
        Login with Google
      </button>
    </form>
  );
};

const RegisterForm = ({ onLogin }: { onLogin: (userData: User) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(backendUrl + "/register", { username, password });
      onLogin(response.data);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        className="border rounded px-4 py-2"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="border rounded px-4 py-2"
      />
      <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">
        Register
      </button>
    </form>
  );
};
