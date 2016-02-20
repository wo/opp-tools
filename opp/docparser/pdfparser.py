#!/usr/bin/env python3
import logging
import re
import os
from os.path import abspath, dirname, join
import subprocess
import json
from .pdf2xml import pdf2xml
from .pdfinfo import pdfinfo

PDFTK = '/usr/bin/pdftk'
PERL = '/usr/bin/perl'

PATH = abspath(dirname(__file__))

logger = logging.getLogger('opp')

def parse(doc, debug_level=1, keep_tempfiles=False):
    """
    tries to enrich Doc object by metadata (authors, title, abstract,
    numwords, numpages, type, text), extracted from the associated pdf
    """
    global _debug_level
    _debug_level = debug_level
    
    pdffile = doc.tempfile
    xmlfile = doc.tempfile.rsplit('.')[0] + '.xml'

    try:
        numpages = int(pdfinfo(pdffile)['Pages'])
    except:
        debug(1, 'pdfinfo %s failed', pdffile)
        return False

    # first try without ocr:
    OCR_IF_CONFIDENCE_BELOW = 0.8
    try1 = pdf2xml(pdffile, xmlfile, use_ocr=False,
                   debug_level=debug_level, keep_tempfiles=keep_tempfiles)
    if try1:
        enrich_xml(xmlfile, doc)
        parse1 = extractor(xmlfile)
        if parse1:
            enrich_doc(doc, parse1)
            if parse1['meta_confidence'] >= OCR_IF_CONFIDENCE_BELOW:
                if not keep_tempfiles:
                    os.remove(xmlfile)
                return True
            else:
                debug(1, 'confidence %s too low, trying ocr', parse1['meta_confidence'])
        else:
            debug(1, 'extractor failed after pdftohtml, trying ocr')
    else:
        debug(1, 'pdftohtml failed, trying ocr')
    """
    If pdftohtml didn't produce garbage, we don't need to OCR more
    than the first 1-3 pages (depending on doc length); we should then
    take .text and .doctype and .numwords etc. from first parse. If
    pdftohtml didn't work at all, we need to OCR more to get some
    meaningful .text, and extrapolate numwords.
    """
    ocr_range = None
    preserve_fields = []
    if try1 and parse1:
        ocr_range = '1-2' if numpages < 50 else '1-4'
        preserve_fields = ['text', 'doctype', 'numwords']
    elif numpages > 10:
        ocr_range = '1-7, r3-r1' # first seven plus last three

    if ocr_range:
        shortpdffile = pdffile.rsplit('.',1)[0] + '-short.pdf'
        try:
            cmd = [PDFTK, pdffile, 'cat', ocr_range, 'output', shortpdffile]
            debug(2, ' '.join(cmd))
            subprocess.check_call(cmd, timeout=5)
            pdffile = shortpdffile
        except subprocess.CalledProcessError as e:
            debug(1, 'pdftk failed to produce short pdf! %s', e.output)
        except subprocess.TimeoutExpired as e:
            debug(1, 'pdftk timeout!')

    try2 = pdf2xml(pdffile, xmlfile, use_ocr=True,
                   debug_level=debug_level, keep_tempfiles=keep_tempfiles)
    if try2:
        enrich_xml(xmlfile, doc)
        parse2 = extractor(xmlfile)
        if parse2 and parse1:
            # compare results:
            if (parse1['authors'] == parse2['authors'] 
                and parse1['title'] == parse2['title']
                and parse1['abstract'] == parse2['abstract']):
                debug(1, "pdftohtml and pdfocr results agree")
                doc.meta_confidence *= 1.05
            else:
                # If pdftohtml and pdfocr produce different results,
                # it's not obvious what we should do. We could go with
                # whatever has greater meta_confidence, but
                # meta_confidence doesn't track things like silly
                # cApiTAlization in titles, it punishes results with
                # more authors, etc. For now, let's go with the ocr
                # result and significantly lower meta_confidence to
                # flag the fact that either pdftohtml or pdfocr
                # produced false metadata.
                debug(1, "pdftohtml and pdfocr results disagree")
                if parse1['authors'] != parse2['authors']:
                    debug(1, "authors: '%s' vs '%s'", parse1['authors'], parse2['authors'])
                    doc.meta_confidence *= 0.8
                if parse1['title'] != parse2['title']:
                    debug(1, "title: '%s' vs '%s'", parse1['title'], parse2['title'])
                    doc.meta_confidence *= 0.8
                if parse1['abstract'] != parse2['abstract']:
                    debug(1, "abstract: '%s' vs '%s'", parse1['abstract'], parse2['abstract'])
                    doc.meta_confidence *= 0.9
        enrich_doc(doc, parse2, preserve_fields=preserve_fields)
        if not keep_tempfiles:
            os.remove(xmlfile)
        return True
    else:
        debug(1, 'pdf parser failed')
        return False

def extractor(xmlfile):
    global _debug_level
    cmd = [PERL, join(PATH, 'Extractor.pm'), "-v{}".format(_debug_level), xmlfile]
    debug(3, ' '.join(cmd))
    try:
        output = subprocess.check_output(cmd, stderr=subprocess.STDOUT, timeout=10)
        output = output.decode('utf-8', 'ignore')
    except subprocess.CalledProcessError as e:
        debug(1, e.output)
        return False
    except subprocess.TimeoutExpired as e:
        debug(1, 'Extractor timeout!')
        return False
    json_separator = '=========== RESULT ===========\n'
    if not json_separator in output:
        debug(1, 'Extractor failed:\n%s', output)
        return False
    log,jsonstr = output.split(json_separator, 1)
    debug(1, log)
    res = json.loads(jsonstr)
    return res

def enrich_xml(xmlfile, doc):
    """
    add doc properties to xmlfile produced by htmltopdf (or ocr2pdf)
    for processing by the Perl metadata extractor
    """
    def mk_el(tag, content):
        return '<{}>{}</{}>'.format(tag, content, tag)
    new_xml = '\n'.join([
        mk_el('url', doc.url),
        mk_el('anchortext', doc.link.anchortext),
        mk_el('linkcontext', doc.link.context),
        mk_el('sourceauthor', doc.source.default_author),
        mk_el('sourcecontent', doc.source.text())
        ])
    bakfile = xmlfile+'.bak'
    with open(bakfile, 'w') as fout:
        with open(xmlfile, 'r') as fin:
            for line in fin:
                fout.write(line)
                if '<pdf2xml' in line:
                    fout.write(new_xml+'\n')
    os.rename(bakfile, xmlfile)

def enrich_doc(doc, extractor_res, preserve_fields=None):
    if not preserve_fields:
        preserve_fields = []
    for k,v in extractor_res.items():
        if k not in preserve_fields:
            setattr(doc, k, v)
    doc.meta_confidence = int(100*float(extractor_res['meta_confidence']))

_debug_level = 0

def debug(level, msg, *args):
    if _debug_level >= level:
        logger.debug(msg, *args)