// ===============================
// SERVIDOR EXPRESS - CONVERSOR ROMANO ↔ ARÁBIGO
// ===============================
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// INICIAR SERVIDOR
// ===============================
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de conversor iniciado en http://localhost:${PORT}`);
  });
}

module.exports = { app, romanToArabic, arabicToRoman };
