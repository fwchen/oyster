import { Injectable } from '@angular/core';
import gql from 'graphql-tag';
import { Apollo } from 'apollo-angular';
import { FeedSource, CreateFeedSourceInput } from '../../typing/feed';
import { Subject, Observable, BehaviorSubject } from 'rxjs';
import { FetchResult } from 'apollo-link';
import { map, tap } from 'rxjs/operators';

const FeedSourcesQuery = gql`
  query getFeedSources {
    sources {
      id
      name
      url
    }
  }
`;

const FeedSourceCreateMutation = gql`
  mutation mutationFeedSource($name: String!, $url: String!) {
    source(name: $name, url: $url) {
      id
      name
      url
    }
  }
`;

@Injectable({
  providedIn: 'root'
})
export class FeedSourceService {
  public feedSources$: Subject<FeedSource[]> = new BehaviorSubject([]);

  constructor(private apollo: Apollo) {}

  public querySourceList(): void {
    this.apollo
      .query<{ sources: FeedSource[] }>({
        query: FeedSourcesQuery,
        fetchPolicy: 'no-cache'
      })
      .subscribe(({ data }) => {
        this.feedSources$.next(data.sources);
      });
  }

  public createFeedSource({ name, url }: CreateFeedSourceInput): Observable<FeedSource> {
    return this.apollo
      .mutate({
        mutation: FeedSourceCreateMutation,
        variables: { name, url }
      })
      .pipe(
        map(({ data }: FetchResult<{ source: FeedSource }>) => data.source),
        tap(() => {
          this.querySourceList();
        })
      );
  }
}