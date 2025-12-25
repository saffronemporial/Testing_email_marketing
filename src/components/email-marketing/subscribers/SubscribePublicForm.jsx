export default function SubscribePublicForm() {
  const submit = async e => {
    e.preventDefault();
    const email = e.target.email.value;

    const res = await fetch("/functions/v1/subscribe-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    alert(res.ok ? "Subscribed successfully" : "Subscription failed");
  };

  return (
    <form
      onSubmit={submit}
      className="email-card p-6 max-w-md mx-auto text-center"
    >
      <h2 className="text-[#d4af37] text-xl mb-4">
        Subscribe to Saffron Emporial
      </h2>

      <input
        name="email"
        required
        type="email"
        placeholder="Your email"
        className="w-full p-3 mb-4 rounded bg-black/40"
      />

      <button className="email-btn-primary w-full">
        Subscribe
      </button>
    </form>
  );
}
