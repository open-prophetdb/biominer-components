import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { Entity, QueryItem, ComposeQueryItem } from './typings';

export function makeQueryEntityStr(params: Partial<Entity>): string {
  let query: ComposeQueryItem = {} as ComposeQueryItem;

  let id_query_item = {} as QueryItem;
  if (params.id) {
    id_query_item = {
      operator: 'like',
      field: 'id',
      value: `%${params.id}%`,
    };
  }

  let name_query_item = {} as QueryItem;
  if (params.name) {
    name_query_item = {
      operator: 'like',
      field: 'name',
      value: `%${params.name}%`,
    };
  }

  let label_query_item = {} as QueryItem;
  if (params.label) {
    label_query_item = {
      operator: '=',
      field: 'label',
      value: params.label,
    };
  }

  if (id_query_item && name_query_item) {
    query = {
      operator: 'or',
      items: [id_query_item, name_query_item],
    };
  } else if (id_query_item) {
    query = {
      operator: 'and',
      items: [id_query_item],
    };
  } else if (name_query_item) {
    query = {
      operator: 'and',
      items: [name_query_item],
    };
  }

  if (query.operator == 'or') {
    query = {
      operator: 'and',
      items: [query, label_query_item],
    };
  } else {
    query = {
      operator: 'and',
      items: [...query.items, label_query_item],
    };
  }

  return JSON.stringify(query);
}

export const getIdentity = async () => {
  let visitorId = localStorage.getItem('rapex-visitor-id');

  if (!visitorId) {
    const fpPromise = FingerprintJS.load();
    // Get the visitor identifier when you need it.
    const fp = await fpPromise;
    const result = await fp.get();

    visitorId = result.visitorId;
  }

  return visitorId;
};
