import os
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import serialization, hashes

class CryptoManager:
    @staticmethod
    def generate_keys(rsa_key_size=1024):
        # RSA for authentication
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=rsa_key_size,
        )
        public_key = private_key.public_key()

        with open("public_key.pem", "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo
            ))

        return private_key, public_key

    @staticmethod
    def load_private_key(file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Private key file '{file_path}' not found. Please provide manually.")
        with open(file_path, "rb") as f:
            return serialization.load_pem_private_key(f.read(), password=None)

    @staticmethod
    def load_public_key(file_path):
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Public key file '{file_path}' not found. Please generate it manually.")
        with open(file_path, "rb") as f:
            return serialization.load_pem_public_key(f.read())

    @staticmethod
    def sign_message(private_key, message):
        return private_key.sign(
            message,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )

    @staticmethod
    def verify_signature(public_key, message, signature):
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