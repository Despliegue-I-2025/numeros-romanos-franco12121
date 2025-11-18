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

// ===== VALIDACIÓN ROMANA ESTRICTA =====
function isValidRoman(roman) {
  const strictRomanRegex =
    /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  return strictRomanRegex.test(roman);
}


// =====================================================
// ENDPOINTS API (SOLO UNA VEZ)
// =====================================================

// ROMANO → ARÁBIGO
app.get('/r2a', (req, res) => {
  const romanRaw = req.query.roman;
  if (!romanRaw) {
    return res.status(400).json({ error: "Falta el parámetro 'roman'." });
  }

  const roman = romanRaw.toUpperCase();

  // Validación estricta de sintaxis
  if (!isValidRoman(roman)) {
    return res.status(400).json({
      error: "Número romano inválido. Repeticiones o formato incorrecto."
    });
  }

  const arabic = romanToArabic(roman);
  if (arabic === null) {
    return res.status(400).json({
      error: "Número romano fuera del rango permitido (1–3999)."
    });
  }

  return res.status(200).json({ arabic });
});

//arabicos -romanos 
+app.get('/a2r', (req, res) => {
  const raw = req.query.arabic;

  // 1. Debe existir
  if (!raw) {
    return res.status(400).json({
      error: "Falta el parámetro 'arabic'."
    });
  }

  // 2. Debe ser SOLO dígitos (sin letras, sin signos, sin espacios)
  if (!/^\d+$/.test(raw)) {
    return res.status(400).json({
      error: "Formato inválido. 'arabic' debe contener únicamente dígitos 0–9."
    });
  }

  // 3. Convertir a número seguro recién ahora
  const arabic = Number(raw);

  // 4. Validar rango
  if (arabic < 1 || arabic > 3999) {
    return res.status(400).json({
      error: "Número fuera de rango. Solo se aceptan valores entre 1 y 3999."
    });
  }

  const roman = arabicToRoman(arabic);
  return res.status(200).json({ roman });
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
