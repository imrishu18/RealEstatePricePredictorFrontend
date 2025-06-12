'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function ResultPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [loanTerm, setLoanTerm] = useState<number>(20);
  const [interestRate, setInterestRate] = useState<number>(9.5);
  const [emi, setEmi] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem('predicted_price');
    if (stored) setPrice(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 100 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 1,
    }));

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
        ctx.shadowBlur = 10;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    animate();
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    if (!price) return;
    const P = price * 1e5;
    const r = interestRate / 12 / 100;
    const n = loanTerm * 12;
    const emiValue = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    setEmi(Math.round(emiValue));
  }, [price, loanTerm, interestRate]);

  const breakdown = price
    ? [
        { label: 'Base Cost', value: price * 1e5 * 0.75, tooltip: 'Estimated construction and land cost' },
        { label: 'Amenities', value: price * 1e5 * 0.15, tooltip: 'Cost of facilities like pool, gym, security' },
        { label: 'Location Premium', value: price * 1e5 * 0.1, tooltip: 'Extra cost due to location advantage' },
      ]
    : [];

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#1a1d5e] to-[#111e3c] text-white px-6 pt-20 pb-10 font-sans">
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-screen h-screen z-0 pointer-events-none"
      />

      <div className="relative z-10">
        <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 text-white">
          <div className="text-lg md:text-xl font-bold">🧠 Real Estate Price Predictor</div>
          <button onClick={() => router.push('/')} className="text-sm text-indigo-300 hover:text-indigo-100 transition">
            ← Back to home
          </button>
        </nav>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 mt-10 max-w-3xl mx-auto text-center space-y-10"
        >
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              🏡{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500">
                Predicted Property Price
              </span>
            </h1>
            <p className="text-lg md:text-xl font-semibold">
              {price ? `₹ ${price.toFixed(2)} Lakhs` : 'Loading...'}
            </p>
          </div>

          {breakdown.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xl md:text-2xl font-semibold">📉 Price Breakdown</h3>
              <ul className="space-y-1 text-base md:text-lg">
                {breakdown.map((item, idx) => (
                  <li key={idx} title={item.tooltip}>
                    {item.label}: ₹ {Math.round(item.value).toLocaleString('en-IN')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {price && (
            <div className="space-y-4">
              <h3 className="text-xl md:text-2xl font-semibold">💳 Estimated EMI</h3>
              <div className="flex flex-wrap justify-center gap-6">
                <div title="Total loan period in years">
                  <label className="block text-sm mb-1">Loan Term</label>
                  <select
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(Number(e.target.value))}
                    className="bg-[#1e1e2f] text-white p-2 rounded-md"
                  >
                    {[10, 15, 20, 25, 30].map((year) => (
                      <option key={year} value={year}>{year} yrs</option>
                    ))}
                  </select>
                </div>
                <div title="Annual interest rate of the loan">
                  <label className="block text-sm mb-1">Interest Rate (%)</label>
                  <input
                    type="number"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="bg-[#1e1e2f] text-white p-2 rounded-md w-24 text-center"
                    step={0.1}
                    min={5}
                    max={20}
                  />
                </div>
              </div>
              <p className="text-xl md:text-2xl font-bold">₹ {emi.toLocaleString('en-IN')} / month</p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/predict')}
            className="mt-4 px-8 py-4 text-lg font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-xl shadow-xl"
          >
            🔁 Predict Another
          </motion.button>
        </motion.section>
      </div>
    </main>
  );
}
