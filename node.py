from qkd import create_shared_key

class Node:
    def __init__(self, name, qkd_key_length):
        self.name = name
        self.qkd_key_length = qkd_key_length
        self.qkd_channels = {}

    def establish_qkd_channel(self, other_node):
        """
        Establish a QKD channel with another node and store the shared key.
        """
        shared_key = create_shared_key(self.qkd_key_length, self.name, other_node.name)
        self.qkd_channels[other_node.name] = shared_key
        other_node.qkd_channels[self.name] = shared_key  # symmetric for both nodes
        print(f"Shared key established between {self.name} and {other_node.name}.")

    def get_shared_key(self, other_node):
        """
        Retrieve the shared key for communication with another node.
        """
        return self.qkd_channels.get(other_node.name)

    def send_message(self, to_node, message_bits):
        """
        Encrypt a bitstring message using the shared key and send to another node.
        """
        key = self.get_shared_key(to_node)
        if key is None:
            raise Exception(f"No QKD key established between {self.name} and {to_node.name}")
        from encode_decode import encode_bitstring
        return encode_bitstring(message_bits, key)

    def receive_message(self, from_node, encoded_message):
        """
        Decrypt an incoming bitstring message from another node using the shared key.
        """
        key = self.get_shared_key(from_node)
        if key is None:
            raise Exception(f"No QKD key established between {self.name} and {from_node.name}")
        from encode_decode import decode_bitstring
        return decode_bitstring(encoded_message, key)