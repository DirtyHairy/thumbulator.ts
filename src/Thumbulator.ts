/*
 * Copyright (c) 2017 Christian Speckner & Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
*/

/// <reference types="emscripten" />
import nativeThumbulator = require('./native/thumbulator');

interface ExportApi {
    _run(cycles: number): Thumbulator.TrapReason;
    _enable_debug(enable: number): void;
    _reset(): void;
    _read_register(register: number): number;
    _write_register(register: number, value: number): void;
    _abort_run(): void;
    _set_stop_address(address: number): void;
}

type EmModule = ExportApi & typeof Module;

interface EmModuleApi {
    print(data: string): void;
    printErr(data: string): void;
    trapOnInstructionFetch(address: number): number;
    trapOnBx32(address: number, targetAddress: number): number;

    busRead16(address: number): number;
    busRead32(address: number): number;

    busWrite16(address: number, value: number): void;
    busWrite32(address: number, value: number): void;
}

class Thumbulator {
    constructor(bus: Thumbulator.Bus, options: Thumbulator.Options = {}) {
        this._options = {
            stopAddress: 0,
            ...options
        };

        this._module = nativeThumbulator(this._getApi(bus, this._options));
        this.enableDebug(false);
    }

    async init(): Promise<void> {
        this._module._set_stop_address(this._options.stopAddress);
    }

    ping(): string {
        return this._module.ccall('ping', 'string', [], []);
    }

    run(cycles: number): Thumbulator.TrapReason | number {
        return this._module._run(cycles);
    }

    abort(): void {
        this._module._abort_run();
    }

    enableDebug(enable: boolean) {
        this._module._enable_debug(enable ? 1 : 0);
    }

    reset(): void {
        this._module._reset();
    }

    readRegister(register: number): number {
        if (register < 0 || register > 15) {
            throw new Error(`illegal thumb register ${register}`);
        }

        return this._module._read_register(register);
    }

    writeRegister(register: number, value: number) {
        if (register < 0 || register > 15) {
            throw new Error(`illegal thumb register ${register}`);
        }

        this._module._write_register(register, value);
    }

    private _getApi(bus: Thumbulator.Bus, options: Thumbulator.Options): EmModuleApi {
        const printer = options.printer || (data => console.log('thumbulator: ' + data));

        return {
            print: printer,
            printErr: printer,
            trapOnInstructionFetch: options.trapOnInstructionFetch || (() => 0),
            trapOnBx32: options.trapOnBx32 || (() => Thumbulator.TrapReason.bxLeaveThumb),

            busRead16: bus.read16,
            busRead32: bus.read32 || (address => (bus.read16(address) & 0xffff) | (bus.read16(address + 2) << 16)),

            busWrite16: bus.write16,
            busWrite32:
                bus.write32 ||
                ((address, value) => (bus.write16(address, value & 0xffff), bus.write16(address + 2, value >>> 16)))
        };
    }

    private _module: EmModule = null;

    private _options: Thumbulator.Options = null;
}

namespace Thumbulator {
    export const enum TrapReason {
        noTrap = 0,
        breakpoint = 1,
        blxLeaveThumb = 2,
        bxLeaveThumb = 3,
        abort = 10,
        stop = 20
    }

    export interface Bus {
        read16(address: number): number;
        read32?(address: number): number;

        write16(address: number, value: number): void;
        write32?(address: number, value: number): void;
    }

    export interface Options {
        printer?: (data: string) => void;
        trapOnInstructionFetch?: (address: number) => number;
        stopAddress?: number;
        trapOnBx32?: (address: number, targetAddress: number) => number;
    }
}

export default Thumbulator;
