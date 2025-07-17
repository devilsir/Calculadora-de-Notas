import webview
import os

base_path = os.path.abspath(os.path.dirname(__file__))
index_path = os.path.join(base_path, 'index.html')

webview.create_window("Calculadora de Notas", index_path, width=900, height=800)
webview.start()
