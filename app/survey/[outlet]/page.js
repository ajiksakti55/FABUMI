"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const QUESTIONS = [
  {
    id: "qa1",
    type: "rating",
    question: "Bagaimana penilaian Anda terhadap rasa makanan/minuman?",
  },
  {
    id: "qa2",
    type: "rating",
    question: "Bagaimana penilaian Anda terhadap porsi makanan/minuman?",
  },
  {
    id: "qa3",
    type: "rating",
    question: "Bagaimana penilaian Anda terhadap kebersihan penyajian makanan?",
  },
  {
    id: "qb1",
    type: "rating",
    question: "Seberapa cepat makanan/minuman disajikan?",
  },
  {
    id: "qb2",
    type: "rating",
    question: "Seberapa ramah dan membantu staf kami?",
  },
  {
    id: "qb3",
    type: "rating",
    question: "Seberapa baik staf memahami pesanan Anda?",
  },
  {
    id: "qc1",
    type: "rating",
    question: "Bagaimana kebersihan area makan / outlet?",
  },
  {
    id: "qc2",
    type: "rating",
    question: "Bagaimana kebersihan alat makan & meja?",
  },
  {
    id: "qd1",
    type: "rating",
    question: "Seberapa sesuai harga dengan kualitas makanan?",
  },
  {
    id: "qe1",
    type: "rating",
    question: "Seberapa puas Anda dengan pengalaman Anda secara keseluruhan?",
  },
  {
    id: "qnps",
    type: "nps",
    question:
      "Seberapa mungkin Anda merekomendasikan outlet kami kepada teman/keluarga?",
  },
  {
    id: "qyn1",
    type: "yesno",
    question: "Apakah Anda akan berkunjung kembali ke outlet kami?",
  },
  {
    id: "qs1",
    type: "text",
    question: "Apa yang paling Anda sukai dari outlet kami?",
  },
  {
    id: "qs2",
    type: "text",
    question: "Apa yang dapat kami tingkatkan?",
  },
];

export default function SurveyPage() {
  const router = useRouter();
  const params = useSearchParams();

  const outletId = params.get("outlet");

  const [outletName, setOutletName] = useState("");
  const [loadingOutlet, setLoadingOutlet] = useState(true);

  const [name, setName] = useState("");
  const [contact, setContact] = useState("");

  // STATE BARU → semua jawaban masuk satu object
  const [answers, setAnswers] = useState({});

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  // ===========================================
  // LOAD OUTLET NAME
  // ===========================================
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/outlets/${outletId}/info`);
        const data = await res.json();
        if (res.ok) setOutletName(data.name);
        else setOutletName("Outlet tidak valid");
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

    load();
  }, [outletId]);

  // ===========================================
  // HANDLE SUBMIT
  // ===========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          outlet: outletId,
          name,
          contact,
          answers, // <-- PENTING
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

  // ===========================================
  // RENDER INPUT BERDASARKAN TIPE PERTANYAAN
  // ===========================================
  const renderQuestion = (q) => {
    // Rating 1–5
    if (q.type === "rating") {
      return (
        <div className="flex items-center space-x-2 mt-1">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: r }))}
              className={`px-3 py-2 rounded ${
                answers[q.id] === r ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      );
    }

    // nps
    if (q.type === "nps") {
      return (
        <div className="flex items-center space-x-2 mt-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: r }))}
              className={`px-3 py-2 rounded ${
                answers[q.id] === r ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      );
    }

    // Yes / No
    if (q.type === "yesno") {
      return (
        <div className="flex gap-3 mt-1">
          {["Yes", "No"].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: v }))}
              className={`px-4 py-2 rounded ${
                answers[q.id] === v ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      );
    }

    // Text
    if (q.type === "text") {
      return (
        <textarea
          rows={3}
          className="w-full border p-2 rounded mt-1"
          value={answers[q.id] || ""}
          onChange={(e) =>
            setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
          }
        ></textarea>
      );
    }

    return null;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 text-black">
      <h1 className="text-2xl font-bold mb-1 text-center">
        Survey Kepuasan Pelanggan
      </h1>
      <p className="text-xl font-bold mb-4 text-center">
        {loadingOutlet ? "Loading..." : outletName}
      </p>

      {status && (
        <div
          className={`mb-4 p-3 rounded ${
            status.ok ? "bg-green-100" : "bg-red-100"
          }`}
        >
          {status.msg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded shadow"
      >
        {/* Nama */}
        <div>
          <label className="block text-sm font-medium">Nama</label>
          <input
            className="w-full border p-2 rounded mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Kontak */}
        <div>
          <label className="block text-sm font-medium">Kontak (WA/Email)</label>
          <input
            className="w-full border p-2 rounded mt-1"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>

        {/* LOOP PERTANYAAN */}
        {QUESTIONS.map((q) => (
          <div key={q.id}>
            <label className="block text-sm font-medium">{q.question}</label>
            {renderQuestion(q)}
          </div>
        ))}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Mengirim..." : "Kirim Survey"}
          </button>
        </div>
      </form>
    </div>
  );
}
