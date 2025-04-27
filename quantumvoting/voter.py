from quantumvoting.node import Node
from quantumvoting.digital_signature import CryptoManager

class Voter(Node):
    def __init__(self, name, qkd_key_length):
        super().__init__(name, qkd_key_length)
        self.id = name
        # No need to load or overwrite private_key, already generated in Node.__init__()

    def sign_identity(self):
        self.signature = CryptoManager.sign_message(self.private_key, self.id.encode())

    def send_vote(self, vote_index, auth_node, tally_node):
        vote_bits = [int(x) for x in format(vote_index, '03b')]

        encrypted_vote = self.send_message(auth_node, vote_bits)

        message_bytes = bytes(vote_bits)
        vote_signature = CryptoManager.sign_message(self.private_key, message_bytes)

        payload = f"{vote_signature.hex()}|{encrypted_vote}"
        return payload