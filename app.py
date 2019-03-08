#!/usr/local/bin/python

import flask,os,sys,time
from flask import Flask, request, render_template, jsonify, redirect
from flask import send_file, send_from_directory
from flask import make_response

#sys.path.append('./server')
#import ConfigGraph

home_dir = os.path.dirname(os.path.realpath(__file__))
app = Flask(__name__, static_url_path='', static_folder='', template_folder='')
app.jinja_env.variable_start_string = '%%'
app.jinja_env.variable_end_string = '%%'

@app.route('/', methods=['GET', 'POST'])
def home():
    return render_template("index.html");
    #return "hello world!";

@app.route('/sbc/', methods=['GET', 'POST'])
def network():
    #graph = ConfigGraph.ConfigGraph();
    #graph.run();
    #networks = graph.get_network_json();
    #return jsonify(networks);
    return jsonify('{ "name": "hello world!"}')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

