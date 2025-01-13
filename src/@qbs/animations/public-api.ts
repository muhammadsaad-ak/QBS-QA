import { expandCollapse } from '../animations/expand-collapse';
import {
    fadeIn,
    fadeInBottom,
    fadeInLeft,
    fadeInRight,
    fadeInTop,
    fadeOut,
    fadeOutBottom,
    fadeOutLeft,
    fadeOutRight,
    fadeOutTop,
} from '../animations/fade';
import { shake } from '../animations/shake';
import {
    slideInBottom,
    slideInLeft,
    slideInRight,
    slideInTop,
    slideOutBottom,
    slideOutLeft,
    slideOutRight,
    slideOutTop,
} from '../animations/slide';
import { zoomIn, zoomOut } from '../animations/zoom';

export const qbsAnimations = [
    expandCollapse,
    fadeIn,
    fadeInTop,
    fadeInBottom,
    fadeInLeft,
    fadeInRight,
    fadeOut,
    fadeOutTop,
    fadeOutBottom,
    fadeOutLeft,
    fadeOutRight,
    shake,
    slideInTop,
    slideInBottom,
    slideInLeft,
    slideInRight,
    slideOutTop,
    slideOutBottom,
    slideOutLeft,
    slideOutRight,
    zoomIn,
    zoomOut,
];
