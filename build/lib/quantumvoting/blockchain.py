import hashlib
import json
import time

class Block:
    def __init__(self, index, previous_hash, timestamp, data, creator_node_id):
        self.index = index
        self.previous_hash = previous_hash
        self.timestamp = timestamp
        self.data = data
        self.creator_node_id = creator_node_id
        self.hash = self.calculate_hash()

    def calculate_hash(self):
        block_string = json.dumps({
            "index": self.index,
            "previous_hash": self.previous_hash,
            "timestamp": self.timestamp,
            "data": self.data,
            "creator_node_id": self.creator_node_id,
        }, sort_keys=True).encode()

        return hashlib.sha256(block_string).hexdigest()

class Blockchain:
    def __init__(self, tally_nodes):
        self.chain = [self.create_genesis_block()]
        self.tally_nodes = tally_nodes

    def create_genesis_block(self):
        return Block(0, "0", time.time(), "Genesis Block", "System")

    def get_latest_block(self):
        return self.chain[-1]

    def add_block(self, new_block):
        if new_block.previous_hash != self.get_latest_block().hash:
            raise Exception("Invalid block: previous hash does not match the chain.")
        self.chain.append(new_block)

    def propose_block(self, votes, node, fixed_creator=None, fixed_timestamp=None):
        new_block = Block(
            index=len(self.chain),
            previous_hash=self.get_latest_block().hash,
            timestamp=fixed_timestamp if fixed_timestamp is not None else time.time(),
            data=votes,
            creator_node_id=fixed_creator if fixed_creator is not None else node.name
        )
        return new_block

    def byzantine_agreement(self, proposed_blocks):
        block_counts = {}
        for block in proposed_blocks:
            block_repr = block.hash
            block_counts[block_repr] = block_counts.get(block_repr, 0) + 1

        majority_block_hash, count = max(block_counts.items(), key=lambda item: item[1])

        if count >= (len(self.tally_nodes) // 2) + 1:
            majority_block = next(b for b in proposed_blocks if b.hash == majority_block_hash)
            self.add_block(majority_block)
            print(f"Consensus reached. Block {majority_block.index} added.")
            return True
        else:
            print("Consensus not reached.")
            return False

    def display_chain(self):
        print("\nBlockchain:")
        for block in self.chain:
            print(f"Block {block.index} [Creator: {block.creator_node_id}]")
            print(f"  Timestamp: {time.ctime(block.timestamp)}")
            print(f"  Previous Hash: {block.previous_hash}")
            print(f"  Hash: {block.hash}")
            print(f"  Data: {block.data}")
            print("-" * 40)

    def simple_majority(self, block_index=1):
        if block_index >= len(self.chain):
            print(f"Block {block_index} does not exist.")
            return

        block = self.chain[block_index]
        vote_dict = block.data

        counts = {"YES": 0, "NO": 0, "ABSTAIN": 0}
        for vote_bits in vote_dict.values():
            try:
                vote_index = int(vote_bits, 2)
                choice = ["YES", "NO", "ABSTAIN"][vote_index]
                counts[choice] += 1
            except Exception as e:
                print(f"Error decoding vote {vote_bits}: {e}")

        print("\nSimple Majority Results:")
        for choice, count in counts.items():
            print(f"{choice}: {count}")

        winner = max(counts, key=lambda k: counts[k])
        print(f"\nWinner: {winner}")

    def export_json(self):
        exported_blocks = []
        for block in self.chain[1:]:  # skip Genesis block
            readable_votes = {}
            for sig_hex, vote_bits in block.data.items():
                try:
                    vote_index = int(vote_bits, 2)
                    choice = ["YES", "NO", "ABSTAIN"][vote_index]
                except:
                    choice = "INVALID"
                readable_votes[sig_hex] = choice

            exported_blocks.append({
                "index": block.index,
                "creator": block.creator_node_id,
                "timestamp": block.timestamp,
                "votes": readable_votes,
                "hash": block.hash,
                "previous_hash": block.previous_hash
            })

        return exported_blocks

    def save_json(self, filepath="blockchain.json"):
        data = self.export_json()
        with open(filepath, "w") as f:
            json.dump(data, f, indent=2)
        print(f"Blockchain exported to {filepath}")