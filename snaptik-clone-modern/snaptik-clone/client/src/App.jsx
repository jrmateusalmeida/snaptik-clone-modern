import React, { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!url) return setError("Cole o link do TikTok.");
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-indigo-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-sky-700">
          Download TikTok - SnapLike
        </h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Cole o link do TikTok"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full border rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            disabled={loading}
            className="w-full bg-sky-600 text-white font-semibold rounded-lg py-3 hover:bg-sky-700"
          >
            {loading ? "Processando..." : "Baixar"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && result.video && (
          <div className="mt-6 text-center">
            <video
              src={result.video.url}
              controls
              className="rounded-lg w-full"
            />
            <a
              href={result.video.url}
              download
              className="mt-3 inline-block bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Baixar MP4
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
