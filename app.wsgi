import sys
sys.path.insert(0, "/var/web_session/") # root directory
import platform
#print platform.python_version()

from app import app as application
