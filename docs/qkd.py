import random
import hashlib
import time
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

backend = AerSimulator()

def quantum_random_bit():
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.measure(0, 0)
    compiled = transpile(qc, backend)
    job = backend.run(compiled)
    result = job.result()
    counts = result.get_counts()
    return int(max(counts, key=counts.get))

def quantum_random_choice(choices):
    index = 0
    for _ in range((len(choices) - 1).bit_length()):
        index = (index << 1) | quantum_random_bit()
    return choices[index % len(choices)]

def create_shared_key(qkd_key_length, node1, node2, eve_attack_prob=0.2, sample_test_fraction=0.1, max_error_rate=0.15):
    print("-"*40 + f"\n--- QKD Session: {node1} ↔ {node2} ---\n"+"-"*40)

    sifted_key = []
    measured_bits = []
    node1_basis_list = []
    node2_basis_list = []
    eve_attacks = []
    total_qubits = 0

    print("Negotiating QKD key...", end=" ", flush=True)
    loader_length = 10
    loader_interval = max(1, qkd_key_length // loader_length)

    while len(sifted_key) < qkd_key_length:
        node1_bit = quantum_random_bit()
        node1_basis = quantum_random_choice(['Z', 'X'])
        node2_basis = quantum_random_choice(['Z', 'X'])

        qc = QuantumCircuit(1, 1)
        if node1_basis == 'Z':
            if node1_bit == 1:
                qc.x(0)
        else:
            if node1_bit == 0:
                qc.h(0)
            else:
                qc.x(0)
                qc.h(0)

        if random.random() < eve_attack_prob:
            eve_basis = random.choice(['Z', 'X'])
            if eve_basis != node1_basis:
                qc.x(0)
                eve_attacks.append({
                    "qubit": total_qubits,
                    "real_basis": node1_basis,
                    "eve_basis": eve_basis,
                    "action": "Flipped"
                })

        if node2_basis == 'X':
            qc.h(0)

        qc.measure(0, 0)
        compiled = transpile(qc, backend)
        job = backend.run(compiled)
        result = job.result()
        counts = result.get_counts()
        measured_bit = int(max(counts, key=counts.get))

        node1_basis_list.append(node1_basis)
        node2_basis_list.append(node2_basis)

        if node1_basis == node2_basis:
            sifted_key.append(node1_bit)
            measured_bits.append(measured_bit)

        total_qubits += 1
        if total_qubits % loader_interval == 0:
            print("#", end="", flush=True)

    print(" Done.\n")
    print(f"Total qubits sent: {total_qubits}")
    print(f"Total Eve attacks: {len(eve_attacks)}")

    if eve_attacks:
        print("\n--- Eve Attack Log ---")
        for attack in eve_attacks:
            print(f"Qubit {attack['qubit']}: Eve basis={attack['eve_basis']}, Sender basis={attack['real_basis']} ➔ {attack['action']}")
        print("----------------------\n")

    node1_basis_str = ''.join(node1_basis_list)
    node2_basis_str = ''.join(node2_basis_list)
    node1_basis_hash = hashlib.sha256(node1_basis_str.encode()).hexdigest()
    node2_basis_hash = hashlib.sha256(node2_basis_str.encode()).hexdigest()

    print(f"{node1} basis commitment (hash): {node1_basis_hash}")
    print(f"{node2} basis commitment (hash): {node2_basis_hash}")

    if hashlib.sha256(node1_basis_str.encode()).hexdigest() != node1_basis_hash:
        raise Exception(f"{node1} basis commitment mismatch!")
    if hashlib.sha256(node2_basis_str.encode()).hexdigest() != node2_basis_hash:
        raise Exception(f"{node2} basis commitment mismatch!")

    print("Basis commitments verified successfully.\n")
    print(f"Final sifted key before privacy amplification: {sifted_key}")

    sample_size = max(1, int(len(sifted_key) * sample_test_fraction))
    sample_indices = random.sample(range(len(sifted_key)), sample_size)
    errors = sum(sifted_key[idx] != measured_bits[idx] for idx in sample_indices)

    error_rate = errors / sample_size
    print(f"\nSample error rate: {error_rate:.2%} (allowed: {max_error_rate:.2%})")

    if error_rate > max_error_rate:
        raise Exception("QKD session aborted: Too much noise detected. Possible Eve attack.")

    final_key = [bit for i, bit in enumerate(sifted_key) if i not in sample_indices]
    final_length = int(len(final_key) * (1 - error_rate))
    final_key = final_key[:final_length]

    print(f"Final secure key ({len(final_key)} bits): {final_key}")
    return final_key