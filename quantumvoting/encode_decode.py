def encode_bitstring(bitstring, key):
    """
    Encodes a bitstring using a shared secret key via XOR operation.
    """
    if len(key) < len(bitstring):
        raise ValueError("Key must be at least as long as bitstring.")
    key = key[:len(bitstring)]
    return ''.join(str(int(b) ^ int(k)) for b, k in zip(bitstring, key))

def decode_bitstring(encoded_bitstring, key):
    """
    Decodes an encoded bitstring using the shared secret key via XOR operation.
    """
    return encode_bitstring(encoded_bitstring, key)