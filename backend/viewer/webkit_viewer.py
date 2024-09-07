#!/usr/bin/env python3

import sys
from PyQt5.QtCore import QUrl, QThread, pyqtSignal
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView
import socket
import add_css
import os

WEBKIT_PORT = int(sys.argv[2]) # What? Why is it argv[2]? In the JS, this is argv[3].. Well, it works. But why would argv[3] correspond to the same thing as argv[4] in JS..
FILENAME = sys.argv[4]

class HTMLServer(QThread):
    new_html_received = pyqtSignal(str)

    def run(self):
        server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server_socket.bind(('0.0.0.0', WEBKIT_PORT))
        server_socket.listen(1)
        print("Server started, waiting for connections...")

        while True:
            client_socket, addr = server_socket.accept()
            print(f"Connection from {addr}")
            self.handle_client(client_socket)

    def handle_client(self, client_socket):
        try:
            while True:
                data = client_socket.recv(30999).decode('utf-8')
                if data:
                    self.new_html_received.emit(data)
                else:
                    break
        except ConnectionResetError:
            print("Connection reset by peer")
            self.browser.setHtml("<html><body><h1>Connection Reset</h1></body></html>")

        finally:
            client_socket.close()

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.setWindowTitle("KaVimTex, " + FILENAME + ", on: " + str(WEBKIT_PORT))
        self.browser = QWebEngineView()

        self.setCentralWidget(self.browser)
        self.browser.setHtml("<html><body><h1>No Connections</h1></body></html>")

        self.server = HTMLServer()
        self.server.new_html_received.connect(self.update_html)
        self.browser.loadFinished.connect(self.check_ratio)
        self.server.start()

        self.page_height = 0
        self.ratio_lower_bound = 0.6
        self.ratio_upper_bound = 0.9
        self.recursion_count = 0
        self.width_checking_bool = False

    def update_html(self, html):
        if html.find("katex") != -1:
            html = add_css.addCSS(html)
            self.browser.setHtml(html)
            self.recursion_count = 0
            self.width_checking_bool = False
        if html == "KAVIMTEX CONNECTED":
            self.browser.setHtml("KVT")

    def check_ratio(self):

        def width_check(width):
            self.recursion_count += 1
            self.notify(f"{width / self.browser.width()}")
            
            if (width / self.browser.width() > 1.01):
                self.browser.page().setZoomFactor(self.browser.page().zoomFactor() * 0.9)
                return self.check_ratio() # recursion
            else:
                self.width_checking_bool = False
                return True

        def after_height_retrieved(height):

            self.recursion_count += 1
            if self.recursion_count > 100: 
                return False

            ratio = height / self.browser.height()
            
            if self.ratio_lower_bound <= ratio <= self.ratio_upper_bound:
                self.width_checking_bool = True
                self.browser.page().runJavaScript("document.body.scrollWidth * window.devicePixelRatio", width_check)
                # return True # it is within range

            else: # recursion time...
                current_zoom_factor = self.browser.page().zoomFactor()
                if ratio > self.ratio_upper_bound:
                    self.browser.page().setZoomFactor(current_zoom_factor * 0.9)
                elif ratio < self.ratio_lower_bound:
                    self.browser.page().setZoomFactor(current_zoom_factor * 1.1)
                
                return self.check_ratio()  # Recursion call

        if not (self.recursion_count > 100 or self.width_checking_bool):
            self.browser.page().runJavaScript("document.body.scrollHeight * window.devicePixelRatio ;", after_height_retrieved)
        elif (self.width_checking_bool) and not(self.recursion_count > 110):
            self.browser.page().runJavaScript("document.body.scrollWidth * window.devicePixelRatio", width_check)



    def notify(self,text):
        os.system(f"notify-send {text}")

if __name__ == '__main__':
    app = QApplication(sys.argv)
    app.setApplicationName("kvt_viewer")
    mainWindow = MainWindow()
    mainWindow.show()
    sys.exit(app.exec_())

