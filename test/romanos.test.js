// =====================================================
// TESTS UNITARIOS para romanos.js
// =====================================================
const { romanToArabic, arabicToRoman } = require('./romanos');

// ===============================
// Romanos → Arábigos
// ===============================
describe('Conversión de Romanos a Arábigos', () => {
  test('I → 1', () => expect(romanToArabic('I')).toBe(1));
  test('IV → 4', () => expect(romanToArabic('IV')).toBe(4));
  test('IX → 9', () => expect(romanToArabic('IX')).toBe(9));
  test('XL → 40', () => expect(romanToArabic('XL')).toBe(40));
  test('XC → 90', () => expect(romanToArabic('XC')).toBe(90));
  test('CD → 400', () => expect(romanToArabic('CD')).toBe(400));
  test('CM → 900', () => expect(romanToArabic('CM')).toBe(900));
  test('MCMXCIX → 1999', () => expect(romanToArabic('MCMXCIX')).toBe(1999));
  test('MMMCMXCIX → 3999', () => expect(romanToArabic('MMMCMXCIX')).toBe(3999));
  test('ABCD → null (inválido)', () => expect(romanToArabic('ABCD')).toBeNull());
});

// ===============================
// Arábigos → Romanos
// ===============================
describe('Conversión de Arábigos a Romanos', () => {
  test('1 → I', () => expect(arabicToRoman(1)).toBe('I'));
  test('4 → IV', () => expect(arabicToRoman(4)).toBe('IV'));
  test('9 → IX', () => expect(arabicToRoman(9)).toBe('IX'));
  test('58 → LVIII', () => expect(arabicToRoman(58)).toBe('LVIII'));
  test('2024 → MMXXIV', () => expect(arabicToRoman(2024)).toBe('MMXXIV'));
  test('3999 → MMMCMXCIX', () => expect(arabicToRoman(3999)).toBe('MMMCMXCIX'));
  test('0 → null (menor a 1)', () => expect(arabicToRoman(0)).toBeNull());
  test('-10 → null (negativo)', () => expect(arabicToRoman(-10)).toBeNull());
  test('4000 → null (mayor a 3999)', () => expect(arabicToRoman(4000)).toBeNull());
  test('"texto" → null (no numérico)', () => expect(arabicToRoman('texto')).toBeNull());
});
