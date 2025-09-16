'use client';

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useStore from "../store/useStore";
import { uid, fetchCountries } from "../utils/helpers";

const schema = z.object({
  country: z.string().min(1, "Select country"),
  phone: z.string().min(6, "Phone too short"),
});

export default function AuthForm({ onSuccess, push }) {
  const [countries, setCountries] = useState([]);
  const [stage, setStage] = useState("form"); // form | verify
  const [sentOtp, setSentOtp] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    fetchCountries().then(setCountries);
  }, []);

  // ---------- Handlers ----------
  const onSubmit = (data) => {
    setLoading(true);
    setTimeout(() => {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      setSentOtp(otp);
      setLoading(false);
      setStage("verify");
      push("OTP sent");
    }, 1000);
  };

  const verify = (val) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (val === sentOtp) {
        const user = { id: uid("user"), phone: val, name: "User" };
        useStore.getState().setUser(user);
        push("Login successful ✅");
        // onSuccess(user);
      } else {
        push("❌ Wrong OTP, try again!");
      }
    }, 700);
  };

  // ---------- Render ----------
  if (stage === "verify") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
          Welcome to <span className="text-blue-600">Gemini AI</span>
        </h1>

        <div className="p-6 max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 text-center">
            Enter OTP
          </h3>

          {/* Show OTP for testing */}
          {sentOtp && (
            <p className="mb-3 text-sm text-green-600 font-medium text-center">
              ✅ Your OTP is: <span className="font-bold">{sentOtp}</span>
            </p>
          )}

          <input
            id="otp-input"
            className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-blue-300 outline-none mb-3 bg-gray-50 dark:bg-gray-800"
            placeholder="Enter OTP"
          />
          <button
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            onClick={() => verify(document.getElementById("otp-input").value)}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950 py-12 px-4">
      <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-8">
        Welcome to <span className="text-blue-600">Gemini AI</span>
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="p-6 max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
          🔐 Sign in with OTP
        </h2>

        {/* Country Select */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Country
        </label>
        <select
          {...register("country")}
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-blue-300 outline-none mb-3 bg-gray-50 dark:bg-gray-800"
        >
          <option value="">Select country</option>
          {countries.map((c, i) => (
            <option key={i} value={c.dial}>
              {c.name} ({c.dial})
            </option>
          ))}
        </select>
        {formState.errors.country && (
          <p className="text-red-500 text-sm mb-2">
            {formState.errors.country.message}
          </p>
        )}

        {/* Phone Input */}
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number
        </label>
        <input
          {...register("phone")}
          placeholder="1234567890"
          className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring focus:ring-blue-300 outline-none mb-3 bg-gray-50 dark:bg-gray-800"
        />
        {formState.errors.phone && (
          <p className="text-red-500 text-sm mb-2">
            {formState.errors.phone.message}
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}
