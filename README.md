# bitburner-python
Run Python scripts inside BitBurner! Uses [Brython](https://github.com/brython-dev/brython) to interpret and run Python. 

Example implementation in `example.py.txt` can invoke BitBurner-specific `ns` functions<br>
and properly handles async/await to avoid `ns` promise race conditions.

### Installation
* Copy both scripts into your BitBurner install
* `run python.js example.py.txt`

* Extend, cleanup, and use however you like!
