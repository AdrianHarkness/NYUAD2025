from node import Node
from digital_signature import sign_message, load_private_key

class Voter(Node):
    def __init__(self, name, qkd_key_length):
        super().__init__(name, qkd_key_length)
        self.id = name
        self.private_key = load_private_key("private_key.pem")
        self.public_key = None  # will be provided separately or via constructor

    def sign_identity(self):
        """
        Signs the voter's identity.
        """
        self.signature = sign_message(self.private_key, self.id.encode())

    def send_vote(self, vote_index, auth_node, tally_node):
        vote_bits = [int(x) for x in format(vote_index, '03b')]
        encrypted_vote = self.send_message(auth_node, vote_bits)

        message_bytes = bytes(vote_bits)
        signature = sign_message(self.private_key, message_bytes)
        signature_hex = signature.hex()

        payload = f"{signature_hex}|{encrypted_vote}"

        return payload