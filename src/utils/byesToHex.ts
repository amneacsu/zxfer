export const bytesToHex = (bytes: number[], legend = true, hex = true) => {
  let _data = '';
  for (let i = 0; i < bytes.length; i += 16) {
    if (legend) _data += (i).toString(16).padStart(8, '0') + ': ';
    const row = bytes.slice(i, i + 16);

    if (hex) {
      for (let x = 0; x < 16; x += 2) {
        for (let x2 = 0; x2 < 2; x2 += 1) {
          const byte = row.at(x + x2);
          _data += byte === undefined
            ? '  '
            : byte.toString(16).toUpperCase().padStart(2, '0');
        }
        _data += ' ';
      }
      _data += ' ';
    }
    _data += String.fromCharCode(...row).replace(/[\x00-\x1F\x7F-\x9F\u200B-\u200F\u2028\u2029\u2060\uFEFF]/g, '.');
    _data += '\n';
  }
  return _data;
};
