# SAWTY | صوتي
*Quantum Voting*

[![Release](https://img.shields.io/github/release/AdrianHarkness/quantumvoting.svg?style=popout-square)](https://github.com/AdrianHarkness/quantumvoting/releases)
[![Downloads](https://img.shields.io/pypi/dm/quantumvoting.svg?style=popout-square)](https://pypi.org/project/quantumvoting/)

## Motivation

**SAWTY**:  Privacy, security, authenticity

“My Vote, My Voice” is building a fully quantum-secure electronic voting system that redefines trust in decision-making. We ensure end-to-end ballot security, anonymity, consensus, and voter authentication, setting a new global standard for trustworthy elections.
*Please check out these slides for more [information](https://www.canva.com/design/DAGlxSn6JNY/dj9YdHfOwejP3PryE83FoA/view?utm_content=DAGlxSn6JNY&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h6b89bc681d).*

## Installation

*Conda users, please make sure to `conda install pip` before running any pip installation if you want to install `qudra` into your conda environment.*

`qudra` is published on PyPI. So, to install, simply run:

```bash
pip install qudra
```
If you also want to download the dependencies needed to run optional tutorials, please use `pip install qudra[dev]` or `pip install 'qudra[dev]'` (for `zsh` users).


To check if the installation was successful, run:

```python
>>> import qudra
```

## Building from source

To build `qudra` from source, pip install using:

```bash
git clone https://github.com/qcenergy/qudra.git
cd qudra
pip install --upgrade .
```

If you also want to download the dependencies needed to run optional tutorials, please use `pip install --upgrade .[dev]` or `pip install --upgrade '.[dev]'` (for `zsh` users).


#### Installation for Devs

If you intend to contribute to this project, please install `qudra` in editable mode as follows:
```bash
git clone https://github.com/qcenergy/qudra.git
cd qudra
pip install -e .[dev]
```

python3 -m venv venv
. venv/bin/activate
Please use `pip install -e '.[dev]'` if you are a `zsh` user.

#### Building documentation locally

Set yourself up to use the `[dev]` dependencies. Then, from the command line run:
```bash
mkdocs build
```

Then, when you're ready to deploy, run:
```bash
mkdocs gh-deploy
```

## Acknowledgements

**Core Devs:** [Asil Qraini](https://github.com/AsilQ), [Fouad Afiouni](https://github.com/fo-ui), [Gargi Chandrakar](https://github.com/gargi2718), [Nurgazy Seidaliev](https://github.com/nursei7), [Sahar Ben Rached](https://github.com/saharbenrached), [Salem Al Haddad](https://github.com/salemalhaddad), [Sarthak Prasad Malla](https://github.com/SarthakMalla1154)

**Mentors:** [Akash Kant](https://github.com/akashkthkr), [Shantanu Jha](https://github.com/Phionx)

This project was created at the [2022 NYUAD Hackathon](https://nyuad.nyu.edu/en/events/2022/march/nyuad-hackathon-event.html) for Social Good in the Arab World: Focusing on Quantum Computing (QC). 
