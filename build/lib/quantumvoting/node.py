from quantumvoting.qkd import create_shared_key
from quantumvoting.encode_decode import encode_bitstring, decode_bitstring
from quantumvoting.digital_signature import CryptoManager

class Node:
    def __init__(self, name, qkd_key_length):
        self.name = name
        self.qkd_key_length = qkd_key_length
        self.qkd_channels = {}
        self.private_key = CryptoManager.load_private_key("private_key.pem")
        self.public_key = CryptoManager.load_public_key("public_key.pem")
        self.known_public_keys = {self.name: self.public_key}

    def establish_qkd_channel(self, other_node, max_retries=3):
        retries = 0
        while retries < max_retries:
            try:
                shared_key = create_shared_key(self.qkd_key_length, self.name, other_node.name)
                self.qkd_channels[other_node.name] = shared_key
                other_node.qkd_channels[self.name] = shared_key
                self.known_public_keys[other_node.name] = other_node.public_key
                other_node.known_public_keys[self.name] = self.public_key
                print(f"Shared key established between {self.name} and {other_node.name}.\n")
                return
            except Exception as e:
                print(f"QKD failed between {self.name} and {other_node.name}: {e}")
                retries += 1
                if retries < max_retries:
                    print(f"Retrying QKD... Attempt {retries+1}/{max_retries}")
                else:
                    raise Exception(f"Failed QKD session after {max_retries} attempts.")

    def get_shared_key(self, other_node):
        return self.qkd_channels.get(other_node.name)

    def send_message(self, to_node, message_bits):
        key = self.get_shared_key(to_node)
        if key is None:
            raise Exception(f"No QKD key between {self.name} and {to_node.name}")

        encoded_message = encode_bitstring(message_bits, key)
        signature = CryptoManager.sign_message(self.private_key, encoded_message.encode())
        return f"{encoded_message}|{signature.hex()}"

    def receive_message(self, from_node, incoming_payload):
        key = self.get_shared_key(from_node)
        if key is None:
            raise Exception(f"No QKD key between {self.name} and {from_node.name}")

        try:
            encoded_message, signature_hex = incoming_payload.split('|')
        except ValueError:
            raise Exception("Malformed message (missing signature).")

        public_key = self.known_public_keys.get(from_node.name)
        if public_key is None:
            raise Exception(f"No stored public key for {from_node.name}.")

        signature = bytes.fromhex(signature_hex)
        if not CryptoManager.verify_signature(public_key, encoded_message.encode(), signature):
            raise Exception(f"Signature verification failed for {from_node.name}.")

        decoded_message = decode_bitstring(encoded_message, key)
        return decoded_message