from flask import Flask
from flask_cors import CORS
import os
import sys
import subprocess

sys.path.insert(1, '../sam-test')

import get_mask

app = Flask(__name__)
cors = CORS(app, resources={r"/mask": {"origins": "*"}})

@app.route("/mask")
def mask():
    subprocess.run(["python", "get_mask.py"])
    return {"testing": ["Mask1", "Mask2"]}


if __name__ == "__main__":
    app.run(debug=True)
