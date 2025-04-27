from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding


def generate_keys(rsa_key_size=1024):
    """
    Generates a pair of RSA keys (public and private) and saves them to files.
    """
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=rsa_key_size,
    )

    public_key = private_key.public_key()

    # Save private key
    with open("private_key.pem", "wb") as f:
        f.write(private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        ))

    # Save public key
    with open("public_key.pem", "wb") as f:
        f.write(public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ))

    return private_key, public_key


def load_private_key(file_path):
    with open(file_path, "rb") as f:
        private_key = serialization.load_pem_private_key(
            f.read(),
            password=None,
        )
    return private_key


def load_public_key(file_path):
    with open(file_path, "rb") as f:
        public_key = serialization.load_pem_public_key(
            f.read(),
        )
    return public_key


def sign_message(private_key, message):
    """
    Signs a message using the private key.
    """
    signature = private_key.sign(
        message,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )

    with open("signature.bin", "wb") as f:
        f.write(signature)

    return signature


def verify_signature(public_key, message, signature):
    """
    Verifies the signature of a message using the public key.
    """
    try:
        public_key.verify(
            signature,
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        return True
    except Exception as e:
        print(f"Verification failed: {e}")
        return False


if __name__ == "__main__":
    RSA_KEY_SIZE = 1024  # Signature key size
    private_key, public_key = generate_keys(RSA_KEY_SIZE)

    private_key = load_private_key("private_key.pem")
    public_key = load_public_key("public_key.pem")
    message = b"Vote Team 6!"
    signature = sign_message(private_key, message)
    print(f"Signature: {signature}")

    is_valid = verify_signature(public_key, message, signature)
    print(f"Signature valid: {is_valid}")