// conversor.test.js
const { romanToArabic, arabicToRoman } = require('./index'); // ajusta si tu archivo tiene otro nombre

describe('🧮 Conversor Romano ↔ Arábigo', () => {

  // ==============================
  // ✅ TESTS ROMANO → ARÁBIGO
  // ==============================

  test('I → 1', () => expect(romanToArabic('I')).toBe(1));
  test('III → 3', () => expect(romanToArabic('III')).toBe(3));
  test('IV → 4', () => expect(romanToArabic('IV')).toBe(4));
  test('IX → 9', () => expect(romanToArabic('IX')).toBe(9));
  test('XIV → 14', () => expect(romanToArabic('XIV')).toBe(14));
  test('XL → 40', () => expect(romanToArabic('XL')).toBe(40));
  test('XC → 90', () => expect(romanToArabic('XC')).toBe(90));
  test('CD → 400', () => expect(romanToArabic('CD')).toBe(400));
  test('CM → 900', () => expect(romanToArabic('CM')).toBe(900));
  test('MMXXIV → 2024', () => expect(romanToArabic('MMXXIV')).toBe(2024));

  // ==============================
  // ✅ TESTS ARÁBIGO → ROMANO
  // ==============================

  test('1 → I', () => expect(arabicToRoman(1)).toBe('I'));
  test('3 → III', () => expect(arabicToRoman(3)).toBe('III'));
  test('4 → IV', () => expect(arabicToRoman(4)).toBe('IV'));
  test('9 → IX', () => expect(arabicToRoman(9)).toBe('IX'));
  test('14 → XIV', () => expect(arabicToRoman(14)).toBe('XIV'));
  test('40 → XL', () => expect(arabicToRoman(40)).toBe('XL'));
  test('90 → XC', () => expect(arabicToRoman(90)).toBe('XC'));
  test('400 → CD', () => expect(arabicToRoman(400)).toBe('CD'));
  test('900 → CM', () => expect(arabicToRoman(900)).toBe('CM'));
  test('2024 → MMXXIV', () => expect(arabicToRoman(2024)).toBe('MMXXIV'));

  // ==============================
  // 🚫 TESTS DE VALIDACIÓN
  // ==============================

  test('Romano inválido: "IIII" → null', () => expect(romanToArabic('IIII')).toBe(null));
  test('Romano con caracteres no válidos: "ABC" → null', () => expect(romanToArabic('ABC')).toBe(null));
  test('Número arábigo fuera de rango (0) → null', () => expect(arabicToRoman(0)).toBe(null));
  test('Número arábigo fuera de rango (4000) → null', () => expect(arabicToRoman(4000)).toBe(null));
  test('Número decimal (3.5) → null', () => expect(arabicToRoman(3.5)).toBe(null));
  test('Entrada no numérica → null', () => expect(arabicToRoman('Hola')).toBe(null));
  test('Romano en minúsculas "xix" → 19', () => expect(romanToArabic('xix')).toBe(19));
  test('Romano vacío → null', () => expect(romanToArabic('')).toBe(null));
  test('Entrada null → null', () => expect(romanToArabic(null)).toBe(null));
  test('Número límite superior 3999 → MMMCMXCIX', () => expect(arabicToRoman(3999)).toBe('MMMCMXCIX'));
});
