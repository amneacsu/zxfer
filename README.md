## Resources

* https://sinclair.wiki.zxnet.co.uk/wiki/Spectrum_tape_interface
* https://worldofspectrum.net/legacy-info/tape-decoding-using-taper/
* https://zxonline.net/zx-spectrum-graphics-magic-the-basics-every-spectrum-fan-should-know/


- The first byte is the flag byte. The ROM uses this to make the difference between a ‘header’ block and a ‘data’ block.
- header: 00, data: ff
- The last byte is the parity byte. This is an 8-bit XOR of all previous bytes, including the flag byte. While loading the data, this parity is calculated again and matched with this last byte.
