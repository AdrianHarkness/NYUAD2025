from node import Node
from digital_signature import verify_signature

class Authenticator(Node):
    def __init__(self, node_id, voter_list, qkd_key_length):
        super().__init__(node_id, qkd_key_length)
        self.voter_list = voter_list
        self.received_ds_table = set()

    def verify_unique(self, digital_signature_hex):
        if digital_signature_hex in self.received_ds_table:
            return False
        self.received_ds_table.add(digital_signature_hex)
        return True

    def verify_registered_voter(self, voter_id):
        return voter_id in self.voter_list

    def verify_signature(self, voter_id, signature, message):
        public_key = self.voter_list.get(voter_id)
        return verify_signature(public_key, message.encode(), signature)

    def forward_vote(self, encoded_vote_payload, tally_node, from_voter):
        signature_hex, encoded_vote = encoded_vote_payload.split('|')
        decoded_vote = self.receive_message(from_voter, encoded_vote)
        forwarded_vote = self.send_message(tally_node, decoded_vote)
        return signature_hex, forwarded_vote