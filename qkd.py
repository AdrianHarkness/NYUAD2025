import random
from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator

session_counter = 0

def create_shared_key(qkd_key_length, node1, node2):
    """
    Simulates the BB84 protocol to generate a shared key of specified length.
    Continues the simulation until the desired number of matching bases is achieved.
    """
    global session_counter
    session_counter += 1
    print(f"\n--- QKD Session: {node1} ↔ {node2} ---\n")

    backend = AerSimulator()
    sifted_key = []
    total_qubits = 0

    while len(sifted_key) < qkd_key_length:
        # Step 1: Alice randomly chooses a bit and a basis
        alice_bit = random.randint(0, 1)
        alice_basis = random.choice(['Z', 'X'])

        # Step 2: Bob randomly chooses a measurement basis
        bob_basis = random.choice(['Z', 'X'])

        # Step 3: Prepare quantum circuit
        qc = QuantumCircuit(1, 1)

        # Alice encodes the bit
        if alice_basis == 'Z':
            if alice_bit == 1:
                qc.x(0)
        else:  # X basis
            if alice_bit == 0:
                qc.h(0)
            else:
                qc.x(0)
                qc.h(0)

        # Bob measures
        if bob_basis == 'X':
            qc.h(0)
        qc.measure(0, 0)

        # Execute circuit
        compiled_circuit = transpile(qc, backend)
        job = backend.run(compiled_circuit)
        result = job.result()
        counts = result.get_counts()
        measured_bit = int(max(counts, key=counts.get))  # most probable outcome

        # Step 4: Sifting
        if alice_basis == bob_basis:
            sifted_key.append(alice_bit)
            print(f"Qubit {total_qubits}: Basis match ({alice_basis}). Alice's bit: {alice_bit}, Bob's measurement: {measured_bit}")
        else:
            print(f"Qubit {total_qubits}: Basis mismatch (Alice: {alice_basis}, Bob: {bob_basis}). Discarded.")

        total_qubits += 1

    print(f"\nTotal qubits sent: {total_qubits}")
    print(f"Final sifted key ({qkd_key_length} bits): {sifted_key}")
    return sifted_key

if __name__ == "__main__":
    QKD_KEY_LENGTH = 32  # desired length of the sifted key
    create_shared_key(QKD_KEY_LENGTH, "Node1", "Node2")