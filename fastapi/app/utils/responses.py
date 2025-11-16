import io, csv
from typing import Iterable, Dict, Any
from fastapi.responses import StreamingResponse

def csv_stream(rows: Iterable[Dict[str, Any]], filename="phase45r4.csv"):
    def gen():
        fp = io.StringIO()
        w = None
        for r in rows:
            if w is None:
                w = csv.DictWriter(fp, fieldnames=list(r.keys()))
                w.writeheader()
            w.writerow(r); fp.seek(0)
            chunk = fp.read(); fp.seek(0); fp.truncate(0)
            yield chunk
    return StreamingResponse(gen(), media_type="text/csv",
                             headers={"Content-Disposition": f'attachment; filename="{filename}"'})
