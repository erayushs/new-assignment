import { useState } from "react";
import personWithLapton from "./assets/personWithLapton.svg";
import waves from "./assets/waves.jpg";
import { useNavigate } from "react-router";

const App = () => {
  const [user, setUser] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user.email === "admin@demo.com" && user.password === "admin") {
      console.log("Form Submitted");
      navigate("/dashboard");
    } else {
      setErrorMessage("Wrong Credentials");
    }
  };

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-100 overflow-hidden">
      <div className="lg:w-[500px] w-full bg-white p-2 h-full relative">
        <img
          src={waves}
          alt="waves"
          className="absolute w-full left-0 lg:-top-[180px] -top-[130px]  object-cover"
        />
        <img
          src={personWithLapton}
          alt="personWithLapton"
          className="w-[200px] absolute right-4 top-4"
        />
        <div className="mt-30 p-4">
          <h1 className="text-[#2F5EE5] text-5xl font-bold">LOGIN</h1>

          <form onSubmit={handleSubmit} className="pt-4 mt-10 flex flex-col">
            <div className="flex flex-col gap-2">
              <label className="text-blue-600 text-sm" htmlFor="email">
                Username
              </label>
              <input
                type="email"
                value={user.email}
                name="email"
                onChange={handleChange}
                id="email"
                className="border-b-2 border-blue-700 focus:outline-none pb-1 pt-2"
                placeholder="Enter email"
                required
              />
            </div>
            <div className="flex flex-col gap-2 pt-20">
              <label className="text-blue-600 text-sm" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                value={user.password}
                name="password"
                onChange={handleChange}
                id="password"
                className="border-b-2 border-blue-700 focus:outline-none pb-1 pt-2"
                placeholder="Enter password"
                required
              />

              <p className="text-sm text-blue-600 cursor-pointer self-end pt-2">
                Forgot your password
              </p>
            </div>

            {errorMessage && <p className="text-red-600">{errorMessage}</p>}

            <button className="text-xl bg-gradient-to-r from-orange-500 to-orange-300 text-white p-6 mt-14 w-[220px] rounded-4xl hover:bg-blue-700 self-end cursor-pointer">
              Login
            </button>
            <p className="text-[#2F5EE5] font-semibold text-sm self-end pt-4 cursor-pointer">
              Don't have an account? Sign up
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default App;
