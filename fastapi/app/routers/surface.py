from fastapi import APIRouter, Body, Query

router = APIRouter()


def _ct_proxy(gamma: float, energy: float) -> float:
    # simple monotone surface: grows with both parameters
    return float((gamma / 100.0) * (energy ** 0.5))


@router.post("/psi_surface")
def psi_surface(body: dict = Body(default_factory=dict)):
    gmin = float(body.get("gmin", 20.0))
    gmax = float(body.get("gmax", 140.0))
    emin = float(body.get("emin", 1e-4))
    emax = float(body.get("emax", 1e-1))
    n = int(body.get("n", 24))

    import numpy as np
    gamma = np.linspace(gmin, gmax, n)
    energy = np.linspace(emin, emax, n)
    ct = [[_ct_proxy(g, e) for g in gamma] for e in energy]
    return {"gamma": gamma.tolist(), "energy": energy.tolist(), "ct": ct}


# Express gateway compatibility (GET + dash in path)
@router.get("/psi-surface")
def psi_surface_get(
    gmin: float = Query(20.0), gmax: float = Query(140.0),
    emin: float = Query(1e-4), emax: float = Query(1e-1),
    n: int = Query(24)
):
    return psi_surface({"gmin": gmin, "gmax": gmax, "emin": emin, "emax": emax, "n": n})

