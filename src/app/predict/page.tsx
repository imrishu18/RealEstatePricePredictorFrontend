'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function PredictPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [form, setForm] = useState({
    total_sqft: '',
    bath: '',
    balcony: '',
    price_per_sqft: '',
    location: ''
  });

const allLocations = [
  'Electronic City Phase II', 'Chikka Tirupathi', 'Uttarahalli', 'Whitefield', 'Old Airport Road',
  'Rajaji Nagar', 'Marathahalli', 'Hoodi', 'Banashankari', '7th Phase JP Nagar', 'Gottigere',
  'Electronic City', 'Rajiv Nagar', 'Yelachenahalli', 'Bisuvanahalli', 'Sarjapur', 'Kanakpura',
  'Raja Rajeshwari Nagar', 'Varthur', 'Kengeri', 'Rachenahalli', 'Arekere', 'Haralur Road',
  'Ramamurthy Nagar', 'HSR Layout', 'Kothanur', 'Kalena Agrahara', 'Hebbal', 'Jayanagar',
  'Malleshwaram', 'Begur Road', 'Indira Nagar', 'Kaggadasapura', 'JP Nagar', 'Bellandur',
  'KR Puram', 'Hormavu', 'Electronics City Phase 1', 'Hennur Road', 'Thigalarapalya', 'Mysore Road',
  'Magadi Road', 'Harlur', 'Bommanahalli', 'Babusapalaya', 'Sarjapur Road', 'Yelahanka',
  'Devanahalli', 'Basavanagudi', 'Kumaraswami Layout', 'Banaswadi', 'Bannerghatta Road',
  'Nagarbhavi', 'Hosa Road', 'Mahadevpura', 'CV Raman Nagar', 'Uttarahalli Hobli', 'Sahakara Nagar',
  'Sanjay nagar', 'Wilson Garden', 'Domlur', 'Frazer Town', 'Chamarajpet', 'RT Nagar',
  'Kalyan Nagar', 'Vijayanagar', 'Sadashiva Nagar', 'Cox Town', 'Koramangala', 'Kodichikkanahalli',
  'Jakkur', 'Bommasandra', 'Sonnenahalli', 'Kudlu Gate', 'HSR Layout Sector 1', 'Narayana Nagar 1st Block',
  'Hulimavu', 'BTM Layout', 'Ejipura', 'Basaveshwara Nagar', 'Bommasandra Industrial Area', 'other'
];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        total_sqft: Number(form.total_sqft),
        bath: Number(form.bath),
        balcony: Number(form.balcony),
        price_per_sqft: Number(form.price_per_sqft),
        location: form.location
      })
    });
    const data = await res.json();
    localStorage.setItem('predicted_price', JSON.stringify(data.predicted_price_lakhs));
    localStorage.setItem('shap_values', JSON.stringify(data.shap_values || []));
    router.push('/result');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 100 }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 1,
      dy: (Math.random() - 0.5) * 1
    }));

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.12)';
        ctx.shadowColor = 'rgba(255,255,255,0.1)';
        ctx.shadowBlur = 10;
        ctx.fill();
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > w) p.dx *= -1;
        if (p.y < 0 || p.y > h) p.dy *= -1;
      });
      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    });
  }, []);

  return (
    <main className="relative min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#1a1d5e] to-[#111e3c] text-white overflow-hidden font-sans px-6 pt-20 pb-16">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between text-white">
        <div className="text-lg md:text-xl font-bold">🧠 Real Estate Price Predictor</div>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-indigo-300 hover:text-indigo-100 transition"
        >
          ⬅ Back to Home
        </button>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-4xl mx-auto text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight leading-tight">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500">
            Predict Property Price
          </span>
        </h1>
        <p className="text-md md:text-lg text-gray-300 mb-10">
          Input the details below and get an instant price prediction.
        </p>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8 text-left">
          {['total_sqft', 'price_per_sqft'].map((field, i) => (
            <div key={i} className="flex flex-col">
              <label className="text-sm font-semibold mb-2">
                {field === 'total_sqft' ? 'Total Sqft' : 'Price Per Sqft (₹)'}
              </label>
              <input
                type="number"
                name={field}
                value={form[field as keyof typeof form]}
                onChange={handleChange}
               placeholder={`e.g., ${field === 'total_sqft' ? '1200' : '7500'}`}
                required
                className="p-3 rounded-xl bg-[#2b2f55] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>
          ))}

          {[{ name: 'bath', label: 'Bathrooms' }, { name: 'balcony', label: 'Balcony' }].map(({ name, label }) => (
            <div key={name} className="flex flex-col relative">
              <label className="text-sm font-semibold mb-2">{label}</label>
              <select
                name={name}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                required
                className="p-3 pr-10 rounded-xl bg-[#2b2f55] text-white w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
              >
                <option value="">Select</option>
                {(name === 'bath' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3]).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <div className="absolute right-3 top-[55%] transform -translate-y-1/2 pointer-events-none text-white text-sm">▼</div>
            </div>
          ))}

          <div className="flex flex-col relative md:col-span-2 z-50">
            <label className="text-sm font-semibold mb-2">Location</label>
            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              className="p-3 pr-10 rounded-xl bg-[#2b2f55] text-white w-full focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none"
            >
              <option value="">Select Location</option>
              {allLocations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <div className="absolute right-3 top-[55%] transform -translate-y-1/2 pointer-events-none text-white text-sm">▼</div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="md:col-span-2 w-full py-4 mt-6 rounded-xl text-lg font-bold text-white bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 shadow-xl transition"
          >
            🎯 Predict Now
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
