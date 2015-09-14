#
# Note (2015-09-11):
#
# There are several modules for extracting the main article content
# from websites. I've tried Goose, Readability, and Dragnet. None of
# them was really satisfactory. For example, on n-category cafe,
# Readability misses the intro part of posts, Goose removes all tags
# (including emphases), and all of them get the mathml formulas
# wrong. Moreover, none of the modules is able to extract the author
# name from posts on group blogs.
#
# Rather than reinventing the wheel completely, what I do here is rely
# on Goose to identify the main post content, locate that in the html
# source, and perform my own clean-up on the html; I also look for 'by
# [names]' strings in the vicinity of the start of the blog post to
# identify authors.
#
import logging
import re
from requests import get
from goose import Goose
from nltk.tokenize import sent_tokenize
# To install nltk.tokenize:
# pip install nltk
# python
#    import nltk
#    nltk.import('punkt')
# sudo mv ~/nltk_data /usr/lib/

logger = logging.getLogger('opp')
logging.basicConfig(level=logging.DEBUG)

def parse(url):
    logger.debug("parsing blog post {}".format(url))
    html = get(url).content
    html = html.decode('utf-8', 'ignore')
    goose = Goose()
    article = goose.extract(raw_html=html)
    goose_text = article.cleaned_text
    post_html = match_text_in_html(goose_text, html)
    #print "\n\nHTML:\n{}\n\n".format(post_html)
    doc = {}
    doc['content'] = strip_tags(post_html)
    #print "\n\ncontent:\n{}\n\n".format(doc['content'])
    doc['numwords'] = len(doc['content'].split())
    doc['abstract'] = get_abstract(post_html)
    #print "\n\nabstract:\n{}\n\n".format(doc['abstract'])
    doc['authors'] = get_authors(html, post_html)
    #print "\n\nauthors:\n{}\n\n".format(doc['authors'])
    return doc

def match_text_in_html(text, html):
    # avoid matches in <meta name="description" content="blah blah">):
    html = re.sub(r'<\s*meta[^>]+>', '', html)
    start_words = re.findall(r'\b\w+\b', text[:50])[:-1]
    re_str = r'\b.+?\b'.join(start_words)
    m1 = shortest_match(re_str, html)
    #print m1.start(1)
    end_words = re.findall(r'\b\w+\b', text[-50:])[1:]
    re_str = r'\b.+?\b'.join(end_words)
    m2 = shortest_match(re_str, html)
    #print m2.end(1)
    return html[m1.start(1):m2.end(1)]

def shortest_match(re_str, string):
    # lookahead to get all matches, including overlapping ones:
    regex = re.compile('(?=({}))'.format(re_str), re.DOTALL)
    ret = None
    for m in regex.finditer(string):
        #print '\nmatch: {}\n\n'.format(m.group(1))
        if not ret or len(m.group(1)) < len(ret.group(1)):
            ret = m
    #print '\nshortest match: {}\n\n'.format(ret.group(1))
    return ret

def strip_tags(text, keep_italics=False):
    if keep_italics:
        text = re.sub(r'<(/?)(?:i|b|em)>', r'{\1emph}', text)
    text = re.sub('<.+?>', ' ', text, flags=re.MULTILINE|re.DOTALL)
    text = re.sub('<', '&lt;', text)
    text = re.sub('  +', ' ', text)
    text = re.sub('(?<=\w) (?=[\.,;:\-\)])', '', text)
    if keep_italics:
        text = re.sub(r'{(/?)emph}', r'<\1i>', text)
    return text

def get_abstract(html):
    text = strip_tags(html, keep_italics=True)
    sentences = sent_tokenize(text[:1000])
    abstract = ''
    for sent in sentences:
        abstract += sent+' '
        if len(abstract) > 600:
            break
    return abstract

def get_authors(full_html, post_html):
    post_start = full_html.find(post_html)
    #print "post_start: {}".format(post_start)
    tagsoup = r'(?:<[^>]+>|\s)*'
    prefix = r'[Bb]y\b'+tagsoup
    name = r'[\w\.\-]+(?: (?!and)[\w\.\-]+){0,3}'
    separator = tagsoup+r'(?: and |, )'+tagsoup
    re_str = r'{}({})(?:{}({}))*'.format(prefix,name,separator,name)
    regex = re.compile(re_str)
    #print "looking for {} in {}".format(re_str, full_html)
    best_match = None
    for m in regex.finditer(full_html):
        #print "{} matches {}".format(re_str, m.group(0))
        #print "({} vs {})".format(m.start(), post_start)
        if not best_match or abs(m.start()-post_start) < abs(best_match.start()-post_start):
            #print "best match ({} vs {})".format(m.start(), post_start)
            best_match = m
    if best_match:
        names = [n for n in best_match.groups() if n]
        #print ', '.join(names)
        return ', '.join(names)
    return ''
    
#url = 'http://blog.practicalethics.ox.ac.uk/2015/09/the-moral-limitations-of-in-vitro-meat/'
#url = 'https://golem.ph.utexas.edu/category/2015/08/wrangling_generators_for_subob.html'
#parse(url)


