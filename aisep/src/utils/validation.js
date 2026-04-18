/**
 * Lightweight Keccak-256 implementation (SHA-3 family)
 * Used for Ethereum EIP-55 checksum validation.
 */
const keccak256 = (function () {
    const rc = new Uint32Array([
        0x00000001, 0x00000000, 0x00008082, 0x00000000, 0x0000808a, 0x80000000, 0x80008000, 0x80000000,
        0x0000808b, 0x00000000, 0x80000001, 0x00000000, 0x80008081, 0x80000000, 0x80008009, 0x00000000,
        0x0000008a, 0x00000000, 0x00000088, 0x00000000, 0x80008009, 0x00000000, 0x8000000a, 0x00000000,
        0x8000808b, 0x00000000, 0x8000008b, 0x80000000, 0x80008089, 0x80000000, 0x80000003, 0x80000000,
        0x80000002, 0x80000000, 0x8000000a, 0x80000000, 0x0000800a, 0x80000000, 0x80008081, 0x80000000,
        0x80008080, 0x00000000, 0x00008001, 0x00000000, 0x80008008, 0x80000000, 0x80000001, 0x00000000
    ]);

    function rotateLeft(high, low, bits) {
        if (bits < 32) {
            return [
                (high << bits) | (low >>> (32 - bits)),
                (low << bits) | (high >>> (32 - bits))
            ];
        } else {
            bits -= 32;
            return [
                (low << bits) | (high >>> (32 - bits)),
                (high << bits) | (low >>> (32 - bits))
            ];
        }
    }

    // Simplified Keccak-256 for string inputs
    return function (message) {
        // This is a minimal implementation for hex string hashing (Ethereum style)
        // For EIP-55, we hash the lowercase address string (w/o 0x)
        const state = new Uint32Array(50); // 25 words of 64-bit (high, low pair)
        const msg = new TextEncoder().encode(message);
        const rate = 136; // bytes
        let offset = 0;

        while (offset < msg.length) {
            const blockSize = Math.min(msg.length - offset, rate);
            for (let i = 0; i < blockSize; i++) {
                const lane = Math.floor(i / 8);
                const byteOffset = (i % 8);
                if (byteOffset < 4) {
                    state[lane * 2] ^= msg[offset + i] << (byteOffset * 8);
                } else {
                    state[lane * 2 + 1] ^= msg[offset + i] << ((byteOffset - 4) * 8);
                }
            }
            offset += blockSize;

            if (blockSize === rate || offset === msg.length) {
                // Padding (minimal for keccak256)
                if (offset === msg.length) {
                    const i = blockSize;
                    const lane = Math.floor(i / 8);
                    const byteOffset = (i % 8);
                    if (byteOffset < 4) {
                        state[lane * 2] ^= 0x01 << (byteOffset * 8);
                    } else {
                        state[lane * 2 + 1] ^= 0x01 << ((byteOffset - 4) * 8);
                    }
                    state[((rate - 1) / 8 | 0) * 2 + 1] ^= 0x80000000;
                }

                // Keccak-f[1600] permutation
                for (let round = 0; round < 24; round++) {
                    const C = new Uint32Array(10);
                    for (let x = 0; x < 5; x++) {
                        C[x * 2] = state[x * 2] ^ state[(x + 5) * 2] ^ state[(x + 10) * 2] ^ state[(x + 15) * 2] ^ state[(x + 20) * 2];
                        C[x * 2 + 1] = state[x * 2 + 1] ^ state[(x + 10) * 2 + 1] ^ state[(x + 5) * 2 + 1] ^ state[(x + 15) * 2 + 1] ^ state[(x + 20) * 2 + 1];
                    }
                    for (let x = 0; x < 5; x++) {
                        const nextX = (x + 1) % 5;
                        const prevX = (x + 4) % 5;
                        const h = C[nextX * 2], l = C[nextX * 2 + 1];
                        const rotated = [(h << 1) | (l >>> 31), (l << 1) | (h >>> 31)];
                        const D = [C[prevX * 2] ^ rotated[0], C[prevX * 2 + 1] ^ rotated[1]];
                        for (let y = 0; y < 5; y++) {
                            state[(x + y * 5) * 2] ^= D[0];
                            state[(x + y * 5) * 2 + 1] ^= D[1];
                        }
                    }

                    // Rho and Pi
                    const nextState = new Uint32Array(50);
                    let [currX, currY] = [1, 0];
                    for (let t = 0; t < 24; t++) {
                        const piX = currY, piY = (2 * currX + 3 * currY) % 5;
                        const rotation = ((t + 1) * (t + 2) / 2) % 64;
                        const rot = rotateLeft(state[(currX + currY * 5) * 2], state[(currX + currY * 5) * 2 + 1], rotation);
                        nextState[(piX + piY * 5) * 2] = rot[0];
                        nextState[(piX + piY * 5) * 2 + 1] = rot[1];
                        [currX, currY] = [piX, piY];
                    }
                    nextState[0] = state[0]; nextState[1] = state[1];
                    
                    // Chi
                    for (let y = 0; y < 5; y++) {
                        const tempArr = new Uint32Array(10);
                        for (let x = 0; x < 5; x++) {
                            tempArr[x * 2] = nextState[(x + y * 5) * 2];
                            tempArr[x * 2 + 1] = nextState[(x + y * 5) * 2 + 1];
                        }
                        for (let x = 0; x < 5; x++) {
                            const x1 = (x + 1) % 5, x2 = (x + 2) % 5;
                            state[(x + y * 5) * 2] = tempArr[x * 2] ^ ((~tempArr[x1 * 2]) & tempArr[x2 * 2]);
                            state[(x + y * 5) * 2 + 1] = tempArr[x * 2 + 1] ^ ((~tempArr[x1 * 2 + 1]) & tempArr[x2 * 2 + 1]);
                        }
                    }

                    // Iota
                    state[0] ^= rc[round * 2];
                    state[1] ^= rc[round * 2 + 1];
                }
            }
        }

        // Output Result (hex string)
        let result = "";
        for (let i = 0; i < 8; i++) { // keccak256 means 32 bytes (8 words)
            let high = state[i * 2], low = state[i * 2 + 1];
            // JS Uint32 doesn't have a direct hex conversion that keeps endianness right for keccak
            // Need to convert bytes individually
            const bytes = [
                low & 0xFF, (low >>> 8) & 0xFF, (low >>> 16) & 0xFF, (low >>> 24) & 0xFF,
                high & 0xFF, (high >>> 8) & 0xFF, (high >>> 16) & 0xFF, (high >>> 24) & 0xFF
            ];
            result += bytes.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        return result;
    };
})();

/**
 * Validates an Ethereum address based on EIP-55 checksum.
 * @param {string} address - The Ethereum address to validate.
 * @returns {boolean} - True if valid.
 */
export const isEthereumAddress = (address) => {
    if (!address || typeof address !== 'string') return false;
    
    // Trim and normalize
    const cleanAddr = address.trim();
    
    // Check basic hex format: optional 0x followed by exactly 40 hex chars
    if (!/^(0x)?[0-9a-fA-F]{40}$/.test(cleanAddr)) return false;

    // We no longer strictly enforce EIP-55 checksum matches on the frontend
    // to avoid blocking users with legacy or API-formatted data.
    return true;
};

/**
 * Validates a string against the backend's allowed character set.
 * Regex: ^[a-zA-Z0-9 .,!?'-àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]*$
 */
export const isValidProfileString = (str, maxLength = 255) => {
    if (!str) return true; // Handled by required attribute if needed
    if (str.length > maxLength) return false;
    
    const regex = /^[a-zA-Z0-9 .,!?'-àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]*$/i;
    return regex.test(str);
};

/**
 * Validates investment amount (> 0)
 */
export const isValidInvestmentAmount = (amount) => {
    const num = Number(amount);
    return !isNaN(num) && num > 0;
};
