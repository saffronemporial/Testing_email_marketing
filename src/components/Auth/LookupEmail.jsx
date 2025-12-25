import React, { useState } from "react";
import supabase from "../../supabaseClient";
import "./auth.css";

const LookupEmail = () => {
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();

    // Query profiles table by phone
    const { data, error } = await supabase
      .from("profiles")
      .select("email")
      .eq("phone", phone)
      .single();

    if (error) {
      setMessage("No email found for this phone number.");
    } else {
      setEmail(data.email);
      setMessage("");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 rounded mt-10">
      <h2 className="text-2xl font-bold text-gold-600 mb-4">Find Registered Email</h2>
      <form onSubmit={handleLookup} className="space-y-3">
        <input
          type="tel"
          placeholder="Enter your registered phone (+971...)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full border px-3 py-2 rounded"
          required
        />
        <button type="submit" className="w-full bg-gold-600 text-white py-2 rounded">
          Lookup Email
        </button>
      </form>
      {message && <p className="mt-3 text-red-500">{message}</p>}
      {email && <p className="mt-3 text-green-600">Your registered email: {email}</p>}
    </div>
  );
};

export default LookupEmail;
