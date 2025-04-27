from setuptools import setup, find_packages

setup(
    name="sawty",
    version="0.1.0",
    description="Quantum-secure blockchain-based voting system with QKD.",
    author="NYUAD 2025 Team 6 SAWTY",
    author_email="shandlaes@gmail.com",
    url="https://github.com/AdrianHarkness/NYUAD2025",
    packages=find_packages(),
    install_requires=[
        "qiskit",
        "cryptography"
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Topic :: Security :: Cryptography",
        "Intended Audience :: Developers",
    ],
    python_requires='>=3.8',
)