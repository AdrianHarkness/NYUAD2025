from .node import Node
from .digital_signature import CryptoManager

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
        return CryptoManager.verify_signature(public_key, message.encode(), signature)

    def forward_vote(self, encoded_vote_payload, tally_node, from_voter):
        try:
            parts = encoded_vote_payload.split('|')
            if len(parts) != 3:
                raise Exception(f"Malformed vote payload: expected 3 parts, got {len(parts)} parts.")
            voter_signature_hex, encrypted_vote_bits, encrypted_vote_signature_hex = parts
        except ValueError:
            raise Exception("Malformed vote payload (cannot split fields).")

        from_voter_public_key = self.known_public_keys.get(from_voter.name)
        if from_voter_public_key is None:
            raise Exception(f"No public key for {from_voter.name}.")

        if not CryptoManager.verify_signature(from_voter_public_key, encrypted_vote_bits.encode(), bytes.fromhex(encrypted_vote_signature_hex)):
            raise Exception(f"Signature verification of QKD channel from {from_voter.name} failed.")

        decoded_vote = self.receive_message(from_voter, f"{encrypted_vote_bits}|{encrypted_vote_signature_hex}")
        forwarded_vote = self.send_message(tally_node, decoded_vote)
        return voter_signature_hex, forwarded_vote