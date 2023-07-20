import type { RelationStat, OptionType } from '../typings';

export const getMaxDigits = (nums: number[]): number => {
  let max = 0;
  nums.forEach((element: number) => {
    let digits = element.toString().length;
    if (digits > max) {
      max = digits;
    }
  });

  return max;
};

export const getDefaultRelSep = () => {
  return '<>';
};

export const getRelationOption = (
  relationType: string,
  resource: string,
  sourceNodeType: string,
  targetNodeType: string,
) => {
  const sep = getDefaultRelSep();

  // Two formats of relationships are supported:
  // 1. Single field mode: bioarx::Covid2_acc_host_gene::Disease:Gene
  // 2. Multiple fields mode: relationshipType<>resource<>sourceNodeType<>targetNodeType
  if (relationType.indexOf('::') >= 0) {
    return relationType;
  } else {
    return [relationType, resource, sourceNodeType, targetNodeType].join(sep);
  }
};

export const makeRelationTypes = (edgeStat: RelationStat[]): OptionType[] => {
  let o: OptionType[] = [];
  const maxDigits = getMaxDigits(edgeStat.map((element: RelationStat) => element.relation_count));

  edgeStat.forEach((element: RelationStat) => {
    const relation_count = element.relation_count.toString().padStart(maxDigits, '0');
    const relationshipType = getRelationOption(
      element.relation_type,
      element.resource,
      element.start_entity_type,
      element.end_entity_type,
    );

    o.push({
      order: element.relation_count,
      label: `[${relation_count}] ${relationshipType}`,
      value: relationshipType,
    });
  });

  console.log('makeRelationTypes', o, edgeStat);
  return o.sort((a: any, b: any) => a.order - b.order);
};
