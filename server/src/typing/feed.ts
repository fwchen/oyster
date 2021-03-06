import { FeedSource } from '../entity/feed-source';

export interface FeedData {
  globalID?: string;
  title: string;
  content: string;
  originHref: string;
  publishedDate: Date;
  author: string;
  source?: FeedSource;
}

export interface FeedResult {
  source: FeedSource;
  feedRawData: string;
}
