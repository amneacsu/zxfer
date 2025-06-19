# ZX Spectrum Tape Decoder using AudioWorklet

This project is a love letter to a simpler time, when home computing meant rainbow stripes, BASIC line numbers, and the oddly soothing screech of a tape loading screen. Using the low-level audio magic of the AudioWorklet API, this app listens to ZX Spectrum audio files, decodes their binary essence by counting T-states, and reconstructs the raw data block by block. All in your browser. No emulators or dependencies, no gimmicks, just pure signal.

## What It Does

- Listens to ZX Spectrum tape audio.
- Analyzes pulse timing to identify 0s, 1s, pilot tones, and sync pulses.
- Splits the stream into header and data blocks
- Displays raw hexadecimal data.
- All processing is done locally in real-time via the AudioWorklet thread for precise timing, just like a real Speccy.

## Why

Because decoding ZX tapes in the browser is technically unnecessary, and therefore completely irresistible. It blends nostalgia with audio engineering and web tech, in the spirit of exploration and digital archaeology.

## Getting Started

Clone the repo and run locally:

```bash
npm install
npm start
```

To build for production:

```bash
npm run build
```

Then open the `dist/` directory in your favorite static server.

## Resources & References

The decoding logic is based on documentation from the ZX Spectrum community:

- https://sinclair.wiki.zxnet.co.uk/wiki/Spectrum_tape_interface
- https://worldofspectrum.net/legacy-info/tape-decoding-using-taper/
- https://zxonline.net/zx-spectrum-graphics-magic-the-basics-every-spectrum-fan-should-know/
- https://worldofspectrum.org/faq/reference/128kreference.htm

## Future Improvements

The current version is functional, but there is still work to be done:

- Decoding video RAM to render ZX Spectrum loading screens and graphics
- Equalizer and filtering tools to clean up noisy or analog tape recordings
- Fine-grained controls for adjusting sampling rate and pulse width thresholds
- Support for detecting turbo loaders and custom tape formats
- Auto-detection of block type and content previews
