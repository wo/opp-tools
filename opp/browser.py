#!/usr/bin/env python3
import time
import logging
from selenium import webdriver
from pyvirtualdisplay import Display

logger = logging.getLogger('opp')

_display = None
_browser = None

# allow for singletons:
def Browser(use_virtual_display=False, reuse_browser=True):
    global _display
    global _browser
    if use_virtual_display and not _display:
        logger.debug('initializing new virtual display')
        _display = Display(visible=0, size=(1366, 768))
        _display.start()
    if not reuse_browser or not _browser:
        _browser = ActualBrowser()
    return _browser

def stop_browser():
    '''quit current _browser and _display if running'''
    global _display
    global _browser
    if not _browser:
        logger.debug('no browser running')
        return

    logger.debug('stopping browser')
    try:
        _browser.quit()
    except Exception as e:
        logger.debug(e)
    if _display:
        time.sleep(1)
        logger.debug('stopping virtual display')
        try:
            _display.stop()
        except Exception as e:
            logger.debug(e)
        del _display
        _display = None
    del _browser
    _browser = None

class ActualBrowser(webdriver.Firefox):
    
    def __init__(self):
        logger.debug('initializing browser')
        super().__init__(log_path='/tmp/selenium.log')
        
    def goto(self, url, timeout=10):
        """sends browser to url, sets (guessed) status code"""
        self.set_page_load_timeout(timeout)
        self.get(url)
        self.status = 200
        # check for errors:
        if "not found" in self.title.lower():
            self.status = 404
        try:
            ff_error = self.find_element_by_id('errorTitleText')
            if 'not found' in ff_error.text:
                self.status = 404
        except Exception:
            pass
        if self.current_url != url:
            self.status = 301
