import random

# encode_decode.py

def encode_bitstring(bitstring, key):
    """
    Encodes a bitstring using a shared secret key via XOR operation.
    """
    if len(key) < len(bitstring):
        raise ValueError("Key must be at least as long as bitstring.")
    key = key[:len(bitstring)]  # slice key to fit message
    return ''.join(str(int(b) ^ int(k)) for b, k in zip(bitstring, key))

def decode_bitstring(encoded_bitstring, key):
    """
    Decodes an encoded bitstring using the shared secret key via XOR operation.
    """
    return encode_bitstring(encoded_bitstring, key)

# ex
if __name__ == "__main__":
    original = ''.join(str(random.randint(0, 1)) for _ in range(5))

    secret_key = "10101"

    print(f"Original: {original}")

    encoded = encode_bitstring(original, secret_key)
    print(f"Encoded: {encoded}")

    decoded = decode_bitstring(encoded, secret_key)
    print(f"Decoded: {decoded}")
    assert original == decoded, "Decoded bitstring does not match the original!"
    print("Encoding and decoding successful!")
    # This is a simple example. In practice, the key should be securely shared.
    # The key should be random and at least as long as the bitstring for security.