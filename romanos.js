// ===============================
// SERVIDOR EXPRESS - CONVERSOR ROMANO ↔ ARÁBIGO
// ===============================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =================================================================
// Nueva interfaz HTML moderna
// =================================================================
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Conversor Romano ↔ Arábigo</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, sans-serif;
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }

        h1 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .card {
          background: #ffffff22;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
          width: 90%;
          max-width: 400px;
          text-align: center;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 1rem;
        }

        input {
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          text-align: center;
        }

        button {
          background: #2563eb;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
          transition: 0.3s;
        }

        button:hover {
          background: #1d4ed8;
        }

        small {
          color: #cbd5e1;
          margin-top: 10px;
          display: block;
        }

        code {
          background: rgba(255,255,255,0.2);
          padding: 3px 6px;
          border-radius: 5px;
        }
      </style>
    </head>

    <body>
      <div class="card">
        <h1>Conversor Romano ↔ Arábigo</h1>

        <form action="/r2a" method="get">
          <label>De Romano a Arábigo:</label>
          <input type="text" name="roman" placeholder="Ej: XLII" required />
          <


// ===============================
// ENDPOINT DE BIENVENIDA
// ===============================
app.get('/', (req, res) => {
  res.json({
    message: 'API de conversión de números romanos ↔ arábigos',
    endpoints: {
      "/r2a?roman=XXI": "Convierte número romano a arábigo",
      "/a2r?arabic=21": "Convierte número arábigo a romano"
    },
    rango_valido: "1 a 3999"
  });
});

// ===============================
// ENDPOINT: Romanos → Arábigos
// ===============================
app.get('/r2a', (req, res) => {
  const romanNumeral = req.query.roman;
  if (!romanNumeral) {
    return res.status(400).json({ error: true, message: 'Parámetro "roman" requerido.' });
  }

  const arabicNumber = romanToArabic(romanNumeral);
  if (arabicNumber === null) {
    return res.status(400).json({ error: true, message: 'Número romano inválido. Usa letras I, V, X, L, C, D, M.' });
  }

  return res.json({ roman: romanNumeral.toUpperCase(), arabic: arabicNumber });
});

// ===============================
// ENDPOINT: Arábigos → Romanos
// ===============================
app.get('/a2r', (req, res) => {
  const arabicNumber = parseInt(req.query.arabic, 10);
  if (isNaN(arabicNumber)) {
    return res.status(400).json({ error: true, message: 'Parámetro "arabic" requerido y debe ser un número.' });
  }

  const romanNumeral = arabicToRoman(arabicNumber);
  if (romanNumeral === null) {
    return res.status(400).json({ error: true, message: 'Número arábigo inválido. Debe estar entre 1 y 3999.' });
  }

  return res.json({ arabic: arabicNumber, roman: romanNumeral });
});

// ===============================
// FUNCIONES DE CONVERSIÓN
// ===============================
function romanToArabic(roman) {
  const map = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
  let value = 0;
  let prev = 0;

  roman = roman.toUpperCase();

  for (let i = roman.length - 1; i >= 0; i--) {
    const curr = map[roman[i]];
    if (!curr) return null; // Letra inválida
    if (curr < prev) value -= curr;
    else value += curr;
    prev = curr;
  }

  // Verificar coherencia (reconvertir para validar)
  const check = arabicToRoman(value);
  if (check !== roman) return null;

  return value;
}

function arabicToRoman(arabic) {
  if (arabic < 1 || arabic > 3999) return null;

  const map = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];

  let roman = '';
  for (const [value, symbol] of map) {
    while (arabic >= value) {
      roman += symbol;
      arabic -= value;
    }
  }
  return roman;
}

// ===============================
// MANEJO DE ERRORES
// ===============================
app.use((err, req, res, next) => {
  console.error('Error interno:', err);
  res.status(500).json({ error: true, message: 'Error interno del servidor.' });
});

// ===============================
// ===============================
// INICIAR SERVIDOR
// ===============================
if (require.main === module) {
  const PORT = process.env.PORT || 3000; // Podés cambiar el número acá
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de conversor iniciado en http://localhost:${PORT}`);
  });
}

module.exports = { app, romanToArabic, arabicToRoman };
 