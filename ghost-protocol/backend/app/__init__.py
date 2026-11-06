import sys

if not ((3, 10) <= sys.version_info[:2] <= (3, 13)):
    raise RuntimeError(
        f"Unsupported Python {sys.version_info.major}.{sys.version_info.minor}: this backend needs Python 3.10-3.13 "
        "(onnxruntime / chromadb have no wheels for newer versions). Recreate the venv with a supported interpreter."
    )
