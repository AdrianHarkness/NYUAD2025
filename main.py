from voter import Voter
from authenticator import Authenticator
from tallier import Tallier
from blockchain import QuantumBlockchain

KEY_LENGTH = 32

def simulate_voting():
    # setup nodes
    alice = Voter("Alice", key_length=KEY_LENGTH)
    auth = Authenticator("AuthNode", {alice.id: alice.public_key}, key_length=KEY_LENGTH)
    tally1 = Tallier("TallyNode1", key_length=KEY_LENGTH)
    tally2 = Tallier("TallyNode2", key_length=KEY_LENGTH)
    tally3 = Tallier("TallyNode3", key_length=KEY_LENGTH)
    talliers = [tally1, tally2, tally3]

    blockchain = QuantumBlockchain(talliers)

    # setup QKD channels
    alice.establish_qkd_channel(auth)
    for tally in talliers:
        alice.establish_qkd_channel(tally)
        auth.establish_qkd_channel(tally)

    # 1. Alice signs into device & votes
    alice.sign_identity()
    encoded_vote = alice.send_vote("YES", auth, talliers[0])

    # 2. Authenticator verifies & forwards
    forwarded_vote = auth.forward_vote(encoded_vote, talliers[0], alice)

    # 3. Tallier receives
    vote = talliers[0].receive_vote(forwarded_vote, auth)
    talliers[0].add_vote(alice.digital_signature.hex(), vote)

    proposed_blocks = []
    for tally in talliers:
        proposed_block = {"votes": tally.received_votes}
        proposed_blocks.append(proposed_block)

    if blockchain.quantum_byzantine_agreement(proposed_blocks):
        blockchain.display_chain()

if __name__ == "__main__":
    simulate_voting()