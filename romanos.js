const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// MAPA BÁSICO
// =====================================================
const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };

// =================================================================
// NUEVA INTERFAZ HTML PERSONALIZADA
// =================================================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>⚜️ Conversor Romano ↔ Arábigo ⚜️</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #2c3e50, #4ca1af);
            color: #fff;
            text-align: center;
            padding: 50px;
          }
          h1 {
            font-size: 2.2em;
            margin-bottom: 10px;
          }
          h3 {
            margin-top: 40px;
          }
          .card {
            background: rgba(255, 255, 255, 0.1);
            padding: 25px;
            border-radius: 15px;
            width: 350px;
            margin: 20px auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          }
          input {
            padding: 10px;
            border: none;
            border-radius: 8px;
            margin: 10px;
            text-align: center;
            width: 70%;
            font-size: 1em;
          }
          button {
            background: #f1c40f;
            border: none;
            border-radius: 8px;
            padding: 10px 20px;
            font-weight: bold;
            cursor: pointer;
            transition: 0.3s;
          }
          button:hover {
            background: #d4ac0d;
          }
          footer {
            margin-top: 50px;
            font-size: 0.9em;
            color: #ddd;
          }
          code {
            background: rgba(255,255,255,0.2);
            padding: 3px 8px;
            border-radius: 5px;
            font-family: monospace;
          }
        </style>
      </head>

      <body>
        <h1>⚜️ Conversor de Números ⚜️</h1>
        <p>Convierte entre números romanos y arábigos fácilmente.</p>

        <div class="card">
          <h3>🔹 Romano → Arábigo</h3>
          <form action="/r2a" method="get">
            <input type="text" name="roman" placeholder="Ejemplo: XXIV" required />
            <button type="submit">Convertir</button>
          </form>
        </div>

        <div class="card">
          <h3>🔸 Arábigo → Romano</h3>
          <form action="/a2r" method="get">
            <input
              type="number"
              name="arabic"
              placeholder="Ejemplo: 2024"
              required
              min="1"
              max="3999"
            />
            <button type="submit">Convertir</button>
          </form>
        </div>

        <footer>
          <p>Rango válido: 1 a 3999</p>
          <p>Prueba también desde la URL:<br>
            <code>/r2a?roman=XXIV</code> |
            <code>/a2r?arabic=2024</code>
          </p>
          <p>🛠️ Desarrollado con ❤️ en Express.js</p>
        </footer>
      </body>
    </html>
  `);
});

// =====================================================
// ROMANO → ARÁBIGO
// =====================================================
function romanToArabic(roman) {
    if (!roman || typeof roman !== "string") {
        return { error: "Debe ingresar un número romano." };
    }

    roman = roman.toUpperCase().trim();

    if (!/^[IVXLCDM]+$/.test(roman)) {
        return { error: "El número romano contiene caracteres inválidos." };
    }

    const validSubtractions = ["IV","IX","XL","XC","CD","CM"];

    for (let i = 0; i < roman.length - 1; i++) {
        const curr = map[roman[i]];
        const next = map[roman[i + 1]];
        if (curr < next) {
            const pair = roman[i] + roman[i+1];
            if (!validSubtractions.includes(pair)) {
                return { error: `La resta '${pair}' es inválida.` };
            }
        }
    }

    let total = 0;
    for (let i = 0; i < roman.length; i++) {
        const curr = map[roman[i]];
        const next = map[roman[i + 1]];
        if (next > curr) {
            total += next - curr;
            i++;
        } else total += curr;
    }

    if (total < 1 || total > 3999) {
        return { error: "El número debe estar entre 1 y 3999." };
    }

    return total;
}

// =====================================================
// ARÁBIGO → ROMANO
// =====================================================
function arabicToRoman(n) {
    if (!Number.isInteger(n)) return { error: "Debe ser un entero." };
    if (n < 1 || n > 3999) return { error: "Número fuera de rango (1–3999)." };

    const numerals = [
        { v: 1000, s: 'M' }, { v: 900, s: 'CM' }, { v: 500, s: 'D' },
        { v: 400, s: 'CD' }, { v: 100, s: 'C' }, { v: 90, s: 'XC' },
        { v: 50, s: 'L' }, { v: 40, s: 'XL' }, { v: 10, s: 'X' },
        { v: 9, s: 'IX' }, { v: 5, s: 'V' }, { v: 4, s: 'IV' }, { v: 1, s: 'I' }
    ];

    let roman = "";
    for (const {v, s} of numerals) {
        while (n >= v) {
            roman += s;
            n -= v;
        }
    }
    return roman;
}

// =====================================================
// ENDPOINTS API (SOLO UNA VEZ)
// =====================================================

// ROMANO → ARÁBIGO
app.get("/r2a", (req, res) => {
    const roman = req.query.roman;
    if (!roman) return res.status(400).json({ error: "Parametro roman requerido." });

    const result = romanToArabic(roman);
    if (result.error) return res.status(400).json({ error: result.error });

    res.json({ arabic: result });
});

// ARÁBIGO → ROMANO
app.get("/a2r", (req, res) => {
    const raw = req.query.arabic;
    if (!raw) return res.status(400).json({ error: "Parametro arabic requerido." });

    const num = parseInt(raw);
    if (isNaN(num)) return res.status(400).json({ error: "Debe ser numérico." });

    const result = arabicToRoman(num);
    if (result.error) return res.status(400).json({ error: result.error });

    res.json({ roman: result });
});

// HEALTHCHECK
app.get("/health", (_, res) => {
    res.json({ ok: true, service: "Roman Converter API" });
});

// NOT FOUND
app.use("*", (_, res) => {
    res.status(404).json({ error: "Endpoint no encontrado." });
});

// =====================================================
// EXPORTAR UNA ÚNICA VEZ (Vercel + Jest)
// =====================================================
module.exports = app;
module.exports.romanToArabic = romanToArabic;
module.exports.arabicToRoman = arabicToRoman;

// Ejecutar localmente
if (!process.env.VERCEL) {
    app.listen(3000, () => console.log("Servidor local en 3000"));
}
