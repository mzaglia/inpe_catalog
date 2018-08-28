import os
from catalog import app

app.run(debug=True, host=os.environ.get('CATALOG_HOST'), port=os.environ.get('CATALOG_PORT'))
