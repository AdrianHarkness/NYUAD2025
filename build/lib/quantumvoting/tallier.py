from .node import Node

class Tallier(Node):
    def __init__(self, node_id, qkd_key_length):
        super().__init__(node_id, qkd_key_length)
        self.received_votes = {}

    def receive_vote(self, encoded_vote, from_auth_node):
        decoded_vote_bits = self.receive_message(from_auth_node, encoded_vote)
        return decoded_vote_bits

    def add_vote(self, signature_hex, vote):
        self.received_votes[signature_hex] = vote
