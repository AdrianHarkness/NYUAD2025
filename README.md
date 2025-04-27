# SAWTY | صوتي  
*Quantum-Secure Electronic Voting*

[![Release](https://img.shields.io/github/v/release/AdrianHarkness/NYUAD2025.svg?style=popout-square)](https://github.com/AdrianHarkness/NYUAD2025/releases)
[![PyPI version](https://img.shields.io/pypi/v/sawty.svg?style=popout-square)](https://pypi.org/project/sawty/)

---

## Motivation

**SAWTY**: Privacy, security, authenticity.

"My Vote, My Voice" is building a fully quantum-secure electronic voting system that redefines trust in decision-making.  
We ensure end-to-end ballot security, anonymity, consensus, and voter authentication, setting a new global standard for trustworthy elections.

[More information here](https://www.canva.com/design/DAGlxSn6JNY/dj9YdHfOwejP3PryE83FoA/view?utm_content=DAGlxSn6JNY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6b89bc681d)

---

## Features

- **Quantum Key Distribution (QKD)**: secure keys for ballot encryption.
- **Quantum-Safe Digital Signatures**: voter authentication without compromising anonymity.
- **Encrypted, Anonymized Ballots**: votes are end-to-end encrypted with zero leakage.
- **Blockchain Consensus**: votes are recorded only after a Byzantine agreement between tallying nodes.
- **Built-in Simulation Tools**: easily test small- to medium-scale elections with quantum-secure infrastructure.

---

## Installation

```bash
pip install sawty
```

Or clone the repository directly:

```bash
git clone https://github.com/AdrianHarkness/quantumvoting.git
cd quantumvoting
pip install .
```

---

## Usage Example

You can quickly simulate a quantum-secure election by running:

```python
import sawty
import time

# Define choices and voters
CHOICES = ["YES", "NO", "ABSTAIN"]
VOTER_CHOICES = {
    "Aya": "YES",
    "Bassem": "NO",
    "Charlie": "ABSTAIN",
    "Dana": "NO",
    "Ella": "NO",
}

QKD_KEY_LENGTH = 32

# Initialize nodes
voters = [Voter(name, qkd_key_length=QKD_KEY_LENGTH) for name in VOTER_CHOICES.keys()]
voter_dict = {voter.id: voter.public_key for voter in voters}
auth = Authenticator("AuthNode", voter_dict, qkd_key_length=QKD_KEY_LENGTH)
talliers = [Tallier(f"TallyNode{i+1}", qkd_key_length=QKD_KEY_LENGTH) for i in range(3)]
blockchain = Blockchain(talliers)

# Quantum key distribution
for voter in voters:
    voter.establish_qkd_channel(auth)
    for tally in talliers:
        voter.establish_qkd_channel(tally)
for tally in talliers:
    auth.establish_qkd_channel(tally)

# Voting process
for voter in voters:
    voter.sign_identity()
    choice = CHOICES.index(VOTER_CHOICES[voter.name])
    vote_payload = voter.send_vote(choice, auth, talliers[0])
    signature_hex, forwarded_vote = auth.forward_vote(vote_payload, talliers[0], voter)
    for tally in talliers:
        vote = tally.receive_vote(forwarded_vote, auth)
        tally.add_vote(signature_hex, vote)

# Blockchain and consensus
snapshot = talliers[0].received_votes.copy()
timestamp = time.time()
blocks = [blockchain.propose_block(snapshot, t, fixed_creator="TallyConsensus", fixed_timestamp=timestamp) for t in talliers]

if blockchain.byzantine_agreement(blocks):
    blockchain.display_chain()
    blockchain.save_json("blockchain.json")
    blockchain.simple_majority()
```

---

## Project Status

✅ Local voting simulation fully functional  
✅ Quantum Key Distribution with Eve attack simulation  
✅ Blockchain consensus + vote majority calculator  
✅ PyPI package publishing: [https://pypi.org/project/sawty/0.1.0/](https://pypi.org/project/sawty/0.1.0/)

---

## License

This project is licensed under the **MIT License**.  
See the [LICENSE](https://opensource.org/licenses/MIT) file for details.

---

## Acknowledgments

- Inspired by real-world challenges in **secure elections**.
- Based on quantum information protocols such as **BB84** and **Byzantine Fault Tolerance**.
- Built to serve both **academic research** and **real-world democracy**.

---

🌟 Your voice matters. Your vote should too. 🌟
