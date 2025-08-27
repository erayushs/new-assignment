import React, { useState } from "react";

const Form = () => {
  type User = {
    email: string;
    password: string;
  };

  const [user, setUser] = useState<User>({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;

    setUser({ ...user, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();

    console.log("Submitted");
  };

  return (
    <div className="flex flex-col bg-gray-200 h-screen w-full items-center pt-20">
      <div className="border p-4 rounded-2xl w-[300px] h-[50%]">
        <h1 className="text-center text-4xl font-mono mb-10">Login Form</h1>
        <div className="pt-4">
          <form onSubmit={handleSubmit} className="flex flex-col">
            <label htmlFor="email">Email</label>
            <input
              value={user.email}
              onChange={handleChange}
              type="email"
              id="email"
              name="email"
              className="border-b focus:outline-none  "
              required
            />

            <label className="mt-4" htmlFor="password">
              Password
            </label>
            <input
              value={user.password}
              onChange={handleChange}
              type="password"
              id="password"
              name="password"
              className="border-b focus:outline-none  "
              required
            />

            <button
              type="submit"
              className="border p-2 rounded bg-blue-400 mt-4 cursor-pointer"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Form;
