import numpy as np
import h5py
import tempfile
from app.services.loaders import load_ligo_hdf5


def test_load_ligo_hdf5_minimal():
    # create a minimal HDF5 file with a canonical strain dataset
    with tempfile.NamedTemporaryFile(suffix=".hdf5", delete=False) as fp:
        path = fp.name
    try:
        with h5py.File(path, "w") as f:
            d = f.create_dataset("strain/Strain", data=np.random.randn(4096).astype(np.float32))
            d.attrs["dt"] = 1.0/4096.0
        x, fs, meta = load_ligo_hdf5(path)
        assert x.ndim == 1 and x.size == 4096
        assert fs == 4096
        assert meta["type"] == "ligo"
    finally:
        try:
            import os
            os.remove(path)
        except Exception:
            pass

