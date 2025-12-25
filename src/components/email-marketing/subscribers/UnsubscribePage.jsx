import { useEffect, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { useSearchParams } from "react-router-dom";

export default function UnsubscribePage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    (async () => {
      const { error } = await supabase
        .from("subscribers")
        .update({ status: "unsubscribed" })
        .eq("unsubscribe_token", token);

      setStatus(error ? "error" : "done");
    })();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a]">
      <div className="email-card p-6 text-center">
        {status === "processing" && "Processing request…"}
        {status === "done" && "You have been unsubscribed successfully."}
        {status === "error" && "Invalid or expired unsubscribe link."}
      </div>
    </div>
  );
}
