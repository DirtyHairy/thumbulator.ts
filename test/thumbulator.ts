import * as assert from 'assert';

import Thumbulator from '../src/Thumbulator';

suite('thumbulator', () => {
    test('instantiation', async (): Promise<void> => {
        const thumbulator = new Thumbulator({
            read16: () => 0,
            write16: () => undefined
        });

        await thumbulator.init();

        assert.strictEqual(thumbulator.ping(), 'thumbulator');
    });
});
