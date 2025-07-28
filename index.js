const fs = require('fs');
const input1 = require('./input1.json');
const input2 = require('./input2.json');

// Convert a digit character to its decimal value
function charToDigit(c) {
    if ('0' <= c && c <= '9') return c.charCodeAt(0) - '0'.charCodeAt(0);
    if ('a' <= c && c <= 'f') return c.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
    if ('A' <= c && c <= 'F') return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
    return -1; // invalid digit
}

// Convert string in base `base` to decimal number (using BigInt for safety)
function baseToDecimal(val, base) {
    let result = BigInt(0);
    let bigBase = BigInt(base);

    for (const c of val) {
        const digit = charToDigit(c);
        if (digit < 0 || digit >= base) {
            throw new Error(`Invalid digit '${c}' for base ${base}`);
        }
        result = result * bigBase + BigInt(digit);
    }
    return result;
}

// Lagrange interpolation to find f(0), i.e. constant term c
// points: array of {x: BigInt, y: BigInt}
function lagrangeConstantTerm(points) {
    const k = points.length;
    let secret = BigInt(0);

    for (let j = 0; j < k; j++) {
        let numerator = BigInt(1);
        let denominator = BigInt(1);
        const xj = points[j].x;

        for (let m = 0; m < k; m++) {
            if (m === j) continue;
            const xm = points[m].x;
            numerator *= -xm;                  // (0 - xm)
            denominator *= (xj - xm);
        }

        // Use integer division here since all coefficients are integers
        // But to avoid fractional, multiply y by numerator then divide by denominator
        // We assume denominator divides numerator * y perfectly (problem statement)
        // Use BigInt division:
        let term = points[j].y * numerator;
        if (term % denominator !== BigInt(0)) {
            throw new Error('Division with remainder detected, precision loss!');
        }
        term = term / denominator;
        secret += term;
    }
    return secret;
}

// Main function: read input, decode, compute secret
function processFile(filename) {
    const data = require(`./${filename}`);

    const n = data.keys.n;
    const k = data.keys.k;

    // Collect and decode points
    let points = [];
    for (const key in data) {
        if (key === 'keys') continue;
        const x = BigInt(key);
        const base = parseInt(data[key].base);
        const val = data[key].value;

        const y = baseToDecimal(val, base);
        points.push({x, y});
    }

    // Take first k points (or you can try combinations if you want)
    const selectedPoints = points.slice(0, k);

    const secret = lagrangeConstantTerm(selectedPoints);
    return secret;
}

// Run on both inputs and print result
function main() {
    try {
        const secret1 = processFile('input1.json');
        const secret2 = processFile('input2.json');

        console.log("Secret 1:", secret1.toString());
        console.log("Secret 2:", secret2.toString());
    } catch (err) {
        console.error("Error:", err.message);
    }
}

main();
