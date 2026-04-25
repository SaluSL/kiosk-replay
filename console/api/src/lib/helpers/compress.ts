import { CompressionFormat } from "bun";
import { brotliCompress, brotliDecompress } from "node:zlib";
import { promisify } from "node:util";

const brotliCompressAsync = promisify(brotliCompress);
const brotliDecompressAsync = promisify(brotliDecompress);

export async function compress(
  data: unknown,
  compressionFormat: CompressionFormat,
): Promise<Uint8Array> {
  if (compressionFormat !== "brotli") {
    throw new Error(`Unsupported compression format: ${compressionFormat}`);
  }

  const stringified = JSON.stringify(data);
  const compressed = await brotliCompressAsync(Buffer.from(stringified));
  return new Uint8Array(compressed);
}

export async function decompress<T = unknown>(
  blob: Uint8Array,
  compressionFormat: CompressionFormat,
): Promise<T> {
  if (compressionFormat !== "brotli") {
    throw new Error(`Unsupported compression format: ${compressionFormat}`);
  }

  const decompressed = await brotliDecompressAsync(blob);
  return JSON.parse(decompressed.toString()) as unknown as T;
}
