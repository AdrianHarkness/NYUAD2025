import random
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

session_counter = 0
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
    for _ in range((len(choices)-1).bit_length()):
        index = (index << 1) | quantum_random_bit()
    return choices[index % len(choices)]

def create_shared_key(qkd_key_length, node1, node2, eve_attack_prob=0.05, sample_test_fraction=0.1, max_error_rate=0.15):
    global session_counter
    session_counter += 1
    print(f"\n--- QKD Session: {node1} ↔ {node2} ---\n")

    sifted_key = []
    measured_bits = []
    bases_match = []

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

        # Eve attack on basis-matched qubits
        if random.random() < eve_attack_prob:
            eve_guess_basis = random.choice(['Z', 'X'])
            if eve_guess_basis == aya_basis:
                pass
            else:
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

        if aya_basis == bassem_basis:
            sifted_key.append(aya_bit)
            measured_bits.append(measured_bit)
            bases_match.append(total_qubits)

            print(f"Qubit {total_qubits}: Basis match ({aya_basis}). Aya's bit: {aya_bit}, Bassem's measurement: {measured_bit}")
        else:
            print(f"Qubit {total_qubits}: Basis mismatch (Aya: {aya_basis}, Bassem: {bassem_basis}). Discarded.")

        total_qubits += 1

    print(f"\nTotal qubits sent: {total_qubits}")
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
        raise Exception("QKD session aborted: Too much noise detected. (Possible Eve attack)")

    final_key = [bit for i, bit in enumerate(sifted_key) if i not in sample_indices]

    shrink_factor = (1 - error_rate)
    final_length = int(len(final_key) * shrink_factor)

    final_key = final_key[:final_length]

    print(f"Final secure key ({len(final_key)} bits): {final_key}")
    return final_key

if __name__ == "__main__":
    QKD_KEY_LENGTH = 32
    create_shared_key(QKD_KEY_LENGTH, "Node1", "Node2")