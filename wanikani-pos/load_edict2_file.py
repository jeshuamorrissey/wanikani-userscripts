#!/usr/bin/python3

from __future__ import print_function

"""
The purpose of this file is to take the edict2 data file (encoded using UTF-8) and
output a JSON dictionary containing the same information. This JSON dictionary can
then be used to develop apps (particularily in JavaScript) which make use of edict2
but don't have very strong text-parsing functions.

To use this file:
  ./load_edict2_file.py --dictionary [edict2] --output [out.json]
"""

import argparse
import os
import sys

parser = argparse.ArgumentParser()
parser.add_argument('--dictionary', type=str, nargs=1, help='Edict2 dictionary file.')
parser.add_argument('--output',     type=str, nargs=1, help='Output location of the JSON file.')
args = parser.parse_args()

# For debugging.
args.dictionary = os.path.join('edict2', 'edict2')
args.output = 'edict2.json'

output = {}

def ParseEdict2Line(line):
  return 0, 0

with open(args.dictionary, 'rU', encoding='EUC-JP') as edict:
  for line in edict:
    key, info = ParseEdict2Line(line)
    if key in output:
      print('Multiple keys? {} {}'.format(key, info))
      sys.exit(1)
    else:
      output[key] = info
