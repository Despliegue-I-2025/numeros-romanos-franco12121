﻿const express = require('express');
const app = express();
const cors = require('cors');

app.use(cors());

// =====================================================
// Mapa de valores básicos
// =====================================================
const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };

// =====================================================
// LÓGICA DE CONVERSIÓN — ROMANO → ARÁBIGO
// =====================================================
function romanToArabic(roman) {
    if (!roman || typeof roman !== "string") {
        return { error: "Debe ingresar un número romano." };
    }

    roman = roman.toUpperCase().trim();

    // 1. Caracteres válidos
    if (!/^[IVXLCDM]+$/.test(roman)) {
        return { error: "El número romano contiene caracteres inválidos. Solo se permiten: I V X L C D M." };
    }

    // 2. Repeticiones inválidas
    if (/IIII/.test(roman)) {
        return { error: "Símbolo I solo puede repetirse hasta 3 veces consecutivas." };
    }
    if (/XXXX/.test(roman)) {
        return { error: "Símbolo X solo puede repetirse hasta 3 veces consecutivas." };
    }
    if (/CCCC/.test(roman)) {
        return { error: "Símbolo C solo puede repetirse hasta 3 veces consecutivas." };
    }
    if (/MMMM/.test(roman)) {
        return { error: "Símbolo M solo puede repetirse hasta 3 veces consecutivas." };
    }

    // 3. V L D NO pueden repetirse
    if (/VV/.test(roman)) return { error: "Símbolo V no puede repetirse." };
    if (/LL/.test(roman)) return { error: "Símbolo L no puede repetirse." };
    if (/DD/.test(roman)) return { error: "Símbolo D no puede repetirse." };

    // 4. Restas válidas permitidas
    const validSubtractions = ["IV","IX","XL","XC","CD","CM"];

    // 5. Detectar restas inválidas como IL, IC, XM, VX
    for (let i = 0; i < roman.length - 1; i++) {
        const curr = roman[i];
        const next = roman[i + 1];
        const vCurr = map[curr];
        const vNext = map[next];

        if (vCurr < vNext) {
            const pair = curr + next;
            if (!validSubtractions.includes(pair)) {
                return { error: `La resta '${pair}' es inválida.` };
            }
        }
    }

    // 6. Conversión estándar
    let total = 0;
    for (let i = 0; i < roman.length; i++) {
        const curr = map[roman[i]];
        const next = map[roman[i + 1]];
        if (next > curr) {
            total += next - curr;
            i++;
        } else {
            total += curr;
        }
    }

    // 7. Rango permitido 1 a 3999
    if (total < 1) return { error: "El número romano no puede representar 0 ni negativos." };
    if (total > 3999) return { error: "El resultado excede 3999, límite máximo permitido." };

    return total;
}

// =====================================================
// LÓGICA DE CONVERSIÓN — ARÁBIGO → ROMANO
// =====================================================
function arabicToRoman(arabic) {
    if (!Number.isInteger(arabic)) {
        return { error: "Debe ingresar un número entero." };
    }
    if (arabic < 1) {
        return { error: "En números romanos NO existe el 0 ni negativos." };
    }
    if (arabic > 3999) {
        return { error: "El número máximo representable en romano es 3999." };
    }

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


// =====================================================
// ENDPOINTS API
// =====================================================

app.get('/r2a', (req, res) => {
    const roman = req.query.roman ? req.query.roman.toUpperCase().trim() : null;

    if (!roman) {
        return res.status(400).json({ error: 'Parametro roman requerido.' });
    }

    const result = romanToArabic(roman);

    if (typeof result === "object" && result.error) {
        return res.status(400).json({ error: result.error });
    }

    return res.json({ arabic: result });
});

app.get('/a2r', (req, res) => {
    const raw = req.query.arabic;

    if (!raw) {
        return res.status(400).json({ error: "Parametro arabic requerido." });
    }

    const num = parseInt(raw, 10);

    if (isNaN(num)) {
        return res.status(400).json({ error: "El valor debe ser numérico." });
    }

    const result = arabicToRoman(num);

    if (typeof result === "object" && result.error) {
        return res.status(400).json({ error: result.error });
    }

    return res.json({ roman: result });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'Roman Converter API' });
});

app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado.' });
});

// =====================================================
// EXPORTAR PARA VERCEL Y JEST
// =====================================================
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Servidor local en puerto ${PORT}`));
}

module.exports = app;
module.exports.romanToArabic = romanToArabic;
module.exports.arabicToRoman = arabicToRoman;

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
  if (isNaN(arabic)) return res.status(400).json({ error: "Parámetro inválido" });

  const roman = arabicToRoman(arabic);
  if (!roman) return res.status(400).json({ error: "Número fuera de rango" });

  res.json({ roman });
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

module.exports = {
  app,
  romanToArabic,
  arabicToRoman
};
