import {
    animation, trigger, animateChild, group, stagger,
    transition, animate, style, query
  } from '@angular/animations';

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('* <=> *', [
        style({position: 'relative'}),
        query(':enter', [
            style({
              position: 'absolute',
              top: 60,
              left: 0,
              width: '100%'
            })
          ]),
      query(':enter', [
        style({opacity: 0}),
          stagger(-500, [
            animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'none' }))
          ])
      ]),
    //   query(':leave', [
    //     style({opacity: 1}),
    //       stagger(-10, [
    //         animate('500ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 0, transform: 'none' }))
    //       ])
    //   ]),
    ]),
  ]);