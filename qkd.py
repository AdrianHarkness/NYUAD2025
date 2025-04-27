import random
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

session_counter = 0
backend = AerSimulator()

def quantum_random_bit():
    """
    Random bit using a quantum circuit (|+> state measurement).
    """
    qc = QuantumCircuit(1, 1)
    qc.h(0)
    qc.measure(0, 0)

    compiled = transpile(qc, backend)
    job = backend.run(compiled)
    result = job.result()
    counts = result.get_counts()

    return int(max(counts, key=counts.get))  # 0 or 1

def quantum_random_choice(choices):
    """
    Randomly select an element from a list using quantum randomness.
    """
    index = 0
    for _ in range((len(choices)-1).bit_length()):  # enough bits to cover choices
        index = (index << 1) | quantum_random_bit()
    return choices[index % len(choices)]

def create_shared_key(qkd_key_length, node1, node2):
    """
    Simulates the BB84 protocol to generate a shared key of specified length.
    Continues the simulation until the desired number of matching bases is achieved.
    """
    global session_counter
    session_counter += 1
    print(f"\n--- QKD Session: {node1} ↔ {node2} ---\n")

    sifted_key = []
    total_qubits = 0

    while len(sifted_key) < qkd_key_length:
        alice_bit = quantum_random_bit()
        alice_basis = quantum_random_choice(['Z', 'X'])
        bob_basis = quantum_random_choice(['Z', 'X'])
        qc = QuantumCircuit(1, 1)

        if alice_basis == 'Z':
            if alice_bit == 1:
                qc.x(0)
        else:  # X basis
            if alice_bit == 0:
                qc.h(0)
            else:
                qc.x(0)
                qc.h(0)

        if bob_basis == 'X':
            qc.h(0)
        qc.measure(0, 0)

        compiled_circuit = transpile(qc, backend)
        job = backend.run(compiled_circuit)
        result = job.result()
        counts = result.get_counts()
        measured_bit = int(max(counts, key=counts.get))  # most probable outcome

        if alice_basis == bob_basis:
            sifted_key.append(alice_bit)
            print(f"Qubit {total_qubits}: Basis match ({alice_basis}). Aya's bit: {alice_bit}, Bassem's measurement: {measured_bit}")
        else:
            print(f"Qubit {total_qubits}: Basis mismatch (Aya: {alice_basis}, Bassem: {bob_basis}). Discarded.")

        total_qubits += 1

    print(f"\nTotal qubits sent: {total_qubits}")
    print(f"Final sifted key ({qkd_key_length} bits): {sifted_key}")
    return sifted_key

if __name__ == "__main__":
    QKD_KEY_LENGTH = 32  # desired length of the sifted key
    create_shared_key(QKD_KEY_LENGTH, "Node1", "Node2")