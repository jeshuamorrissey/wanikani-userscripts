from flask import Flask, Response, make_response

import json

app = Flask(__name__)

# Load JSON data files.
sentences = json.loads(open('/home/jeshuam/wanikani-sentences/sentences.json', 'rU').read())
links = json.loads(open('/home/jeshuam/wanikani-sentences/links.json', 'rU').read())
sentences_by_word = json.loads(open('/home/jeshuam/wanikani-sentences/sentences_by_word.json', 'rU').read())

@app.route('/wanikani-sentences/<vocabulary>')
def get_sentences_containing_word(vocabulary):
    result = []

    for id in sentences_by_word[vocabulary]:
      result.append({
        'jpn': sentences[id]['text'],
        'eng': sentences[links[id]]['text'],
      })

    return make_response(Response(json.dumps(result), mimetype='application/json'), 200, {'Access-Control-Allow-Origin': '*'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
