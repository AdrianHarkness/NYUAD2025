import random


def encode_bitstring(bitstring, key):
    """
    Encodes a bitstring using a shared secret key via XOR operation.

    Args:
        bitstring (str): The bitstring to encode (e.g., '1010').
        key (str): The shared secret key (must be the same length as bitstring).

    Returns:
        str: The encoded bitstring.
    """
    if len(bitstring) != len(key):
        raise ValueError("Bitstring and key must be of the same length.")
    return ''.join(str(int(b) ^ int(k)) for b, k in zip(bitstring, key))


def decode_bitstring(encoded_bitstring, key):
    """
    Decodes an encoded bitstring using the shared secret key via XOR operation.

    Args:
        encoded_bitstring (str): The encoded bitstring (e.g., '1100').
        key (str): The shared secret key (must be the same length as encoded_bitstring).

    Returns:
        str: The original bitstring.
    """
    # Decoding is the same as encoding due to XOR properties
    return encode_bitstring(encoded_bitstring, key)


# Example usage
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