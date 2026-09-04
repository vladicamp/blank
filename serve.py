#!/usr/bin/env python3
"""Local preview server for the Wild Sheep static build.

    python3 serve.py [port]          # default http://localhost:8756
    python3 serve.py [port] --lan    # also reachable from phones on the same Wi-Fi

Default binding is loopback only. `--lan` binds every interface so other devices
on the network can load the site — handy for testing the mobile layout on a real
handset, but it does serve this folder to anyone on the same Wi-Fi.
"""
import functools, http.server, os, socket, socketserver, sys

ROOT = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if not a.startswith('-')]
LAN = '--lan' in sys.argv
PORT = int(args[0]) if args else 8756
HOST = '0.0.0.0' if LAN else '127.0.0.1'


def lan_ip():
    """The address this machine presents on the local network. No traffic is
    sent — connect() on a UDP socket just picks the outbound interface."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('192.168.0.1', 1))
        return s.getsockname()[0]
    except OSError:
        return '127.0.0.1'
    finally:
        s.close()


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        '.otf': 'font/otf', '.ttf': 'font/ttf',
        '.svg': 'image/svg+xml', '.json': 'application/json',
    }

    # SimpleHTTPRequestHandler defaults to HTTP/1.0, which has no keep-alive: the
    # server closes the socket after every response, so each asset costs its own
    # TCP handshake. A game page pulls 35+ files, and on loopback that is free —
    # but over wifi to a phone it is 35 round trips against a 6-connection
    # browser limit, which is why the LAN preview crawled and rendered unstyled.
    # HTTP/1.1 reuses one connection for the lot. Safe here because every
    # response this server sends carries a Content-Length, which is what
    # keep-alive needs to find the end of a body.
    protocol_version = 'HTTP/1.1'

    def end_headers(self):
        # Always serve fresh files while iterating on the design.
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    # A phone that opens a connection and then sits on it must not be able to
    # hold the whole server hostage. Applies per connection, not per server.
    # It also bounds how long an idle keep-alive connection keeps its thread.
    timeout = 20

    def log_message(self, fmt, *args):
        sys.stderr.write('%s %s\n' % (self.address_string(), fmt % args))


class Server(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """Threaded on purpose. The stdlib's plain TCPServer handles one connection
    at a time, which is fine for one desktop browser on loopback and falls over
    the moment a real device is involved: a phone opens several connections in
    parallel, and one slow or half-open connection (an HTTPS probe against this
    plain-HTTP port will do it) blocks every other request behind it. Symptom is
    a page whose HTML and CSS arrive but whose data fetch never completes."""
    daemon_threads = True     # don't let open connections block Ctrl-C
    allow_reuse_address = True


os.chdir(ROOT)
with Server((HOST, PORT), functools.partial(Handler, directory=ROOT)) as httpd:
    print(f'Wild Sheep preview -> http://localhost:{PORT}/  (serving {ROOT})')
    if LAN:
        print(f'On this Wi-Fi        -> http://{lan_ip()}:{PORT}/')
    httpd.serve_forever()
