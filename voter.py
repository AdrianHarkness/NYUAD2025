# Alice in this case
from node import Node
from digital_signature import generate_keys, sign_message

class Voter(Node):
    def __init__(self, voter_id, key_length):
        super().__init__(voter_id, key_length)
        self.private_key, self.public_key = generate_keys()
        self.digital_signature = None

    def sign_identity(self):
        voter_id_bytes = self.id.encode()
        self.digital_signature = sign_message(self.private_key, voter_id_bytes)

    def send_vote(self, vote, auth_node, tally_node):
        vote_payload = vote # f"{self.digital_signature.hex()}|{vote}"
        encoded_vote = self.send_message(auth_node, vote_payload)
        return encoded_vote