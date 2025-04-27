from node import Node

class Tallier(Node):
    def __init__(self, node_id, key_length):
        super().__init__(node_id, key_length)
        self.received_votes = {}

    def receive_vote(self, encoded_vote, from_auth_node):
        vote = self.receive_message(from_auth_node, encoded_vote)
        return vote

    def add_vote(self, signature_hex, vote):
        self.received_votes[signature_hex] = vote

    def establish_consensus(self, other_talliers):
        # For hackathon simplicity, assume honest majority
        return True

    def publish_results(self):
        print("Final Results:")
        for sig, vote in self.received_votes.items():
            print(f"Vote: {vote}")