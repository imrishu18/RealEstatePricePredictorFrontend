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
    'Whitefield', 'Sarjapur', 'Electronic City', 'MG Road', 'Koramangala',
    'Indira Nagar', 'Jayanagar', 'Hebbal', 'Rajaji Nagar', 'Yelahanka',
    'Bannerghatta Road', 'HSR Layout', 'Marathahalli', 'Kengeri', 'Bellandur',
    'BTM Layout', 'Banashankari', 'KR Puram', 'Hennur Road', 'Old Airport Road',
    'Basavanagudi', 'Malleshwaram', 'Kaggadasapura', 'Begur Road', 'Devanahalli',
    'Electronic City Phase II', 'Raja Rajeshwari Nagar', 'Kothanur', 'Varthur',
    'Uttarahalli', 'Arekere', 'Kanakpura Road', 'Ramamurthy Nagar',
    'Sahakara Nagar', 'Chikkabanavar', 'Kalena Agrahara', 'Domlur', 'Cox Town',
    'Hoodi', 'Nagarbhavi', 'Yeshwanthpur', 'Mahadevpura', 'Thigalarapalya',
    'Bommanahalli', 'Sonnenahalli', 'Kudlu Gate', 'Hulimavu', 'Ejipura',
    'JP Nagar', 'Wilson Garden', 'Frazer Town', 'Harlur', 'RT Nagar',
    'CV Raman Nagar', 'Sadashivanagar', 'Sanjay Nagar', 'Basaveshwara Nagar',
    'Jakkur', 'Bommasandra', 'Thanisandra', 'Chandra Layout', 'Vijayanagar',
    'Hosa Road', 'Narayana Nagar', 'Brookefield', 'HRBR Layout', 'Ulsoor',
    'Richmond Town', 'Somasundara Palya'
  ];

  const [filtered, setFiltered] = useState<string[]>(allLocations);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const listItemsRef = useRef<(HTMLLIElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));

    if (name === 'location') {
      setShowDropdown(true);
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => {
        const val = value.toLowerCase();
        setFiltered(allLocations.filter(loc => loc.toLowerCase().includes(val)));
        setHighlight(-1);
      }, 200);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlight >= 0) {
        selectLocation(filtered[highlight]);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  const selectLocation = (loc: string) => {
    setForm(f => ({ ...f, location: loc }));
    setShowDropdown(false);
  };

  useEffect(() => {
    if (highlight >= 0 && listItemsRef.current[highlight]) {
      listItemsRef.current[highlight]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }, [highlight]);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!allLocations.includes(form.location)) {
    alert("❌ Please select a valid location from the list.");
    return;
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

  try {
    const res = await fetch(`${apiBaseUrl}/predict`, {
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

    if (!res.ok) {
      throw new Error("API error: " + res.statusText);
    }

    const data = await res.json();
    localStorage.setItem('predicted_price', JSON.stringify(data.predicted_price_lakhs));
    localStorage.setItem('shap_values', JSON.stringify(data.shap_values || []));
    router.push('/result');
  } catch (error) {
    console.error("❌ Prediction request failed:", error);
    alert("Something went wrong. Please check the backend or console logs.");
  }
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
    <main className="relative min-h-screen w-full bg-gradient-to-br from-[#0f0c29] via-[#1a1d5e] to-[#111e3c] text-white overflow-hidden px-6 pt-20 pb-16 font-sans">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-0" />

      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex items-center justify-between">
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
            <div key={name} className="flex flex-col">
              <label className="text-sm font-semibold mb-2">{label}</label>
              <select
                name={name}
                value={form[name as keyof typeof form]}
                onChange={handleChange}
                required
                className="p-3 rounded-xl bg-[#2b2f55] text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select</option>
                {(name === 'bath' ? [1, 2, 3, 4, 5] : [0, 1, 2, 3]).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          ))}

          <div className="flex flex-col md:col-span-2 relative">
            <label className="text-sm font-semibold mb-2">Location</label>
            {showDropdown && filtered.length > 0 && (
              <ul className="absolute bottom-full mb-1 w-full max-h-48 overflow-auto rounded-xl bg-[#2b2f55] text-white shadow-lg z-20">
                {filtered.map((loc, i) => {
                  listItemsRef.current[i] = null;
                  return (
                    <li
                      key={loc}
                      ref={el => {
                        if (el) listItemsRef.current[i] = el;
                      }}
                      className={`px-3 py-2 cursor-pointer ${
                        i === highlight ? 'bg-yellow-500 text-black' : 'hover:bg-[#414670]'
                      }`}
                      onMouseEnter={() => setHighlight(i)}
                      onMouseDown={() => selectLocation(loc)}
                    >
                      {loc}
                    </li>
                  );
                })}
              </ul>
            )}
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type or choose location"
              required
              className="p-3 rounded-xl bg-[#2b2f55] text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
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
