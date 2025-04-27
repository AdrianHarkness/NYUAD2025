# parent node class
from encode_decode import encode_bitstring, decode_bitstring
from qkd import create_shared_key

def text_to_bits(text):
    return ''.join(format(ord(c), '08b') for c in text)

def bits_to_text(bits):
    chars = [bits[i:i + 8] for i in range(0, len(bits), 8)]
    return ''.join(chr(int(char, 2)) for char in chars)

class Node:
    def __init__(self, node_id, key_length):
        self.id = node_id
        self.shared_keys = {}  # {other_node_id: shared_key}
        self.key_length = key_length  # store it here

    def establish_qkd_channel(self, other_node):
        shared_key = create_shared_key(self.key_length, self.id, other_node.id)
        self.shared_keys[other_node.id] = shared_key
        other_node.shared_keys[self.id] = shared_key

    def send_message(self, to_node, message):
        print("[DEBUG] Raw message:", message)
        serialized_message = str(message).encode()
        print("[DEBUG] Serialized message (bytes):", serialized_message)
        print("[DEBUG] Size of message:", len(serialized_message), "bytes =", len(serialized_message) * 8, "bits")

        key = self.shared_keys.get(to_node.id)
        if not key:
            raise Exception(f"No shared key established with {to_node.id}")

        message_bits = text_to_bits(message)

        if len(message_bits) > len(key):
            raise ValueError(
                f"Message is longer than key. Message length: {len(message_bits)}, key length: {len(key)}")

        key = key[:len(message_bits)]

        encoded_message = encode_bitstring(message_bits, key)
        return encoded_message

    def receive_message(self, from_node, encoded_message):
        key = self.shared_keys.get(from_node.id)
        if not key:
            raise Exception(f"No shared key established with {from_node.id}")

        decoded_bits = decode_bitstring(encoded_message, key)
        decoded_message = bits_to_text(decoded_bits)
        return decoded_message