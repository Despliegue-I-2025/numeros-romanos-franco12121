// romanos.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// =====================================================
// MAPA BÁSICO
// =====================================================
const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };

// =====================================================
// FUNCIONES DE CONVERSIÓN
// =====================================================

/**
 * Convierte número arábigo (entero 1..3999) a romano.
 * Devuelve string romano o null si fuera de rango / inválido.
 */
function arabicToRoman(arabic) {
  if (!Number.isInteger(arabic) || arabic < 1 || arabic > 3999) return null;
  const numerals = [
    { v: 1000, s: 'M' }, { v: 900, s: 'CM' }, { v: 500, s: 'D' },
    { v: 400, s: 'CD' }, { v: 100, s: 'C' }, { v: 90, s: 'XC' },
    { v: 50, s: 'L' }, { v: 40, s: 'XL' }, { v: 10, s: 'X' },
    { v: 9, s: 'IX' }, { v: 5, s: 'V' }, { v: 4, s: 'IV' }, { v: 1, s: 'I' }
  ];
  let n = arabic;
  let roman = '';
  for (const { v, s } of numerals) {
    while (n >= v) {
      roman += s;
      n -= v;
    }
  }
  return roman;
}

/**
 * Convierte romano (cadena validada) a arábigo.
 * Devuelve número entero o null si inválido / fuera de rango.
 *
 * Nota: esta función asume que la entrada fue validada previamente
 * con isValidRoman(). Aun así, hacemos chequeos mínimos.
 */
function romanToArabic(roman) {
  if (!roman || typeof roman !== 'string') return null;
  const R = roman.toUpperCase();
  if (!/^[IVXLCDM]+$/.test(R)) return null;

  let total = 0;
  for (let i = 0; i < R.length; i++) {
    const c = R[i];
    const cur = map[c];
    const next = map[R[i + 1]] || 0;
    if (next > cur) {
      total += (next - cur);
      i++; // saltamos el siguiente porque ya lo usamos
    } else {
      total += cur;
    }
  }

  // rango válido 1..3999
  if (total < 1 || total > 3999) return null;
  return total;
}

// =====================================================
// VALIDACIONES
// =====================================================

/**
 * Regex estricto para validar la sintaxis correcta de números romanos
 * (evita repeticiones inválidas como IIII, IIV, IC, etc).
 */
function isValidRoman(roman) {
  if (!roman || typeof roman !== 'string') return false;
  const strictRomanRegex =
    /^M{0,3}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
  return strictRomanRegex.test(roman.toUpperCase());
}

/**
 * Validación estricta para números arábigos: solo dígitos ASCII 0-9,
 * sin signos, sin espacios, sin decimales, etc.
 */
function isValidArabicString(s) {
  return typeof s === 'string' && /^\d+$/.test(s);
}

// =====================================================
// NUEVA INTERFAZ HTML PERSONALIZADA
// =====================================================
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
          h1 { font-size: 2.2em; margin-bottom: 10px; }
          h3 { margin-top: 40px; }
          .card {
            background: rgba(255,255,255,0.1);
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
          button:hover { background: #d4ac0d; }
          footer { margin-top: 50px; font-size: 0.9em; color: #ddd; }
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
// ENDPOINTS API (colocados antes de otros middlewares/404)
// =====================================================

/**
 * ROMANO → ARÁBIGO
 * Requisito del evaluador: GET /r2a?roman=CXXIII -> { "arabic": 123 } (200)
 */
app.get('/r2a', (req, res) => {
  const romanRaw = req.query.roman;

  // 1) parámetro presente?
  if (!romanRaw) {
    return res.status(400).json({ error: "Falta el parámetro 'roman'." });
  }

  const roman = String(romanRaw).toUpperCase();

  // 2) sintaxis romana estricta
  if (!isValidRoman(roman)) {
    return res.status(400).json({
      error: "Número romano inválido. Formato o repeticiones incorrectas."
    });
  }

  // 3) conversión segura
  const arabic = romanToArabic(roman);
  if (arabic === null) {
    return res.status(400).json({
      error: "Número romano fuera del rango permitido (1–3999)."
    });
  }

  // 4) respuesta EXACTA que pide el evaluador
  return res.status(200).json({ arabic });
});

/**
 * ARÁBIGO → ROMANO
 * Requisito del evaluador: GET /a2r?arabic=123 -> { "roman": "CXXIII" } (200)
 *
 * Validamos estrictamente que el query sea solo dígitos,
 * para que '12abc' sea rechazado con 400.
 */
app.get('/a2r', (req, res) => {
  // Aceptamos el parámetro con nombre 'arabic' (requisito)
  // Si quieres aceptar también 'number' por compatibilidad, podrías usar:
  // const raw = req.query.arabic || req.query.number;
  const raw = req.query.arabic;

  // 1) parámetro presente?
  if (raw === undefined) {
    return res.status(400).json({ error: "Falta el parámetro 'arabic'." });
  }

  // Forzamos a string para testear con regex
  const rawStr = String(raw);

  // 2) solo dígitos (evita parseInt("12abc") => 12)
  if (!isValidArabicString(rawStr)) {
    return res.status(400).json({
      error: "Formato inválido. 'arabic' debe contener únicamente dígitos 0–9."
    });
  }

  // 3) convertir y chequear rango
  const arabic = Number(rawStr);
  if (!Number.isInteger(arabic) || arabic < 1 || arabic > 3999) {
    return res.status(400).json({
      error: "Número fuera de rango. Debe estar entre 1 y 3999."
    });
  }

  const roman = arabicToRoman(arabic);
  if (roman === null) {
    // por seguridad, aunque no debería ocurrir
    return res.status(400).json({
      error: "No se pudo convertir el número proporcionado."
    });
  }

  // respuesta EXACTA que pide el evaluador
  return res.status(200).json({ roman });
});

// =====================================================
// HEALTHCHECK
// =====================================================
app.get('/health', (_, res) => {
  res.json({ ok: true, service: 'Roman Converter API' });
});

// =====================================================
// 404 GENERICO
// =====================================================
app.use('*', (_, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado.',
    endpoints_disponibles: ['/a2r?arabic=123', '/r2a?roman=CXXIII', '/health']
  });
});

// =====================================================
// EXPORTS (Vercel + Jest)
// =====================================================
module.exports = app;
module.exports.romanToArabic = romanToArabic;
module.exports.arabicToRoman = arabicToRoman;

// =====================================================
// Ejecutar localmente solo si no está en Vercel
// =====================================================
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor local en http://localhost:${PORT}`);
  });
}
