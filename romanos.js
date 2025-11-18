const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

// =================================================================
// LÓGICA DE CONVERSIÓN
// =================================================================
function romanToArabic(roman) {
  if (!/^[IVXLCDM]+$/i.test(roman)) return null;
  const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let arabic = 0;
  for (let i = 0; i < roman.length; i++) {
    const current = map[roman[i]];
    const next = map[roman[i + 1]];
    if (next > current) {
      arabic += next - current;
      i++;
    } else arabic += current;
  }
  return arabic < 1 || arabic > 3999 ? null : arabic;
}

function arabicToRoman(arabic) {
  if (arabic < 1 || arabic > 3999 || !Number.isInteger(arabic)) return null;
  const numerals = [
    { v: 1000, s: 'M' }, { v: 900, s: 'CM' }, { v: 500, s: 'D' },
    { v: 400, s: 'CD' }, { v: 100, s: 'C' }, { v: 90, s: 'XC' },
    { v: 50, s: 'L' }, { v: 40, s: 'XL' }, { v: 10, s: 'X' },
    { v: 9, s: 'IX' }, { v: 5, s: 'V' }, { v: 4, s: 'IV' }, { v: 1, s: 'I' }
  ];
  let roman = '';
  for (const { v, s } of numerals) {
    while (arabic >= v) {
      roman += s;
      arabic -= v;
    }
  }
  return roman;
}

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
            <input type="number" name="arabic" placeholder="Ejemplo: 2024" required min="1" max="3999" />
            <button type="submit">Convertir</button>
          </form>
        </div>

        <footer>
          <p>Rango válido: 1 a 3999</p>
          <p>Prueba también desde la URL:<br>
          <code>/r2a?roman=XXIV</code> | <code>/a2r?arabic=2024</code></p>
          <p>🛠️ Desarrollado con ❤️ en Express.js</p>
        </footer>
      </body>
    </html>
  `);
});

// =================================================================
// ENDPOINTS PERSONALIZADOS
// =================================================================
app.get('/r2a', (req, res) => {
  const roman = req.query.roman ? req.query.roman.toUpperCase() : null;
  if (!roman) {
    return res.status(400).json({ error: 'Falta el parámetro "roman". Ejemplo: /r2a?roman=XXIV' });
  }
  const arabic = romanToArabic(roman);
  if (arabic === null) {
    return res.status(400).json({
      error: 'Número romano inválido. Solo se permiten letras I, V, X, L, C, D, M dentro del rango 1–3999.'
    });
  }
  res.json({ conversion: `${roman} → ${arabic}`, roman, arabic });
});

app.get('/a2r', (req, res) => {
  const arabic = parseInt(req.query.arabic, 10);
  if (isNaN(arabic)) {
    return res.status(400).json({ error: 'Debe ingresar un número válido. Ejemplo: /a2r?arabic=15' });
  }
  const roman = arabicToRoman(arabic);
  if (roman === null) {
    return res.status(400).json({
      error: 'Número fuera de rango. Solo se aceptan valores enteros entre 1 y 3999.'
    });
  }
  res.json({ conversion: `${arabic} → ${roman}`, arabic, roman });
});

app.get('/health', (req, res) => {
  res.json({ estado: '✅ Operativo', servicio: 'Conversor Romano ↔ Arábigo' });
});

app.use('*', (req, res) => {
  res.status(404).json({
    error: '❌ Ruta inexistente.',
    sugerencia: 'Usa /r2a?roman=XXIV o /a2r?arabic=2024 para probar el conversor.'
  });
});

// =================================================================
// EXPORTAR PARA VERCEL
// =================================================================
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`🚀 Servidor en ejecución → http://localhost:${PORT}`));
}

module.exports.romanToArabic = romanToArabic;
module.exports.arabicToRoman = arabicToRoman;
module.exports = (req, res) => app(req, res);
