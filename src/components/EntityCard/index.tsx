import React from 'react';
import type { Entity } from '../typings';

const EntityCard = (metadata: Entity | undefined) => {
  if (!metadata) {
    return <div>No metadata found!</div>;
  } else {
    return (
      <div style={{ overflowWrap: 'break-word', width: '500px' }}>
        <p style={{ marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Synonyms: </span>
          {metadata.synonyms || 'No synonyms found!'}
        </p>
        <p style={{ marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Xrefs: </span>
          {metadata.xrefs || 'No xrefs found!'}
        </p>
        <p style={{ marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Description: </span>
          {metadata.description || 'No description found!'}
        </p>
        <p style={{ marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>ID: </span>
          {metadata.id}
        </p>
        <p style={{ marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Name: </span>
          {metadata.name}
        </p>
        <p style={{ marginBottom: '5px' }}>
          <span style={{ fontWeight: 'bold' }}>Label: </span>
          {metadata.label}
        </p>
      </div>
    );
  }
};

export default EntityCard;
