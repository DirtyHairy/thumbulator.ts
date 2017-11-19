# What is it?

This is a customized version of David Welch's
[thumbulator](https://github.com/dwelch67/thumbulator), an emulator targetting
the thumb subset of the ARM instruction set.

The thumbulator itself has been transpiled from C using
[emscripten](http://kripken.github.io/emscripten-site/), the glue code around it
is written in Typescript. As such, the module can be directly used with
TS, not external typings required (of course, it works in plain JS, too).

# How to use it?

The package has a single default export: the `Thumbulator` class. In order to
instatiate, you need to pass a `bus` object that implements reading and writing
from the bus.

```typescript
import Thumbulator from 'thumbulator.ts';

const thumbulator = new Thumbulator({
    read16: (address: number): number => {
        // read a 16 bit word at the given address
    },
    read32: (address: number): number => {
        // optional; read a 32 bit word (will use read16 instead if not specified)
    },
    write16: (address: number, value: number) => {
        // owrite a 16 bit word to the given address
    },
    write32: (address: number, value: number) => {
        // optional; write a 32 bit word (will use write16 if not specified)
    }
});
```

After instantiation, call init and wait for the promise to resolve in order to
make sure that the emscripten runtime has initialized.

```typescript
await thumbulator.init();
```

## Running the emulation

```typescript
const trapReason: Thumbulator.TrapReason = thumbulator.run(cycles);
```

Run the emulation for `cycles` instructions or until a trap occurs. See the
typings for trap codes.

## Aborting the running emulator (during bus access)

```typescript
thumbulator.abort();
```

This will cause `run` to return immediatelly with `TrapReason.abort`.

## Reset the emulation

```typescript
thumbulator.reset();
```

## Read and write registers

```typescript
const value = thumbulator.readRegister(r);
thumbulator.writeRegister(r, value);
```

These will read and write registers.

## Verbose debug output

```typescript
thumbulator.enableDebug(true);
```

# Why?

This module is used in the [6502.ts](https://github.com/6502ts/6502.ts) VCS emulator
in order to emulate the ARM SOC in the Harmony cartridge.

# License

This will cause the emulator to enter verbose mode and dump disassembly (via `console.error`);

Both David Welch's original code and the glue around it are licensed under the
MIT license.
