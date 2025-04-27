import random
import hashlib
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

def create_shared_key(qkd_key_length, node1, node2, eve_attack_prob=0.05, sample_test_fraction=0.1, max_error_rate=0.15):
    print(f"\n--- QKD Session: {node1} ↔ {node2} ---\n")

    sifted_key = []
    measured_bits = []
    aya_basis_list = []
    bassem_basis_list = []

    total_qubits = 0

    while len(sifted_key) < qkd_key_length:
        aya_bit = quantum_random_bit()
        aya_basis = quantum_random_choice(['Z', 'X'])
        bassem_basis = quantum_random_choice(['Z', 'X'])

        qc = QuantumCircuit(1, 1)
        if aya_basis == 'Z':
            if aya_bit == 1:
                qc.x(0)
        else:
            if aya_bit == 0:
                qc.h(0)
            else:
                qc.x(0)
                qc.h(0)

        # Eve attack simulation
        if random.random() < eve_attack_prob:
            eve_basis = random.choice(['Z', 'X'])
            if eve_basis != aya_basis:
                if random.random() < 0.5:
                    qc.x(0)
                    print(f"Eve induced an error on qubit {total_qubits}!")

        if bassem_basis == 'X':
            qc.h(0)
        qc.measure(0, 0)
        compiled = transpile(qc, backend)
        job = backend.run(compiled)
        result = job.result()
        counts = result.get_counts()
        measured_bit = int(max(counts, key=counts.get))

        aya_basis_list.append(aya_basis)
        bassem_basis_list.append(bassem_basis)

        if aya_basis == bassem_basis:
            sifted_key.append(aya_bit)
            measured_bits.append(measured_bit)
            print(f"Qubit {total_qubits}: Basis match ({aya_basis}). Aya's bit: {aya_bit}, Bassem's measurement: {measured_bit}")
        else:
            print(f"Qubit {total_qubits}: Basis mismatch (Aya: {aya_basis}, Bassem: {bassem_basis}). Discarded.")

        total_qubits += 1

    print(f"\nTotal qubits sent: {total_qubits}")

    aya_basis_str = ''.join(aya_basis_list)
    bassem_basis_str = ''.join(bassem_basis_list)
    aya_basis_hash = hashlib.sha256(aya_basis_str.encode()).hexdigest()
    bassem_basis_hash = hashlib.sha256(bassem_basis_str.encode()).hexdigest()

    print(f"Aya basis commitment (hash): {aya_basis_hash}")
    print(f"Bassem basis commitment (hash): {bassem_basis_hash}")

    if hashlib.sha256(aya_basis_str.encode()).hexdigest() != aya_basis_hash:
        raise Exception("Aya basis commitment mismatch! Possible tampering.")
    if hashlib.sha256(bassem_basis_str.encode()).hexdigest() != bassem_basis_hash:
        raise Exception("Bassem basis commitment mismatch! Possible tampering.")

    print("Basis commitments verified successfully.\n")

    print(f"Final sifted key before privacy amplification: {sifted_key}")

    sample_size = max(1, int(len(sifted_key) * sample_test_fraction))
    sample_indices = random.sample(range(len(sifted_key)), sample_size)
    errors = 0

    for idx in sample_indices:
        if sifted_key[idx] != measured_bits[idx]:
            errors += 1

    error_rate = errors / sample_size
    print(f"\nSample error rate: {error_rate:.2%} (allowed: {max_error_rate:.2%})")

    if error_rate > max_error_rate:
        raise Exception("QKD session aborted: Too much noise detected. Possible Eve attack.")

    final_key = [bit for i, bit in enumerate(sifted_key) if i not in sample_indices]
    final_length = int(len(final_key) * (1 - error_rate))
    final_key = final_key[:final_length]

    print(f"Final secure key ({len(final_key)} bits): {final_key}")
    return final_key