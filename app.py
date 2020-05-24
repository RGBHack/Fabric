from flask import Flask, render_template, make_response, redirect
import os
import time
import sys
from werkzeug.routing import BaseConverter
import random
from flask_socketio import SocketIO, send, emit
import json

app = Flask(__name__)

sessions = {}
num = 0
socketio = SocketIO(app)
datas = []


class RegexConverter(BaseConverter):
    def __init__(self, url_map, *items):
        super(RegexConverter, self).__init__(url_map)
        self.regex = items[0]


app.url_map.converters['regex'] = RegexConverter


@app.route('/admin/<id>:<password>')
def admin(id, password):
    print(id, file=sys.stdout)
    if not id in sessions:
        return redirect('/404')
    if sessions[id]['password'] != password:
        return redirect('/view/'+id)
    return render_template('draw.html', id=id, password=password)

@app.route('/404')
def four ():
    return render_template('404.html')

@app.route('/view/<id>')
def view(id):
    print(id, file=sys.stdout)
    if not id in sessions:
        return redirect('/404')
    return render_template('view.html', id=id)


def format_server_time():
    server_time = time.localtime()
    return time.strftime("%I:%M:%S %p", server_time)


@app.route('/')
def index():
    context = {'server_time': format_server_time()}
    return render_template('index.html', context=context)


@app.route('/about')
def about():
    context = {'server_time': format_server_time()}
    return render_template('about.html', context=context)


@app.route('/create')
def create():
    global num
    num += 1
    num2 = random.randrange(99999)
    password = str(random.randrange(99999999))
    sessionid = str(num)+str(num2)
    sessions[sessionid] = {"session": sessionid, "password": password, "data": []}
    return redirect('/admin/'+sessionid+':'+password)


@socketio.on('connection')
def connection(socket):
    print("Client #"+str(socket.id)+"Has connected")


@socketio.on('drawing')
def drawing(data):
    global datas
    datas.append(data)
    emit('drawing', data, broadcast=True)


@socketio.on('connect')
def onconnection():
    global datas
    for i in datas:
        emit('drawing', i)


@socketio.on('clear')
def onclear():
    emit('clear',broadcast=True)
    global datas
    datas = []


if __name__ == '__main__':
    socketio.run(app, debug=True, port=int(os.environ.get('PORT', 5004)))
