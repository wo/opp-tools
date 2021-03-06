#!/usr/bin/env python3
import sys
import time
import signal
import logging
import findmodules
from opp.config import config
from opp import scraper, blogpostprocessor, browser
from opp.daemon import Daemon
from opp.debug import debug, debuglevel

logger = logging.getLogger('opp')
logger.setLevel(logging.DEBUG if config['loglevel'] > 1 else logging.INFO)
fh = logging.FileHandler(config['logfile'])
fh.setLevel(logging.DEBUG if config['loglevel'] > 1 else logging.INFO)
fh.setLevel(logging.DEBUG)
fh.setFormatter(logging.Formatter(fmt='%(asctime)s %(message)s', 
                                  datefmt='%Y-%m-%d %H:%M:%S'))
logger.addHandler(fh)

PIDFILE = '/tmp/opp-scraper.pid' 

class GracefulKiller:
    kill_now = False
    def __init__(self):
        signal.signal(signal.SIGINT, self.exit_gracefully)
        signal.signal(signal.SIGTERM, self.exit_gracefully)

    def exit_gracefully(self,signum, frame):
        self.kill_now = True

class ScraperDaemon(Daemon):

    def start(self):
        debuglevel(3)
        super().start()
        self.run()

    def run(self):
        killer = GracefulKiller()
        pause_secs = 10
        restart_browser_interval = 900
        browser_starttime = time.time()
        while True:
            # process new blog posts:
            blogpostprocessor.run()
            # look for new papers:
            source = scraper.next_source()
            if source:
                scraper.scrape(source)
            # wait:
            pause_secs = 10 if source else 60
            for sec in range(pause_secs):
                if killer.kill_now:
                    self.stop()
                    return
                time.sleep(1)
            # restart browser?
            if time.time() - browser_starttime > restart_browser_interval:
                browser.stop_browser()
                browser_starttime = time.time() 

    def stop(self):
        print("hold on...")
        browser.stop_browser()
        time.sleep(1)
        super().stop()


if __name__ == "__main__":

    daemon = ScraperDaemon(PIDFILE,
                           stderr=config['logfile'],
                           stdout=config['logfile'])

    if len(sys.argv) == 2:
        if 'start' == sys.argv[1]:
            daemon.start()
        elif 'stop' == sys.argv[1]:
            daemon.stop()
        elif 'restart' == sys.argv[1]:
            daemon.restart()
        elif 'status' == sys.argv[1]:
            daemon.status()
        else:
            print("Unknown command")
            sys.exit(2)
        sys.exit(0)
    else:
        print("Usage: {} start|stop|restart|status".format(sys.argv[0]))
        sys.exit(2)

