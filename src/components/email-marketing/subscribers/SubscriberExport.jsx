import { exportSubscribers } from "../services/subscriber.service";

export default function SubscriberExport() {
  const handleExport = async () => {
    const data = await exportSubscribers();
    const csv =
      "email,name,phone,status,created_at\n" +
      data
        .map(
          s =>
            `${s.email},${s.name || ""},${s.phone || ""},${s.status},${s.created_at}`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button className="email-btn-primary" onClick={handleExport}>
      Export Subscribers
    </button>
  );
}
