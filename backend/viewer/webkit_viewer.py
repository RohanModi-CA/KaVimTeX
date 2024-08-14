#!/usr/bin/env python3

import sys
from PyQt5.QtCore import QUrl, QThread, pyqtSignal
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView
import socket
import add_css
# import io

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
        self.base_url = QUrl.fromLocalFile("/home/rohan/.config/nvim/lua/llvp/render/resources/")
        self.browser.setHtml("<html><body><h1>No Connections</h1></body></html>")

        self.server = HTMLServer()
        self.server.new_html_received.connect(self.update_html)
        self.browser.loadFinished.connect(self.check_ratio)
        self.server.start()

        self.page_height = 0
        self.ratio_lower_bound = 0.6
        self.ratio_upper_bound = 0.9

    def update_html(self, html):
        if html == "KAVIMTEX TERMINATED":
            self.browser.setHtml(r"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Display Connection Terminated</title><style>body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } .serif { font-family: "Times New Roman", Times, serif; }</style></head><body><div class="serif">Connection Terminated</div></body></html>""")
            self.server.terminate()
            QApplication.quit()
            sys.exit(app.exec_())
        if html.find("katex") != -1:

            html = add_css.addCSS(html)
            self.browser.setHtml(html)
            #self.notify(html)

        if html == "KAVIMTEX CONNECTED":
            # self.browser.setHtml(r"""<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Display KVT</title><style>body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; } .serif { font-family: "Times New Roman", Times, serif; }</style></head><body><div class="serif">KVT</div></body></html>""")
            self.browser.setHtml("KVT")

    def resize_to_content_height(self, height):
        # self.resize(self.width(), height)
        # self.update_html(f"katex {height}")
        browser_h = self.browser.height()
        self.browser.setZoomFactor(((browser_h ) / height) )
        
        self.notify(f"{browser_h} and {height} \n")
        # self.browser.page().runJavaScript("window.scrollTo(0, document.body.scrollHeight / 2)")
 
    def check_ratio(self, max_loops=100):
        def after_height_retrieved(height):
            
            if max_loops > 0:
                ratio = height / self.browser.height()
                self.notify(f"Ratio: {str(ratio)[:4]} and height: {height}")
                
                if self.ratio_lower_bound <= ratio <= self.ratio_upper_bound:
                    # self.notify(" done true ")
                    return True
                else: # recursion time...
                    
                    current_zoom_factor = self.browser.page().zoomFactor()
                    if ratio > self.ratio_upper_bound:
                        # self.notify(f"gs {str(height)[:3]} / {self.browser.height()} ")
                        self.browser.setZoomFactor(current_zoom_factor * 0.9)
                    elif ratio < self.ratio_lower_bound:
                        # self.notify(f"gb {ratio} ")
                        self.browser.setZoomFactor(current_zoom_factor * 1.1)
                    
                    self.check_ratio(max_loops - 1)

                    return False
        self.browser.page().runJavaScript("document.body.scrollHeight;", after_height_retrieved)



    def notify(self,text):
        with open("/home/rohan/Documents/FileFolder/minefield/minefield.buggs", "a") as buggs:
            buggs.write(text)


if __name__ == '__main__':
    app = QApplication(sys.argv)
    app.setApplicationName("kvt_viewer")
    mainWindow = MainWindow()
    mainWindow.show()
    sys.exit(app.exec_())

