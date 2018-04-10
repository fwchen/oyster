import * as md5 from 'md5';
import * as xml2js from 'xml2js';
import * as fetch from 'isomorphic-fetch';
import * as Rx from 'rxjs';
import { parseFeed } from './parser';
import { logger } from './logger';

const loop = (sources: FeedSource[]): Rx.Observable<{} | FeedResult> => {
  const hashMap = new Map();
  return Rx.Observable.interval(50000)
    .startWith(0)
    .concatMap(() =>
      Rx.Observable.of(...sources)
        .concatMap(async source => {
          logger.info(`fetch ${source.label}`);
          const feedRawData = await (await fetch(source.url)).text();
          return { ...source, feedRawData };
        })
        .filter(feed => {
          const hash = md5(feed.feedRawData);
          if (hashMap[feed.url] === hash) {
            return false;
          }
          hashMap[feed.url] = hash;
          return true;
        })
        .catch((error, caught) => {
          logger.error(`fetch failure : ${error.message}`);
          return Rx.Observable.empty().ignoreElements();
        })
    );
};

export const fetchFeedSources = (
  feedSources: FeedSource[],
  handleFeeds: (feeds: any[]) => void
): (() => void) => {
  const feed$ = loop(feedSources);
  const subscription = feed$.subscribe(
    async (result: { label: string; url: string; feedRawData: string }) => {
      try {
        const feeds = await parseFeed(result.feedRawData);
        logger.info(`parse "${result.label} feed raw data susscess"; lenght = ${feeds.length}`);
        return handleFeeds(feeds);
      } catch (error) {
        logger.error(`parse and save feed error. ${error}`);
      }
    }
  );
  return () => subscription.unsubscribe();
};
