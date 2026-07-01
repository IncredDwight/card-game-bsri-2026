export const SHAPE_IMAGES = [
  '/area_normalized_shapes/00.png',
  '/area_normalized_shapes/01.png',
  '/area_normalized_shapes/10.png',
  '/area_normalized_shapes/11.png',
];

export function cardColor(index) {
  return ['#ff2b7a', '#3b82f6', '#22c55e', '#eab308'][index];
}

export function getPositions(count) {
  switch (count) {
    case 0:
      return [{ left: '32%', top: '32%', size: '33%' }];

    case 1:
      return [
        { left: '17%', top: '18%', size: '27%' },
        { left: '57%', top: '58%', size: '27%' },
      ];

    case 2:
      return [
        { left: '10%', top: '10%', size: '24%' },
        { left: '35%', top: '35%', size: '24%' },
        { left: '67%', top: '60%', size: '24%' },
      ];

    case 3:
      return [
        { left: '20%', top: '0%', size: '22%' },
        { left: '47%', top: '25%', size: '22%' },
        { left: '20%', top: '50%', size: '22%' },
        { left: '47%', top: '75%', size: '22%' },
      ];

    default:
      return [];
  }
}
