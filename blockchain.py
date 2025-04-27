# idk yet
class Blockchain:
    def __init__(self, tally_nodes):
        self.chain = []  # list of finalized vote blocks
        self.tally_nodes = tally_nodes  # all talliers participating

    def propose_block(self, vote_block):
        """
        Each Tallier proposes a block — for simplicity, assume all votes collected.
        """
        return vote_block

    def quantum_byzantine_agreement(self, proposed_blocks):
        """
        Simplified Quantum Byzantine Agreement:
        All tally nodes agree on the same block if >50% propose the same block.
        """
        block_counts = {}
        for block in proposed_blocks:
            block_counts[str(block)] = block_counts.get(str(block), 0) + 1

        # Find majority-agreed block
        majority_block, count = max(block_counts.items(), key=lambda item: item[1])

        if count >= (len(self.tally_nodes) // 2) + 1:
            print(f"Consensus reached: {majority_block}")
            self.chain.append(eval(majority_block))  # WARNING: eval is hackathon-level quickfix
            return True
        else:
            print("Consensus not reached.")
            return False

    def display_chain(self):
        print("\nQuantum Blockchain:")
        for i, block in enumerate(self.chain):
            print(f"Block {i}: {block}")