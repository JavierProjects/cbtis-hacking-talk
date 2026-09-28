"""Check the authorization boundary that drives the on-stage demonstration."""

import http.client
import json
import threading
import unittest
from http.server import ThreadingHTTPServer

from server import Handler


class DemoAuthorizationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def request(self, path, cookie=None, method="GET"):
        connection = http.client.HTTPConnection("127.0.0.1", self.server.server_port)
        headers = {"Cookie": cookie} if cookie else {}
        connection.request(method, path, headers=headers)
        response = connection.getresponse()
        data = json.loads(response.read())
        result = response.status, response.getheader("Set-Cookie"), data
        connection.close()
        return result

    def test_demo_shows_missing_check_and_server_side_fix(self):
        status, _, _ = self.request("/api/vulnerable/expedientes/105")
        self.assertEqual(status, 401)
        _, cookie, session = self.request("/api/session")
        self.assertEqual(session["user"], "alex")
        cookie = cookie.split(";", 1)[0]
        own_status, _, own = self.request("/api/protected/expedientes/104", cookie)
        leak_status, _, other = self.request("/api/vulnerable/expedientes/105", cookie)
        blocked_status, _, blocked = self.request("/api/protected/expedientes/105", cookie)
        self.assertEqual((own_status, own["name"]), (200, "Alex Rivera"))
        self.assertEqual((leak_status, other["name"]), (200, "Sam Ortega"))
        self.assertEqual(blocked_status, 403)
        self.assertIn("Acceso denegado", blocked["error"])

        fixed_status, _, state = self.request("/api/demo/fix", cookie, "POST")
        self.assertEqual((fixed_status, state["fixed"]), (200, True))
        old_url_status, _, _ = self.request("/api/vulnerable/expedientes/105", cookie)
        own_old_url_status, _, _ = self.request("/api/vulnerable/expedientes/104", cookie)
        self.assertEqual((old_url_status, own_old_url_status), (403, 200))
        _, _, same_session = self.request("/api/session", cookie)
        self.assertTrue(same_session["fixed"])

        reset_status, _, state = self.request("/api/demo/reset", cookie, "POST")
        self.assertEqual((reset_status, state["fixed"]), (200, False))
        replay_status, _, _ = self.request("/api/vulnerable/expedientes/105", cookie)
        self.assertEqual(replay_status, 200)


if __name__ == "__main__":
    unittest.main()
