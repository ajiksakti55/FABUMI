"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const QUESTIONS = [
  { id: "qa1", type: "rating", question: "Bagaimana penilaian Anda terhadap rasa makanan/minuman?" },
  { id: "qa2", type: "rating", question: "Bagaimana penilaian Anda terhadap porsi makanan/minuman?" },
  { id: "qa3", type: "rating", question: "Bagaimana penilaian Anda terhadap kebersihan penyajian makanan?" },
  { id: "qb1", type: "rating", question: "Seberapa cepat makanan/minuman disajikan?" },
  { id: "qb2", type: "rating", question: "Seberapa ramah dan membantu staf kami?" },
  { id: "qb3", type: "rating", question: "Seberapa baik staf memahami pesanan Anda?" },
  { id: "qc1", type: "rating", question: "Bagaimana kebersihan area makan / outlet?" },
  { id: "qc2", type: "rating", question: "Bagaimana kebersihan alat makan & meja?" },
  { id: "qd1", type: "rating", question: "Seberapa sesuai harga dengan kualitas makanan?" },
  { id: "qe1", type: "rating", question: "Seberapa puas Anda dengan pengalaman Anda secara keseluruhan?" },
  {
    id: "qnps",
    type: "nps",
    question:
      "Seberapa mungkin Anda merekomendasikan outlet kami kepada teman/keluarga?",
  },
  { id: "qyn1", type: "yesno", question: "Apakah Anda akan berkunjung kembali ke outlet kami?" },
  { id: "qs1", type: "text", question: "Apa yang paling Anda sukai dari outlet kami?" },
  { id: "qs2", type: "text", question: "Apa yang dapat kami tingkatkan?" },
];

export default function SurveyPage() {
  const router = useRouter();
  const params = useSearchParams();

  const outletId = params.get("outlet");

  const [outletName, setOutletName] = useState("");
  const [loadingOutlet, setLoadingOutlet] = useState(true);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [hoverRating, setHoverRating] = useState({});

  // LOAD OUTLET NAME
  useEffect(() => {
    async function loadOutlet() {
      try {
        const res = await fetch(`/api/outlets/${outletId}/info`);
        const data = await res.json();
        setOutletName(res.ok ? data.name : "Outlet tidak valid");
      } catch {
        setOutletName("Gagal memuat data outlet");
      }
      setLoadingOutlet(false);
    }

    if (!outletId) {
      setOutletName("Outlet tidak ditemukan");
      setLoadingOutlet(false);
      return;
    }

    loadOutlet();
  }, [outletId]);

  // SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answers["qyn1"]) {
      alert("Pertanyaan 'Akan berkunjung kembali?' wajib diisi.");
      return;
    }

    setLoading(true);
    setStatus(null);

    const formattedAnswers = QUESTIONS.map((q) => ({
      id: q.id,
      type: q.type,
      value: answers[q.id] ?? null,
    }));

    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlet: outletId,
          name,
          contact,
          answers: formattedAnswers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal submit");

      router.push("/survey/thankyou");
    } catch (err) {
      setStatus({ ok: false, msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  // RENDER QUESTION
  const renderQuestion = (q) => {
    const val = answers[q.id];

    // ⭐ BINTANG 1–5
    if (q.type === "rating") {
      const current = val ?? 0;
      const hover = hoverRating[q.id] ?? 0;

      return (
        <div className="flex gap-2 pt-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: star }))}
              onMouseEnter={() =>
                setHoverRating((prev) => ({ ...prev, [q.id]: star }))
              }
              onMouseLeave={() =>
                setHoverRating((prev) => ({ ...prev, [q.id]: 0 }))
              }
              className={`text-4xl cursor-pointer transition-all ${
                (hover || current) >= star ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </span>
          ))}
        </div>
      );
    }

    // 🔵 NPS GRID 1–10
    if (q.type === "nps") {
      return (
        <div className="grid grid-cols-5 gap-2 pt-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setAnswers((p) => ({ ...p, [q.id]: n }))}
              className={`p-3 rounded-xl border text-sm font-medium transition
                ${
                  val === n
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-300"
                }`}
            >
              {n}
            </button>
          ))}
        </div>
      );
    }

    // ✔️ YES / NO
    if (q.type === "yesno") {
      return (
        <div className="flex gap-3 pt-3">
          {["Yes", "No"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAnswers((p) => ({ ...p, [q.id]: v }))}
              className={`px-5 py-2.5 rounded-xl border transition font-medium
                ${
                  val === v
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-300"
                }`}
            >
              {v}
            </button>
          ))}
        </div>
      );
    }

    // 📝 TEXTAREA
    if (q.type === "text") {
      return (
        <textarea
          rows={3}
          className="w-full border border-gray-300 p-3 rounded-xl mt-3 focus:ring-2 focus:ring-blue-300 focus:outline-none"
          value={val || ""}
          onChange={(e) =>
            setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
          }
        ></textarea>
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 text-black">
      <h1 className="text-3xl font-bold text-center mb-1">
        Survey Kepuasan Pelanggan
      </h1>

      <p className="text-lg font-semibold text-center mb-6 text-gray-600">
        {loadingOutlet ? "Memuat outlet..." : outletName}
      </p>

      {/* STATUS */}
      {status && (
        <div
          className={`mb-4 p-4 rounded-xl ${
            status.ok ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {status.msg}
        </div>
      )}

      {/* CARD CONTAINER */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-6 space-y-6"
      >
        {/* NAMA */}
        <div>
          <label className="block font-medium">Nama</label>
          <input
            className="w-full border p-3 rounded-xl mt-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* KONTAK */}
        <div>
          <label className="block font-medium">Kontak (WA/Email)</label>
          <input
            className="w-full border p-3 rounded-xl mt-2 focus:ring-2 focus:ring-blue-300 focus:outline-none"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        {/* PERTANYAAN */}
        {QUESTIONS.map((q) => (
          <div key={q.id} className="pt-2">
            <label className="block text-md font-semibold text-gray-800">
              {q.question}
            </label>
            {renderQuestion(q)}
          </div>
        ))}

        {/* SUBMIT */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          >
            {loading ? "Mengirim..." : "Kirim Survey"}
          </button>
        </div>
      </form>
    </div>
  );
}
