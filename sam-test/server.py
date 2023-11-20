from flask import Flask
from flask_cors import CORS
import os
import sys
import subprocess

sys.path.insert(1, '../sam-test')

import get_mask

app = Flask(__name__)
CORS(app)

@app.route("/mask/<x_value>/<y_value>")
def mask(x_value=0, y_value=0):
    subprocess.run(["python", "get_mask.py", x_value, y_value])
    return {"testing": ["Mask1", "Mask2"]}


if __name__ == "__main__":
    app.run(debug=True)
