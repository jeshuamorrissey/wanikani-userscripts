# -*- coding: utf-8 -*-

from collections import defaultdict
import json, urllib

MAX_LEVEL = 60

levels = [str(n) for n in range(1, MAX_LEVEL + 1)]

API_KEY = 'c24f131f7fadd445c447f935f34fc984'
WK_ALL_WORDS = 'https://www.wanikani.com/api/user/{key}/vocabulary/{level}'

# Get a list of all vocab items.
print('Loading WK API...')
all_words = set([])
for level in levels:
  print('... {}'.format(level))
  result_json = json.loads(
      urllib.urlopen(WK_ALL_WORDS.format(key=API_KEY, level=level)).read())
  for word_json in result_json['requested_information']:
    all_words.add(word_json['character'])

print('Loading sentences...')
sentences = json.load(open('sentences.json', 'rU'))

print('Loading links...')
links = json.load(open('links.json', 'rU'))

sentences_by_word = defaultdict(list)

print('Making word --> sentence map')
for id, sentence in sentences.items():
  if sentence['lang'] == 'jpn':
    for word in sentence['text']:
      if word in all_words and id in links and links[id] in sentences:
        if id not in sentences_by_word[word]:
          sentences_by_word[word].append(id)

output_json = open('sentences_by_word.json', 'w')
output_json.write(json.dumps(sentences_by_word))
output_json.close()
