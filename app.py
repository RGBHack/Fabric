from flask import Flask, render_template, make_response, redirect
import os
import time
import sys
from werkzeug.routing import BaseConverter
import random
from flask_socketio import SocketIO
import json

app = Flask(__name__)

rooms = []
num = 0
socketio = SocketIO(app)

class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]
app.url_map.converters['regex'] = RegexConverter

@app.route('/admin/<id>:<password>')
def admin(id,password):
    print(id, file=sys.stdout)
    #if id is in database, then continue, otherwise redirect to 404 error
    return render_template('draw.html',id=id,password=password)

@app.route('/view/<id>')
def view(id):
    print(id, file=sys.stdout)
    #if id is in database, then continue, otherwise redirect to 404 error
    return render_template('view.html',id=id)

def format_server_time():
   server_time = time.localtime()
   return time.strftime("%I:%M:%S %p", server_time)

@app.route('/')
def index():
    context = { 'server_time': format_server_time() }
    return render_template('index.html', context=context)

@app.route('/about')
def draw():
    context = { 'server_time': format_server_time() }
    return render_template('about.html', context=context)

@app.route('/create')
def create():
    num = num+1
    num2 = random.randrange(99999)
    sessionid = str(num)+str(num2)
    

if __name__ == '__main__':
    socketio.run(debug=True,port=int(os.environ.get('PORT', 5004)))