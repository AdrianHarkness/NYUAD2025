from voter import Voter
from authenticator import Authenticator
from tallier import Tallier
from blockchain import Blockchain

CHOICES = ["YES", "NO", "ABSTAIN"]
VOTER_CHOICE = "YES"
VOTE_INDEX = CHOICES.index(VOTER_CHOICE)
QKD_KEY_LENGTH = 32  # quantum key length (for encrypting messages between nodes)

def simulate_voting():
    # setup nodes
    alice = Voter("Alice", qkd_key_length=QKD_KEY_LENGTH)
    auth = Authenticator("AuthNode", {alice.id: alice.public_key}, qkd_key_length=QKD_KEY_LENGTH)
    tally1 = Tallier("TallyNode1", qkd_key_length=QKD_KEY_LENGTH)
    tally2 = Tallier("TallyNode2", qkd_key_length=QKD_KEY_LENGTH)
    tally3 = Tallier("TallyNode3", qkd_key_length=QKD_KEY_LENGTH)
    talliers = [tally1, tally2, tally3]

    blockchain = Blockchain(talliers)

    # setup QKD channels
    alice.establish_qkd_channel(auth)
    for tally in talliers:
        alice.establish_qkd_channel(tally)
        auth.establish_qkd_channel(tally)

    # 1. Alice signs identity & sends vote
    alice.sign_identity()
    vote_payload = alice.send_vote(VOTE_INDEX, auth, talliers[0])  # fixed: one output only

    # 2. authenticator verifies and forwards
    signature_hex, forwarded_vote = auth.forward_vote(vote_payload, talliers[0], alice)

    # 3. tally receives and adds vote
    vote = talliers[0].receive_vote(forwarded_vote, auth)
    talliers[0].add_vote(signature_hex, vote)

    # 4. consensus & blockchain display
    proposed_blocks = [{"votes": tally.received_votes} for tally in talliers]
    if blockchain.quantum_byzantine_agreement(proposed_blocks):
        blockchain.display_chain()

if __name__ == "__main__":
    simulate_voting()