#!/usr/bin/env python3
import pytest
import logging
import os.path
import os, sys, shutil
import json
import re
from opp import scraper
from opp.docparser import blogpostparser

curpath = os.path.abspath(os.path.dirname(__file__))
testdir = os.path.join(curpath, 'blogpages')

testcases = [
    ('contessa', 'Logic versus Rhetoric in Philosophical Argumentation'),
    ('heck', 'Roasted Eggplant with Artichoke Hearts and Salsa Verde'),
    ('pe', 'Three Black Teenagers'),
    # ('brain', 'Diversity of epistemic practices: toward solving the puzzle'),
    ('schliesser', 'Isaac Newton and Clarke on Metaphysical Modality'),
]

@pytest.mark.parametrize("basefile, title", testcases)
def test_linkcontext(basefile, title):
    scraper.debuglevel(5)
    html = readfile(os.path.join(testdir, basefile+'.html'))
    content = readfile(os.path.join(testdir, basefile+'.txt')).strip()
    doc = scraper.Doc(title=title)
    res = blogpostparser.extract_content(html, doc)
    assert re.sub(r'\s+', ' ', content) == re.sub(r'\s+', ' ', res)

def readfile(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()
